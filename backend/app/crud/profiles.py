from fastapi import HTTPException, status
from sqlmodel import Session, select
from sqlalchemy.exc import IntegrityError
from app.models.profiles import DoctorBookmark, PatientProfile, DoctorProfile
from app.schemas.profiles import (
    PatientProfileCreate,
    PatientProfileUpdate,
    DoctorProfileCreate,
    DoctorProfileUpdate,
)
from app.models.auth import User
from app.db.session import engine
from typing import Optional, Tuple, List
from datetime import datetime
import logging
import uuid
from sqlalchemy import func, or_
from app.crud.auth import get_user_by_id
from datetime import date

logger = logging.getLogger(__name__)


async def get_profile(
    user_id: Optional[uuid.UUID] = None,
    profile_id: Optional[uuid.UUID] = None,
    password: bool = False,
) -> dict:
    if not (user_id or profile_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either user_id or profile_id must be provided",
        )

    user = None
    profile = None

    if user_id:
        user = get_user_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found for the given user ID",
            )
        profile = get_patient_profile_by_user_id(
            user_id
        ) or get_doctor_profile_by_user_id(user_id)
    elif profile_id:
        with Session(engine) as session:
            profile = (
                session.exec(
                    select(PatientProfile).where(PatientProfile.id == profile_id)
                ).first()
                or session.exec(
                    select(DoctorProfile).where(DoctorProfile.id == profile_id)
                ).first()
            )
            if not profile:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Profile not found for the given profile ID",
                )
            user = get_user_by_id(profile.user_id)

    result = {}
    if user:
        for k, v in user.__dict__.items():
            if k == "password_hash" and not password:
                continue
            if not k.startswith("_"):
                result[k] = v
    if profile:
        for k, v in profile.__dict__.items():
            if not k.startswith("_"):
                if k == "id":
                    result["profile_id"] = v
                elif k != "user_id":
                    result[k] = v

    if "date_of_birth" in result and result["date_of_birth"]:
        dob = result["date_of_birth"]
        if isinstance(dob, str):
            dob = date.fromisoformat(dob)
        today = date.today()
        result["age"] = (
            today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
        )

    return result


# Helper function to get user profile ID
async def get_user_profile_id(user: User) -> uuid.UUID:
    """Get the profile ID for the current user based on their type."""
    if user.is_patient:
        profile = get_patient_profile_by_user_id(user.id)
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Patient profile not found",
            )
        return profile.id
    elif user.is_doctor:
        profile = get_doctor_profile_by_user_id(user.id)
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Doctor profile not found"
            )
        return profile.id
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only patients and doctors can access medications",
        )


# Patient Profile CRUD
def get_patient_profile_by_user_id(user_id: uuid.UUID) -> Optional[PatientProfile]:
    """Get patient profile by user ID."""
    try:
        with Session(engine) as session:
            statement = select(PatientProfile).where(PatientProfile.user_id == user_id)
            return session.exec(statement).first()
    except Exception as e:
        logger.error(f"Error fetching patient profile for user {user_id}: {e}")
        return None


def create_patient_profile(profile_data: PatientProfileCreate) -> PatientProfile:
    """Create a new patient profile."""
    with Session(engine) as session:
        try:
            db_profile = PatientProfile(**profile_data.model_dump())
            session.add(db_profile)
            session.commit()
            session.refresh(db_profile)
            return db_profile
        except IntegrityError as e:
            session.rollback()
            logger.error(f"Database integrity error creating patient profile: {e}")
            raise ValueError("Patient profile already exists for this user")
        except Exception as e:
            session.rollback()
            logger.error(f"Error creating patient profile: {e}")
            raise


def update_patient_profile(
    user_id: uuid.UUID, profile_data: PatientProfileUpdate
) -> Optional[PatientProfile]:
    """Update patient profile by user ID."""
    with Session(engine) as session:
        try:
            statement = select(PatientProfile).where(PatientProfile.user_id == user_id)
            db_profile = session.exec(statement).first()

            if not db_profile:
                return None

            # Update only provided fields
            update_data = profile_data.model_dump(exclude_unset=True)
            for field, value in update_data.items():
                setattr(db_profile, field, value)

            # Update the timestamp
            db_profile.updated_at = datetime.utcnow()

            session.add(db_profile)
            session.commit()
            session.refresh(db_profile)
            return db_profile
        except Exception as e:
            session.rollback()
            logger.error(f"Error updating patient profile: {e}")
            raise


