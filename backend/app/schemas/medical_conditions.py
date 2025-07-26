from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
import uuid
from app.models.enums import ConditionType, ConditionStatus, AllergySeverity


class MedicalConditionBase(BaseModel):
    """Base schema for medical conditions."""
    condition_type: ConditionType
    name: str = Field(..., max_length=200)
    status: ConditionStatus = Field(default=ConditionStatus.ACTIVE)
    diagnosed_date: Optional[datetime] = None
    notes: Optional[str] = Field(None, max_length=1000)
    
    # For medical conditions
    severity: Optional[str] = Field(None, max_length=50)
    treatment: Optional[str] = Field(None, max_length=500)
    
    # For allergies (only used when condition_type = "allergy")
    allergy_severity: Optional[AllergySeverity] = None
    reaction: Optional[str] = Field(None, max_length=500)


class MedicalConditionCreate(MedicalConditionBase):
    """Schema for creating a new medical condition."""
    patient_id: uuid.UUID


class MedicalConditionUpdate(BaseModel):
    """Schema for updating a medical condition."""
    status: Optional[ConditionStatus] = None
    diagnosed_date: Optional[datetime] = None
    notes: Optional[str] = Field(None, max_length=1000)
    severity: Optional[str] = Field(None, max_length=50)
    treatment: Optional[str] = Field(None, max_length=500)
    allergy_severity: Optional[AllergySeverity] = None
    reaction: Optional[str] = Field(None, max_length=500)


class MedicalConditionRead(MedicalConditionBase):
    """Schema for reading a medical condition."""
    id: uuid.UUID
    patient_id: uuid.UUID
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class MedicalConditionSearchFilters(BaseModel):
    """Schema for medical condition search filters."""
    patient_id: Optional[uuid.UUID] = None
    condition_type: Optional[ConditionType] = None
    status: Optional[ConditionStatus] = None
    name: Optional[str] = None
    allergy_severity: Optional[AllergySeverity] = None
    limit: int = Field(20, ge=1, le=100)
    offset: int = Field(0, ge=0)
