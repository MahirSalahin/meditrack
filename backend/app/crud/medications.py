from fastapi import File
from sqlmodel import Session, select, and_, or_, func
from sqlalchemy.exc import IntegrityError
from app.models.medications import (
    Medication,
    Prescription,
    MedicationLog,
    PrescriptionPDF,
    PrescriptionItem,  # new import
)
from app.models.profiles import PatientProfile, DoctorProfile
from app.models.auth import User
from app.models.enums import PrescriptionStatus
from app.schemas.medications import (
    MedicationCreate,
    MedicationUpdate,
    MedicationSearchFilters,
    PrescriptionCreate,
    PrescriptionUpdate,
    PrescriptionSearchFilters,
    MedicationLogCreate,
    MedicationLogUpdate,
    PrescriptionStats,
)
from app.db.session import engine
from typing import Optional, List, Tuple
from datetime import datetime
import logging
import uuid
from app.services import file_service
from app.services.pdf_service import render_prescription_pdf
from app.crud.profiles import get_profile

logger = logging.getLogger(__name__)


# ===============================
# MEDICATION CRUD OPERATIONS
# ===============================


def get_medication_by_id(medication_id: uuid.UUID) -> Optional[Medication]:
    """Get medication by ID."""
    try:
        with Session(engine) as session:
            statement = select(Medication).where(Medication.id == medication_id)
            medication = session.exec(statement).first()
            return medication
    except Exception as e:
        logger.error(f"Error fetching medication {medication_id}: {e}")
        return None


def create_medication(medication_data: MedicationCreate) -> Medication:
    """Create a new medication."""
    with Session(engine) as session:
        try:
            db_medication = Medication(
                name=medication_data.name,
                generic_name=medication_data.generic_name,
                description=medication_data.description,
                manufacturer=medication_data.manufacturer,
                drug_class=medication_data.drug_class,
                contraindications=medication_data.contraindications,
                side_effects=medication_data.side_effects,
                interactions=medication_data.interactions,
            )

            session.add(db_medication)
            session.commit()
            session.refresh(db_medication)
            return db_medication

        except IntegrityError as e:
            session.rollback()
            logger.error(f"Database integrity error creating medication: {e}")
            raise ValueError("Failed to create medication - data integrity error")
        except Exception as e:
            session.rollback()
            logger.error(f"Error creating medication: {e}")
            raise


def update_medication(
    medication_id: uuid.UUID, medication_data: MedicationUpdate
) -> Optional[Medication]:
    """Update an existing medication."""
    with Session(engine) as session:
        try:
            medication = session.exec(
                select(Medication).where(Medication.id == medication_id)
            ).first()

            if not medication:
                return None

            # Update fields that are provided
            update_data = medication_data.model_dump(exclude_unset=True)
            for field, value in update_data.items():
                setattr(medication, field, value)

            session.add(medication)
            session.commit()
            session.refresh(medication)
            return medication

        except Exception as e:
            session.rollback()
            logger.error(f"Error updating medication {medication_id}: {e}")
            raise


def delete_medication(medication_id: uuid.UUID) -> bool:
    """Delete a medication (hard delete if no prescriptions exist)."""
    with Session(engine) as session:
        try:
            # Check if medication has any prescriptions
            prescription_count = session.exec(
                select(func.count(Prescription.id)).where(
                    Prescription.medication_id == medication_id
                )
            ).first()

            if prescription_count > 0:
                raise ValueError("Cannot delete medication with existing prescriptions")

            medication = session.exec(
                select(Medication).where(Medication.id == medication_id)
            ).first()

            if not medication:
                return False

            session.delete(medication)
            session.commit()
            return True

        except Exception as e:
            session.rollback()
            logger.error(f"Error deleting medication {medication_id}: {e}")
            raise


