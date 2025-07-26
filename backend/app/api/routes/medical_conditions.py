from fastapi import APIRouter, HTTPException, status, Query
from fastapi.requests import Request
from app.schemas.medical_conditions import (
    MedicalConditionCreate,
    MedicalConditionUpdate,
    MedicalConditionRead,
    MedicalConditionSearchFilters
)
from app.crud.medical_conditions import (
    get_medical_condition_by_id,
    create_medical_condition,
    update_medical_condition,
    delete_medical_condition,
    get_patient_medical_conditions,
    search_medical_conditions,
    get_active_medical_conditions,
    get_patient_allergies
)
from app.crud.profiles import get_patient_profile_by_user_id
from app.models.auth import User
from app.models.enums import ConditionType, ConditionStatus, AllergySeverity
from typing import Optional, List
import logging
import uuid

logger = logging.getLogger(__name__)
router = APIRouter()


# Helper function to get patient profile ID
async def get_patient_profile_id(user: User) -> uuid.UUID:
    """Get the patient profile ID for the current user."""
    if not user.is_patient:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only patients can access medical conditions"
        )
    
    profile = get_patient_profile_by_user_id(user.id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient profile not found"
        )
    return profile.id


# ===============================
# MEDICAL CONDITION ENDPOINTS
# ===============================

# Create Medical Condition
@router.post("/medical-conditions", response_model=MedicalConditionRead)
async def create_new_medical_condition(
    condition_data: MedicalConditionCreate,
    request: Request
):
    """Create a new medical condition. Patients can only create for themselves, doctors and admins for any patient."""
    try:
        current_user = request.state.user
        
        # Check permissions
        if current_user.is_patient:
            # Patients can only create for themselves
            patient_profile_id = await get_patient_profile_id(current_user)
            if condition_data.patient_id != patient_profile_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Patients can only create medical conditions for themselves"
                )
        elif not (current_user.is_doctor or current_user.is_admin):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only patients, doctors, and admins can create medical conditions"
            )

        condition = create_medical_condition(condition_data)
        return MedicalConditionRead.model_validate(condition)

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error creating medical condition: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create medical condition"
        )


# Get Medical Condition by ID
@router.get("/medical-conditions/{condition_id}", response_model=MedicalConditionRead)
async def get_medical_condition(
    condition_id: uuid.UUID,
    request: Request
):
    """Get medical condition by ID. Users can only access their own conditions unless they're admin/doctor."""
    condition = get_medical_condition_by_id(condition_id)
    if not condition:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medical condition not found"
        )
    
    current_user = request.state.user
    
    # Check access permissions
    if not (current_user.is_admin or current_user.is_doctor):
        if current_user.is_patient:
            patient_profile_id = await get_patient_profile_id(current_user)
            if condition.patient_id != patient_profile_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied"
                )
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )

    return MedicalConditionRead.model_validate(condition)


# Update Medical Condition
@router.put("/medical-conditions/{condition_id}", response_model=MedicalConditionRead)
async def update_existing_medical_condition(
    condition_id: uuid.UUID,
    condition_data: MedicalConditionUpdate,
    request: Request
):
    """Update medical condition. Users can only update their own conditions unless they're admin/doctor."""
    # Get existing condition
    existing_condition = get_medical_condition_by_id(condition_id)
    if not existing_condition:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medical condition not found"
        )

    current_user = request.state.user
    
    # Check access permissions
    if not (current_user.is_admin or current_user.is_doctor):
        if current_user.is_patient:
            patient_profile_id = await get_patient_profile_id(current_user)
            if existing_condition.patient_id != patient_profile_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied"
                )
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )

    try:
        updated_condition = update_medical_condition(condition_id, condition_data)
        if not updated_condition:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Medical condition not found"
            )

        return MedicalConditionRead.model_validate(updated_condition)

    except Exception as e:
        logger.error(f"Error updating medical condition {condition_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update medical condition"
        )


