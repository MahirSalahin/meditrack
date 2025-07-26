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
    AdminRegisterRequest
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

from .medications import (
    # Medication schemas
    MedicationCreate,
    MedicationUpdate,
    MedicationRead,
    MedicationSearchFilters,
    # Prescription schemas
    PrescriptionCreate,
    PrescriptionUpdate,
    PrescriptionRead,
    PrescriptionWithDetails,
    PrescriptionSearchFilters,
    PrescriptionStats,
    PrescriptionBatchUpdate,
    # Medication log schemas
    MedicationLogCreate,
    MedicationLogUpdate,
    MedicationLogRead,
    MedicationLogWithDetails
)

# Import enums from models
from app.models.enums import UserType, BloodGroup, Gender, AppointmentStatus, AppointmentType, MedicationStatus, PrescriptionStatus

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
    
    # Medication schemas
    "MedicationCreate",
    "MedicationUpdate",
    "MedicationRead",
    "MedicationSearchFilters",
    "PrescriptionCreate",
    "PrescriptionUpdate",
    "PrescriptionRead",
    "PrescriptionWithDetails",
    "PrescriptionSearchFilters",
    "PrescriptionStats",
    "PrescriptionBatchUpdate",
    "MedicationLogCreate",
    "MedicationLogUpdate",
    "MedicationLogRead",
    "MedicationLogWithDetails",
    
    # Auth schemas
    "Token",
    "TokenData",
    "LoginRequest",
    "PatientRegisterRequest",
    "DoctorRegisterRequest",
    "AdminRegisterRequest",
    
    # Enums
    "UserType",
    "BloodGroup",
    "Gender",
    "AppointmentStatus",
    "AppointmentType",
    "MedicationStatus",
    "PrescriptionStatus"
]