def search_medications(
    filters: MedicationSearchFilters,
) -> Tuple[List[Medication], int]:
    """Search medications with filtering and pagination."""
    with Session(engine) as session:
        try:
            # Base query
            base_query = select(Medication)

            # Apply filters
            where_conditions = []

            if filters.name:
                where_conditions.append(Medication.name.ilike(f"%{filters.name}%"))

            if filters.generic_name:
                where_conditions.append(
                    Medication.generic_name.ilike(f"%{filters.generic_name}%")
                )

            if filters.manufacturer:
                where_conditions.append(
                    Medication.manufacturer.ilike(f"%{filters.manufacturer}%")
                )

            if filters.drug_class:
                where_conditions.append(
                    Medication.drug_class.ilike(f"%{filters.drug_class}%")
                )

            if where_conditions:
                base_query = base_query.where(and_(*where_conditions))

            # Get total count
            count_query = select(func.count()).select_from(base_query.subquery())
            total_count = session.exec(count_query).first()

            # Apply pagination and get results
            medications_query = (
                base_query.offset(filters.offset)
                .limit(filters.limit)
                .order_by(Medication.name)
            )
            medications = session.exec(medications_query).all()

            return list(medications), total_count

        except Exception as e:
            logger.error(f"Error searching medications: {e}")
            return [], 0


# ===============================
# PRESCRIPTION CRUD OPERATIONS
# ===============================


def get_prescription_by_id(prescription_id: uuid.UUID) -> Optional[Prescription]:
    """Get prescription by ID with relationships and items."""
    try:
        with Session(engine) as session:
            statement = select(Prescription).where(Prescription.id == prescription_id)
            prescription = session.exec(statement).first()
            if prescription:
                # Eager load items
                prescription.items  # triggers loading
            return prescription
    except Exception as e:
        logger.error(f"Error fetching prescription {prescription_id}: {e}")
        return None


def create_prescription(
    prescription_data: PrescriptionCreate,
    created_by_doctor_id: Optional[uuid.UUID] = None,
) -> Prescription:
    """Create a new prescription with multiple items."""
    with Session(engine) as session:
        try:
            doctor_id = created_by_doctor_id or prescription_data.doctor_id
            patient_id = prescription_data.patient_id
            if not doctor_id:
                raise ValueError("Doctor ID is required")
            if not patient_id:
                raise ValueError("Patient ID is required")
            # Verify doctor exists
            doctor_exists = session.exec(
                select(DoctorProfile).where(DoctorProfile.id == doctor_id)
            ).first()
            if not doctor_exists:
                raise ValueError("Doctor not found")
            # Verify patient exists
            patient_exists = session.exec(
                select(PatientProfile).where(PatientProfile.id == patient_id)
            ).first()
            if not patient_exists:
                raise ValueError("Patient not found")
            # Create prescription
            db_prescription = Prescription(
                patient_id=patient_id,
                doctor_id=doctor_id,
                appointment_id=prescription_data.appointment_id,
                prescribed_date=datetime.utcnow(),
                start_date=prescription_data.start_date,
                end_date=prescription_data.end_date,
                diagnosis=prescription_data.diagnosis,
                notes=prescription_data.notes,
                status=PrescriptionStatus.ACTIVE,
            )
            session.add(db_prescription)
            session.flush()  # get id for items
            # Add items
            for item in prescription_data.items:
                db_item = PrescriptionItem(
                    prescription_id=db_prescription.id,
                    medication_name=item.medication_name,
                    dosage=item.dosage,
                    frequency=item.frequency,
                    quantity=item.quantity,
                    duration=item.duration,
                    instructions=item.instructions,
                )
                session.add(db_item)
            session.commit()
            session.refresh(db_prescription)
            db_prescription.items  # eager load
            return db_prescription
        except IntegrityError as e:
            session.rollback()
            logger.error(f"Database integrity error creating prescription: {e}")
            raise ValueError("Failed to create prescription - data integrity error")
        except Exception as e:
            session.rollback()
            logger.error(f"Error creating prescription: {e}")
            raise


def update_prescription(
    prescription_id: uuid.UUID, prescription_data: PrescriptionUpdate
) -> Optional[Prescription]:
    """Update an existing prescription and its items."""
    with Session(engine) as session:
        try:
            prescription = session.exec(
                select(Prescription).where(Prescription.id == prescription_id)
            ).first()
            if not prescription:
                return None
            update_data = prescription_data.model_dump(exclude_unset=True)
            # Update prescription fields
            for field in ["start_date", "end_date", "status", "diagnosis", "notes"]:
                if field in update_data:
                    setattr(prescription, field, update_data[field])
            # Update items if provided
            if "items" in update_data and update_data["items"] is not None:
                # Remove old items
                for old_item in prescription.items:
                    session.delete(old_item)
                # Add new items
                for item in update_data["items"]:
                    db_item = PrescriptionItem(
                        prescription_id=prescription.id,
                        medication_name=item.medication_name,
                        dosage=item.dosage,
                        frequency=item.frequency,
                        quantity=item.quantity,
                        duration=item.duration,
                        instructions=item.instructions,
                    )
                    session.add(db_item)
            session.add(prescription)
            session.commit()
            session.refresh(prescription)
            prescription.items  # eager load
            return prescription
        except Exception as e:
            session.rollback()
            logger.error(f"Error updating prescription {prescription_id}: {e}")
            raise


