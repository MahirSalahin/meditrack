from fastapi import APIRouter, HTTPException, status, Query
from fastapi.requests import Request
from app.schemas.profiles import (
    UserProfileRead,
    UserProfileUpdate,
    DoctorSearchResponse,
    PatientProfileRead,
    DoctorProfileRead,
    DoctorSearchResult,
    PatientDetailsForDoctor,
    PatientDetailsForDoctor,
    PatientListResponse,
)
from app.schemas.auth import UserRead
from app.crud.profiles import (
    get_user_with_profile,
    toggle_bookmark_patient,
    update_patient_profile,
    update_doctor_profile,
    search_doctors,
    get_doctor_count,
    get_doctor_profile_by_user_id,
    get_patient_by_patient_id,
    get_all_patients_for_doctor,
    search_patients_for_doctor,
    get_bookmarked_patients,
)
from app.crud.auth import update_user, get_user_by_id
import logging
import math
import uuid

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


@router.get("/patients/{patient_id}", response_model=PatientDetailsForDoctor)
async def get_patient_details(patient_id: uuid.UUID, request: Request):
    """Get detailed patient information. Only doctors and admins can access."""
    try:
        current_user = request.state.user

        # Check permissions
        if not (current_user.is_doctor or current_user.is_admin):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only doctors and admins can access patient details",
            )

        # Get patient details
        patient = get_patient_by_patient_id(patient_id)
        if not patient:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found"
            )

        return PatientDetailsForDoctor(**patient)

    except Exception as e:
        logger.error(f"Error fetching patient details: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch patient details",
        )


@router.get("/doctors/patients", response_model=PatientListResponse)
async def get_doctor_patients(
    request: Request,
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
):
    """Get all patients for the current doctor with pagination."""
    try:
        current_user = request.state.user

        # Check permissions
        if not current_user.is_doctor:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only doctors can access patient lists",
            )

        # Get doctor profile to use the correct doctor_id
        doctor_profile = get_doctor_profile_by_user_id(current_user.id)
        if not doctor_profile:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Doctor profile not found",
            )

        # Calculate offset
        offset = (page - 1) * page_size

        # Get patients
        patients, total_count = get_all_patients_for_doctor(
            doctor_id=doctor_profile.id,  # Use doctor profile ID, not user ID
            limit=page_size,
            offset=offset,
        )

        # Calculate total pages
        total_pages = math.ceil(total_count / page_size) if total_count > 0 else 0

        # Convert to response format
        patient_list = []
        for patient in patients:
            patient_item = PatientDetailsForDoctor(**patient)
            patient_list.append(patient_item)

        return PatientListResponse(
            patients=patient_list,
            total_count=total_count,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
        )

    except Exception as e:
        logger.error(f"Error fetching doctor patients: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch patient list",
        )


@router.get("/doctors/patients/search", response_model=PatientListResponse)
async def search_doctor_patients(
    request: Request,
    search_term: str = Query(
        ..., description="Search term for patient name, email, or phone"
    ),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
):
    """Search patients for the current doctor with pagination."""
    try:
        current_user = request.state.user

        # Check permissions
        if not current_user.is_doctor:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only doctors can search patients",
            )

        # Get doctor profile to use the correct doctor_id
        doctor_profile = get_doctor_profile_by_user_id(current_user.id)
        if not doctor_profile:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Doctor profile not found",
            )

        # Calculate offset
        offset = (page - 1) * page_size

        # Search patients
        patients, total_count = search_patients_for_doctor(
            doctor_id=doctor_profile.id,  # Use doctor profile ID, not user ID
            search_term=search_term,
            limit=page_size,
            offset=offset,
        )

        # Calculate total pages
        total_pages = math.ceil(total_count / page_size) if total_count > 0 else 0

        # Convert to response format
        patient_list = []
        for patient in patients:
            patient_item = PatientDetailsForDoctor(**patient)
            patient_list.append(patient_item)

        return PatientListResponse(
            patients=patient_list,
            total_count=total_count,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
        )

    except Exception as e:
        logger.error(f"Error searching doctor patients: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to search patients",
        )


# Endpoints for doctorbookmark
@router.get("/bookmark", response_model=PatientListResponse)
async def bookmarked_patients(
    request: Request,
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
):
    """Get all bookmarked patients for the current doctor with pagination."""
    try:
        current_user = request.state.user
        doctor = get_doctor_profile_by_user_id(current_user.id)

        # Check permissions
        if not doctor:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Doctor Profile is not found!",
            )

        # Calculate offset
        offset = (page - 1) * page_size

        # Get bookmarked patients
        patients, total_count = get_bookmarked_patients(
            doctor_id=doctor.id,
            limit=page_size,
            offset=offset,
        )

        # Calculate total pages
        total_pages = math.ceil(total_count / page_size) if total_count > 0 else 0

        # Convert to response format
        patient_list = []
        for patient in patients:
            patient_item = PatientDetailsForDoctor(**patient)
            patient_list.append(patient_item)

        return PatientListResponse(
            patients=patient_list,
            total_count=total_count,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
        )

    except Exception as e:
        logger.error(f"Error fetching bookmarked patients: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch bookmarked patients",
        )


@router.post("/bookmark/{patient_id}/toggle")
async def create_bookmark_patient(patient_id: uuid.UUID, request: Request):
    """Bookmark a patient for the current doctor."""
    try:
        current_user = request.state.user

        # Check permissions
        if not current_user.is_doctor:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only doctors can bookmark patients",
            )

        # Bookmark the patient
        doctor = get_doctor_profile_by_user_id(current_user.id)
        patient_bookmark = toggle_bookmark_patient(
            patient_id=patient_id, doctor_id=doctor.id
        )

        if not patient_bookmark:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found"
            )

        return patient_bookmark

    except Exception as e:
        logger.error(f"Error bookmarking patient: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to bookmark patient",
        )
