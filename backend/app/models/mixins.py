from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime


# Base model for common timestamp fields
class TimestampMixin(SQLModel):
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = Field(default=None) 