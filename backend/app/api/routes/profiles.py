from fastapi import APIRouter, HTTPException, status, Query
from fastapi.requests import Request
from app.schemas.profiles import (
    UserProfileRead,
    UserProfileUpdate,
    DoctorSearchResponse,
    PatientProfileRead,
    DoctorProfileRead,
    DoctorSearchResult,
)
from app.schemas.auth import UserRead
from app.crud.profiles import (
    get_user_with_profile,
    update_patient_profile,
    update_doctor_profile,
    search_doctors,
    get_doctor_count,
    get_doctor_profile_by_user_id,
)
from app.crud.auth import update_user, get_user_by_id
import logging
import math
import uuid
from datetime import datetime

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/me", response_model=UserProfileRead)
async def get_current_user_profile(request: Request):
    """Get current user data with profile information."""
    current_user = request.state.user

    try:
        user_with_profile = get_user_with_profile(current_user.id)

        if not user_with_profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User profile not found"
            )

        user_data = user_with_profile["user"]
        profile_data = user_with_profile["profile"]

        # Create response based on user type
        response_data = {
            "user": UserRead.model_validate(user_data),
            "patient_profile": None,
            "doctor_profile": None,
        }

        if user_data.is_patient and profile_data:
            response_data["patient_profile"] = PatientProfileRead.model_validate(
                profile_data
            )
        elif user_data.is_doctor and profile_data:
            response_data["doctor_profile"] = DoctorProfileRead.model_validate(
                profile_data
            )

        return UserProfileRead(**response_data)

    except Exception as e:
        logger.error(f"Error fetching user profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch user profile",
        )


@router.put("/me", response_model=UserProfileRead)
async def update_current_user_profile(
    profile_update: UserProfileUpdate, request: Request
):
    """Update current user data and profile information."""
    current_user = request.state.user

    try:
        # Extract user fields
        user_fields = {
            "first_name": profile_update.first_name,
            "last_name": profile_update.last_name,
            "phone": profile_update.phone,
        }
        # Remove None values
        user_fields = {k: v for k, v in user_fields.items() if v is not None}

        # Update user data if there are fields to update
        updated_user = current_user
        if user_fields:
            updated_user = update_user(current_user.id, user_fields)
            if not updated_user:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
                )

        # Update profile based on user type
        updated_profile = None
        if current_user.is_patient:
            # Extract patient profile fields
            from app.schemas.profiles import PatientProfileUpdate

            patient_fields = {
                "date_of_birth": profile_update.date_of_birth,
                "gender": profile_update.gender,
                "blood_group": profile_update.blood_group,
                "emergency_contact_name": profile_update.emergency_contact_name,
                "emergency_contact_phone": profile_update.emergency_contact_phone,
                "address": profile_update.address,
                "insurance_info": profile_update.insurance_info,
                "allergies": profile_update.allergies,
                "medical_history": profile_update.medical_history,
            }
            # Remove None values
            patient_fields = {k: v for k, v in patient_fields.items() if v is not None}

            if patient_fields:
                patient_update = PatientProfileUpdate(**patient_fields)
                updated_profile = update_patient_profile(
                    current_user.id, patient_update
                )

        elif current_user.is_doctor:
            # Extract doctor profile fields
            from app.schemas.profiles import DoctorProfileUpdate

            doctor_fields = {
                "medical_license_number": profile_update.medical_license_number,
                "license_expiry_date": profile_update.license_expiry_date,
                "specialization": profile_update.specialization,
                "years_of_experience": profile_update.years_of_experience,
                "hospital_affiliation": profile_update.hospital_affiliation,
                "education_background": profile_update.education_background,
                "consultation_fee": profile_update.consultation_fee,
                "available_days": profile_update.available_days,
                "bio": profile_update.bio,
            }
            # Remove None values
            doctor_fields = {k: v for k, v in doctor_fields.items() if v is not None}

            if doctor_fields:
                doctor_update = DoctorProfileUpdate(**doctor_fields)
                updated_profile = update_doctor_profile(current_user.id, doctor_update)

        # Return updated user with profile
        response_data = {
            "user": UserRead.model_validate(updated_user),
            "patient_profile": None,
            "doctor_profile": None,
        }

        if updated_user.is_patient and updated_profile:
            response_data["patient_profile"] = PatientProfileRead.model_validate(
                updated_profile
            )
        elif updated_user.is_doctor and updated_profile:
            response_data["doctor_profile"] = DoctorProfileRead.model_validate(
                updated_profile
            )

        return UserProfileRead(**response_data)

    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Error updating user profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update user profile",
        )


