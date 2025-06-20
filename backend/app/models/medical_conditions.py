from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, TYPE_CHECKING
from datetime import datetime
import uuid
from app.models.mixins import TimestampMixin
from app.models.enums import ConditionType, ConditionStatus, AllergySeverity

if TYPE_CHECKING:
    from app.models.profiles import PatientProfile


class MedicalCondition(TimestampMixin, table=True):
    __tablename__ = "medical_conditions"
    
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    patient_id: uuid.UUID = Field(foreign_key="patient_profiles.id")
    
    # Common fields
    condition_type: ConditionType
    name: str = Field(max_length=200)  # condition name or allergen
    status: ConditionStatus = Field(default=ConditionStatus.ACTIVE)
    diagnosed_date: Optional[datetime] = Field(default=None)
    notes: Optional[str] = Field(max_length=1000, default=None)
    
    # For medical conditions
    severity: Optional[str] = Field(max_length=50, default=None)
    treatment: Optional[str] = Field(max_length=500, default=None)
    
    # For allergies (only used when condition_type = "allergy")
    allergy_severity: Optional[AllergySeverity] = Field(default=None)
    reaction: Optional[str] = Field(max_length=500, default=None)
    
    # Relationships
    patient: "PatientProfile" = Relationship(back_populates="medical_conditions") 