from sqlmodel import Session, select
from sqlalchemy.exc import IntegrityError
from app.models.auth import User
from app.models.profiles import PatientProfile, DoctorProfile
from app.models.enums import UserType
from app.schemas.auth import UserCreate, PatientRegisterRequest, DoctorRegisterRequest, AdminRegisterRequest
from app.utils.auth import get_password_hash
from app.db.session import engine
from typing import Optional
import logging
import uuid

logger = logging.getLogger(__name__)


def get_user_by_id(user_id: uuid.UUID) -> Optional[User]:
    """Get user by ID from database."""
    try:
        with Session(engine) as session:
            statement = select(User).where(User.id == user_id)
            user = session.exec(statement).first()
            return user
    except Exception as e:
        logger.error(f"Error fetching user {user_id}: {e}")
        return None


def get_user_by_email(email: str) -> Optional[User]:
    """Get user by email from database."""
    try:
        with Session(engine) as session:
            statement = select(User).where(User.email == email)
            user = session.exec(statement).first()
            return user
    except Exception as e:
        logger.error(f"Error fetching user by email {email}: {e}")
        return None


def create_user(user_data: UserCreate) -> User:
    """Create a new user."""
    with Session(engine) as session:
        # Hash password
        hashed_password = get_password_hash(user_data.password)

        # Create user
        db_user = User(
            email=user_data.email,
            first_name=user_data.first_name,
            last_name=user_data.last_name,
            phone=user_data.phone,
            password_hash=hashed_password,
            user_type=user_data.user_type,
            is_active=user_data.is_active,
            is_verified=user_data.is_verified
        )

        session.add(db_user)
        session.commit()
        session.refresh(db_user)
        return db_user


def create_patient_user(register_data: PatientRegisterRequest) -> User:
    """Create patient user with patient profile in a single transaction."""
    with Session(engine) as session:
        try:
            # Hash password
            hashed_password = get_password_hash(register_data.password)

            # Create user
            db_user = User(
                email=register_data.email,
                first_name=register_data.first_name,
                last_name=register_data.last_name,
                phone=register_data.phone,
                password_hash=hashed_password,
                user_type=UserType.PATIENT,
                is_active=True,
                is_verified=False
            )
            session.add(db_user)
            session.flush()  # Get the user ID without committing

            # Create patient profile
            patient_profile = PatientProfile(
                user_id=db_user.id,
                date_of_birth=register_data.date_of_birth,
                gender=register_data.gender,
                blood_group=register_data.blood_group,
                emergency_contact_name=register_data.emergency_contact_name,
                emergency_contact_phone=register_data.emergency_contact_phone,
                address=register_data.address,
                insurance_info=register_data.insurance_info,
                allergies=register_data.allergies,
                medical_history=register_data.medical_history
            )
            session.add(patient_profile)

            # Commit everything together
            session.commit()
            session.refresh(db_user)
            return db_user

        except IntegrityError as e:
            session.rollback()
            logger.error(
                f"Database integrity error creating patient user: {e}")
            if "email" in str(e).lower():
                raise ValueError("Email address is already registered")
            elif "medical_license_number" in str(e).lower():
                raise ValueError(
                    "Medical license number is already registered")
            else:
                raise ValueError(
                    "Data integrity error - please check your input")
        except Exception as e:
            session.rollback()
            logger.error(f"Error creating patient user: {e}")
            raise


def create_doctor_user(register_data: DoctorRegisterRequest) -> User:
    """Create doctor user with doctor profile in a single transaction."""
    with Session(engine) as session:
        try:
            # Hash password
            hashed_password = get_password_hash(register_data.password)

            # Create user
            db_user = User(
                email=register_data.email,
                first_name=register_data.first_name,
                last_name=register_data.last_name,
                phone=register_data.phone,
                password_hash=hashed_password,
                user_type=UserType.DOCTOR,
                is_active=True,
                is_verified=False
            )
            session.add(db_user)
            session.flush()  # Get the user ID without committing

            # Create doctor profile
            doctor_profile = DoctorProfile(
                user_id=db_user.id,
                medical_license_number=register_data.medical_license_number,
                license_expiry_date=register_data.license_expiry_date,
                specialization=register_data.specialization,
                years_of_experience=register_data.years_of_experience,
                hospital_affiliation=register_data.hospital_affiliation,
                education_background=register_data.education_background,
                consultation_fee=register_data.consultation_fee,
                available_days=register_data.available_days,
                bio=register_data.bio
            )
            session.add(doctor_profile)

            # Commit everything together
            session.commit()
            session.refresh(db_user)
            return db_user

        except IntegrityError as e:
            session.rollback()
            logger.error(f"Database integrity error creating doctor user: {e}")
            if "email" in str(e).lower():
                raise ValueError("Email address is already registered")
            elif "medical_license_number" in str(e).lower():
                raise ValueError(
                    "Medical license number is already registered")
            else:
                raise ValueError(
                    "Data integrity error - please check your input")
        except Exception as e:
            session.rollback()
            logger.error(f"Error creating doctor user: {e}")
            raise


def create_admin_user(register_data: AdminRegisterRequest) -> User:
    """Create admin user (no additional profile needed)."""
    with Session(engine) as session:
        try:
            # Hash password
            hashed_password = get_password_hash(register_data.password)

            # Create user
            db_user = User(
                email=register_data.email,
                first_name=register_data.first_name,
                last_name=register_data.last_name,
                phone=register_data.phone,
                password_hash=hashed_password,
                user_type=UserType.SYSTEM_ADMIN,
                is_active=True,
                is_verified=False
            )
            session.add(db_user)
            session.commit()
            session.refresh(db_user)
            return db_user
            
        except IntegrityError as e:
            session.rollback()
            logger.error(f"Database integrity error creating admin user: {e}")
            if "email" in str(e).lower():
                raise ValueError("Email address is already registered")
            else:
                raise ValueError(
                    "Data integrity error - please check your input")
        except Exception as e:
            session.rollback()
            logger.error(f"Error creating admin user: {e}")
            raise


def update_user(user_id: uuid.UUID, user_data: dict) -> Optional[User]:
    """Update user basic information."""
    with Session(engine) as session:
        try:
            statement = select(User).where(User.id == user_id)
            db_user = session.exec(statement).first()
            
            if not db_user:
                return None
            
            # Update only provided fields
            for field, value in user_data.items():
                if hasattr(db_user, field):
                    setattr(db_user, field, value)
            
            session.add(db_user)
            session.commit()
            session.refresh(db_user)
            return db_user
            
        except Exception as e:
            session.rollback()
            logger.error(f"Error updating user: {e}")
            raise
 