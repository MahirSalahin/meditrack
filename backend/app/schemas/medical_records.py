from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field
import uuid
from app.models.enums import RecordCategory, Priority


class MedicalAttachmentRead(BaseModel):
    id: uuid.UUID
    filename: str
    original_filename: str
    file_path: str
    file_type: str
    file_size: int
    content_type: str
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        orm_mode = True


class MedicalAttachmentCreate(BaseModel):
    filename: str
    original_filename: str
    file_path: str
    file_type: str
    file_size: int
    content_type: str


class MedicalRecordBase(BaseModel):
    title: str
    category: RecordCategory
    record_date: Optional[datetime]
    facility: Optional[str]
    summary: Optional[str]
    diagnosis: Optional[str]
    symptoms: Optional[str]
    treatment_summary: Optional[str]
    priority: Optional[Priority] = Priority.NORMAL
    tags: Optional[str]


class MedicalRecordCreate(MedicalRecordBase):
    pass


class MedicalRecordUpdate(MedicalRecordBase):
    pass


class MedicalRecordRead(MedicalRecordBase):
    id: uuid.UUID
    patient_id: uuid.UUID
    doctor_id: Optional[uuid.UUID]
    attachments: List[MedicalAttachmentRead] = []
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        orm_mode = True
