from fastapi import (
    APIRouter,
    HTTPException,
    status,
    Query,
    UploadFile,
    File,
    Form,
    Body,
)
from fastapi.requests import Request
from app.core.config import settings
from fastapi.responses import FileResponse
from app.schemas.medications import (
    MedicationCreate,
    MedicationUpdate,
    MedicationRead,
    MedicationSearchFilters,
    PrescriptionCreate,
    PrescriptionUpdate,
    PrescriptionRead,
    PrescriptionSearchFilters,
    PrescriptionStats,
    MedicationLogCreate,
    MedicationLogUpdate,
    MedicationLogRead,
    PrescriptionBatchUpdate,
    PrescriptionPDFRead,
    PrescriptionItemCreate,
    PrescriptionItemRead,
)
from app.crud.medications import (
    get_medication_by_id,
    create_medication,
    update_medication,
    delete_medication,
    search_medications,
    get_prescription_by_id,
    create_prescription,
    update_prescription,
    delete_prescription,
    search_prescriptions,
    get_patient_prescriptions,
    get_doctor_prescriptions,
    get_active_prescriptions,
    get_prescription_stats,
    get_medication_log_by_id,
    create_medication_log,
    update_medication_log,
    delete_medication_log,
    get_prescription_logs,
    get_patient_medication_logs,
    create_prescription_from_pdf,
    get_prescription_pdf_by_id,
    get_patient_prescription_pdfs,
    create_prescription_pdf_and_store,
)
from app.crud.profiles import (
    get_profile,
    get_user_profile_id,
    get_doctor_profile_by_user_id,
)
from app.models.auth import User
from app.models.enums import PrescriptionStatus
from app.db.session import SessionDep
from typing import Optional, List
from datetime import datetime
import logging
import uuid
import os
from pydantic import BaseModel


class PrescriptionURL(BaseModel):
    url: str
from app.services import file_service
from app.models.medications import PrescriptionItem
from app.models.profiles import DoctorProfile
from app.models.medications import Prescription
from sqlmodel import select
from io import BytesIO
from PIL import Image
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter

logger = logging.getLogger(__name__)
router = APIRouter()

# ===============================
# MEDICATION ENDPOINTS
# ===============================


# Create Medication (Admin/Doctor only)
@router.post("/medications", response_model=MedicationRead)
async def create_new_medication(
    medication_data: MedicationCreate, session: SessionDep, request: Request
):
    """Create a new medication. Only doctors and admins can create medications."""
    try:
        current_user = request.state.user

        # Only doctors and admins can create medications
        if not (current_user.is_doctor or current_user.is_admin):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only doctors and admins can create medications",
            )

        medication = create_medication(medication_data)
        return MedicationRead.model_validate(medication)

    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating medication: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create medication",
        )


# Get Medication by ID
@router.get("/medications/{medication_id}", response_model=MedicationRead)
async def get_medication(
    medication_id: uuid.UUID,
):
    """Get medication by ID. All authenticated users can view medications."""
    medication = get_medication_by_id(medication_id)
    if not medication:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Medication not found"
        )

    return MedicationRead.model_validate(medication)


# Update Medication (Admin/Doctor only)
@router.put("/medications/{medication_id}", response_model=MedicationRead)
async def update_existing_medication(
    medication_id: uuid.UUID, medication_data: MedicationUpdate, request: Request
):
    """Update medication. Only doctors and admins can update medications."""
    current_user = request.state.user

    # Only doctors and admins can update medications
    if not (current_user.is_doctor or current_user.is_admin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only doctors and admins can update medications",
        )

    try:
        updated_medication = update_medication(medication_id, medication_data)
        if not updated_medication:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Medication not found"
            )

        return MedicationRead.model_validate(updated_medication)

    except Exception as e:
        logger.error(f"Error updating medication {medication_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update medication",
        )


# Delete Medication (Admin only)
@router.delete("/medications/{medication_id}")
async def delete_existing_medication(medication_id: uuid.UUID, request: Request):
    """Delete medication. Only admins can delete medications."""
    current_user = request.state.user

    # Only admins can delete medications
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can delete medications",
        )

    try:
        success = delete_medication(medication_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Medication not found"
            )

        return {"message": "Medication deleted successfully"}

    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Error deleting medication {medication_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete medication",
        )


