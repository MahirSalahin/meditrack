from sqlmodel import Session, select, and_, func
from sqlalchemy.exc import IntegrityError
from app.models.health_metrics import HealthMetric
from app.models.profiles import PatientProfile
from app.schemas.health_metrics import (
    HealthMetricCreate, 
    HealthMetricUpdate, 
    HealthMetricSearchFilters,
    HealthMetricStats
)
from app.db.session import engine
from app.models.enums import VitalType
from typing import Optional, List, Tuple
from datetime import datetime, timedelta
import logging
import uuid

logger = logging.getLogger(__name__)


def get_health_metric_by_id(metric_id: uuid.UUID) -> Optional[HealthMetric]:
    """Get health metric by ID."""
    with Session(engine) as session:
        try:
            return session.exec(
                select(HealthMetric).where(HealthMetric.id == metric_id)
            ).first()
        except Exception as e:
            logger.error(f"Error getting health metric {metric_id}: {e}")
            return None


def create_health_metric(metric_data: HealthMetricCreate) -> HealthMetric:
    """Create a new health metric."""
    with Session(engine) as session:
        try:
            # Verify patient exists
            patient_exists = session.exec(
                select(PatientProfile).where(PatientProfile.id == metric_data.patient_id)
            ).first()
            if not patient_exists:
                raise ValueError("Patient not found")

            db_metric = HealthMetric(
                patient_id=metric_data.patient_id,
                metric_type=metric_data.metric_type,
                value=metric_data.value,
                unit=metric_data.unit,
                recorded_at=metric_data.recorded_at or datetime.utcnow(),
                recorded_by=metric_data.recorded_by,
                notes=metric_data.notes,
                normal_min=metric_data.normal_min,
                normal_max=metric_data.normal_max,
            )

            session.add(db_metric)
            session.commit()
            session.refresh(db_metric)
            return db_metric

        except IntegrityError as e:
            session.rollback()
            logger.error(f"Database integrity error creating health metric: {e}")
            raise ValueError("Failed to create health metric - data integrity error")
        except Exception as e:
            session.rollback()
            logger.error(f"Error creating health metric: {e}")
            raise


def update_health_metric(metric_id: uuid.UUID, metric_data: HealthMetricUpdate) -> Optional[HealthMetric]:
    """Update health metric by ID."""
    with Session(engine) as session:
        try:
            db_metric = session.exec(
                select(HealthMetric).where(HealthMetric.id == metric_id)
            ).first()
            
            if not db_metric:
                return None

            update_data = metric_data.model_dump(exclude_unset=True)
            for field, value in update_data.items():
                setattr(db_metric, field, value)

            session.add(db_metric)
            session.commit()
            session.refresh(db_metric)
            return db_metric

        except IntegrityError as e:
            session.rollback()
            logger.error(f"Database integrity error updating health metric {metric_id}: {e}")
            raise ValueError("Failed to update health metric - data integrity error")
        except Exception as e:
            session.rollback()
            logger.error(f"Error updating health metric {metric_id}: {e}")
            raise


def delete_health_metric(metric_id: uuid.UUID) -> bool:
    """Delete health metric by ID."""
    with Session(engine) as session:
        try:
            db_metric = session.exec(
                select(HealthMetric).where(HealthMetric.id == metric_id)
            ).first()
            
            if not db_metric:
                return False

            session.delete(db_metric)
            session.commit()
            return True

        except Exception as e:
            session.rollback()
            logger.error(f"Error deleting health metric {metric_id}: {e}")
            raise


def get_patient_health_metrics(
    patient_id: uuid.UUID,
    filters: Optional[HealthMetricSearchFilters] = None,
    limit: int = 50,
    offset: int = 0
) -> Tuple[List[HealthMetric], int]:
    """Get health metrics for a specific patient with optional filters."""
    with Session(engine) as session:
        try:
            # Build query
            query = select(HealthMetric).where(HealthMetric.patient_id == patient_id)
            
            if filters:
                if filters.metric_type:
                    query = query.where(HealthMetric.metric_type == filters.metric_type)
                if filters.recorded_from:
                    query = query.where(HealthMetric.recorded_at >= filters.recorded_from)
                if filters.recorded_to:
                    query = query.where(HealthMetric.recorded_at <= filters.recorded_to)
                if filters.recorded_by:
                    query = query.where(HealthMetric.recorded_by == filters.recorded_by)

            # Count total
            count_query = select(func.count()).select_from(query.subquery())
            total_count = session.exec(count_query).one()

            # Get paginated results
            metrics = session.exec(
                query.order_by(HealthMetric.recorded_at.desc())
                .offset(offset)
                .limit(limit)
            ).all()

            return list(metrics), total_count

        except Exception as e:
            logger.error(f"Error getting patient health metrics: {e}")
            return [], 0


def get_patient_health_metrics_stats(patient_id: uuid.UUID) -> HealthMetricStats:
    """Get health metrics statistics for a patient."""
    with Session(engine) as session:
        try:
            # Get latest metrics (one of each type)
            latest_metrics_query = """
                SELECT DISTINCT ON (metric_type) *
                FROM health_metrics
                WHERE patient_id = :patient_id
                ORDER BY metric_type, recorded_at DESC
            """
            
            latest_metrics = session.exec(
                select(HealthMetric).from_statement(
                    latest_metrics_query
                ).params(patient_id=patient_id)
            ).all()

            # Count total metrics
            total_count = session.exec(
                select(func.count(HealthMetric.id))
                .where(HealthMetric.patient_id == patient_id)
            ).one()

            # Count metrics this week
            week_ago = datetime.utcnow() - timedelta(days=7)
            metrics_this_week = session.exec(
                select(func.count(HealthMetric.id))
                .where(
                    and_(
                        HealthMetric.patient_id == patient_id,
                        HealthMetric.recorded_at >= week_ago
                    )
                )
            ).one()

            # Count metrics this month
            month_ago = datetime.utcnow() - timedelta(days=30)
            metrics_this_month = session.exec(
                select(func.count(HealthMetric.id))
                .where(
                    and_(
                        HealthMetric.patient_id == patient_id,
                        HealthMetric.recorded_at >= month_ago
                    )
                )
            ).one()

            return HealthMetricStats(
                latest_metrics=list(latest_metrics),
                total_count=total_count,
                metrics_this_week=metrics_this_week,
                metrics_this_month=metrics_this_month
            )

        except Exception as e:
            logger.error(f"Error getting health metrics stats for patient {patient_id}: {e}")
            return HealthMetricStats(
                latest_metrics=[],
                total_count=0,
                metrics_this_week=0,
                metrics_this_month=0
            )


def get_latest_health_metrics_for_dashboard(patient_id: uuid.UUID) -> List[HealthMetric]:
    """Get the latest health metrics for dashboard display (one of each type)."""
    with Session(engine) as session:
        try:
            # Get the latest metric for each type
            metrics = []
            for vital_type in [VitalType.BLOOD_PRESSURE, VitalType.HEART_RATE, VitalType.TEMPERATURE, VitalType.WEIGHT]:
                latest_metric = session.exec(
                    select(HealthMetric)
                    .where(
                        and_(
                            HealthMetric.patient_id == patient_id,
                            HealthMetric.metric_type == vital_type
                        )
                    )
                    .order_by(HealthMetric.recorded_at.desc())
                    .limit(1)
                ).first()
                
                if latest_metric:
                    metrics.append(latest_metric)

            return metrics

        except Exception as e:
            logger.error(f"Error getting latest health metrics for dashboard: {e}")
            return []