# Doctor Profile CRUD
def get_doctor_profile_by_user_id(user_id: uuid.UUID) -> Optional[DoctorProfile]:
    """Get doctor profile by user ID."""
    try:
        with Session(engine) as session:
            statement = select(DoctorProfile).where(DoctorProfile.user_id == user_id)
            return session.exec(statement).first()
    except Exception as e:
        logger.error(f"Error fetching doctor profile for user {user_id}: {e}")
        return None


def get_doctor_profile_by_license(license_number: str) -> Optional[DoctorProfile]:
    """Get doctor profile by medical license number."""
    try:
        with Session(engine) as session:
            statement = select(DoctorProfile).where(
                DoctorProfile.medical_license_number == license_number
            )
            return session.exec(statement).first()
    except Exception as e:
        logger.error(f"Error fetching doctor profile by license {license_number}: {e}")
        return None


def create_doctor_profile(profile_data: DoctorProfileCreate) -> DoctorProfile:
    """Create a new doctor profile."""
    with Session(engine) as session:
        try:
            db_profile = DoctorProfile(**profile_data.model_dump())
            session.add(db_profile)
            session.commit()
            session.refresh(db_profile)
            return db_profile
        except IntegrityError as e:
            session.rollback()
            logger.error(f"Database integrity error creating doctor profile: {e}")
            if "medical_license_number" in str(e).lower():
                raise ValueError("Medical license number is already registered")
            else:
                raise ValueError("Doctor profile already exists for this user")
        except Exception as e:
            session.rollback()
            logger.error(f"Error creating doctor profile: {e}")
            raise


def update_doctor_profile(
    user_id: uuid.UUID, profile_data: DoctorProfileUpdate
) -> Optional[DoctorProfile]:
    """Update doctor profile by user ID."""
    with Session(engine) as session:
        try:
            statement = select(DoctorProfile).where(DoctorProfile.user_id == user_id)
            db_profile = session.exec(statement).first()

            if not db_profile:
                return None

            # Update only provided fields
            update_data = profile_data.model_dump(exclude_unset=True)
            for field, value in update_data.items():
                setattr(db_profile, field, value)

            # Update the timestamp
            db_profile.updated_at = datetime.utcnow()

            session.add(db_profile)
            session.commit()
            session.refresh(db_profile)
            return db_profile
        except IntegrityError as e:
            session.rollback()
            logger.error(f"Database integrity error updating doctor profile: {e}")
            if "medical_license_number" in str(e).lower():
                raise ValueError("Medical license number is already registered")
            else:
                raise ValueError("Data integrity error - please check your input")
        except Exception as e:
            session.rollback()
            logger.error(f"Error updating doctor profile: {e}")
            raise


# Doctor Search Functions
def search_doctors(
    specialization: Optional[str] = None,
    hospital_affiliation: Optional[str] = None,
    min_experience: Optional[int] = None,
    max_fee: Optional[float] = None,
    is_verified: Optional[bool] = None,
    location: Optional[str] = None,
    name: Optional[str] = None,
    limit: int = 20,
    offset: int = 0,
) -> list[DoctorProfile]:
    """Search doctors with advanced filtering."""
    try:
        with Session(engine) as session:
            # Build query with joins to get user data
            from app.models.auth import User

            statement = select(DoctorProfile).join(User)

            # Add filters
            if specialization:
                statement = statement.where(
                    DoctorProfile.specialization.ilike(f"%{specialization}%")
                )

            if hospital_affiliation:
                statement = statement.where(
                    DoctorProfile.hospital_affiliation.ilike(
                        f"%{hospital_affiliation}%"
                    )
                )

            if min_experience is not None:
                statement = statement.where(
                    DoctorProfile.years_of_experience >= min_experience
                )

            if max_fee is not None:
                statement = statement.where(DoctorProfile.consultation_fee <= max_fee)

            if is_verified is not None:
                statement = statement.where(DoctorProfile.is_verified == is_verified)

            # Add name search filter
            if name:
                from sqlalchemy import or_

                statement = statement.where(
                    or_(
                        User.first_name.ilike(f"%{name}%"),
                        User.last_name.ilike(f"%{name}%"),
                        (User.first_name + " " + User.last_name).ilike(f"%{name}%"),
                    )
                )

            # Filter by active users only
            statement = statement.where(User.is_active)

            # Add pagination
            statement = statement.offset(offset).limit(limit)

            return session.exec(statement).all()
    except Exception as e:
        logger.error(f"Error searching doctors: {e}")
        return []