# Search Medications
@router.get("/medications/search", response_model=dict)
async def search_all_medications(
    request: Request,
    name: Optional[str] = Query(None),
    generic_name: Optional[str] = Query(None),
    manufacturer: Optional[str] = Query(None),
    drug_class: Optional[str] = Query(None),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
):
    """Search medications with filters. All authenticated users can search medications."""
    try:
        filters = MedicationSearchFilters(
            name=name,
            generic_name=generic_name,
            manufacturer=manufacturer,
            drug_class=drug_class,
            limit=limit,
            offset=offset,
        )

        medications, total_count = search_medications(filters)

        return {
            "medications": [MedicationRead.model_validate(med) for med in medications],
            "total": total_count,
            "limit": limit,
            "offset": offset,
        }

    except Exception as e:
        logger.error(f"Error searching medications: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to search medications",
        )


# ===============================
# PRESCRIPTION ENDPOINTS
# ===============================


# Create Prescription
@router.post("/prescriptions", response_model=PrescriptionRead)
async def create_new_prescription(
    prescription_data: PrescriptionCreate, session: SessionDep, request: Request
):
    """Create a new prescription. Only doctors can create prescriptions."""
    try:
        current_user = request.state.user
        created_by_doctor_id = None
        if current_user.is_doctor:
            doctor_profile_id = await get_user_profile_id(current_user)
            created_by_doctor_id = doctor_profile_id
        elif not current_user.is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only doctors and admins can create prescriptions",
            )
        prescription = create_prescription(prescription_data, created_by_doctor_id)
        # --- FIX: Re-fetch prescription with relationships loaded ---
        prescription = get_prescription_by_id(prescription.id)

        # --- PDF GENERATION, UPLOAD, AND DB RECORD ---
        pdf_record = await create_prescription_pdf_and_store(
            prescription=prescription,
            uploaded_by=current_user.id,
            title=f"Prescription for {getattr(prescription, 'diagnosis', '') or 'Patient'}",
        )
        print(f"🔥{pdf_record}")
        # Optionally, you can return the PDF info as part of the response, or just the prescription
        # return {"prescription": PrescriptionRead.model_validate(prescription), "pdf": PrescriptionPDFRead.model_validate(pdf_record)}
        return PrescriptionRead.model_validate(prescription)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating prescription: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create prescription",
        )


# Upload Prescription by patient (PDF File)
@router.post("/prescriptions/upload", response_model=PrescriptionPDFRead)
async def upload_prescription_pdf(
    file: UploadFile = File(...), title: str = Form(None), request: Request = None
):
    """Upload a prescription PDF file or image. Patients can upload prescriptions for their own records. Images are converted to PDF."""
    try:
        current_user = request.state.user
        if not current_user.is_patient:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only patients can upload prescriptions",
            )
        user_profile_id = await get_user_profile_id(current_user)

        # Accept PDF or image
        content_type = file.content_type.lower()
        filename = file.filename.lower()
        allowed_image_types = ["image/jpeg", "image/png", "image/jpg"]
        is_pdf = content_type == "application/pdf" or filename.endswith(".pdf")
        is_image = content_type in allowed_image_types or filename.endswith(
            (".jpg", ".jpeg", ".png")
        )

        pdf_upload_file = file
        temp_pdf_stream = None

        if is_image:
            # Convert image to PDF
            image_bytes = await file.read()
            image = Image.open(BytesIO(image_bytes)).convert("RGB")
            temp_pdf_stream = BytesIO()
            image.save(temp_pdf_stream, format="PDF")
            temp_pdf_stream.seek(0)

            # Create a new UploadFile-like object for the PDF
            class SimpleUploadFile:
                def __init__(self, file_bytes, filename):
                    self.file = BytesIO(file_bytes)
                    self.filename = filename

            pdf_upload_file = SimpleUploadFile(
                temp_pdf_stream.read(), filename.rsplit(".", 1)[0] + ".pdf"
            )
        elif not is_pdf:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only PDF or image files (JPG, PNG) are allowed",
            )

        pdf_record = create_prescription_from_pdf(
            file=pdf_upload_file,
            patient_id=user_profile_id,
            uploaded_by=current_user.id,
            title=title,
        )
        return PrescriptionPDFRead.model_validate(pdf_record)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Error uploading prescription PDF: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upload prescription PDF",
        )


