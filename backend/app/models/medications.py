from sqlmodel import Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime
import uuid
from app.models.mixins import TimestampMixin
from app.models.enums import PrescriptionStatus

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
    # prescription_items: List["PrescriptionItem"] = Relationship(
    #     back_populates="medication"
    # )


class Prescription(TimestampMixin, table=True):
    __tablename__ = "prescriptions"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    patient_id: uuid.UUID = Field(foreign_key="patient_profiles.id")
    doctor_id: uuid.UUID = Field(foreign_key="doctor_profiles.id")
    appointment_id: Optional[uuid.UUID] = Field(
        foreign_key="appointments.id", default=None
    )

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
    appointment: Optional["Appointment"] = Relationship()
    medication_logs: List["MedicationLog"] = Relationship(back_populates="prescription")
    items: List["PrescriptionItem"] = Relationship(back_populates="prescription")


class PrescriptionPDF(TimestampMixin, table=True):
    __tablename__ = "prescription_pdfs"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    prescription_id: Optional[uuid.UUID] = Field(foreign_key="prescriptions.id")
    patient_id: uuid.UUID = Field(foreign_key="patient_profiles.id")
    uploaded_by: uuid.UUID = Field(foreign_key="users.id")
    status: PrescriptionStatus = Field(default=PrescriptionStatus.DRAFT)
    title: str = Field(max_length=255)
    file_name: str = Field(max_length=255)
    file_size: int
    created_at: datetime = Field(default_factory=datetime.utcnow)


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


class PrescriptionItem(TimestampMixin, table=True):
    __tablename__ = "prescription_items"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    prescription_id: uuid.UUID = Field(foreign_key="prescriptions.id")

    # Use free-text medicine name instead of FK
    medication_name: str = Field(max_length=200)

    # Per-medicine details
    dosage: str = Field(max_length=100)  # "500mg"
    frequency: str = Field(max_length=100)  # "twice daily"
    quantity: str = Field(max_length=50)  # "30 tablets"
    duration: Optional[str] = Field(max_length=50, default=None)  # "5 days"
    instructions: Optional[str] = Field(
        max_length=500, default=None
    )  # "Take with food"

    # Relationships
    prescription: "Prescription" = Relationship(back_populates="items")
