from pydantic import BaseModel, field_validator
from typing import Optional, List
from datetime import datetime
import uuid
from app.models.enums import AppointmentStatus, AppointmentType
from .common import TimestampSchema


# Base Appointment Schemas
class AppointmentBase(BaseModel):
    appointment_date: datetime
    duration_minutes: int = 30
    appointment_type: AppointmentType = AppointmentType.CONSULTATION
    reason: Optional[str] = None
    notes: Optional[str] = None
    meeting_link: Optional[str] = None
    meeting_id: Optional[str] = None
    consultation_fee: Optional[float] = None

    @field_validator('duration_minutes')
    def validate_duration(cls, v):
        if v < 15 or v > 180:
            raise ValueError('Duration must be between 15 and 180 minutes')
        return v

    @field_validator('consultation_fee')
    def validate_fee(cls, v):
        if v is not None and v < 0:
            raise ValueError('Consultation fee cannot be negative')
        return v


class AppointmentCreate(AppointmentBase):
    doctor_id: uuid.UUID
    patient_id: Optional[uuid.UUID] = None  # Set by middleware for patients


class AppointmentUpdate(BaseModel):
    appointment_date: Optional[datetime] = None
    duration_minutes: Optional[int] = None
    appointment_type: Optional[AppointmentType] = None
    status: Optional[AppointmentStatus] = None
    reason: Optional[str] = None
    notes: Optional[str] = None
    prescription_given: Optional[bool] = None
    follow_up_required: Optional[bool] = None
    follow_up_date: Optional[datetime] = None
    meeting_link: Optional[str] = None
    meeting_id: Optional[str] = None
    consultation_fee: Optional[float] = None
    payment_status: Optional[str] = None

    @field_validator('duration_minutes')
    def validate_duration(cls, v):
        if v is not None and (v < 15 or v > 180):
            raise ValueError('Duration must be between 15 and 180 minutes')
        return v

    @field_validator('consultation_fee')
    def validate_fee(cls, v):
        if v is not None and v < 0:
            raise ValueError('Consultation fee cannot be negative')
        return v


class AppointmentRead(AppointmentBase, TimestampSchema):
    id: uuid.UUID
    patient_id: uuid.UUID
    doctor_id: uuid.UUID
    status: AppointmentStatus
    prescription_given: bool
    follow_up_required: bool
    follow_up_date: Optional[datetime]
    payment_status: Optional[str]

    class Config:
        from_attributes = True


# Appointment with related data
class AppointmentWithDetails(AppointmentRead):
    patient_name: Optional[str] = None
    doctor_name: Optional[str] = None
    doctor_specialization: Optional[str] = None


# Search and Filter Schemas
class AppointmentSearchFilters(BaseModel):
    """Search filters for appointments - patients can search by various criteria"""
    doctor_id: Optional[uuid.UUID] = None
    patient_id: Optional[uuid.UUID] = None
    status: Optional[AppointmentStatus] = None
    appointment_type: Optional[AppointmentType] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
    specialization: Optional[str] = None  # Search by doctor specialization
    doctor_name: Optional[str] = None     # Search by doctor name
    limit: int = 20
    offset: int = 0
    
    @field_validator('limit')
    def validate_limit(cls, v):
        if v < 1 or v > 100:
            raise ValueError('Limit must be between 1 and 100')
        return v


# Appointment Reminder Schemas
class AppointmentReminderBase(BaseModel):
    reminder_time: datetime
    reminder_type: str  # email, sms, push

    @field_validator('reminder_type')
    def validate_reminder_type(cls, v):
        allowed_types = ['email', 'sms', 'push']
        if v not in allowed_types:
            raise ValueError(f'Reminder type must be one of: {", ".join(allowed_types)}')
        return v


class AppointmentReminderCreate(AppointmentReminderBase):
    appointment_id: uuid.UUID


class AppointmentReminderRead(AppointmentReminderBase, TimestampSchema):
    id: uuid.UUID
    appointment_id: uuid.UUID
    is_sent: bool
    sent_at: Optional[datetime]

    class Config:
        from_attributes = True


# Batch operations
class AppointmentBatchUpdate(BaseModel):
    appointment_ids: List[uuid.UUID]
    status: Optional[AppointmentStatus] = None
    notes: Optional[str] = None


# Stats and Analytics
class AppointmentStats(BaseModel):
    total_appointments: int
    scheduled: int
    confirmed: int
    completed: int
    cancelled: int
    no_show: int
    upcoming_count: int
    today_count: int 