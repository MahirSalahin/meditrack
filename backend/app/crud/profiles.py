from sqlmodel import Session, select
from sqlalchemy.exc import IntegrityError
from app.models.profiles import PatientProfile, DoctorProfile
from app.schemas.profiles import (
    PatientProfileCreate, PatientProfileUpdate,
    DoctorProfileCreate, DoctorProfileUpdate
)
from app.db.session import engine
from typing import Optional
import logging
import uuid

logger = logging.getLogger(__name__)


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


def update_patient_profile(user_id: uuid.UUID, profile_data: PatientProfileUpdate) -> Optional[PatientProfile]:
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


def update_doctor_profile(user_id: uuid.UUID, profile_data: DoctorProfileUpdate) -> Optional[DoctorProfile]:
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
    limit: int = 20,
    offset: int = 0
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
                    DoctorProfile.hospital_affiliation.ilike(f"%{hospital_affiliation}%")
                )
            
            if min_experience is not None:
                statement = statement.where(
                    DoctorProfile.years_of_experience >= min_experience
                )
            
            if max_fee is not None:
                statement = statement.where(
                    DoctorProfile.consultation_fee <= max_fee
                )
            
            if is_verified is not None:
                statement = statement.where(
                    DoctorProfile.is_verified == is_verified
                )
            
            # Filter by active users only
            statement = statement.where(User.is_active == True)
            
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
    location: Optional[str] = None
) -> int:
    """Get count of doctors matching search criteria."""
    try:
        with Session(engine) as session:
            from app.models.auth import User
            from sqlalchemy import func
            
            statement = select(func.count(DoctorProfile.id)).join(User)
            
            # Add same filters as search
            if specialization:
                statement = statement.where(
                    DoctorProfile.specialization.ilike(f"%{specialization}%")
                )
            
            if hospital_affiliation:
                statement = statement.where(
                    DoctorProfile.hospital_affiliation.ilike(f"%{hospital_affiliation}%")
                )
            
            if min_experience is not None:
                statement = statement.where(
                    DoctorProfile.years_of_experience >= min_experience
                )
            
            if max_fee is not None:
                statement = statement.where(
                    DoctorProfile.consultation_fee <= max_fee
                )
            
            if is_verified is not None:
                statement = statement.where(
                    DoctorProfile.is_verified == is_verified
                )
            
            statement = statement.where(User.is_active == True)
            
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
            
            return {
                "user": user,
                "profile": profile
            }
    except Exception as e:
        logger.error(f"Error fetching user with profile: {e}")
        return None 