# Get Prescription by ID
@router.get("/prescriptions/{prescription_id}", response_model=PrescriptionRead)
async def get_prescription(prescription_id: uuid.UUID, request: Request):
    """Get prescription by ID. Users can only access their own prescriptions unless they're admin."""
    prescription = get_prescription_by_id(prescription_id)
    if not prescription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Prescription not found"
        )
    current_user = request.state.user
    if not current_user.is_admin:
        user_profile_id = await get_user_profile_id(current_user)
        if (
            prescription.patient_id != user_profile_id
            and prescription.doctor_id != user_profile_id
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Access denied"
            )
    return PrescriptionRead.model_validate(prescription)


# Update Prescription
@router.put("/prescriptions/{prescription_id}", response_model=PrescriptionRead)
async def update_existing_prescription(
    prescription_id: uuid.UUID, prescription_data: PrescriptionUpdate, request: Request
):
    """Update prescription. Users can only update prescriptions they're involved in."""
    existing_prescription = get_prescription_by_id(prescription_id)
    if not existing_prescription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Prescription not found"
        )
    current_user = request.state.user
    if not current_user.is_admin:
        user_profile_id = await get_user_profile_id(current_user)
        if (
            existing_prescription.patient_id != user_profile_id
            and existing_prescription.doctor_id != user_profile_id
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Access denied"
            )
        if current_user.is_patient:
            allowed_fields = {"status", "notes"}
            provided_fields = set(
                prescription_data.model_dump(exclude_unset=True).keys()
            )
            if not provided_fields.issubset(allowed_fields):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Patients can only update: {', '.join(allowed_fields)}",
                )
    try:
        updated_prescription = update_prescription(prescription_id, prescription_data)
        if not updated_prescription:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Prescription not found"
            )
        return PrescriptionRead.model_validate(updated_prescription)
    except Exception as e:
        logger.error(f"Error updating prescription {prescription_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update prescription",
        )


# Cancel Prescription
@router.delete("/prescriptions/{prescription_id}")
async def cancel_prescription(prescription_id: uuid.UUID, request: Request):
    """Cancel a prescription. Users can only cancel prescriptions they're involved in."""
    # Get existing prescription
    existing_prescription = get_prescription_by_id(prescription_id)
    if not existing_prescription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Prescription not found"
        )

    # Check access permissions
    current_user = request.state.user
    if not current_user.is_admin:
        user_profile_id = await get_user_profile_id(current_user)

        # Check if user is either the patient or doctor in this prescription
        print(f"🔥{existing_prescription}\n\n{user_profile_id}")
        if (
            existing_prescription.patient_id != user_profile_id
            and existing_prescription.doctor_id != user_profile_id
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Access denied"
            )

    try:
        success = delete_prescription(prescription_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Prescription not found"
            )

        return {"message": "Prescription cancelled successfully"}

    except Exception as e:
        logger.error(f"Error cancelling prescription {prescription_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to cancel prescription",
        )


# Search Prescriptions
@router.get("/prescriptions/search", response_model=dict)
async def search_user_prescriptions(
    request: Request,
    patient_id: Optional[uuid.UUID] = Query(None),
    doctor_id: Optional[uuid.UUID] = Query(None),
    medication_id: Optional[uuid.UUID] = Query(None),
    appointment_id: Optional[uuid.UUID] = Query(None),
    status: Optional[PrescriptionStatus] = Query(None),
    prescribed_date_from: Optional[datetime] = Query(None),
    prescribed_date_to: Optional[datetime] = Query(None),
    start_date_from: Optional[datetime] = Query(None),
    start_date_to: Optional[datetime] = Query(None),
    medication_name: Optional[str] = Query(None),
    diagnosis: Optional[str] = Query(None),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
):
    """Search prescriptions with filters. Users can only search their own prescriptions unless they're admin."""
    try:
        current_user = request.state.user

        # Restrict search based on user type
        if not current_user.is_admin:
            user_profile_id = await get_user_profile_id(current_user)

            if current_user.is_patient:
                # Patients can only search their own prescriptions
                patient_id = user_profile_id
                doctor_id = None  # Clear doctor_id filter
            elif current_user.is_doctor:
                # Doctors can only search prescriptions they created
                doctor_id = user_profile_id
                # Don't clear patient_id - doctors can filter by patient

        filters = PrescriptionSearchFilters(
            patient_id=patient_id,
            doctor_id=doctor_id,
            medication_id=medication_id,
            appointment_id=appointment_id,
            status=status,
            prescribed_date_from=prescribed_date_from,
            prescribed_date_to=prescribed_date_to,
            start_date_from=start_date_from,
            start_date_to=start_date_to,
            medication_name=medication_name,
            diagnosis=diagnosis,
            limit=limit,
            offset=offset,
        )

        prescriptions, total_count = search_prescriptions(filters)

        return {
            "prescriptions": prescriptions,
            "total": total_count,
            "limit": limit,
            "offset": offset,
        }

    except Exception as e:
        logger.error(f"Error searching prescriptions: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to search prescriptions",
        )


