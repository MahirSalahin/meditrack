from sqlmodel import SQLModel, Field, Relationship
from typing import Optional
import uuid
from .mixins import TimestampMixin
from .enums import UserType


# User Models
class UserBase(SQLModel):
    email: str = Field(max_length=255, unique=True, index=True)
    first_name: str = Field(max_length=100)
    last_name: str = Field(max_length=100)
    phone: Optional[str] = Field(default=None, max_length=20)
    is_active: bool = Field(default=True)
    is_verified: bool = Field(default=False)


class User(UserBase, TimestampMixin, table=True):
    __tablename__ = "users"
    
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    password_hash: str = Field(max_length=255)
    user_type: UserType = Field(default=UserType.PATIENT)
    
    # Relationships (forward references to avoid circular imports)
    patient_profile: Optional["PatientProfile"] = Relationship(
        back_populates="user")
    doctor_profile: Optional["DoctorProfile"] = Relationship(
        back_populates="user")
    
    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}"
    
    @property
    def is_patient(self) -> bool:
        return self.user_type == UserType.PATIENT
    
    @property
    def is_doctor(self) -> bool:
        return self.user_type == UserType.DOCTOR
    
    @property
    def is_admin(self) -> bool:
        return self.user_type == UserType.SYSTEM_ADMIN
 