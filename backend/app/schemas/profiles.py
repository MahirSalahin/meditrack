from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import uuid
from app.models.enums import BloodGroup, Gender
from .common import TimestampSchema


# Patient Profile Schemas
class PatientProfileBase(BaseModel):
    date_of_birth: Optional[datetime] = None
    gender: Optional[Gender] = None
    blood_group: Optional[BloodGroup] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    address: Optional[str] = None
    insurance_info: Optional[str] = None
    allergies: Optional[str] = None
    medical_history: Optional[str] = None


class PatientProfileCreate(PatientProfileBase):
    user_id: uuid.UUID


class PatientProfileUpdate(PatientProfileBase):
    pass


class PatientProfileRead(PatientProfileBase, TimestampSchema):
    id: uuid.UUID
    user_id: uuid.UUID
    age: Optional[int] = None

    class Config:
        from_attributes = True


# Doctor Profile Schemas
class DoctorProfileBase(BaseModel):
    medical_license_number: str
    license_expiry_date: Optional[datetime] = None
    specialization: str
    years_of_experience: Optional[int] = 0
    hospital_affiliation: Optional[str] = None
    education_background: Optional[str] = None
    consultation_fee: Optional[float] = None
    available_days: Optional[str] = None
    bio: Optional[str] = None


class DoctorProfileCreate(DoctorProfileBase):
    user_id: uuid.UUID


class DoctorProfileUpdate(DoctorProfileBase):
    medical_license_number: Optional[str] = None
    specialization: Optional[str] = None


class DoctorProfileRead(DoctorProfileBase, TimestampSchema):
    id: uuid.UUID
    user_id: uuid.UUID
    is_verified: bool
    is_license_valid: bool

    class Config:
        from_attributes = True


# Additional schemas for profile endpoints
class DoctorSearchResult(BaseModel):
    """Doctor profile with user information for search results"""

    id: uuid.UUID
    user_id: uuid.UUID
    medical_license_number: str
    license_expiry_date: Optional[datetime] = None
    specialization: str
    years_of_experience: Optional[int] = 0
    hospital_affiliation: Optional[str] = None
    education_background: Optional[str] = None
    consultation_fee: Optional[float] = None
    available_days: Optional[str] = None
    bio: Optional[str] = None
    is_verified: bool
    is_license_valid: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    # User information
    doctor_name: str
    doctor_email: str

    class Config:
        from_attributes = True


class DoctorSearchResponse(BaseModel):
    doctors: list[DoctorSearchResult]
    total_count: int
    page: int
    page_size: int
    total_pages: int


class UserProfileUpdate(BaseModel):
    """Update user and profile data together"""

    # User fields
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None

    # Patient profile fields (only used if user is patient)
    date_of_birth: Optional[datetime] = None
    gender: Optional[Gender] = None
    blood_group: Optional[BloodGroup] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    address: Optional[str] = None
    insurance_info: Optional[str] = None
    allergies: Optional[str] = None
    medical_history: Optional[str] = None

    # Doctor profile fields (only used if user is doctor)
    medical_license_number: Optional[str] = None
    license_expiry_date: Optional[datetime] = None
    specialization: Optional[str] = None
    years_of_experience: Optional[int] = None
    hospital_affiliation: Optional[str] = None
    education_background: Optional[str] = None
    consultation_fee: Optional[float] = None
    available_days: Optional[str] = None
    bio: Optional[str] = None


# Import UserRead after other classes to avoid circular imports
from .auth import UserRead


# Patient Details for Doctor Portal
class PatientDetailsForDoctor(BaseModel):
    """Patient details schema for doctor portal access"""

    id: str
    name: str
    email: str
    phone: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[Gender] = None
    blood_group: Optional[BloodGroup] = None
    allergies: Optional[list] = None
    medical_history: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    address: Optional[str] = None
    insurance_info: Optional[str] = None
    date_of_birth: Optional[str] = None
    is_bookmarked: bool = False

    class Config:
        from_attributes = True

class PatientListResponse(BaseModel):
    """Response schema for patient list with pagination"""

    patients: list[PatientDetailsForDoctor]
    total_count: int
    page: int
    page_size: int
    total_pages: int


# User profile schemas with profile data
class UserProfileRead(BaseModel):
    """Combined user and profile data"""

    user: UserRead
    patient_profile: Optional[PatientProfileRead] = None
    doctor_profile: Optional[DoctorProfileRead] = None

    class Config:
        from_attributes = True
