from sqlmodel import SQLModel, Field, Relationship, UniqueConstraint
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime
import uuid
from app.models.mixins import TimestampMixin
from app.models.enums import Gender, BloodGroup

if TYPE_CHECKING:
    from app.models.auth import User
    from app.models.medical_records import MedicalRecord
    from app.models.appointments import Appointment
    from app.models.medications import Prescription
    from app.models.health_metrics import HealthMetric
    from app.models.medical_conditions import MedicalCondition


# Patient Profile Model
class PatientProfile(TimestampMixin, table=True):
    __tablename__ = "patient_profiles"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)

    # Foreign Keys
    user_id: uuid.UUID = Field(foreign_key="users.id", unique=True)

    # Patient Profile Fields
    date_of_birth: Optional[datetime] = Field(default=None)
    gender: Optional[Gender] = Field(default=None)
    blood_group: Optional[BloodGroup] = Field(default=None)
    emergency_contact_name: Optional[str] = Field(default=None, max_length=100)
    emergency_contact_phone: Optional[str] = Field(default=None, max_length=20)
    address: Optional[str] = Field(default=None, max_length=500)
    insurance_info: Optional[str] = Field(default=None)  # JSON string
    allergies: Optional[str] = Field(default=None)  # JSON string
    medical_history: Optional[str] = Field(default=None)  # JSON string

    # Relationships (forward reference to avoid circular imports)
    user: "User" = Relationship(back_populates="patient_profile")
    
    # New relationships
    medical_records: List["MedicalRecord"] = Relationship(back_populates="patient")
    appointments: List["Appointment"] = Relationship(back_populates="patient") 
    prescriptions: List["Prescription"] = Relationship(back_populates="patient")
    health_metrics: List["HealthMetric"] = Relationship(back_populates="patient")
    medical_conditions: List["MedicalCondition"] = Relationship(back_populates="patient")
    bookmarked_by: List["DoctorBookmark"] = Relationship(back_populates="patient")

    @property
    def age(self) -> Optional[int]:
        if self.date_of_birth:
            today = datetime.utcnow()
            return (
                today.year
                - self.date_of_birth.year
                - (
                    (today.month, today.day)
                    < (self.date_of_birth.month, self.date_of_birth.day)
                )
            )
        return None


# Doctor Profile Model
class DoctorProfile(TimestampMixin, table=True):
    __tablename__ = "doctor_profiles"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)

    # Foreign Keys
    user_id: uuid.UUID = Field(foreign_key="users.id", unique=True)

    # Doctor Profile Fields
    medical_license_number: str = Field(max_length=50, unique=True, index=True)
    license_expiry_date: Optional[datetime] = Field(default=None)
    specialization: str = Field(max_length=100)
    years_of_experience: Optional[int] = Field(default=0, ge=0)
    hospital_affiliation: Optional[str] = Field(default=None, max_length=200)
    education_background: Optional[str] = Field(default=None, max_length=500)
    consultation_fee: Optional[float] = Field(default=None, ge=0)
    available_days: Optional[str] = Field(default=None)  # JSON string for days/times
    bio: Optional[str] = Field(default=None, max_length=1000)
    is_verified: bool = Field(default=False)  # Admin verification status

    # Relationships (forward reference to avoid circular imports)
    user: "User" = Relationship(back_populates="doctor_profile")
    
    # New relationships
    medical_records: List["MedicalRecord"] = Relationship(back_populates="doctor")
    appointments: List["Appointment"] = Relationship(back_populates="doctor")
    prescriptions: List["Prescription"] = Relationship(back_populates="doctor")
    bookmarks: List["DoctorBookmark"] = Relationship(back_populates="doctor")

    @property
    def is_license_valid(self) -> bool:
        if self.license_expiry_date:
            return self.license_expiry_date > datetime.utcnow()
        return True  # Assume valid if no expiry date set


# Doctor Bookmark Model
class DoctorBookmark(TimestampMixin, table=True):
    __tablename__ = "doctor_bookmarks"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)

    # Foreign Keys
    doctor_id: uuid.UUID = Field(foreign_key="doctor_profiles.id")
    patient_id: uuid.UUID = Field(foreign_key="patient_profiles.id")

    # Relationships
    doctor: "DoctorProfile" = Relationship(back_populates="bookmarks")
    patient: "PatientProfile" = Relationship(back_populates="bookmarked_by")

    class Config:
        # Ensure unique combination of doctor and patient
        table_args = (
            UniqueConstraint(
                "doctor_id", "patient_id", name="uq_doctor_patient_bookmark"
            ),
        )
