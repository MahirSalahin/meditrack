from fastapi import (
    APIRouter,
    HTTPException,
    status,
    UploadFile,
    File,
    Form,
    Request,
)
from typing import List, Optional
from uuid import UUID
from app.core.config import settings
from app.schemas.medical_records import (
    MedicalRecordRead,
    MedicalRecordUpdate,
    MedicalAttachmentRead,
)
from app.models.enums import RecordCategory, Priority
from app.models.medical_records import MedicalRecord, MedicalAttachment
from app.db.session import engine
from app.crud.profiles import get_user_profile_id
import logging
from sqlmodel import Session, select
from app.services import file_service
from fastapi.responses import FileResponse
from io import BytesIO
from PIL import Image

router = APIRouter()
logger = logging.getLogger(__name__)


# GET /records/my/list
@router.get("/my/list", response_model=List[MedicalRecordRead])
async def get_my_records(request: Request):
    """Get all medical records for the current patient, sorted by record_date descending."""
    current_user = request.state.user
    user_profile_id = await get_user_profile_id(current_user)
    with Session(engine) as session:
        records = session.exec(
            select(MedicalRecord)
            .where(MedicalRecord.patient_id == user_profile_id)
            .order_by(MedicalRecord.record_date.desc())
        ).all()
        result = []
        for record in records:
            attachments = session.exec(
                select(MedicalAttachment).where(
                    MedicalAttachment.medical_record_id == record.id
                )
            ).all()
            record_dict = record.__dict__.copy()
            record_dict["attachments"] = [
                MedicalAttachmentRead.model_validate(a, from_attributes=True)
                for a in attachments
            ]
            result.append(
                MedicalRecordRead.model_validate(record_dict, from_attributes=True)
            )
        return result


# POST /records/my/upload
@router.post("/my/upload", response_model=MedicalRecordRead)
async def upload_my_record(
    request: Request,
    file: UploadFile = File(...),
    title: str = Form(...),
    category: RecordCategory = Form(...),
    summary: Optional[str] = Form(None),
    facility: Optional[str] = Form(None),
    diagnosis: Optional[str] = Form(None),
    treatment_summary: Optional[str] = Form(None),
    priority: Priority = Form(Priority.NORMAL),
    tags: Optional[str] = Form(None),
):
    """Upload a new medical record with attachment for the current patient. File is uploaded to GCP with a unique, structured name. Accepts PDF or image (JPG, PNG). Images are converted to PDF."""
    from datetime import datetime
    import os
    

    try:
        current_user = request.state.user
        user_profile_id = await get_user_profile_id(current_user)
        # Accept PDF or image
        content_type = file.content_type.lower()
        filename = file.filename.lower()
        allowed_image_types = ["image/jpeg", "image/png", "image/jpg"]
        is_image = content_type in allowed_image_types or filename.endswith(
            (".jpg", ".jpeg", ".png")
        )

        file_bytes = await file.read()
        file_size = len(file_bytes)
        if file_size == 0:
            raise HTTPException(status_code=400, detail="Uploaded file is empty")

        # Convert image to PDF if needed
        if is_image:
            image = Image.open(BytesIO(file_bytes)).convert("RGB")
            temp_pdf_stream = BytesIO()
            image.save(temp_pdf_stream, format="PDF")
            temp_pdf_stream.seek(0)
            file_bytes = temp_pdf_stream.read()
            file_size = len(file_bytes)
            content_type = "application/pdf"
            filename = filename.rsplit(".", 1)[0] + ".pdf"

        # Create DB record for MedicalRecord first (to get record.id)
        with Session(engine) as session:
            record = MedicalRecord(
                patient_id=user_profile_id,
                doctor_id=None,
                title=title,
                category=category,
                record_date=datetime.utcnow(),
                facility=facility,
                summary=summary,
                diagnosis=diagnosis,
                treatment_summary=treatment_summary,
                priority=priority,
                tags=tags,
            )
            session.add(record)
            session.commit()
            session.refresh(record)
            # Generate unique GCP filename (e.g., patient_{patient_id}/record_{record_id}_{timestamp}.pdf)
            timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
            ext = os.path.splitext(filename)[1] or ".pdf"
            gcp_filename = (
                f"patient_{user_profile_id}/record_{record.id}_{timestamp}{ext}"
            )
            # Upload to GCP
            try:
                uploaded_blob_name = file_service.save_file(
                    file_bytes,
                    gcp_filename,
                )
            except Exception as upload_exc:
                # Clean up the record if upload fails
                session.delete(record)
                session.commit()
                logger.error(f"Failed to upload file to GCP: {upload_exc}")
                raise HTTPException(
                    status_code=500, detail="Failed to upload file to GCP"
                )
            # Create MedicalAttachment
            attachment = MedicalAttachment(
                medical_record_id=record.id,
                filename=uploaded_blob_name,  # GCP blob name
                original_filename=filename,
                file_path=uploaded_blob_name,  # For GCP, this is the blob name
                file_type=content_type or "application/pdf",
                file_size=file_size,
                content_type=content_type or "application/pdf",
            )
            session.add(attachment)
            session.commit()
            session.refresh(attachment)
            # Reload record and attachments for response
            attachments = session.exec(
                select(MedicalAttachment).where(
                    MedicalAttachment.medical_record_id == record.id
                )
            ).all()
            record_dict = record.__dict__.copy()
            record_dict["attachments"] = [a.__dict__ for a in attachments]
            return MedicalRecordRead.model_validate(record_dict, from_attributes=True)
    except Exception as e:
        logger.error(f"Error uploading medical record: {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed to upload medical record: {e}"
        )


