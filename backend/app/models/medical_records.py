from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime
import uuid
from app.models.mixins import TimestampMixin
from app.models.enums import RecordCategory, Priority

if TYPE_CHECKING:
    from app.models.profiles import PatientProfile, DoctorProfile


class MedicalRecord(TimestampMixin, table=True):
    __tablename__ = "medical_records"
    
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    patient_id: uuid.UUID = Field(foreign_key="patient_profiles.id")
    doctor_id: Optional[uuid.UUID] = Field(foreign_key="doctor_profiles.id", default=None)
    
    title: str = Field(max_length=200)
    category: RecordCategory
    record_date: datetime = Field(default_factory=datetime.utcnow)
    facility: Optional[str] = Field(max_length=200, default=None)
    summary: Optional[str] = Field(max_length=1000, default=None)
    diagnosis: Optional[str] = Field(max_length=500, default=None)
    symptoms: Optional[str] = Field(default=None)  # JSON
    treatment_summary: Optional[str] = Field(max_length=1000, default=None)
    priority: Priority = Field(default=Priority.NORMAL)
    tags: Optional[str] = Field(default=None)  # JSON array
    
    # Relationships
    patient: "PatientProfile" = Relationship(back_populates="medical_records")
    doctor: Optional["DoctorProfile"] = Relationship(back_populates="medical_records")
    attachments: List["MedicalAttachment"] = Relationship(back_populates="medical_record")


class MedicalAttachment(TimestampMixin, table=True):
    __tablename__ = "medical_attachments"
    
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    medical_record_id: uuid.UUID = Field(foreign_key="medical_records.id")
    
    filename: str = Field(max_length=255)
    original_filename: str = Field(max_length=255)
    file_path: str = Field(max_length=500)
    file_type: str = Field(max_length=50)  # PDF, JPG, PNG, etc.
    file_size: int  # in bytes
    content_type: str = Field(max_length=100)
    
    # Relationships
    medical_record: "MedicalRecord" = Relationship(back_populates="attachments") 