def delete_prescription(prescription_id: uuid.UUID) -> bool:
    """Delete a prescription (soft delete by setting status to cancelled) and remove associated PDF from GCP."""
    from app.models.medications import PrescriptionPDF

    with Session(engine) as session:
        try:
            prescription = session.exec(
                select(Prescription).where(Prescription.id == prescription_id)
            ).first()

            if not prescription:
                return False

            # Delete associated PDF from GCP and DB
            pdf_record = session.exec(
                select(PrescriptionPDF).where(
                    PrescriptionPDF.prescription_id == prescription_id
                )
            ).first()
            if pdf_record:
                # Delete file from GCP
                file_service.delete_file(pdf_record.file_name)
                # Delete PDF record from DB
                session.delete(pdf_record)

            prescription.status = PrescriptionStatus.DISCONTINUED
            session.add(prescription)
            session.commit()
            return True

        except Exception as e:
            session.rollback()
            logger.error(f"Error deleting prescription {prescription_id}: {e}")
            return False


def search_prescriptions(filters: PrescriptionSearchFilters) -> Tuple[List[dict], int]:
    """Search prescriptions with filtering and pagination."""
    with Session(engine) as session:
        try:
            # Use aliases to avoid column conflicts
            from sqlalchemy import alias

            PatientUser = alias(User, name="patient_user")
            DoctorUser = alias(User, name="doctor_user")

            # Base query with joins for searching
            base_query = (
                select(
                    Prescription,
                    func.concat(
                        PatientUser.c.first_name, " ", PatientUser.c.last_name
                    ).label("patient_name"),
                    func.concat(
                        DoctorUser.c.first_name, " ", DoctorUser.c.last_name
                    ).label("doctor_name"),
                    Medication.name.label("medication_name"),
                    Medication.generic_name.label("medication_generic_name"),
                )
                .join(PatientProfile, Prescription.patient_id == PatientProfile.id)
                .join(
                    PatientUser,
                    PatientProfile.user_id == PatientUser.c.id,
                    isouter=True,
                )
                .join(DoctorProfile, Prescription.doctor_id == DoctorProfile.id)
                .join(
                    DoctorUser, DoctorProfile.user_id == DoctorUser.c.id, isouter=True
                )
                .join(Medication, Prescription.medication_id == Medication.id)
            )

            # Apply filters
            where_conditions = []

            if filters.patient_id:
                where_conditions.append(Prescription.patient_id == filters.patient_id)

            if filters.doctor_id:
                where_conditions.append(Prescription.doctor_id == filters.doctor_id)

            if filters.medication_id:
                where_conditions.append(
                    Prescription.medication_id == filters.medication_id
                )

            if filters.appointment_id:
                where_conditions.append(
                    Prescription.appointment_id == filters.appointment_id
                )

            if filters.status:
                where_conditions.append(Prescription.status == filters.status)

            if filters.prescribed_date_from:
                where_conditions.append(
                    Prescription.prescribed_date >= filters.prescribed_date_from
                )

            if filters.prescribed_date_to:
                where_conditions.append(
                    Prescription.prescribed_date <= filters.prescribed_date_to
                )

            if filters.start_date_from:
                where_conditions.append(
                    Prescription.start_date >= filters.start_date_from
                )

            if filters.start_date_to:
                where_conditions.append(
                    Prescription.start_date <= filters.start_date_to
                )

            if filters.medication_name:
                where_conditions.append(
                    or_(
                        Medication.name.ilike(f"%{filters.medication_name}%"),
                        Medication.generic_name.ilike(f"%{filters.medication_name}%"),
                    )
                )

            if filters.diagnosis:
                where_conditions.append(
                    Prescription.diagnosis.ilike(f"%{filters.diagnosis}%")
                )

            if where_conditions:
                base_query = base_query.where(and_(*where_conditions))

            # Get total count
            count_query = select(func.count()).select_from(base_query.subquery())
            total_count = session.exec(count_query).first()

            # Apply pagination and get results
            prescriptions_query = (
                base_query.offset(filters.offset)
                .limit(filters.limit)
                .order_by(Prescription.prescribed_date.desc())
            )
            results = session.exec(prescriptions_query).all()

            # Format results
            prescriptions_with_details = []
            for result in results:
                prescription_dict = result[0].__dict__.copy()
                prescription_dict["patient_name"] = result[1]
                prescription_dict["doctor_name"] = result[2]
                prescription_dict["medication_name"] = result[3]
                prescription_dict["medication_generic_name"] = result[4]
                prescriptions_with_details.append(prescription_dict)

            return prescriptions_with_details, total_count

        except Exception as e:
            logger.error(f"Error searching prescriptions: {e}")
            return [], 0


