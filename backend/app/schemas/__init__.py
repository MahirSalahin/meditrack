from .common import TimestampSchema
from .auth import (
    # User schemas
    UserRead,
    UserCreate,
    UserUpdate,
    UserInDB,
    
    # Auth schemas
    Token,
    TokenData,
    LoginRequest,
    PatientRegisterRequest,
    DoctorRegisterRequest,
    AdminRegisterRequest,
    UserWithProfile
)

from .profiles import (
    # Profile schemas
    PatientProfileRead,
    PatientProfileCreate,
    PatientProfileUpdate,
    DoctorProfileRead,
    DoctorProfileCreate,
    DoctorProfileUpdate
)

from .appointments import (
    # Appointment schemas
    AppointmentCreate,
    AppointmentUpdate,
    AppointmentRead,
    AppointmentWithDetails,
    AppointmentSearchFilters,
    AppointmentStats,
    AppointmentReminderCreate,
    AppointmentReminderRead,
    AppointmentBatchUpdate
)

# Import enums from models
from app.models.enums import UserType, BloodGroup, Gender, AppointmentStatus, AppointmentType

__all__ = [
    # Base schemas
    "TimestampSchema",
    
    # User schemas
    "UserRead",
    "UserCreate", 
    "UserUpdate",
    "UserInDB",
    
    # Profile schemas
    "PatientProfileRead",
    "PatientProfileCreate",
    "PatientProfileUpdate",
    "DoctorProfileRead",
    "DoctorProfileCreate", 
    "DoctorProfileUpdate",
    
    # Appointment schemas
    "AppointmentCreate",
    "AppointmentUpdate",
    "AppointmentRead",
    "AppointmentWithDetails",
    "AppointmentSearchFilters",
    "AppointmentStats",
    "AppointmentReminderCreate",
    "AppointmentReminderRead",
    "AppointmentBatchUpdate",
    
    # Auth schemas
    "Token",
    "TokenData",
    "LoginRequest",
    "PatientRegisterRequest",
    "DoctorRegisterRequest",
    "AdminRegisterRequest",
    "UserWithProfile",
    
    # Enums
    "UserType",
    "BloodGroup",
    "Gender",
    "AppointmentStatus",
    "AppointmentType"
]