# Get My Prescriptions
@router.get("/prescriptions/my/list", response_model=dict)
async def get_my_prescriptions(
    request: Request, limit: int = Query(20, ge=1, le=100), offset: int = Query(0, ge=0)
):
    """Get current user's prescriptions (as patient or doctor)."""
    try:
        current_user = request.state.user
        user_profile_id = await get_user_profile_id(current_user)

        if current_user.is_patient:
            prescriptions, total_count = get_patient_prescriptions(
                user_profile_id, limit, offset
            )
        elif current_user.is_doctor:
            prescriptions, total_count = get_doctor_prescriptions(
                user_profile_id, limit, offset
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only patients and doctors can access prescriptions",
            )

        return {
            "prescriptions": [
                PrescriptionRead.model_validate(p) for p in prescriptions
            ],
            "total": total_count,
            "limit": limit,
            "offset": offset,
        }

    except Exception as e:
        logger.error(f"Error fetching user prescriptions: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch prescriptions",
        )


# Get Active Prescriptions
@router.get("/prescriptions/my/active", response_model=List[PrescriptionRead])
async def get_my_active_prescriptions(
    request: Request, limit: int = Query(20, ge=1, le=50)
):
    """Get current user's active prescriptions."""
    try:
        current_user = request.state.user
        prescriptions = get_active_prescriptions(current_user, limit)

        return [PrescriptionRead.model_validate(p) for p in prescriptions]

    except Exception as e:
        logger.error(f"Error fetching active prescriptions: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch active prescriptions",
        )


# Get Prescription Stats
@router.get("/prescriptions/my/stats", response_model=PrescriptionStats)
async def get_my_prescription_stats(request: Request):
    """Get prescription statistics for current user."""
    try:
        current_user = request.state.user
        stats = get_prescription_stats(current_user)
        print(f"🔥{stats}")
        return stats

    except Exception as e:
        logger.error(f"Error fetching prescription stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch prescription statistics",
        )


# Batch Update Prescriptions
@router.put("/prescriptions/batch", response_model=dict)
async def batch_update_prescriptions(
    batch_data: PrescriptionBatchUpdate, request: Request
):
    """Batch update prescriptions. Only doctors and admins can perform batch operations."""
    current_user = request.state.user

    # Only doctors and admins can perform batch operations
    if not (current_user.is_doctor or current_user.is_admin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only doctors and admins can perform batch operations",
        )

    try:
        updated_count = 0
        failed_updates = []

        for prescription_id in batch_data.prescription_ids:
            try:
                # Check if user has access to this prescription
                existing_prescription = get_prescription_by_id(prescription_id)
                if not existing_prescription:
                    failed_updates.append(
                        {"id": prescription_id, "error": "Prescription not found"}
                    )
                    continue

                # Check access permissions
                if not current_user.is_admin:
                    user_profile_id = await get_user_profile_id(current_user)
                    if (
                        existing_prescription.patient_id != user_profile_id
                        and existing_prescription.doctor_id != user_profile_id
                    ):
                        failed_updates.append(
                            {"id": prescription_id, "error": "Access denied"}
                        )
                        continue

                # Create update data
                update_data = PrescriptionUpdate()
                if batch_data.status:
                    update_data.status = batch_data.status
                if batch_data.notes:
                    update_data.notes = batch_data.notes

                # Update prescription
                updated_prescription = update_prescription(prescription_id, update_data)
                if updated_prescription:
                    updated_count += 1
                else:
                    failed_updates.append(
                        {"id": prescription_id, "error": "Update failed"}
                    )

            except Exception as e:
                failed_updates.append({"id": prescription_id, "error": str(e)})

        return {
            "message": "Batch update completed",
            "updated_count": updated_count,
            "failed_count": len(failed_updates),
            "failed_updates": failed_updates,
        }

    except Exception as e:
        logger.error(f"Error in batch update: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to perform batch update",
        )


