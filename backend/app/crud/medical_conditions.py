from sqlmodel import Session, select
from sqlalchemy.exc import IntegrityError
from app.models.medical_conditions import MedicalCondition
from app.schemas.medical_conditions import (
    MedicalConditionCreate, MedicalConditionUpdate, MedicalConditionSearchFilters
)
from app.db.session import engine
from app.models.enums import ConditionStatus
from typing import Optional, Tuple, List
from datetime import datetime
import logging
import uuid

logger = logging.getLogger(__name__)


def get_medical_condition_by_id(condition_id: uuid.UUID) -> Optional[MedicalCondition]:
    """Get medical condition by ID."""
    try:
        with Session(engine) as session:
            statement = select(MedicalCondition).where(MedicalCondition.id == condition_id)
            return session.exec(statement).first()
    except Exception as e:
        logger.error(f"Error fetching medical condition {condition_id}: {e}")
        return None


def create_medical_condition(condition_data: MedicalConditionCreate) -> MedicalCondition:
    """Create a new medical condition."""
    with Session(engine) as session:
        try:
            db_condition = MedicalCondition(**condition_data.model_dump())
            session.add(db_condition)
            session.commit()
            session.refresh(db_condition)
            return db_condition
        except IntegrityError as e:
            session.rollback()
            logger.error(f"Database integrity error creating medical condition: {e}")
            raise ValueError("Medical condition could not be created due to data integrity error")
        except Exception as e:
            session.rollback()
            logger.error(f"Error creating medical condition: {e}")
            raise


def update_medical_condition(condition_id: uuid.UUID, condition_data: MedicalConditionUpdate) -> Optional[MedicalCondition]:
    """Update medical condition by ID."""
    with Session(engine) as session:
        try:
            statement = select(MedicalCondition).where(MedicalCondition.id == condition_id)
            db_condition = session.exec(statement).first()
            
            if not db_condition:
                return None
            
            # Update only provided fields
            update_data = condition_data.model_dump(exclude_unset=True)
            for field, value in update_data.items():
                setattr(db_condition, field, value)
            
            # Update the timestamp
            db_condition.updated_at = datetime.utcnow()
            
            session.add(db_condition)
            session.commit()
            session.refresh(db_condition)
            return db_condition
        except Exception as e:
            session.rollback()
            logger.error(f"Error updating medical condition {condition_id}: {e}")
            raise


def delete_medical_condition(condition_id: uuid.UUID) -> bool:
    """Delete medical condition by ID."""
    with Session(engine) as session:
        try:
            statement = select(MedicalCondition).where(MedicalCondition.id == condition_id)
            db_condition = session.exec(statement).first()
            
            if not db_condition:
                return False
            
            session.delete(db_condition)
            session.commit()
            return True
        except Exception as e:
            session.rollback()
            logger.error(f"Error deleting medical condition {condition_id}: {e}")
            raise


def get_patient_medical_conditions(
    patient_id: uuid.UUID,
    status: Optional[ConditionStatus] = None,
    limit: int = 50,
    offset: int = 0
) -> Tuple[List[MedicalCondition], int]:
    """Get medical conditions for a specific patient."""
    try:
        with Session(engine) as session:
            # Build query
            statement = select(MedicalCondition).where(MedicalCondition.patient_id == patient_id)
            
            # Add status filter if provided
            if status:
                statement = statement.where(MedicalCondition.status == status)
            
            # Count total
            count_statement = select(MedicalCondition).where(MedicalCondition.patient_id == patient_id)
            if status:
                count_statement = count_statement.where(MedicalCondition.status == status)
            
            total_count = len(session.exec(count_statement).all())
            
            # Add pagination and execute
            statement = statement.offset(offset).limit(limit)
            conditions = session.exec(statement).all()
            
            return conditions, total_count
    except Exception as e:
        logger.error(f"Error fetching patient medical conditions: {e}")
        return [], 0


def search_medical_conditions(filters: MedicalConditionSearchFilters) -> Tuple[List[MedicalCondition], int]:
    """Search medical conditions with filters."""
    try:
        with Session(engine) as session:
            # Build base query
            statement = select(MedicalCondition)
            
            # Add filters
            if filters.patient_id:
                statement = statement.where(MedicalCondition.patient_id == filters.patient_id)
            
            if filters.condition_type:
                statement = statement.where(MedicalCondition.condition_type == filters.condition_type)
            
            if filters.status:
                statement = statement.where(MedicalCondition.status == filters.status)
            
            if filters.name:
                statement = statement.where(MedicalCondition.name.ilike(f"%{filters.name}%"))
            
            if filters.allergy_severity:
                statement = statement.where(MedicalCondition.allergy_severity == filters.allergy_severity)
            
            # Count total
            count_statement = statement
            total_count = len(session.exec(count_statement).all())
            
            # Add pagination
            statement = statement.offset(filters.offset).limit(filters.limit)
            
            conditions = session.exec(statement).all()
            return conditions, total_count
    except Exception as e:
        logger.error(f"Error searching medical conditions: {e}")
        return [], 0


def get_active_medical_conditions(patient_id: uuid.UUID) -> List[MedicalCondition]:
    """Get active medical conditions for a patient."""
    try:
        with Session(engine) as session:
            statement = select(MedicalCondition).where(
                MedicalCondition.patient_id == patient_id,
                MedicalCondition.status == ConditionStatus.ACTIVE
            )
            return session.exec(statement).all()
    except Exception as e:
        logger.error(f"Error fetching active medical conditions for patient {patient_id}: {e}")
        return []


def get_patient_allergies(patient_id: uuid.UUID) -> List[MedicalCondition]:
    """Get patient's allergies for safety checks."""
    try:
        from app.models.enums import ConditionType
        with Session(engine) as session:
            statement = select(MedicalCondition).where(
                MedicalCondition.patient_id == patient_id,
                MedicalCondition.condition_type == ConditionType.ALLERGY,
                MedicalCondition.status == ConditionStatus.ACTIVE
            )
            return session.exec(statement).all()
    except Exception as e:
        logger.error(f"Error fetching allergies for patient {patient_id}: {e}")
        return []