# PUT /records/my/{record_id}
@router.put("/my/{record_id}", response_model=MedicalRecordRead)
async def update_my_record(
    record_id: UUID, record_data: MedicalRecordUpdate, request: Request
):
    """Update a medical record for the current patient."""
    current_user = request.state.user
    user_profile_id = await get_user_profile_id(current_user)
    with Session(engine) as session:
        record = session.exec(
            select(MedicalRecord).where(MedicalRecord.id == record_id)
        ).first()
        if not record:
            raise HTTPException(status_code=404, detail="Medical record not found")
        if record.patient_id != user_profile_id:
            raise HTTPException(status_code=403, detail="Access denied")
        update_data = record_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(record, field, value)
        session.add(record)
        session.commit()
        session.refresh(record)
        # Reload attachments
        attachments = session.exec(
            select(MedicalAttachment).where(
                MedicalAttachment.medical_record_id == record.id
            )
        ).all()
        record_dict = record.__dict__.copy()
        record_dict["attachments"] = [a.__dict__ for a in attachments]
        return MedicalRecordRead.model_validate(record_dict, from_attributes=True)


# DELETE /records/my/{record_id}
@router.delete("/my/{record_id}", response_model=dict)
async def delete_my_record(record_id: UUID, request: Request):
    """Delete a medical record and its attachments for the current patient (also deletes files from GCP)."""
    current_user = request.state.user
    user_profile_id = await get_user_profile_id(current_user)
    with Session(engine) as session:
        record = session.exec(
            select(MedicalRecord).where(MedicalRecord.id == record_id)
        ).first()
        if not record:
            raise HTTPException(status_code=404, detail="Medical record not found")
        if record.patient_id != user_profile_id:
            raise HTTPException(status_code=403, detail="Access denied")
        # Delete attachments from GCP and DB
        attachments = session.exec(
            select(MedicalAttachment).where(
                MedicalAttachment.medical_record_id == record.id
            )
        ).all()
        for attachment in attachments:
            try:
                file_service.delete_file(attachment.filename)
            except Exception as e:
                logger.error(f"Failed to delete file from GCP: {e}")
            session.delete(attachment)
        # Delete the record
        session.delete(record)
        session.commit()
        return {"message": "Medical record and attachments deleted successfully"}


# GET /records/patient/{patient_id}/list
@router.get("/patient/{patient_id}/list", response_model=List[MedicalRecordRead])
async def get_patient_records(patient_id: UUID, request: Request):
    """Doctor views all records for a patient."""
    current_user = request.state.user
    if not current_user.is_doctor:
        raise HTTPException(
            status_code=403, detail="Only doctors can view patient records"
        )
    with Session(engine) as session:
        records = session.exec(
            select(MedicalRecord)
            .where(MedicalRecord.patient_id == patient_id)
            .order_by(MedicalRecord.record_date.desc())
        ).all()
        result = []
        for record in records:
            attachments = session.exec(
                select(MedicalAttachment).where(
                    MedicalAttachment.medical_record_id == record.id
                )
            ).all()
            record_dict = record.__dict__.copy()
            record_dict["attachments"] = [
                MedicalAttachmentRead.model_validate(a, from_attributes=True)
                for a in attachments
            ]
            result.append(
                MedicalRecordRead.model_validate(record_dict, from_attributes=True)
            )
        return result


# GET /records/{record_id}/attachment/{attachment_id}
@router.get(
    "/{record_id}/attachment/{attachment_id}",
    response_model=MedicalAttachmentRead,
)
async def get_record_attachment(record_id: UUID, attachment_id: UUID, request: Request):
    """Download or view a medical record attachment."""
    # TODO: Implement actual file serving logic
    return {}


# GET /records/attachment/{attachment_id}/view
@router.get("/attachment/{attachment_id}/view", response_model=str)
async def view_medical_attachment(attachment_id: UUID, request: Request):
    """Generate a signed URL to view a medical record attachment in GCP. Patients, doctors, and admins can access."""
    try:
        current_user = request.state.user
        with Session(engine) as session:
            attachment = session.get(MedicalAttachment, attachment_id)
            if not attachment:
                raise HTTPException(status_code=404, detail="Attachment not found")
            record = session.get(MedicalRecord, attachment.medical_record_id)
            if not record:
                raise HTTPException(status_code=404, detail="Medical record not found")
            # Allow: patient who owns, any doctor, or admin
            user_profile_id = await get_user_profile_id(current_user)
            if not (
                current_user.is_admin
                or current_user.is_doctor
                or (current_user.is_patient and record.patient_id == user_profile_id)
            ):
                raise HTTPException(status_code=403, detail="Access denied")
            file_path = file_service.get_file_path(attachment.filename)
            if not file_path:
                raise HTTPException(
                    detail="File not found",
                    status_code=404,
                )
            # Instead of a signed URL, we'll generate a URL to our new endpoint
            BACKEND_URL = settings.BACKEND_URL.rstrip("/")
            file_url = f"{BACKEND_URL}/files/{attachment.filename}"
            return file_url
    except Exception as e:
        logger.error(
            f"Error generating signed URL for medical attachment {attachment_id}: {e}"
        )
        raise HTTPException(
            status_code=500, detail="Failed to generate signed URL for attachment"
        )


# ===============================
# FILE SERVING ENDPOINTS
# ===============================

@router.get("/files/{filename}")
async def serve_pdf_file(filename: str):
    """
    Serve PDF files from the uploads directory without authorization.
    This endpoint allows public access to medical record attachments and other uploaded files.
    """
    import os
    try:
        # Get the file path from the file service
        file_path = file_service.get_file_path(filename)
        
        if not file_path:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="File not found"
            )
        
        # Check if file exists
        if not os.path.exists(file_path):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="File not found"
            )
        
        # Return the file
        return FileResponse(
            path=file_path,
            filename=filename,
            media_type="application/pdf"
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error serving file {filename}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to serve file"
        )
