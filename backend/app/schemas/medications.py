from fastapi import File
from pydantic import BaseModel, field_validator
from typing import Optional, List
from datetime import datetime
import uuid
from app.models.enums import MedicationStatus, PrescriptionStatus
from .common import TimestampSchema


# Medication Schemas
class MedicationBase(BaseModel):
    name: str
    generic_name: Optional[str] = None
    description: Optional[str] = None
    manufacturer: Optional[str] = None
    drug_class: Optional[str] = None
    contraindications: Optional[str] = None
    side_effects: Optional[str] = None
    interactions: Optional[str] = None

    @field_validator("name")
    def validate_name(cls, v):
        if not v or len(v.strip()) < 2:
            raise ValueError("Medication name must be at least 2 characters long")
        return v.strip()


class MedicationCreate(MedicationBase):
    pass


class MedicationUpdate(BaseModel):
    name: Optional[str] = None
    generic_name: Optional[str] = None
    description: Optional[str] = None
    manufacturer: Optional[str] = None
    drug_class: Optional[str] = None
    contraindications: Optional[str] = None
    side_effects: Optional[str] = None
    interactions: Optional[str] = None

    @field_validator("name")
    def validate_name(cls, v):
        if v is not None and (not v or len(v.strip()) < 2):
            raise ValueError("Medication name must be at least 2 characters long")
        return v.strip() if v else v


class MedicationRead(MedicationBase, TimestampSchema):
    id: uuid.UUID

    class Config:
        from_attributes = True


# Prescription Schemas
class PrescriptionItemBase(BaseModel):
    medication_name: str
    dosage: str
    frequency: str
    quantity: str
    duration: Optional[str] = None
    instructions: Optional[str] = None

    @field_validator("medication_name")
    def validate_medication_name(cls, v):
        if not v or len(v.strip()) < 1:
            raise ValueError("Medication name is required")
        return v.strip()

    @field_validator("dosage")
    def validate_dosage(cls, v):
        if not v or len(v.strip()) < 1:
            raise ValueError("Dosage is required")
        return v.strip()

    @field_validator("frequency")
    def validate_frequency(cls, v):
        if not v or len(v.strip()) < 1:
            raise ValueError("Frequency is required")
        return v.strip()

    @field_validator("quantity")
    def validate_quantity(cls, v):
        if not v or len(v.strip()) < 1:
            raise ValueError("Quantity is required")
        return v.strip()


class PrescriptionItemCreate(PrescriptionItemBase):
    pass


class PrescriptionItemRead(PrescriptionItemBase, TimestampSchema):
    id: uuid.UUID

    class Config:
        from_attributes = True


class PrescriptionBase(BaseModel):
    # Remove medication_id, dosage, frequency, quantity, instructions
    start_date: datetime
    end_date: Optional[datetime] = None
    diagnosis: Optional[str] = None
    notes: Optional[str] = None
    items: List[PrescriptionItemCreate]


class PrescriptionCreate(PrescriptionBase):
    patient_id: Optional[uuid.UUID] = None
    doctor_id: Optional[uuid.UUID] = None
    appointment_id: Optional[uuid.UUID] = None


class PrescriptionUpdate(BaseModel):
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    status: Optional[PrescriptionStatus] = None
    diagnosis: Optional[str] = None
    notes: Optional[str] = None
    items: Optional[List[PrescriptionItemCreate]] = None


class PrescriptionRead(PrescriptionBase, TimestampSchema):
    id: uuid.UUID
    patient_id: uuid.UUID
    doctor_id: uuid.UUID
    appointment_id: Optional[uuid.UUID]
    prescribed_date: datetime
    status: PrescriptionStatus
    items: List[PrescriptionItemRead]

    class Config:
        from_attributes = True


class PrescriptionWithDetails(PrescriptionRead):
    patient_name: Optional[str] = None
    doctor_name: Optional[str] = None
    medication_name: Optional[str] = None
    medication_generic_name: Optional[str] = None


# Search and Filter Schemas
class PrescriptionSearchFilters(BaseModel):
    patient_id: Optional[uuid.UUID] = None
    doctor_id: Optional[uuid.UUID] = None
    medication_id: Optional[uuid.UUID] = None
    appointment_id: Optional[uuid.UUID] = None
    status: Optional[PrescriptionStatus] = None
    prescribed_date_from: Optional[datetime] = None
    prescribed_date_to: Optional[datetime] = None
    start_date_from: Optional[datetime] = None
    start_date_to: Optional[datetime] = None
    medication_name: Optional[str] = None
    diagnosis: Optional[str] = None
    limit: int = 20
    offset: int = 0

    @field_validator("limit")
    def validate_limit(cls, v):
        if v < 1 or v > 100:
            raise ValueError("Limit must be between 1 and 100")
        return v


class MedicationSearchFilters(BaseModel):
    name: Optional[str] = None
    generic_name: Optional[str] = None
    manufacturer: Optional[str] = None
    drug_class: Optional[str] = None
    limit: int = 20
    offset: int = 0

    @field_validator("limit")
    def validate_limit(cls, v):
        if v < 1 or v > 100:
            raise ValueError("Limit must be between 1 and 100")
        return v


# Medication Log Schemas
class MedicationLogBase(BaseModel):
    taken_at: datetime
    dosage_taken: str
    notes: Optional[str] = None
    side_effects_experienced: Optional[str] = None

    @field_validator("dosage_taken")
    def validate_dosage_taken(cls, v):
        if not v or len(v.strip()) < 1:
            raise ValueError("Dosage taken is required")
        return v.strip()


class MedicationLogCreate(MedicationLogBase):
    prescription_id: uuid.UUID


class MedicationLogUpdate(BaseModel):
    taken_at: Optional[datetime] = None
    dosage_taken: Optional[str] = None
    notes: Optional[str] = None
    side_effects_experienced: Optional[str] = None

    @field_validator("dosage_taken")
    def validate_dosage_taken(cls, v):
        if v is not None and (not v or len(v.strip()) < 1):
            raise ValueError("Dosage taken is required")
        return v.strip() if v else v


class MedicationLogRead(MedicationLogBase, TimestampSchema):
    id: uuid.UUID
    prescription_id: uuid.UUID

    class Config:
        from_attributes = True


class MedicationLogWithDetails(MedicationLogRead):
    prescription_medication_name: Optional[str] = None
    prescription_dosage: Optional[str] = None
    prescription_frequency: Optional[str] = None


# Stats Schemas
class PrescriptionStats(BaseModel):
    total_prescriptions: int
    draft: int
    active: int
    completed: int
    discontinued: int
    current_medications: int
    medication_logs_count: int


class MedicationStats(BaseModel):
    total_medications: int
    total_prescriptions: int
    most_prescribed: List[dict]  # List of {medication_name, count}
    by_drug_class: List[dict]  # List of {drug_class, count}


# Batch operations
class PrescriptionBatchUpdate(BaseModel):
    prescription_ids: List[uuid.UUID]
    status: Optional[PrescriptionStatus] = None
    notes: Optional[str] = None


class PrescriptionPDFRead(BaseModel):
    id: uuid.UUID
    prescription_id: Optional[uuid.UUID]
    patient_id: uuid.UUID
    uploaded_by: uuid.UUID
    status: PrescriptionStatus
    title: str
    file_name: str
    file_size: int
    created_at: datetime
    own_prescription: bool = False  # Indicates if the PDF belongs to the user

    class Config:
        from_attributes = True