def get_patient_prescriptions(
    patient_id: uuid.UUID, limit: int = 20, offset: int = 0
) -> Tuple[List[Prescription], int]:
    """Get prescriptions for a specific patient."""
    with Session(engine) as session:
        try:
            # Get total count
            total_count = session.exec(
                select(func.count(Prescription.id)).where(
                    Prescription.patient_id == patient_id
                )
            ).first()

            # Get prescriptions
            prescriptions_query = (
                select(Prescription)
                .where(Prescription.patient_id == patient_id)
                .order_by(Prescription.prescribed_date.desc())
                .offset(offset)
                .limit(limit)
            )
            prescriptions = session.exec(prescriptions_query).all()

            return list(prescriptions), total_count

        except Exception as e:
            logger.error(f"Error fetching patient prescriptions: {e}")
            return [], 0


def get_doctor_prescriptions(
    doctor_id: uuid.UUID, limit: int = 20, offset: int = 0
) -> Tuple[List[Prescription], int]:
    """Get prescriptions created by a specific doctor."""
    with Session(engine) as session:
        try:
            # Get total count
            total_count = session.exec(
                select(func.count(Prescription.id)).where(
                    Prescription.doctor_id == doctor_id
                )
            ).first()

            # Get prescriptions
            prescriptions_query = (
                select(Prescription)
                .where(Prescription.doctor_id == doctor_id)
                .order_by(Prescription.prescribed_date.desc())
                .offset(offset)
                .limit(limit)
            )
            prescriptions = session.exec(prescriptions_query).all()

            return list(prescriptions), total_count

        except Exception as e:
            logger.error(f"Error fetching doctor prescriptions: {e}")
            return [], 0


def get_active_prescriptions(user: User, limit: int = 20) -> List[Prescription]:
    """Get active prescriptions for a user (patient or all for doctor)."""
    with Session(engine) as session:
        try:
            if user.is_patient:
                # Get patient profile
                from app.crud.profiles import get_patient_profile_by_user_id

                patient_profile = get_patient_profile_by_user_id(user.id)
                if not patient_profile:
                    return []

                prescriptions_query = (
                    select(Prescription)
                    .where(
                        and_(
                            Prescription.patient_id == patient_profile.id,
                            Prescription.status == PrescriptionStatus.ACTIVE,
                        )
                    )
                    .order_by(Prescription.prescribed_date.desc())
                    .limit(limit)
                )
            elif user.is_doctor:
                # Get doctor profile
                from app.crud.profiles import get_doctor_profile_by_user_id

                doctor_profile = get_doctor_profile_by_user_id(user.id)
                if not doctor_profile:
                    return []

                prescriptions_query = (
                    select(Prescription)
                    .where(
                        and_(
                            Prescription.doctor_id == doctor_profile.id,
                            Prescription.status == PrescriptionStatus.ACTIVE,
                        )
                    )
                    .order_by(Prescription.prescribed_date.desc())
                    .limit(limit)
                )
            else:
                # Admin gets all active prescriptions
                prescriptions_query = (
                    select(Prescription)
                    .where(Prescription.status == PrescriptionStatus.ACTIVE)
                    .order_by(Prescription.prescribed_date.desc())
                    .limit(limit)
                )

            prescriptions = session.exec(prescriptions_query).all()
            return list(prescriptions)

        except Exception as e:
            logger.error(f"Error fetching active prescriptions: {e}")
            return []


