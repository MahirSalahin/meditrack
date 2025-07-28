from fastapi import APIRouter, HTTPException, Request, status, Query
from app.schemas.health_metrics import (
    HealthMetricCreate,
    HealthMetricUpdate,
    HealthMetricRead,
    HealthMetricStats,
    HealthMetricSearchFilters
)
from app.crud.health_metrics import (
    get_health_metric_by_id,
    create_health_metric,
    update_health_metric,
    delete_health_metric,
    get_patient_health_metrics,
    get_patient_health_metrics_stats,
    get_latest_health_metrics_for_dashboard
)
from app.crud.profiles import get_patient_profile_by_user_id
from app.models.auth import User
from app.models.enums import VitalType
from typing import Optional, List
from datetime import datetime
import uuid
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/health-metrics")


# Helper function to get patient profile ID
async def get_patient_profile_id(user: User) -> uuid.UUID:
    """Get the patient profile ID for the current user."""
    if not user.is_patient:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only patients can access health metrics"
        )
    
    profile = get_patient_profile_by_user_id(user.id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient profile not found"
        )
    return profile.id


# Get health metrics for current patient (dashboard)
@router.get("/my/dashboard", response_model=List[HealthMetricRead])
async def get_my_dashboard_health_metrics(request: Request):
    """Get latest health metrics for patient dashboard."""
    try:
        current_user: User = request.state.user
        
        if not current_user.is_patient:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only patients can access their health metrics"
            )

        patient_profile_id = await get_patient_profile_id(current_user)
        if not patient_profile_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Patient profile not found"
            )

        metrics = get_latest_health_metrics_for_dashboard(patient_profile_id)
        return [HealthMetricRead.model_validate(metric) for metric in metrics]

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting dashboard health metrics: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve health metrics"
        )


# Get health metrics stats for current patient
@router.get("/my/stats", response_model=HealthMetricStats)
async def get_my_health_metrics_stats(request: Request):
    """Get health metrics statistics for the current patient."""
    try:
        current_user: User = request.state.user
        
        if not current_user.is_patient:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only patients can access their health metrics"
            )

        patient_profile_id = await get_patient_profile_id(current_user)
        if not patient_profile_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Patient profile not found"
            )

        stats = get_patient_health_metrics_stats(patient_profile_id)
        return stats

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting health metrics stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve health metrics statistics"
        )


# Get all health metrics for current patient
@router.get("/my", response_model=List[HealthMetricRead])
async def get_my_health_metrics(
    request: Request,
    metric_type: Optional[VitalType] = Query(None),
    recorded_from: Optional[datetime] = Query(None),
    recorded_to: Optional[datetime] = Query(None),
    recorded_by: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0)
):
    """Get health metrics for the current patient with optional filters."""
    try:
        current_user: User = request.state.user
        
        if not current_user.is_patient:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only patients can access their health metrics"
            )

        patient_profile_id = await get_patient_profile_id(current_user)
        if not patient_profile_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Patient profile not found"
            )

        filters = HealthMetricSearchFilters(
            metric_type=metric_type,
            recorded_from=recorded_from,
            recorded_to=recorded_to,
            recorded_by=recorded_by
        )

        metrics, total_count = get_patient_health_metrics(
            patient_profile_id, filters, limit, offset
        )
        
        return [HealthMetricRead.model_validate(metric) for metric in metrics]

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting patient health metrics: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve health metrics"
        )


# Create new health metric
@router.post("/", response_model=HealthMetricRead)
async def create_new_health_metric(
    metric_data: HealthMetricCreate,
    request: Request
):
    """Create a new health metric. Patients can only create for themselves, doctors can create for any patient."""
    try:
        current_user: User = request.state.user
        
        # Check permissions
        if current_user.is_patient:
            # Patients can only create for themselves
            patient_profile_id = await get_patient_profile_id(current_user)
            if metric_data.patient_id != patient_profile_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Patients can only create health metrics for themselves"
                )
        elif not (current_user.is_doctor or current_user.is_admin):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only patients, doctors, and admins can create health metrics"
            )

        metric = create_health_metric(metric_data)
        return HealthMetricRead.model_validate(metric)

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error creating health metric: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create health metric"
        )


# Get health metric by ID
@router.get("/{metric_id}", response_model=HealthMetricRead)
async def get_health_metric(
    metric_id: uuid.UUID,
    request: Request
):
    """Get health metric by ID. Users can only access their own metrics unless they're admin/doctor."""
    try:
        current_user: User = request.state.user
        
        metric = get_health_metric_by_id(metric_id)
        if not metric:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Health metric not found"
            )

        # Check permissions
        if current_user.is_patient:
            patient_profile_id = await get_patient_profile_id(current_user)
            if metric.patient_id != patient_profile_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You can only access your own health metrics"
                )
        elif not (current_user.is_doctor or current_user.is_admin):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )

        return HealthMetricRead.model_validate(metric)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting health metric {metric_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve health metric"
        )


# Update health metric
@router.put("/{metric_id}", response_model=HealthMetricRead)
async def update_existing_health_metric(
    metric_id: uuid.UUID,
    metric_data: HealthMetricUpdate,
    request: Request
):
    """Update health metric. Users can only update their own metrics unless they're admin/doctor."""
    try:
        current_user: User = request.state.user
        
        # Check if metric exists and permissions
        metric = get_health_metric_by_id(metric_id)
        if not metric:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Health metric not found"
            )

        # Check permissions
        if current_user.is_patient:
            patient_profile_id = await get_patient_profile_id(current_user)
            if metric.patient_id != patient_profile_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You can only update your own health metrics"
                )
        elif not (current_user.is_doctor or current_user.is_admin):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )

        updated_metric = update_health_metric(metric_id, metric_data)
        if not updated_metric:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Health metric not found"
            )

        return HealthMetricRead.model_validate(updated_metric)

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating health metric {metric_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update health metric"
        )


# Delete health metric
@router.delete("/{metric_id}")
async def delete_existing_health_metric(
    metric_id: uuid.UUID,
    request: Request
):
    """Delete health metric. Users can only delete their own metrics unless they're admin/doctor."""
    try:
        current_user: User = request.state.user
        
        # Check if metric exists and permissions
        metric = get_health_metric_by_id(metric_id)
        if not metric:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Health metric not found"
            )

        # Check permissions
        if current_user.is_patient:
            patient_profile_id = await get_patient_profile_id(current_user)
            if metric.patient_id != patient_profile_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You can only delete your own health metrics"
                )
        elif not (current_user.is_doctor or current_user.is_admin):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )

        success = delete_health_metric(metric_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Health metric not found"
            )

        return {"message": "Health metric deleted successfully"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting health metric {metric_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete health metric"
        )
