from sqlmodel import create_engine, Session
from app.core.config import settings
import logging
from typing import Annotated
from fastapi import Depends

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create engine with connection pooling
engine = create_engine(
    str(settings.POSTGRES_DATABASE_URL),
    echo=False,  # Set to True for SQL debugging
    pool_pre_ping=True,  # Verify connections before use
    pool_recycle=300,    # Recycle connections every 5 minutes
)


def get_session():
    """Dependency to get database session."""
    with Session(engine) as session:
        yield session

SessionDep = Annotated[Session, Depends(get_session)]