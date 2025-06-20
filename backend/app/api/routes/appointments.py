from fastapi import APIRouter, HTTPException, status, Query
from fastapi.requests import Request
from app.schemas.appointments import (
    AppointmentCreate,
    AppointmentUpdate,
    AppointmentRead,
    AppointmentSearchFilters,
    AppointmentStats,
    AppointmentReminderCreate,
    AppointmentReminderRead,
    AppointmentBatchUpdate
)
from app.crud.appointments import (
    get_appointment_by_id,
    create_appointment,
    update_appointment,
    delete_appointment,
    search_appointments,
    get_patient_appointments,
    get_doctor_appointments,
    get_upcoming_appointments,
    get_appointment_stats,
    create_appointment_reminder,
    get_user_reminders,
    get_reminder_by_id,
    delete_reminder
)
from app.crud.profiles import (
    get_patient_profile_by_user_id,
    get_doctor_profile_by_user_id
)
from app.models.auth import User
from app.models.enums import AppointmentStatus
from app.db.session import SessionDep
from typing import Optional, List
from datetime import datetime
import logging
import uuid

logger = logging.getLogger(__name__)
router = APIRouter()


# Helper function to get user profile ID
async def get_user_profile_id(user: User) -> uuid.UUID:
    """Get the profile ID for the current user based on their type."""
    if user.is_patient:
        profile = get_patient_profile_by_user_id(user.id)
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Patient profile not found"
            )
        return profile.id
    elif user.is_doctor:
        profile = get_doctor_profile_by_user_id(user.id)
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Doctor profile not found"
            )
        return profile.id
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only patients and doctors can access appointments"
        )


# Create Appointment
@router.post("/", response_model=AppointmentRead)
async def create_new_appointment(
    appointment_data: AppointmentCreate,
    session: SessionDep,
    request: Request
):
    """Create a new appointment. Patients can only create appointments for themselves."""
    try:
        created_by_patient_id = None
        current_user = request.state.user
        # If user is a patient, set their profile ID
        if current_user.is_patient:
            patient_profile_id = await get_user_profile_id(current_user)
            created_by_patient_id = patient_profile_id

            # Patients can only create appointments for themselves
            if appointment_data.patient_id and appointment_data.patient_id != patient_profile_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Patients can only create appointments for themselves"
                )

        # Doctors and admins can create appointments for any patient
        elif not current_user.is_doctor and not current_user.is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only patients, doctors, and admins can create appointments"
            )

        appointment = create_appointment(
            appointment_data, created_by_patient_id)
        return AppointmentRead.model_validate(appointment)

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error creating appointment: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create appointment"
        )


# Get Appointment by ID
@router.get("/{appointment_id}", response_model=AppointmentRead)
async def get_appointment(
    appointment_id: uuid.UUID,
    request: Request
):
    """Get appointment by ID. Users can only access their own appointments unless they're admin."""
    appointment = get_appointment_by_id(appointment_id)
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found"
        )
    current_user = request.state.user
    # Check access permissions
    if not current_user.is_admin:
        user_profile_id = await get_user_profile_id(current_user)

        # Check if user is either the patient or doctor in this appointment
        if (appointment.patient_id != user_profile_id and
                appointment.doctor_id != user_profile_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )

    return AppointmentRead.model_validate(appointment)


# Update Appointment
@router.put("/{appointment_id}", response_model=AppointmentRead)
async def update_existing_appointment(
    appointment_id: uuid.UUID,
    appointment_data: AppointmentUpdate,
    request: Request
):
    """Update appointment. Users can only update appointments they're involved in."""
    # Get existing appointment
    existing_appointment = get_appointment_by_id(appointment_id)
    if not existing_appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found"
        )

    # Check access permissions
    current_user = request.state.user
    if not current_user.is_admin:
        user_profile_id = await get_user_profile_id(current_user)

        # Check if user is either the patient or doctor in this appointment
        if (existing_appointment.patient_id != user_profile_id and
                existing_appointment.doctor_id != user_profile_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )

        # Patients have limited update permissions
        if current_user.is_patient:
            # Patients can only update certain fields
            allowed_fields = {'reason', 'notes'}
            provided_fields = set(
                appointment_data.model_dump(exclude_unset=True).keys())
            if not provided_fields.issubset(allowed_fields):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Patients can only update: {', '.join(allowed_fields)}"
                )

    try:
        updated_appointment = update_appointment(
            appointment_id, appointment_data)
        if not updated_appointment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Appointment not found"
            )

        return AppointmentRead.model_validate(updated_appointment)

    except Exception as e:
        logger.error(f"Error updating appointment {appointment_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update appointment"
        )


