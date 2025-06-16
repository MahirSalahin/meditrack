from pydantic import BaseModel
from typing import Optional
from datetime import datetime


# Base schemas for common fields
class TimestampSchema(BaseModel):
    created_at: datetime
    updated_at: Optional[datetime] = None 