# Generate a signed URL to view a prescription PDF
@router.get(
    "/prescriptions/pdf/{pdf_id}/view",
    response_model=str,
    tags=["Prescriptions"],
)
async def view_prescription_pdf(pdf_id: uuid.UUID, request: Request):
    """Generate a signed URL to view a prescription PDF. Only the patient who uploaded it or an admin can access."""
    try:
        pdf_record = get_prescription_pdf_by_id(pdf_id)
        if not pdf_record:
            raise HTTPException(status_code=404, detail="Prescription PDF not found")
        current_user = request.state.user
        patient_id = await get_user_profile_id(current_user)
        # Only the patient who uploaded or admin can view
        if not (
            current_user.is_admin
            or current_user.is_doctor
            or pdf_record.patient_id == patient_id
        ):
            raise HTTPException(status_code=403, detail="Access denied")
        # Generate signed URL
        # Generate a URL to the file serving endpoint
        BACKEND_URL = settings.BACKEND_URL.rstrip("/")
        file_url = f"{BACKEND_URL}/files/{pdf_record.file_name}"
        print(f"Generated file URL for prescription PDF {pdf_id}: {file_url}")
        return file_url
    except Exception as e:
        logger.error(
            f"❌ Error generating signed URL for prescription PDF {pdf_id}: {e}"
        )
        raise HTTPException(
            status_code=500,
            detail="Failed to generate signed URL for prescription PDF",
        )


@router.get("/prescriptions/my/pdfs", response_model=dict)
async def get_my_prescription_pdfs(
    request: Request, limit: int = Query(20, ge=1, le=100), offset: int = Query(0, ge=0)
):
    """Get current patient's uploaded prescription PDFs."""
    try:
        current_user = request.state.user
        if not current_user.is_patient:
            raise HTTPException(
                status_code=403,
                detail="Only patients can access their prescription PDFs",
            )
        user_profile_id = await get_user_profile_id(current_user)
        pdfs, total_count = get_patient_prescription_pdfs(
            user_profile_id, limit, offset
        )
        return {
            "pdfs": [
                PrescriptionPDFRead.model_validate(
                    {
                        "own_prescription": pdf.uploaded_by == current_user.id,
                        **pdf.__dict__,
                    }
                )
                for pdf in pdfs
            ],
            "total": total_count,
            "limit": limit,
            "offset": offset,
        }
    except Exception as e:
        logger.error(f"❌ Error fetching patient prescription PDFs: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch prescription PDFs",
        )


@router.get("/prescriptions/patients/{patient_id}/pdfs", response_model=dict)
async def get_paitents_prescriptions_pdfs(
    request: Request,
    patient_id: uuid.UUID,
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
):
    """Get current patient's uploaded prescription PDFs."""
    try:
        current_user = request.state.user
        if not current_user.is_doctor:
            raise HTTPException(
                status_code=403,
                detail="Only doctor can access patients prescription PDFs",
            )

        pdfs, total_count = get_patient_prescription_pdfs(
            patient_id=patient_id, limit=limit, offset=offset
        )
        return {
            "pdfs": [PrescriptionPDFRead.model_validate(pdf) for pdf in pdfs],
            "total": total_count,
            "limit": limit,
            "offset": offset,
        }
    except Exception as e:
        logger.error(f"❌ Error fetching patient prescription PDFs: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch prescription PDFs",
        )