def get_doctor_count(
    specialization: Optional[str] = None,
    hospital_affiliation: Optional[str] = None,
    min_experience: Optional[int] = None,
    max_fee: Optional[float] = None,
    is_verified: Optional[bool] = None,
    location: Optional[str] = None,
    name: Optional[str] = None,
) -> int:
    """Get count of doctors matching search criteria."""
    try:
        with Session(engine) as session:
            from app.models.auth import User
            from sqlalchemy import func, or_

            statement = select(func.count(DoctorProfile.id)).join(User)

            # Add same filters as search
            if specialization:
                statement = statement.where(
                    DoctorProfile.specialization.ilike(f"%{specialization}%")
                )

            if hospital_affiliation:
                statement = statement.where(
                    DoctorProfile.hospital_affiliation.ilike(
                        f"%{hospital_affiliation}%"
                    )
                )

            if min_experience is not None:
                statement = statement.where(
                    DoctorProfile.years_of_experience >= min_experience
                )

            if max_fee is not None:
                statement = statement.where(DoctorProfile.consultation_fee <= max_fee)

            if is_verified is not None:
                statement = statement.where(DoctorProfile.is_verified == is_verified)

            # Add name search filter
            if name:
                statement = statement.where(
                    or_(
                        User.first_name.ilike(f"%{name}%"),
                        User.last_name.ilike(f"%{name}%"),
                        (User.first_name + " " + User.last_name).ilike(f"%{name}%"),
                    )
                )

            statement = statement.where(User.is_active)

            return session.exec(statement).first() or 0
    except Exception as e:
        logger.error(f"Error counting doctors: {e}")
        return 0


# User Profile Management Functions
def get_user_with_profile(user_id: uuid.UUID) -> Optional[dict]:
    """Get user with their profile data."""
    try:
        with Session(engine) as session:
            from app.models.auth import User

            statement = select(User).where(User.id == user_id)
            user = session.exec(statement).first()

            if not user:
                return None

            # Get profile based on user type
            profile = None
            if user.is_patient:
                profile = get_patient_profile_by_user_id(user_id)
            elif user.is_doctor:
                profile = get_doctor_profile_by_user_id(user_id)

            return {"user": user, "profile": profile}
    except Exception as e:
        logger.error(f"Error fetching user with profile: {e}")
        return None


def get_all_patients_for_doctor(
    doctor_id: uuid.UUID, limit: int = 50, offset: int = 0
) -> Tuple[List[dict], int]:
    """Get all patients that a doctor has seen (through appointments)."""
    try:
        with Session(engine) as session:
            from app.models.auth import User
            from app.models.appointments import Appointment

            # Get patients through appointments
            base_query = (
                select(
                    PatientProfile,
                    User.first_name,
                    User.last_name,
                    User.email,
                    User.phone,
                    func.count(Appointment.id).label("appointment_count"),
                    func.max(Appointment.appointment_date).label("last_visit"),
                )
                .join(User, PatientProfile.user_id == User.id)
                .join(Appointment, PatientProfile.id == Appointment.patient_id)
                .where(Appointment.doctor_id == doctor_id)
                .group_by(
                    PatientProfile.id,
                    User.first_name,
                    User.last_name,
                    User.email,
                    User.phone,
                )
            )

            # Get total count
            count_query = select(func.count()).select_from(base_query.subquery())
            total_count = session.exec(count_query).first()

            # Apply pagination
            patients_query = (
                base_query.offset(offset)
                .limit(limit)
                .order_by(func.max(Appointment.appointment_date).desc())
            )

            results = session.exec(patients_query).all()

            # Format results
            patients = []
            for result in results:
                (
                    patient_profile,
                    first_name,
                    last_name,
                    email,
                    phone,
                    appointment_count,
                    last_visit,
                ) = result

                # Calculate age
                age = None
                if patient_profile.date_of_birth:
                    from datetime import date

                    today = date.today()
                    age = (
                        today.year
                        - patient_profile.date_of_birth.year
                        - (
                            (today.month, today.day)
                            < (
                                patient_profile.date_of_birth.month,
                                patient_profile.date_of_birth.day,
                            )
                        )
                    )

                patient_dict = {
                    "id": str(patient_profile.id),
                    "name": f"{first_name} {last_name}",
                    "email": email,
                    "phone": phone,
                    "age": age,
                    "gender": patient_profile.gender,
                    "blood_group": patient_profile.blood_group,
                    "appointment_count": appointment_count,
                    "last_visit": last_visit.isoformat() if last_visit else None,
                    "allergies": patient_profile.allergies or [],
                    "medical_history": patient_profile.medical_history or "",
                    "emergency_contact_name": patient_profile.emergency_contact_name,
                    "emergency_contact_phone": patient_profile.emergency_contact_phone,
                    "address": patient_profile.address,
                    "insurance_info": patient_profile.insurance_info,
                }
                patients.append(patient_dict)

            return patients, total_count

    except Exception as e:
        logger.error(f"Error fetching patients for doctor {doctor_id}: {e}")
        return [], 0