@router.get("/doctors/search", response_model=DoctorSearchResponse)
async def search_doctors_endpoint(
    specialization: str = Query(None, description="Filter by specialization"),
    hospital_affiliation: str = Query(
        None, description="Filter by hospital affiliation"
    ),
    min_experience: int = Query(None, ge=0, description="Minimum years of experience"),
    max_fee: float = Query(None, ge=0, description="Maximum consultation fee"),
    is_verified: bool = Query(None, description="Filter by verification status"),
    location: str = Query(None, description="Filter by location"),
    name: str = Query(None, description="Search by doctor name"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
):
    """Search doctors with advanced filtering and pagination."""
    try:
        # Calculate offset
        offset = (page - 1) * page_size

        # Search doctors
        doctors = search_doctors(
            specialization=specialization,
            hospital_affiliation=hospital_affiliation,
            min_experience=min_experience,
            max_fee=max_fee,
            is_verified=is_verified,
            location=location,
            name=name,
            limit=page_size,
            offset=offset,
        )

        # Get total count
        total_count = get_doctor_count(
            specialization=specialization,
            hospital_affiliation=hospital_affiliation,
            min_experience=min_experience,
            max_fee=max_fee,
            is_verified=is_verified,
            location=location,
            name=name,
        )

        # Calculate total pages
        total_pages = math.ceil(total_count / page_size) if total_count > 0 else 0

        # Convert to response format with user information
        doctor_results = []

        for doctor in doctors:
            user = get_user_by_id(doctor.user_id)
            if user:
                # Create a proper DoctorSearchResult object
                doctor_result = DoctorSearchResult(
                    id=doctor.id,
                    user_id=doctor.user_id,
                    medical_license_number=doctor.medical_license_number,
                    license_expiry_date=doctor.license_expiry_date,
                    specialization=doctor.specialization,
                    years_of_experience=doctor.years_of_experience or 0,
                    hospital_affiliation=doctor.hospital_affiliation,
                    education_background=doctor.education_background,
                    consultation_fee=doctor.consultation_fee,
                    available_days=doctor.available_days,
                    bio=doctor.bio,
                    is_verified=doctor.is_verified,
                    is_license_valid=doctor.is_license_valid,
                    created_at=doctor.created_at,
                    updated_at=doctor.updated_at,  # Can be None, which is fine
                    doctor_name=f"{user.first_name} {user.last_name}",
                    doctor_email=user.email,
                )
                doctor_results.append(doctor_result)

        return DoctorSearchResponse(
            doctors=doctor_results,
            total_count=total_count,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
        )

    except Exception as e:
        logger.error(f"Error searching doctors: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to search doctors",
        )


@router.get("/doctors/{doctor_id}", response_model=DoctorProfileRead)
async def get_doctor_profile(doctor_id: str):
    """Get a specific doctor's profile by user ID."""
    try:
        doctor_uuid = uuid.UUID(doctor_id)
        doctor_profile = get_doctor_profile_by_user_id(doctor_uuid)

        if not doctor_profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Doctor profile not found"
            )

        return DoctorProfileRead.model_validate(doctor_profile)

    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid doctor ID format"
        )
    except Exception as e:
        logger.error(f"Error fetching doctor profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch doctor profile",
        )