def get_prescription_stats(user: User) -> PrescriptionStats:
    """Get prescription statistics for a user, including both structured prescriptions and uploaded PDFs."""
    with Session(engine) as session:
        try:
            print(
                f"🩺 [get_prescription_stats] User: {user.id}, is_patient={getattr(user, 'is_patient', None)}, is_doctor={getattr(user, 'is_doctor', None)}"
            )
            base_query = select(Prescription)
            pdf_query = select(PrescriptionPDF)

            if user.is_patient:
                from app.crud.profiles import get_patient_profile_by_user_id

                patient_profile = get_patient_profile_by_user_id(user.id)
                print(f"👤 [get_prescription_stats] Patient profile: {patient_profile}")
                if not patient_profile:
                    print("❌ [get_prescription_stats] No patient profile found.")
                    return PrescriptionStats(
                        total_prescriptions=0,
                        draft=0,
                        active=0,
                        completed=0,
                        discontinued=0,
                        current_medications=0,
                        medication_logs_count=0,
                    )
                base_query = base_query.where(
                    Prescription.patient_id == patient_profile.id
                )
                pdf_query = pdf_query.where(
                    PrescriptionPDF.patient_id == patient_profile.id
                )
            elif user.is_doctor:
                from app.crud.profiles import get_doctor_profile_by_user_id

                doctor_profile = get_doctor_profile_by_user_id(user.id)
                print(f"🩺 [get_prescription_stats] Doctor profile: {doctor_profile}")
                if not doctor_profile:
                    print("❌ [get_prescription_stats] No doctor profile found.")
                    return PrescriptionStats(
                        total_prescriptions=0,
                        draft=0,
                        active=0,
                        completed=0,
                        discontinued=0,
                        current_medications=0,
                        medication_logs_count=0,
                    )
                base_query = base_query.where(
                    Prescription.doctor_id == doctor_profile.id
                )
                pdf_query = pdf_query.where(PrescriptionPDF.uploaded_by == user.id)

            # Get counts by status for prescriptions
            total_prescriptions = (
                session.exec(
                    select(func.count()).select_from(base_query.subquery())
                ).first()
                or 0
            )
            print(
                f"📊 [get_prescription_stats] total_prescriptions (structured): {total_prescriptions}"
            )

            draft = (
                session.exec(
                    select(func.count()).select_from(
                        base_query.where(
                            Prescription.status == PrescriptionStatus.DRAFT
                        ).subquery()
                    )
                ).first()
                or 0
            )
            print(f"📝 [get_prescription_stats] draft (structured): {draft}")

            active = (
                session.exec(
                    select(func.count()).select_from(
                        base_query.where(
                            Prescription.status == PrescriptionStatus.ACTIVE
                        ).subquery()
                    )
                ).first()
                or 0
            )
            print(f"✅ [get_prescription_stats] active (structured): {active}")

            completed = (
                session.exec(
                    select(func.count()).select_from(
                        base_query.where(
                            Prescription.status == PrescriptionStatus.COMPLETED
                        ).subquery()
                    )
                ).first()
                or 0
            )
            print(f"🏁 [get_prescription_stats] completed (structured): {completed}")

            discontinued = (
                session.exec(
                    select(func.count()).select_from(
                        base_query.where(
                            Prescription.status == PrescriptionStatus.DISCONTINUED
                        ).subquery()
                    )
                ).first()
                or 0
            )
            print(
                f"🚫 [get_prescription_stats] discontinued (structured): {discontinued}"
            )

            # Get counts by status for PDFs
            total_pdfs = (
                session.exec(
                    select(func.count()).select_from(pdf_query.subquery())
                ).first()
                or 0
            )
            print(f"📄 [get_prescription_stats] total_pdfs: {total_pdfs}")

            draft_pdfs = (
                session.exec(
                    select(func.count()).select_from(
                        pdf_query.where(
                            PrescriptionPDF.status == PrescriptionStatus.DRAFT
                        ).subquery()
                    )
                ).first()
                or 0
            )
            print(f"📝 [get_prescription_stats] draft (pdf): {draft_pdfs}")

            active_pdfs = (
                session.exec(
                    select(func.count()).select_from(
                        pdf_query.where(
                            PrescriptionPDF.status == PrescriptionStatus.ACTIVE
                        ).subquery()
                    )
                ).first()
                or 0
            )
            print(f"✅ [get_prescription_stats] active (pdf): {active_pdfs}")

            completed_pdfs = (
                session.exec(
                    select(func.count()).select_from(
                        pdf_query.where(
                            PrescriptionPDF.status == PrescriptionStatus.COMPLETED
                        ).subquery()
                    )
                ).first()
                or 0
            )
            print(f"🏁 [get_prescription_stats] completed (pdf): {completed_pdfs}")

            discontinued_pdfs = (
                session.exec(
                    select(func.count()).select_from(
                        pdf_query.where(
                            PrescriptionPDF.status == PrescriptionStatus.DISCONTINUED
                        ).subquery()
                    )
                ).first()
                or 0
            )
            print(
                f"🚫 [get_prescription_stats] discontinued (pdf): {discontinued_pdfs}"
            )

            # Sum both sources
            total_all = total_prescriptions + total_pdfs
            draft_all = draft + draft_pdfs
            active_all = active + active_pdfs
            completed_all = completed + completed_pdfs
            discontinued_all = discontinued + discontinued_pdfs
            print(f"📊 [get_prescription_stats] total_all: {total_all}")
            print(f"📝 [get_prescription_stats] draft_all: {draft_all}")
            print(f"✅ [get_prescription_stats] active_all: {active_all}")
            print(f"🏁 [get_prescription_stats] completed_all: {completed_all}")
            print(f"🚫 [get_prescription_stats] discontinued_all: {discontinued_all}")

            # Current medications (active prescriptions only from structured)
            current_medications = active
            print(
                f"💊 [get_prescription_stats] current_medications: {current_medications}"
            )

            # Get medication logs count (structured only)
            medication_logs_count = 0
            if user.is_patient:
                # Count logs for patient's prescriptions
                medication_logs_count = (
                    session.exec(
                        select(func.count(MedicationLog.id))
                        .join(
                            Prescription,
                            MedicationLog.prescription_id == Prescription.id,
                        )
                        .where(Prescription.patient_id == patient_profile.id)
                    ).first()
                    or 0
                )
                print(
                    f"📝 [get_prescription_stats] medication_logs_count: {medication_logs_count}"
                )

            print(
                f"✅ [get_prescription_stats] Returning stats: total_prescriptions={total_all}, draft={draft_all}, active={active_all}, completed={completed_all}, discontinued={discontinued_all}, current_medications={current_medications}, medication_logs_count={medication_logs_count}"
            )
            return PrescriptionStats(
                total_prescriptions=total_all,
                draft=draft_all,
                active=active_all,
                completed=completed_all,
                discontinued=discontinued_all,
                current_medications=current_medications,
                medication_logs_count=medication_logs_count,
            )

        except Exception as e:
            print(f"❌ [get_prescription_stats] Error fetching prescription stats: {e}")
            return PrescriptionStats(
                total_prescriptions=0,
                draft=0,
                active=0,
                completed=0,
                discontinued=0,
                current_medications=0,
                medication_logs_count=0,
            )