def get_patient_by_patient_id(patient_id: uuid.UUID) -> Optional[dict]:
    """Get patient profile with user information."""
    try:
        with Session(engine) as session:
            statement = (
                select(PatientProfile, User)
                .join(PatientProfile, User.id == PatientProfile.user_id)
                .where(PatientProfile.id == patient_id)
            )

            result = session.exec(statement).first()
            if not result:
                return None

            patient_profile, user = result

            # Calculate age
            age = None
            if patient_profile.date_of_birth:
                from datetime import date

                today = date.today()
                age = (
                    today.year
                    - patient_profile.date_of_birth.year
                    - (
                        (today.month, today.day)
                        < (
                            patient_profile.date_of_birth.month,
                            patient_profile.date_of_birth.day,
                        )
                    )
                )

            patinet_bookmark = session.exec(
                select(DoctorBookmark).where(DoctorBookmark.patient_id == patient_id)
            ).first()
            if patinet_bookmark:
                is_bookmarked = True
            else:
                is_bookmarked = False

            return {
                "id": str(patient_id),
                "name": f"{user.first_name} {user.last_name}",
                "email": user.email,
                "phone": user.phone,
                "age": age,
                "gender": patient_profile.gender,
                "blood_group": patient_profile.blood_group,
                "allergies": patient_profile.allergies or [],
                "medical_history": patient_profile.medical_history or "",
                "emergency_contact_name": patient_profile.emergency_contact_name,
                "emergency_contact_phone": patient_profile.emergency_contact_phone,
                "address": patient_profile.address,
                "insurance_info": patient_profile.insurance_info,
                "is_bookmarked": is_bookmarked,
                "date_of_birth": patient_profile.date_of_birth.isoformat()
                if patient_profile.date_of_birth
                else None,
            }

    except Exception as e:
        logger.error(f"Error fetching patient {patient_id}: {e}")
        return None


def search_patients_for_doctor(
    doctor_id: uuid.UUID,
    search_term: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
) -> Tuple[List[dict], int]:
    """Search patients for a doctor with optional search term."""
    try:
        with Session(engine) as session:
            from app.models.auth import User
            from app.models.appointments import Appointment

            # Base query
            base_query = (
                select(
                    PatientProfile,
                    User.first_name,
                    User.last_name,
                    User.email,
                    User.phone,
                    func.count(Appointment.id).label("appointment_count"),
                    func.max(Appointment.appointment_date).label("last_visit"),
                )
                .join(User, PatientProfile.user_id == User.id)
                .join(Appointment, PatientProfile.id == Appointment.patient_id)
                .where(Appointment.doctor_id == doctor_id)
            )

            # Add search filter if provided
            if search_term:
                base_query = base_query.where(
                    or_(
                        User.first_name.ilike(f"%{search_term}%"),
                        User.last_name.ilike(f"%{search_term}%"),
                        User.email.ilike(f"%{search_term}%"),
                        User.phone.ilike(f"%{search_term}%"),
                    )
                )

            base_query = base_query.group_by(
                PatientProfile.id,
                User.first_name,
                User.last_name,
                User.email,
                User.phone,
            )

            # Get total count
            count_query = select(func.count()).select_from(base_query.subquery())
            total_count = session.exec(count_query).first()

            # Apply pagination and get results
            patients_query = (
                base_query.offset(offset)
                .limit(limit)
                .order_by(func.max(Appointment.appointment_date).desc())
            )

            results = session.exec(patients_query).all()

            # Format results
            patients = []
            for result in results:
                (
                    patient_profile,
                    first_name,
                    last_name,
                    email,
                    phone,
                    appointment_count,
                    last_visit,
                ) = result

                # Calculate age
                age = None
                if patient_profile.date_of_birth:
                    from datetime import date

                    today = date.today()
                    age = (
                        today.year
                        - patient_profile.date_of_birth.year
                        - (
                            (today.month, today.day)
                            < (
                                patient_profile.date_of_birth.month,
                                patient_profile.date_of_birth.day,
                            )
                        )
                    )

                patient_dict = {
                    "id": str(patient_profile.id),
                    "name": f"{first_name} {last_name}",
                    "email": email,
                    "phone": phone,
                    "age": age,
                    "gender": patient_profile.gender,
                    "blood_group": patient_profile.blood_group,
                    "appointment_count": appointment_count,
                    "last_visit": last_visit.isoformat() if last_visit else None,
                    "allergies": patient_profile.allergies or [],
                    "medical_history": patient_profile.medical_history or "",
                    "emergency_contact_name": patient_profile.emergency_contact_name,
                    "emergency_contact_phone": patient_profile.emergency_contact_phone,
                    "address": patient_profile.address,
                    "insurance_info": patient_profile.insurance_info,
                }
                patients.append(patient_dict)

            return patients, total_count

    except Exception as e:
        logger.error(f"Error searching patients for doctor {doctor_id}: {e}")
        return [], 0


