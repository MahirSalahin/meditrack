from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime
import uuid
from app.models.mixins import TimestampMixin
from app.models.enums import MedicationStatus, PrescriptionStatus

if TYPE_CHECKING:
    from app.models.profiles import PatientProfile, DoctorProfile
    from app.models.appointments import Appointment


class Medication(TimestampMixin, table=True):
    __tablename__ = "medications"
    
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    
    name: str = Field(max_length=200)
    generic_name: Optional[str] = Field(max_length=200, default=None)
    description: Optional[str] = Field(max_length=1000, default=None)
    manufacturer: Optional[str] = Field(max_length=100, default=None)
    
    # Drug information
    drug_class: Optional[str] = Field(max_length=100, default=None)
    contraindications: Optional[str] = Field(default=None)  # JSON
    side_effects: Optional[str] = Field(default=None)  # JSON
    interactions: Optional[str] = Field(default=None)  # JSON
    
    # Relationships
    prescriptions: List["Prescription"] = Relationship(back_populates="medication")


class Prescription(TimestampMixin, table=True):
    __tablename__ = "prescriptions"
    
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    patient_id: uuid.UUID = Field(foreign_key="patient_profiles.id")
    doctor_id: uuid.UUID = Field(foreign_key="doctor_profiles.id")
    medication_id: uuid.UUID = Field(foreign_key="medications.id")
    appointment_id: Optional[uuid.UUID] = Field(foreign_key="appointments.id", default=None)
    
    # Prescription details
    dosage: str = Field(max_length=100)  # "10mg", "2 tablets"
    frequency: str = Field(max_length=100)  # "twice daily", "every 8 hours"
    quantity: str = Field(max_length=50)  # "30 tablets", "1 bottle"
    instructions: Optional[str] = Field(max_length=500, default=None)
    
    # Dates
    prescribed_date: datetime = Field(default_factory=datetime.utcnow)
    start_date: datetime
    end_date: Optional[datetime] = Field(default=None)
    
    # Status and tracking
    status: PrescriptionStatus = Field(default=PrescriptionStatus.ACTIVE)
    diagnosis: Optional[str] = Field(max_length=200, default=None)
    notes: Optional[str] = Field(max_length=500, default=None)
    
    # Relationships
    patient: "PatientProfile" = Relationship(back_populates="prescriptions")
    doctor: "DoctorProfile" = Relationship(back_populates="prescriptions")
    medication: "Medication" = Relationship(back_populates="prescriptions")
    appointment: Optional["Appointment"] = Relationship()
    medication_logs: List["MedicationLog"] = Relationship(back_populates="prescription")


class MedicationLog(TimestampMixin, table=True):
    __tablename__ = "medication_logs"
    
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    prescription_id: uuid.UUID = Field(foreign_key="prescriptions.id")
    
    taken_at: datetime
    dosage_taken: str = Field(max_length=100)
    notes: Optional[str] = Field(max_length=500, default=None)
    side_effects_experienced: Optional[str] = Field(max_length=500, default=None)
    
    # Relationships
    prescription: "Prescription" = Relationship(back_populates="medication_logs") 