@router.patch("/prescriptions/pdf/{pdf_id}/status", response_model=str)
async def update_prescription_pdf_status(
    pdf_id: uuid.UUID,
    request: Request,
    status: PrescriptionStatus = Body(..., embed=True),
):
    """Update the status of an uploaded prescription PDF (patient only)."""
    pdf_record = get_prescription_pdf_by_id(pdf_id)
    if not pdf_record:
        raise HTTPException(status_code=404, detail="Prescription PDF not found")
    current_user = request.state.user
    user_profile_id = await get_user_profile_id(current_user)

    # Check access: patient can update their own PDF, doctor can only mark completed as expired
    is_owner = current_user.is_patient and pdf_record.patient_id == user_profile_id

    if not is_owner:
        raise HTTPException(status_code=403, detail="Access denied")

    # Update status
    from app.db.session import engine
    from sqlmodel import Session

    with Session(engine) as session:
        pdf_record.status = status
        session.add(pdf_record)
        session.commit()
        session.refresh(pdf_record)
        return status


@router.delete("/prescriptions/pdf/{pdf_id}", response_model=dict)
async def delete_prescription_pdf(pdf_id: uuid.UUID, request: Request):
    """Delete an uploaded prescription PDF (patient only)."""
    pdf_record = get_prescription_pdf_by_id(pdf_id)
    if not pdf_record:
        raise HTTPException(status_code=404, detail="Prescription PDF not found")
    current_user = request.state.user
    user_profile_id = await get_user_profile_id(current_user)

    # Only the patient corresponding or doctor who uploaded the PDF can delete it
    if not (
        (current_user.is_patient and pdf_record.patient_id == user_profile_id)
        or (current_user.is_doctor and pdf_record.uploaded_by == current_user.id)
    ):
        raise HTTPException(status_code=403, detail="Access denied")

    # Delete from DB
    from app.db.session import engine
    from sqlmodel import Session

    with Session(engine) as session:
        session.delete(pdf_record)
        session.commit()
    return {"message": "Prescription PDF deleted successfully"}


# ===============================
# MEDICATION LOG ENDPOINTS
# ===============================


# Create Medication Log
@router.post("/medication-logs", response_model=MedicationLogRead)
async def create_new_medication_log(
    log_data: MedicationLogCreate, session: SessionDep, request: Request
):
    """Create a new medication log. Patients can only log their own prescriptions."""
    try:
        current_user = request.state.user

        # Check if user has access to the prescription
        prescription = get_prescription_by_id(log_data.prescription_id)
        if not prescription:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Prescription not found"
            )

        # Check access permissions
        if not current_user.is_admin:
            user_profile_id = await get_user_profile_id(current_user)

            # Patients can only log their own prescriptions
            if current_user.is_patient:
                if prescription.patient_id != user_profile_id:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN, detail="Access denied"
                    )
            # Doctors can log for their own prescriptions
            elif current_user.is_doctor:
                if prescription.doctor_id != user_profile_id:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN, detail="Access denied"
                    )

        log = create_medication_log(log_data)
        return MedicationLogRead.model_validate(log)

    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating medication log: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create medication log",
        )


# Get Medication Log by ID
@router.get("/medication-logs/{log_id}", response_model=MedicationLogRead)
async def get_medication_log(log_id: uuid.UUID, request: Request):
    """Get medication log by ID. Users can only access logs for their prescriptions."""
    log = get_medication_log_by_id(log_id)
    if not log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Medication log not found"
        )

    # Check access permissions through prescription
    prescription = get_prescription_by_id(log.prescription_id)
    if not prescription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Associated prescription not found",
        )

    current_user = request.state.user
    if not current_user.is_admin:
        user_profile_id = await get_user_profile_id(current_user)

        # Check if user is either the patient or doctor in the prescription
        if (
            prescription.patient_id != user_profile_id
            and prescription.doctor_id != user_profile_id
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Access denied"
            )

    return MedicationLogRead.model_validate(log)


# Update Medication Log
@router.put("/medication-logs/{log_id}", response_model=MedicationLogRead)
async def update_existing_medication_log(
    log_id: uuid.UUID, log_data: MedicationLogUpdate, request: Request
):
    """Update medication log. Users can only update logs for their prescriptions."""
    # Get existing log
    existing_log = get_medication_log_by_id(log_id)
    if not existing_log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Medication log not found"
        )

    # Check access permissions through prescription
    prescription = get_prescription_by_id(existing_log.prescription_id)
    if not prescription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Associated prescription not found",
        )

    current_user = request.state.user
    if not current_user.is_admin:
        user_profile_id = await get_user_profile_id(current_user)

        # Check if user is either the patient or doctor in the prescription
        if (
            prescription.patient_id != user_profile_id
            and prescription.doctor_id != user_profile_id
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Access denied"
            )

    try:
        updated_log = update_medication_log(log_id, log_data)
        if not updated_log:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Medication log not found"
            )

        return MedicationLogRead.model_validate(updated_log)

    except Exception as e:
        logger.error(f"Error updating medication log {log_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update medication log",
        )