def toggle_bookmark_patient(
    doctor_id: uuid.UUID, patient_id: uuid.UUID
) -> Optional[PatientProfile]:
    """Bookmark a patient for a doctor."""
    try:
        with Session(engine) as session:
            # Check if bookmark already exists
            existing_bookmark = session.exec(
                select(DoctorBookmark).where(
                    DoctorBookmark.doctor_id == doctor_id,
                    DoctorBookmark.patient_id == patient_id,
                )
            ).first()

            if existing_bookmark:
                # If exists, remove (unbookmark)
                session.delete(existing_bookmark)
                session.commit()
                # Return the patient profile (now unbookmarked)
                return True
            else:
                # Create new bookmark
                bookmark = DoctorBookmark(doctor_id=doctor_id, patient_id=patient_id)
                logger.info(f"✅ Creating bookmark: {bookmark}")
                session.add(bookmark)
                session.commit()
                session.refresh(bookmark)
                # Return the patient profile (now bookmarked)
                return True

    except Exception as e:
        logger.error(
            f"Error bookmarking patient {patient_id} for doctor {doctor_id}: {e}"
        )
        return None


def get_bookmarked_patients(
    doctor_id: uuid.UUID, limit: int = 50, offset: int = 0
) -> Tuple[List[dict], int]:
    """Get all bookmarked patients that a doctor has made."""
    try:
        with Session(engine) as session:
            # Join DoctorBookmark to PatientProfile and User
            base_query = (
                select(
                    PatientProfile,
                    User.first_name,
                    User.last_name,
                    User.email,
                    User.phone,
                    func.count(DoctorBookmark.id).label("bookmark_count"),
                )
                .join(DoctorBookmark, DoctorBookmark.patient_id == PatientProfile.id)
                .join(User, PatientProfile.user_id == User.id)
                .where(DoctorBookmark.doctor_id == doctor_id)
                .group_by(
                    PatientProfile.id,
                    User.first_name,
                    User.last_name,
                    User.email,
                    User.phone,
                )
            )

            # Get total count
            count_query = select(func.count()).select_from(base_query.subquery())
            total_count = session.exec(count_query).first()

            # Apply pagination
            patients_query = (
                base_query.offset(offset).limit(limit)
                # .order_by(func.max(DoctorBookmark.created_at).desc())  # Only if you want to order by latest bookmark
            )

            results = session.exec(patients_query).all()

            # Format results
            patients = []
            for result in results:
                (
                    patient_profile,
                    first_name,
                    last_name,
                    email,
                    phone,
                    bookmark_count,
                ) = result

                # Calculate age
                age = None
                if patient_profile.date_of_birth:
                    from datetime import date

                    today = date.today()
                    age = (
                        today.year
                        - patient_profile.date_of_birth.year
                        - (
                            (today.month, today.day)
                            < (
                                patient_profile.date_of_birth.month,
                                patient_profile.date_of_birth.day,
                            )
                        )
                    )

                patient_dict = {
                    "id": str(patient_profile.id),
                    "name": f"{first_name} {last_name}",
                    "email": email,
                    "phone": phone,
                    "age": age,
                    "gender": patient_profile.gender,
                    "blood_group": patient_profile.blood_group,
                    "appointment_count": bookmark_count,
                    # "last_visit": last_visit.isoformat() if last_visit else None,  # Remove if not selected
                    "allergies": patient_profile.allergies or [],
                    "medical_history": patient_profile.medical_history or "",
                    "emergency_contact_name": patient_profile.emergency_contact_name,
                    "emergency_contact_phone": patient_profile.emergency_contact_phone,
                    "address": patient_profile.address,
                    "insurance_info": patient_profile.insurance_info,
                    "is_bookmarked": True,
                }
                patients.append(patient_dict)

            return patients, total_count

    except Exception as e:
        logger.error(f"Error fetching patients for doctor {doctor_id}: {e}")
        return [], 0
