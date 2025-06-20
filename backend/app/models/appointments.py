from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime
import uuid
from app.models.mixins import TimestampMixin
from app.models.enums import AppointmentStatus, AppointmentType

if TYPE_CHECKING:
    from app.models.profiles import PatientProfile, DoctorProfile


class Appointment(TimestampMixin, table=True):
    __tablename__ = "appointments"
    
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    patient_id: uuid.UUID = Field(foreign_key="patient_profiles.id")
    doctor_id: uuid.UUID = Field(foreign_key="doctor_profiles.id")
    
    appointment_date: datetime
    duration_minutes: int = Field(default=30, ge=15, le=180)
    appointment_type: AppointmentType = Field(default=AppointmentType.CONSULTATION)
    status: AppointmentStatus = Field(default=AppointmentStatus.SCHEDULED)
    
    reason: Optional[str] = Field(max_length=500, default=None)
    notes: Optional[str] = Field(max_length=1000, default=None)
    prescription_given: bool = Field(default=False)
    follow_up_required: bool = Field(default=False)
    follow_up_date: Optional[datetime] = Field(default=None)
    
    # Virtual appointment details
    meeting_link: Optional[str] = Field(max_length=500, default=None)
    meeting_id: Optional[str] = Field(max_length=100, default=None)
    
    # Billing
    consultation_fee: Optional[float] = Field(default=None, ge=0)
    payment_status: Optional[str] = Field(max_length=50, default="pending")
    
    # Relationships
    patient: "PatientProfile" = Relationship(back_populates="appointments")
    doctor: "DoctorProfile" = Relationship(back_populates="appointments")
    reminders: List["AppointmentReminder"] = Relationship(back_populates="appointment")


class AppointmentReminder(TimestampMixin, table=True):
    __tablename__ = "appointment_reminders"
    
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    appointment_id: uuid.UUID = Field(foreign_key="appointments.id")
    
    reminder_time: datetime
    reminder_type: str = Field(max_length=50)  # email, sms, push
    is_sent: bool = Field(default=False)
    sent_at: Optional[datetime] = Field(default=None)
    
    # Relationships
    appointment: "Appointment" = Relationship(back_populates="reminders") 