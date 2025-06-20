from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, TYPE_CHECKING
from datetime import datetime
import uuid
from app.models.mixins import TimestampMixin
from app.models.enums import VitalType

if TYPE_CHECKING:
    from app.models.profiles import PatientProfile


class HealthMetric(TimestampMixin, table=True):
    __tablename__ = "health_metrics"
    
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    patient_id: uuid.UUID = Field(foreign_key="patient_profiles.id")
    
    metric_type: VitalType
    value: str = Field(max_length=50)  # "120/80", "98.6°F", "72 bpm"
    unit: str = Field(max_length=20)  # "mmHg", "°F", "bpm"
    recorded_at: datetime = Field(default_factory=datetime.utcnow)
    recorded_by: Optional[str] = Field(max_length=100, default=None)  # self, doctor, device
    notes: Optional[str] = Field(max_length=500, default=None)
    
    # Normal ranges for comparison
    normal_min: Optional[float] = Field(default=None)
    normal_max: Optional[float] = Field(default=None)
    
    # Relationships
    patient: "PatientProfile" = Relationship(back_populates="health_metrics") 