# Delete Medication Log
@router.delete("/medication-logs/{log_id}")
async def delete_existing_medication_log(log_id: uuid.UUID, request: Request):
    """Delete medication log. Users can only delete logs for their prescriptions."""
    # Get existing log
    existing_log = get_medication_log_by_id(log_id)
    if not existing_log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Medication log not found"
        )

    # Check access permissions through prescription
    prescription = get_prescription_by_id(existing_log.prescription_id)
    if not prescription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Associated prescription not found",
        )

    current_user = request.state.user
    if not current_user.is_admin:
        user_profile_id = await get_user_profile_id(current_user)

        # Check if user is either the patient or doctor in the prescription
        if (
            prescription.patient_id != user_profile_id
            and prescription.doctor_id != user_profile_id
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Access denied"
            )

    try:
        success = delete_medication_log(log_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Medication log not found"
            )

        return {"message": "Medication log deleted successfully"}

    except Exception as e:
        logger.error(f"Error deleting medication log {log_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete medication log",
        )


# Get Prescription Logs
@router.get("/prescriptions/{prescription_id}/logs", response_model=dict)
async def get_prescription_medication_logs(
    prescription_id: uuid.UUID,
    request: Request,
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
):
    """Get medication logs for a specific prescription."""
    # Check if prescription exists and user has access
    prescription = get_prescription_by_id(prescription_id)
    if not prescription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Prescription not found"
        )

    current_user = request.state.user
    if not current_user.is_admin:
        user_profile_id = await get_user_profile_id(current_user)

        # Check if user is either the patient or doctor in the prescription
        if (
            prescription.patient_id != user_profile_id
            and prescription.doctor_id != user_profile_id
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Access denied"
            )

    try:
        logs, total_count = get_prescription_logs(prescription_id, limit, offset)

        return {
            "logs": [MedicationLogRead.model_validate(log) for log in logs],
            "total": total_count,
            "limit": limit,
            "offset": offset,
        }

    except Exception as e:
        logger.error(f"Error fetching prescription logs: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch medication logs",
        )


# Get My Medication Logs (Patient)
@router.get("/medication-logs/my/list", response_model=dict)
async def get_my_medication_logs(
    request: Request, limit: int = Query(50, ge=1, le=100), offset: int = Query(0, ge=0)
):
    """Get current patient's medication logs with prescription details."""
    try:
        current_user = request.state.user

        # Only patients can access this endpoint
        if not current_user.is_patient:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only patients can access medication logs",
            )

        user_profile_id = await get_user_profile_id(current_user)
        logs, total_count = get_patient_medication_logs(user_profile_id, limit, offset)

        return {"logs": logs, "total": total_count, "limit": limit, "offset": offset}

    except Exception as e:
        logger.error(f"Error fetching patient medication logs: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch medication logs",
        )