# Delete Appointment (Cancel)
@router.delete("/{appointment_id}")
async def cancel_appointment(
    appointment_id: uuid.UUID,
    request: Request
):
    """Cancel appointment. Users can only cancel appointments they're involved in."""
    # Get existing appointment
    existing_appointment = get_appointment_by_id(appointment_id)
    if not existing_appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found"
        )

    # Check access permissions
    current_user = request.state.user
    if not current_user.is_admin:
        user_profile_id = await get_user_profile_id(current_user)

        # Check if user is either the patient or doctor in this appointment
        if (existing_appointment.patient_id != user_profile_id and
                existing_appointment.doctor_id != user_profile_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )

    try:
        success = delete_appointment(appointment_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Appointment not found"
            )

        return {"message": "Appointment cancelled successfully"}

    except Exception as e:
        logger.error(f"Error cancelling appointment {appointment_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to cancel appointment"
        )


# Search Appointments with Filters
@router.get("/search", response_model=dict)
async def search_user_appointments(
    request: Request,
    doctor_id: Optional[uuid.UUID] = Query(None),
    patient_id: Optional[uuid.UUID] = Query(None),
    status: Optional[AppointmentStatus] = Query(None),
    appointment_type: Optional[str] = Query(None),
    date_from: Optional[datetime] = Query(None),
    date_to: Optional[datetime] = Query(None),
    specialization: Optional[str] = Query(None),
    doctor_name: Optional[str] = Query(None),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    """Search appointments with various filters. Access controlled by user role."""
    current_user = request.state.user
    try:
        # Build search filters
        filters = AppointmentSearchFilters(
            doctor_id=doctor_id,
            patient_id=patient_id,
            status=status,
            appointment_type=appointment_type,
            date_from=date_from,
            date_to=date_to,
            specialization=specialization,
            doctor_name=doctor_name,
            limit=limit,
            offset=offset
        )

        # Apply access control based on user role
        if current_user.is_patient:
            # Patients can only see their own appointments
            user_profile_id = await get_user_profile_id(current_user)
            filters.patient_id = user_profile_id
        elif current_user.is_doctor:
            # Doctors can only see their own appointments unless they search for specific patients
            if not patient_id:  # If no specific patient requested, show doctor's appointments
                user_profile_id = await get_user_profile_id(current_user)
                filters.doctor_id = user_profile_id
        # Admins can see all appointments without restrictions

        appointments, total_count = search_appointments(filters)

        return {
            "appointments": appointments,
            "total": total_count,
            "limit": limit,
            "offset": offset,
            "has_more": offset + limit < total_count
        }

    except Exception as e:
        logger.error(f"Error searching appointments: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to search appointments"
        )


# Get User's Appointments (Simplified endpoint)
@router.get("/my/list", response_model=dict)
async def get_my_appointments(
    request: Request,
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    """Get current user's appointments."""
    current_user = request.state.user
    try:
        user_profile_id = await get_user_profile_id(current_user)

        if current_user.is_patient:
            appointments, total_count = get_patient_appointments(
                user_profile_id, limit, offset)
        elif current_user.is_doctor:
            appointments, total_count = get_doctor_appointments(
                user_profile_id, limit, offset)
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only patients and doctors can access this endpoint"
            )

        return {
            "appointments": [AppointmentRead.model_validate(apt).model_dump() for apt in appointments],
            "total": total_count,
            "limit": limit,
            "offset": offset,
            "has_more": offset + limit < total_count
        }

    except Exception as e:
        logger.error(f"Error getting user appointments: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get appointments"
        )


# Get Upcoming Appointments
@router.get("/my/upcoming", response_model=List[AppointmentRead])
async def get_my_upcoming_appointments(
    request: Request,
    limit: int = Query(10, ge=1, le=50)
):
    """Get current user's upcoming appointments."""
    current_user = request.state.user
    try:
        appointments = get_upcoming_appointments(
            current_user, limit)
        return [AppointmentRead.model_validate(apt) for apt in appointments]

    except Exception as e:
        logger.error(f"Error getting upcoming appointments: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get upcoming appointments"
        )


# Get Appointment Statistics
@router.get("/my/stats", response_model=AppointmentStats)
async def get_my_appointment_stats(
    request: Request
):
    """Get appointment statistics for current user."""
    current_user = request.state.user
    try:
        stats = get_appointment_stats(current_user)
        return stats

    except Exception as e:
        logger.error(f"Error getting appointment stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get appointment statistics"
        )


# Batch Update Appointments (Admin/Doctor only)
@router.put("/batch", response_model=dict)
async def batch_update_appointments(
    batch_data: AppointmentBatchUpdate,
    request: Request
):
    current_user = request.state.user
    """Batch update multiple appointments. Admin and doctors only."""
    if not (current_user.is_admin or current_user.is_doctor):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins and doctors can perform batch updates"
        )

    try:
        updated_count = 0
        failed_count = 0

        for appointment_id in batch_data.appointment_ids:
            try:
                update_data = AppointmentUpdate()
                if batch_data.status:
                    update_data.status = batch_data.status
                if batch_data.notes:
                    update_data.notes = batch_data.notes

                result = update_appointment(appointment_id, update_data)
                if result:
                    updated_count += 1
                else:
                    failed_count += 1
            except Exception as e:
                logger.error(
                    f"Error updating appointment {appointment_id}: {e}")
                failed_count += 1

        return {
            "message": "Batch update completed",
            "updated": updated_count,
            "failed": failed_count,
            "total": len(batch_data.appointment_ids)
        }

    except Exception as e:
        logger.error(f"Error in batch update: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to perform batch update"
        )