def create_prescription_from_pdf(
    file, patient_id: uuid.UUID, uploaded_by: uuid.UUID, title: str = None
) -> PrescriptionPDF:
    """Create a PrescriptionPDF record from an uploaded PDF file."""
    if not file:
        raise ValueError("No file provided")
    if not file.filename.lower().endswith(".pdf"):
        raise ValueError("Only PDF files are allowed")

    file_bytes = file.file.read()
    file_size = len(file_bytes)
    if file_size == 0:
        raise ValueError("Uploaded file is empty")

    # Upload to GCP
    gcp_filename = file_service.save_file(
        file_bytes, file.filename
    )

    # Save PrescriptionPDF record
    with Session(engine) as session:
        pdf_record = PrescriptionPDF(
            prescription_id=None,  # Not linked to a structured prescription
            patient_id=patient_id,
            uploaded_by=uploaded_by,
            status=PrescriptionStatus.DRAFT,
            title=title or file.filename,
            file_name=gcp_filename,
            file_size=file_size,
        )
        session.add(pdf_record)
        session.commit()
        session.refresh(pdf_record)
        return pdf_record


async def create_prescription_pdf_and_store(
    prescription: Prescription, uploaded_by: uuid.UUID, title: str = None
) -> PrescriptionPDF:
    """
    Generate a PDF for a prescription, upload to GCP, and save a PrescriptionPDF record.
    Args:
        prescription: Prescription object (with items loaded)
        uploaded_by: UUID of the user uploading (doctor)
        title: Optional title for the PDF
    Returns:
        PrescriptionPDF record
    """
    # Fetch patient and doctor info
    patient_info = await get_profile(profile_id=prescription.patient_id)
    doctor_info = await get_profile(profile_id=prescription.doctor_id)
    logger.info(f"🔥 {patient_info}\n{doctor_info}")

    # Build context for the new template
    context = {
        "patient": {
            "name": f"{patient_info['first_name']} {patient_info['last_name']}",
            "email": patient_info["email"],
            "phone": patient_info["phone"] or "N/A",
            "address": patient_info["address"] or "N/A",
            "age": patient_info.get("age", "N/A"),
        },
        "doctor": {
            "name": f"{doctor_info['first_name']} {doctor_info['last_name']}",
            "email": doctor_info["email"],
            "phone": doctor_info["phone"] or "N/A",
            "specialization": doctor_info["specialization"] or "N/A",
            "medical_license_number": doctor_info["medical_license_number"] or "N/A",
        },
        "items": [
            {
                "medication_name": item.medication_name,
                "dosage": item.dosage,
                "frequency": item.frequency,
                "quantity": item.quantity,
                "duration": item.duration,
                "instructions": item.instructions,
            }
            for item in getattr(prescription, "items", [])
        ],
        "diagnosis": prescription.diagnosis,
        "notes": prescription.notes,
        "start_date": prescription.start_date.strftime("%Y-%m-%d"),
    }

    # Generate PDF
    pdf_bytes = render_prescription_pdf(context)
    # Generate GCP filename
    gcp_filename = file_service.generate_prescription_filename(
        str(prescription.patient_id), str(prescription.id)
    )
    # Upload to GCP
    uploaded_blob_name = file_service.save_file(
        pdf_bytes, gcp_filename
    )
    file_size = len(pdf_bytes)
    # Save PrescriptionPDF record
    from app.models.medications import PrescriptionPDF
    from app.models.enums import PrescriptionStatus
    from app.db.session import engine
    from sqlmodel import Session

    with Session(engine) as session:
        pdf_record = PrescriptionPDF(
            prescription_id=prescription.id,
            patient_id=prescription.patient_id,
            uploaded_by=uploaded_by,
            status=PrescriptionStatus.DRAFT,
            title=title or f"Prescription {prescription.id}",
            file_name=uploaded_blob_name,
            file_size=file_size,
        )
        session.add(pdf_record)
        session.commit()
        session.refresh(pdf_record)
        return pdf_record


