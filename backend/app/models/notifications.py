from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, TYPE_CHECKING
from datetime import datetime
import uuid
from app.models.mixins import TimestampMixin
from app.models.enums import NotificationType, NotificationStatus

if TYPE_CHECKING:
    from app.models.auth import User


class Notification(TimestampMixin, table=True):
    __tablename__ = "notifications"
    
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="users.id")
    
    notification_type: NotificationType
    title: str = Field(max_length=200)
    message: str = Field(max_length=1000)
    
    # Scheduling
    scheduled_for: Optional[datetime] = Field(default=None)
    sent_at: Optional[datetime] = Field(default=None)
    read_at: Optional[datetime] = Field(default=None)
    
    # Status and delivery
    status: NotificationStatus = Field(default=NotificationStatus.PENDING)
    delivery_method: Optional[str] = Field(max_length=50, default=None)  # email, push
    
    # Related entity IDs (optional)
    related_entity_type: Optional[str] = Field(max_length=50, default=None)
    related_entity_id: Optional[uuid.UUID] = Field(default=None)
    
    # Relationships
    user: "User" = Relationship() 