@router.get("/medications/my/list-items", response_model=dict)
async def get_my_medication_items(
    request: Request,
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
):
    """Get all medication items (PrescriptionItems) for the current patient, with prescription and doctor info."""
    try:
        current_user = request.state.user
        if not current_user.is_patient:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only patients can access their medications",
            )
        user_profile_id = await get_user_profile_id(current_user)
        from app.db.session import engine
        from sqlmodel import Session

        with Session(engine) as session:
            # Get all prescriptions for this patient
            prescriptions = session.exec(
                select(Prescription).where(Prescription.patient_id == user_profile_id)
            ).all()
            prescription_ids = [p.id for p in prescriptions]
            # Get all PrescriptionItems for these prescriptions
            items = session.exec(
                select(PrescriptionItem)
                .where(PrescriptionItem.prescription_id.in_(prescription_ids))
                .offset(offset)
                .limit(limit)
            ).all()
            # Build response with prescription and doctor info
            result = []
            for item in items:
                prescription = next(
                    (p for p in prescriptions if p.id == item.prescription_id), None
                )
                doctor_info = None
                if prescription:
                    doctor_info = await get_profile(profile_id=prescription.doctor_id)
                result.append(
                    {
                        "id": str(item.id),
                        "medication_name": item.medication_name,
                        "dosage": item.dosage,
                        "frequency": item.frequency,
                        "quantity": item.quantity,
                        "duration": item.duration,
                        "instructions": item.instructions,
                        "prescription_id": str(item.prescription_id),
                        "prescribed_date": prescription.prescribed_date
                        if prescription
                        else None,
                        "doctor": {
                            "name": f"{doctor_info.get('first_name', '')} {doctor_info.get('last_name', '')}"
                            if doctor_info
                            else None,
                            "specialization": doctor_info.get("specialization")
                            if doctor_info
                            else None,
                        }
                        if doctor_info
                        else None,
                    }
                )
            return {
                "medications": result,
                "total": len(result),
                "limit": limit,
                "offset": offset,
            }
    except Exception as e:
        logger.error(f"Error fetching patient medication items: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch medication items",
        )


@router.get("/medications/my/stats", response_model=dict)
async def get_my_medication_stats(request: Request):
    """Get medication stats for the current patient (for sidebar)."""
    try:
        current_user = request.state.user
        if not current_user.is_patient:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only patients can access medication stats",
            )
        user_profile_id = await get_user_profile_id(current_user)
        from app.db.session import engine
        from sqlmodel import Session

        with Session(engine) as session:
            # Get all prescriptions for this patient
            prescriptions = session.exec(
                select(Prescription).where(Prescription.patient_id == user_profile_id)
            ).all()
            prescription_ids = [p.id for p in prescriptions]
            # Get all PrescriptionItems for these prescriptions
            items = session.exec(
                select(PrescriptionItem).where(
                    PrescriptionItem.prescription_id.in_(prescription_ids)
                )
            ).all()
            active_medications = len(items)
            return {"activeMedications": active_medications}
    except Exception as e:
        logger.error(f"Error fetching patient medication stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch medication stats",
        )


@router.get("/medications/patient/{patient_id}/list-items", response_model=dict)
async def get_patient_medication_items(
    patient_id: uuid.UUID,
    request: Request,
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
):
    """Get all medication items (PrescriptionItems) for a specific patient, with prescription and doctor info. Only doctors and admins can access."""
    try:
        current_user = request.state.user
        if not (current_user.is_doctor or current_user.is_admin):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only doctors and admins can access patient medications",
            )
        from app.db.session import engine
        from sqlmodel import Session

        with Session(engine) as session:
            # Get all prescriptions for this patient
            prescriptions = session.exec(
                select(Prescription).where(Prescription.patient_id == patient_id)
            ).all()
            prescription_ids = [p.id for p in prescriptions]
            # Get all PrescriptionItems for these prescriptions
            items = session.exec(
                select(PrescriptionItem)
                .where(PrescriptionItem.prescription_id.in_(prescription_ids))
                .offset(offset)
                .limit(limit)
            ).all()
            # Build response with prescription and doctor info
            result = []
            for item in items:
                prescription = next(
                    (p for p in prescriptions if p.id == item.prescription_id), None
                )
                doctor_info = None
                if prescription:
                    doctor_info = await get_profile(profile_id=prescription.doctor_id)
                result.append(
                    {
                        "id": str(item.id),
                        "medication_name": item.medication_name,
                        "dosage": item.dosage,
                        "frequency": item.frequency,
                        "quantity": item.quantity,
                        "duration": item.duration,
                        "instructions": item.instructions,
                        "prescription_id": str(item.prescription_id),
                        "prescribed_date": prescription.prescribed_date
                        if prescription
                        else None,
                        "doctor": {
                            "name": f"{doctor_info.get('first_name', '')} {doctor_info.get('last_name', '')}"
                            if doctor_info
                            else None,
                            "specialization": doctor_info.get("specialization")
                            if doctor_info
                            else None,
                        }
                        if doctor_info
                        else None,
                    }
                )
            return {
                "medications": result,
                "total": len(result),
                "limit": limit,
                "offset": offset,
            }
    except Exception as e:
        logger.error(f"Error fetching patient medication items: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch medication items",
        )