# ===============================
# MEDICATION LOG CRUD OPERATIONS
# ===============================


def get_medication_log_by_id(log_id: uuid.UUID) -> Optional[MedicationLog]:
    """Get medication log by ID."""
    try:
        with Session(engine) as session:
            statement = select(MedicationLog).where(MedicationLog.id == log_id)
            log = session.exec(statement).first()
            return log
    except Exception as e:
        logger.error(f"Error fetching medication log {log_id}: {e}")
        return None


def create_medication_log(log_data: MedicationLogCreate) -> MedicationLog:
    """Create a new medication log."""
    with Session(engine) as session:
        try:
            # Verify prescription exists
            prescription_exists = session.exec(
                select(Prescription).where(Prescription.id == log_data.prescription_id)
            ).first()
            if not prescription_exists:
                raise ValueError("Prescription not found")

            db_log = MedicationLog(
                prescription_id=log_data.prescription_id,
                taken_at=log_data.taken_at,
                dosage_taken=log_data.dosage_taken,
                notes=log_data.notes,
                side_effects_experienced=log_data.side_effects_experienced,
            )

            session.add(db_log)
            session.commit()
            session.refresh(db_log)
            return db_log

        except IntegrityError as e:
            session.rollback()
            logger.error(f"Database integrity error creating medication log: {e}")
            raise ValueError("Failed to create medication log - data integrity error")
        except Exception as e:
            session.rollback()
            logger.error(f"Error creating medication log: {e}")
            raise