# Appointment Reminders
@router.post("/{appointment_id}/reminders", response_model=AppointmentReminderRead)
async def create_appointment_reminder_endpoint(
    appointment_id: uuid.UUID,
    reminder_data: AppointmentReminderCreate,
    request: Request
):
    """Create an appointment reminder."""
    current_user = request.state.user
    # Verify appointment exists and user has access
    appointment = get_appointment_by_id(appointment_id)
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found"
        )

    # Check access permissions
    if not current_user.is_admin:
        user_profile_id = await get_user_profile_id(current_user)

        if (appointment.patient_id != user_profile_id and
                appointment.doctor_id != user_profile_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )

    try:
        # Set the appointment_id
        reminder_data.appointment_id = appointment_id
        reminder = create_appointment_reminder(reminder_data)
        return AppointmentReminderRead.model_validate(reminder)

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error creating reminder: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create reminder"
        )


# Get User's Reminders
@router.get("/my/reminders", response_model=List[AppointmentReminderRead])
async def get_my_reminders(
    request: Request,
    limit: int = Query(50, ge=1, le=100)
):
    """Get current user's appointment reminders."""
    current_user = request.state.user
    try:
        reminders = get_user_reminders(
            current_user, limit)
        return [AppointmentReminderRead.model_validate(reminder) for reminder in reminders]

    except Exception as e:
        logger.error(f"Error getting user reminders: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get reminders"
        )


# Delete User's Reminder
@router.delete("/reminders/{reminder_id}")
async def delete_my_reminder(
    reminder_id: uuid.UUID,
    request: Request
):
    """Delete a user's appointment reminder."""
    current_user = request.state.user

    try:
        # Get the reminder to check ownership
        reminder = get_reminder_by_id(reminder_id)
        if not reminder:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Reminder not found"
            )

        # Get the appointment to check if user has access
        appointment = get_appointment_by_id(reminder.appointment_id)
        if not appointment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Associated appointment not found"
            )

        # Check access permissions
        if not current_user.is_admin:
            user_profile_id = await get_user_profile_id(current_user)

            if (appointment.patient_id != user_profile_id and
                    appointment.doctor_id != user_profile_id):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied"
                )

        success = delete_reminder(reminder_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Reminder not found"
            )

        return {"message": "Reminder deleted successfully"}

    except Exception as e:
        logger.error(f"Error deleting reminder {reminder_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete reminder"
        )