# Delete Medical Condition
@router.delete("/medical-conditions/{condition_id}")
async def delete_existing_medical_condition(
    condition_id: uuid.UUID,
    request: Request
):
    """Delete medical condition. Users can only delete their own conditions unless they're admin/doctor."""
    # Get existing condition
    existing_condition = get_medical_condition_by_id(condition_id)
    if not existing_condition:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medical condition not found"
        )

    current_user = request.state.user
    
    # Check access permissions
    if not (current_user.is_admin or current_user.is_doctor):
        if current_user.is_patient:
            patient_profile_id = await get_patient_profile_id(current_user)
            if existing_condition.patient_id != patient_profile_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied"
                )
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )

    try:
        success = delete_medical_condition(condition_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Medical condition not found"
            )

        return {"message": "Medical condition deleted successfully"}

    except Exception as e:
        logger.error(f"Error deleting medical condition {condition_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete medical condition"
        )


# Search Medical Conditions
@router.get("/medical-conditions/search", response_model=dict)
async def search_user_medical_conditions(
    request: Request,
    patient_id: Optional[uuid.UUID] = Query(None),
    condition_type: Optional[ConditionType] = Query(None),
    status: Optional[ConditionStatus] = Query(None),
    name: Optional[str] = Query(None),
    allergy_severity: Optional[AllergySeverity] = Query(None),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    """Search medical conditions with filters. Users can only search their own conditions unless they're admin/doctor."""
    try:
        current_user = request.state.user
        
        # Restrict search based on user type
        if not (current_user.is_admin or current_user.is_doctor):
            if current_user.is_patient:
                # Patients can only search their own conditions
                patient_profile_id = await get_patient_profile_id(current_user)
                patient_id = patient_profile_id
            else:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied"
                )

        filters = MedicalConditionSearchFilters(
            patient_id=patient_id,
            condition_type=condition_type,
            status=status,
            name=name,
            allergy_severity=allergy_severity,
            limit=limit,
            offset=offset
        )

        conditions, total_count = search_medical_conditions(filters)
        
        return {
            "medical_conditions": [MedicalConditionRead.model_validate(c) for c in conditions],
            "total": total_count,
            "limit": limit,
            "offset": offset
        }

    except Exception as e:
        logger.error(f"Error searching medical conditions: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to search medical conditions"
        )


# Get My Medical Conditions
@router.get("/medical-conditions/my/list", response_model=dict)
async def get_my_medical_conditions(
    request: Request,
    status: Optional[ConditionStatus] = Query(None),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    """Get current patient's medical conditions."""
    try:
        current_user = request.state.user
        patient_profile_id = await get_patient_profile_id(current_user)

        conditions, total_count = get_patient_medical_conditions(
            patient_profile_id, status, limit, offset)

        return {
            "medical_conditions": [MedicalConditionRead.model_validate(c) for c in conditions],
            "total": total_count,
            "limit": limit,
            "offset": offset
        }

    except Exception as e:
        logger.error(f"Error fetching patient medical conditions: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch medical conditions"
        )


# Get Active Medical Conditions
@router.get("/medical-conditions/my/active", response_model=List[MedicalConditionRead])
async def get_my_active_medical_conditions(
    request: Request
):
    """Get current patient's active medical conditions."""
    try:
        current_user = request.state.user
        patient_profile_id = await get_patient_profile_id(current_user)

        conditions = get_active_medical_conditions(patient_profile_id)
        return [MedicalConditionRead.model_validate(c) for c in conditions]

    except Exception as e:
        logger.error(f"Error fetching active medical conditions: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch active medical conditions"
        )


# Get Patient Allergies (for safety checks)
@router.get("/medical-conditions/allergies/{patient_id}", response_model=List[MedicalConditionRead])
async def get_patient_allergy_list(
    patient_id: uuid.UUID,
    request: Request
):
    """Get patient's allergies. Only doctors, admins, and the patient themselves can access this."""
    try:
        current_user = request.state.user
        
        # Check access permissions
        if not (current_user.is_admin or current_user.is_doctor):
            if current_user.is_patient:
                patient_profile_id = await get_patient_profile_id(current_user)
                if patient_id != patient_profile_id:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="Access denied"
                    )
            else:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied"
                )

        allergies = get_patient_allergies(patient_id)
        return [MedicalConditionRead.model_validate(a) for a in allergies]

    except Exception as e:
        logger.error(f"Error fetching patient allergies: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch patient allergies"
        )