def update_medication_log(
    log_id: uuid.UUID, log_data: MedicationLogUpdate
) -> Optional[MedicationLog]:
    """Update an existing medication log."""
    with Session(engine) as session:
        try:
            log = session.exec(
                select(MedicationLog).where(MedicationLog.id == log_id)
            ).first()

            if not log:
                return None

            # Update fields that are provided
            update_data = log_data.model_dump(exclude_unset=True)
            for field, value in update_data.items():
                setattr(log, field, value)

            session.add(log)
            session.commit()
            session.refresh(log)
            return log

        except Exception as e:
            session.rollback()
            logger.error(f"Error updating medication log {log_id}: {e}")
            raise


def delete_medication_log(log_id: uuid.UUID) -> bool:
    """Delete a medication log."""
    with Session(engine) as session:
        try:
            log = session.exec(
                select(MedicationLog).where(MedicationLog.id == log_id)
            ).first()

            if not log:
                return False

            session.delete(log)
            session.commit()
            return True

        except Exception as e:
            session.rollback()
            logger.error(f"Error deleting medication log {log_id}: {e}")
            return False


def get_prescription_logs(
    prescription_id: uuid.UUID, limit: int = 50, offset: int = 0
) -> Tuple[List[MedicationLog], int]:
    """Get medication logs for a specific prescription."""
    with Session(engine) as session:
        try:
            # Get total count
            total_count = session.exec(
                select(func.count(MedicationLog.id)).where(
                    MedicationLog.prescription_id == prescription_id
                )
            ).first()

            # Get logs
            logs_query = (
                select(MedicationLog)
                .where(MedicationLog.prescription_id == prescription_id)
                .order_by(MedicationLog.taken_at.desc())
                .offset(offset)
                .limit(limit)
            )
            logs = session.exec(logs_query).all()

            return list(logs), total_count

        except Exception as e:
            logger.error(f"Error fetching prescription logs: {e}")
            return [], 0


def get_patient_medication_logs(
    patient_id: uuid.UUID, limit: int = 50, offset: int = 0
) -> Tuple[List[dict], int]:
    """Get all medication logs for a patient with prescription details."""
    with Session(engine) as session:
        try:
            # Base query with joins
            base_query = (
                select(
                    MedicationLog,
                    Medication.name.label("medication_name"),
                    Prescription.dosage.label("prescription_dosage"),
                    Prescription.frequency.label("prescription_frequency"),
                )
                .join(Prescription, MedicationLog.prescription_id == Prescription.id)
                .join(Medication, Prescription.medication_id == Medication.id)
                .where(Prescription.patient_id == patient_id)
            )

            # Get total count
            count_query = select(func.count()).select_from(base_query.subquery())
            total_count = session.exec(count_query).first()

            # Apply pagination and get results
            logs_query = (
                base_query.offset(offset)
                .limit(limit)
                .order_by(MedicationLog.taken_at.desc())
            )
            results = session.exec(logs_query).all()

            # Format results
            logs_with_details = []
            for result in results:
                log_dict = result[0].__dict__.copy()
                log_dict["prescription_medication_name"] = result[1]
                log_dict["prescription_dosage"] = result[2]
                log_dict["prescription_frequency"] = result[3]
                logs_with_details.append(log_dict)

            return logs_with_details, total_count

        except Exception as e:
            logger.error(f"Error fetching patient medication logs: {e}")
            return [], 0


def get_prescription_pdf_by_id(pdf_id: uuid.UUID) -> Optional[PrescriptionPDF]:
    """Get a PrescriptionPDF record by its ID."""
    try:
        with Session(engine) as session:
            statement = select(PrescriptionPDF).where(PrescriptionPDF.id == pdf_id)
            pdf = session.exec(statement).first()
            return pdf
    except Exception as e:
        logger.error(f"Error fetching PrescriptionPDF {pdf_id}: {e}")
        return None


def get_patient_prescription_pdfs(
    patient_id: uuid.UUID, limit: int = 20, offset: int = 0
) -> Tuple[List[PrescriptionPDF], int]:
    """Get all uploaded prescription PDFs for a patient."""
    with Session(engine) as session:
        # Get total count
        total_count = session.exec(
            select(func.count(PrescriptionPDF.id)).where(
                PrescriptionPDF.patient_id == patient_id
            )
        ).first()
        # Get PDFs
        pdfs_query = (
            select(PrescriptionPDF)
            .where(PrescriptionPDF.patient_id == patient_id)
            .order_by(PrescriptionPDF.created_at.desc())
            .offset(offset)
            .limit(limit)
        )
        pdfs = session.exec(pdfs_query).all()
        return list(pdfs), total_count
