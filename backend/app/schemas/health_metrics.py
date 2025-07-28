from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime
import uuid
from app.models.enums import VitalType


class HealthMetricBase(BaseModel):
    metric_type: VitalType
    value: str
    unit: str
    recorded_at: Optional[datetime] = None
    recorded_by: Optional[str] = None
    notes: Optional[str] = None
    normal_min: Optional[float] = None
    normal_max: Optional[float] = None


class HealthMetricCreate(HealthMetricBase):
    patient_id: uuid.UUID


class HealthMetricUpdate(BaseModel):
    metric_type: Optional[VitalType] = None
    value: Optional[str] = None
    unit: Optional[str] = None
    recorded_at: Optional[datetime] = None
    recorded_by: Optional[str] = None
    notes: Optional[str] = None
    normal_min: Optional[float] = None
    normal_max: Optional[float] = None


class HealthMetricRead(HealthMetricBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: uuid.UUID
    patient_id: uuid.UUID
    created_at: datetime
    updated_at: datetime


class HealthMetricStats(BaseModel):
    """Dashboard-friendly health metrics stats"""
    latest_metrics: List[HealthMetricRead]
    total_count: int
    metrics_this_week: int
    metrics_this_month: int


class HealthMetricSearchFilters(BaseModel):
    metric_type: Optional[VitalType] = None
    recorded_from: Optional[datetime] = None
    recorded_to: Optional[datetime] = None
    recorded_by: Optional[str] = None
