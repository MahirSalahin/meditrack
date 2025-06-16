from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
from datetime import datetime
import uuid
from app.models.enums import UserType, BloodGroup, Gender
from .common import TimestampSchema
from .profiles import PatientProfileRead, DoctorProfileRead


# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    phone: Optional[str] = None
    is_active: bool = True
    is_verified: bool = False


class UserCreate(UserBase):
    password: str
    user_type: UserType

    @field_validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        return v


class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    is_active: Optional[bool] = None
    is_verified: Optional[bool] = None


class UserRead(UserBase, TimestampSchema):
    id: uuid.UUID
    user_type: UserType
    full_name: str
    is_patient: bool
    is_doctor: bool
    is_admin: bool

    class Config:
        from_attributes = True


class UserInDB(UserRead):
    password_hash: str


# Authentication Schemas
class LoginRequest(BaseModel):
    email: EmailStr
    password: str


# Base registration schema
class BaseRegisterRequest(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    phone: Optional[str] = None

    @field_validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        return v


class PatientRegisterRequest(BaseRegisterRequest):
    """Patient registration with health-specific fields."""
    # Patient-specific profile data
    date_of_birth: Optional[datetime] = None
    gender: Optional[Gender] = None
    blood_group: Optional[BloodGroup] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    address: Optional[str] = None
    insurance_info: Optional[str] = None
    allergies: Optional[str] = None
    medical_history: Optional[str] = None


class DoctorRegisterRequest(BaseRegisterRequest):
    """Doctor registration with medical practice fields."""
    # Required doctor fields
    medical_license_number: str
    specialization: str

    # Optional doctor fields
    license_expiry_date: Optional[datetime] = None
    years_of_experience: Optional[int] = 0
    hospital_affiliation: Optional[str] = None
    education_background: Optional[str] = None
    consultation_fee: Optional[float] = None
    available_days: Optional[str] = None
    bio: Optional[str] = None


class AdminRegisterRequest(BaseRegisterRequest):
    """System admin registration - minimal fields."""
    pass


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserRead


class TokenData(BaseModel):
    user_id: Optional[uuid.UUID] = None
    email: Optional[str] = None
    user_type: Optional[str] = None


# Combined User with Profile Schemas
class UserWithProfile(UserRead):
    patient_profile: Optional[PatientProfileRead] = None
    doctor_profile: Optional[DoctorProfileRead] = None
 