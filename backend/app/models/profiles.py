from sqlmodel import SQLModel, Field, Relationship
from typing import Optional
from datetime import datetime
import uuid
from .mixins import TimestampMixin
from .enums import Gender, BloodGroup


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
    
    @property
    def age(self) -> Optional[int]:
        if self.date_of_birth:
            today = datetime.utcnow()
            return today.year - self.date_of_birth.year - (
                (today.month, today.day) < (
                    self.date_of_birth.month, self.date_of_birth.day)
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
    available_days: Optional[str] = Field(
        default=None)  # JSON string for days/times
    bio: Optional[str] = Field(default=None, max_length=1000)
    is_verified: bool = Field(default=False)  # Admin verification status
    
    # Relationships (forward reference to avoid circular imports)
    user: "User" = Relationship(back_populates="doctor_profile")
    
    @property
    def is_license_valid(self) -> bool:
        if self.license_expiry_date:
            return self.license_expiry_date > datetime.utcnow()
        return True  # Assume valid if no expiry date set 