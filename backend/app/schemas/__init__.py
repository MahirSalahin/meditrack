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

# Import enums from models
from app.models.enums import UserType, BloodGroup, Gender

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
    "Gender"
]
