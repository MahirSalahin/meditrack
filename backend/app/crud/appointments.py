from sqlmodel import Session, select, and_, or_, func
from sqlalchemy.exc import IntegrityError
from app.models.appointments import Appointment, AppointmentReminder
from app.models.profiles import PatientProfile, DoctorProfile
from app.models.auth import User
from app.models.enums import AppointmentStatus
from app.schemas.appointments import (
    AppointmentCreate,
    AppointmentUpdate,
    AppointmentSearchFilters,
    AppointmentReminderCreate,
    AppointmentStats
)
from app.db.session import engine
from typing import Optional, List, Tuple
from datetime import datetime
import logging
import uuid

logger = logging.getLogger(__name__)


def get_appointment_by_id(appointment_id: uuid.UUID) -> Optional[Appointment]:
    """Get appointment by ID with relationships."""
    try:
        with Session(engine) as session:
            statement = (
                select(Appointment)
                .where(Appointment.id == appointment_id)
            )
            appointment = session.exec(statement).first()
            return appointment
    except Exception as e:
        logger.error(f"Error fetching appointment {appointment_id}: {e}")
        return None


def create_appointment(appointment_data: AppointmentCreate, created_by_patient_id: Optional[uuid.UUID] = None) -> Appointment:
    """Create a new appointment."""
    with Session(engine) as session:
        try:
            # If created by patient, set patient_id
            patient_id = created_by_patient_id or appointment_data.patient_id
            if not patient_id:
                raise ValueError("Patient ID is required")

            # Verify doctor exists
            doctor_exists = session.exec(
                select(DoctorProfile).where(
                    DoctorProfile.id == appointment_data.doctor_id)
            ).first()
            if not doctor_exists:
                raise ValueError("Doctor not found")

            # Verify patient exists
            patient_exists = session.exec(
                select(PatientProfile).where(PatientProfile.id == patient_id)
            ).first()
            if not patient_exists:
                raise ValueError("Patient not found")

            # Create appointment
            db_appointment = Appointment(
                patient_id=patient_id,
                doctor_id=appointment_data.doctor_id,
                appointment_date=appointment_data.appointment_date,
                duration_minutes=appointment_data.duration_minutes,
                appointment_type=appointment_data.appointment_type,
                reason=appointment_data.reason,
                notes=appointment_data.notes,
                meeting_link=appointment_data.meeting_link,
                meeting_id=appointment_data.meeting_id,
                consultation_fee=appointment_data.consultation_fee,
                status=AppointmentStatus.SCHEDULED
            )

            session.add(db_appointment)
            session.commit()
            session.refresh(db_appointment)
            return db_appointment

        except IntegrityError as e:
            session.rollback()
            logger.error(f"Database integrity error creating appointment: {e}")
            raise ValueError(
                "Failed to create appointment - data integrity error")
        except Exception as e:
            session.rollback()
            logger.error(f"Error creating appointment: {e}")
            raise


def update_appointment(appointment_id: uuid.UUID, appointment_data: AppointmentUpdate) -> Optional[Appointment]:
    """Update an existing appointment."""
    with Session(engine) as session:
        try:
            # Get existing appointment
            appointment = session.exec(
                select(Appointment).where(Appointment.id == appointment_id)
            ).first()

            if not appointment:
                return None

            # Update fields that are provided
            update_data = appointment_data.model_dump(exclude_unset=True)
            for field, value in update_data.items():
                setattr(appointment, field, value)

            session.add(appointment)
            session.commit()
            session.refresh(appointment)
            return appointment

        except Exception as e:
            session.rollback()
            logger.error(f"Error updating appointment {appointment_id}: {e}")
            raise


def delete_appointment(appointment_id: uuid.UUID) -> bool:
    """Delete an appointment (soft delete by setting status to cancelled)."""
    with Session(engine) as session:
        try:
            appointment = session.exec(
                select(Appointment).where(Appointment.id == appointment_id)
            ).first()

            if not appointment:
                return False

            appointment.status = AppointmentStatus.CANCELLED
            session.add(appointment)
            session.commit()
            return True

        except Exception as e:
            session.rollback()
            logger.error(f"Error deleting appointment {appointment_id}: {e}")
            return False


def search_appointments(filters: AppointmentSearchFilters) -> Tuple[List[dict], int]:
    """Search appointments with filtering and pagination."""
    with Session(engine) as session:
        try:
            # Use aliases to avoid column conflicts
            from sqlalchemy import alias
            PatientUser = alias(User, name='patient_user')
            DoctorUser = alias(User, name='doctor_user')

            # Base query with joins for searching
            base_query = (
                select(
                    Appointment,
                    func.concat(PatientUser.c.first_name, ' ',
                                PatientUser.c.last_name).label('patient_name'),
                    func.concat(DoctorUser.c.first_name, ' ',
                                DoctorUser.c.last_name).label('doctor_name'),
                    DoctorProfile.specialization
                )
                .join(PatientProfile, Appointment.patient_id == PatientProfile.id)
                .join(PatientUser, PatientProfile.user_id == PatientUser.c.id, isouter=True)
                .join(DoctorProfile, Appointment.doctor_id == DoctorProfile.id)
                .join(DoctorUser, DoctorProfile.user_id == DoctorUser.c.id, isouter=True)
            )

            # Apply filters
            where_conditions = []

            if filters.doctor_id:
                where_conditions.append(
                    Appointment.doctor_id == filters.doctor_id)

            if filters.patient_id:
                where_conditions.append(
                    Appointment.patient_id == filters.patient_id)

            if filters.status:
                where_conditions.append(Appointment.status == filters.status)

            if filters.appointment_type:
                where_conditions.append(
                    Appointment.appointment_type == filters.appointment_type)

            if filters.date_from:
                where_conditions.append(
                    Appointment.appointment_date >= filters.date_from)

            if filters.date_to:
                where_conditions.append(
                    Appointment.appointment_date <= filters.date_to)

            if filters.specialization:
                where_conditions.append(
                    DoctorProfile.specialization.ilike(
                        f"%{filters.specialization}%")
                )

            if filters.doctor_name:
                where_conditions.append(
                    or_(
                        DoctorUser.c.first_name.ilike(
                            f"%{filters.doctor_name}%"),
                        DoctorUser.c.last_name.ilike(
                            f"%{filters.doctor_name}%"),
                        func.concat(DoctorUser.c.first_name, ' ', DoctorUser.c.last_name).ilike(
                            f"%{filters.doctor_name}%")
                    )
                )

            # Apply where conditions
            if where_conditions:
                base_query = base_query.where(and_(*where_conditions))

            # Get total count
            count_query = select(func.count()).select_from(
                base_query.subquery())
            total_count = session.exec(count_query).first() or 0

            # Apply pagination and ordering
            query = (
                base_query
                .order_by(Appointment.appointment_date.desc())
                .offset(filters.offset)
                .limit(filters.limit)
            )

            results = session.exec(query).all()

            # Format results
            appointments = []
            for row in results:
                appointment, patient_name, doctor_name, specialization = row
                appointment_dict = appointment.model_dump() if hasattr(appointment, 'model_dump') else {
                    'id': appointment.id,
                    'patient_id': appointment.patient_id,
                    'doctor_id': appointment.doctor_id,
                    'appointment_date': appointment.appointment_date,
                    'duration_minutes': appointment.duration_minutes,
                    'appointment_type': appointment.appointment_type,
                    'status': appointment.status,
                    'reason': appointment.reason,
                    'notes': appointment.notes,
                    'prescription_given': appointment.prescription_given,
                    'follow_up_required': appointment.follow_up_required,
                    'follow_up_date': appointment.follow_up_date,
                    'meeting_link': appointment.meeting_link,
                    'meeting_id': appointment.meeting_id,
                    'consultation_fee': appointment.consultation_fee,
                    'payment_status': appointment.payment_status,
                    'created_at': appointment.created_at,
                    'updated_at': appointment.updated_at,
                }
                appointment_dict.update({
                    'patient_name': patient_name,
                    'doctor_name': doctor_name,
                    'doctor_specialization': specialization
                })
                appointments.append(appointment_dict)

            return appointments, total_count

        except Exception as e:
            logger.error(f"Error searching appointments: {e}")
            raise


def get_patient_appointments(patient_id: uuid.UUID, limit: int = 20, offset: int = 0) -> Tuple[List[Appointment], int]:
    """Get appointments for a specific patient."""
    filters = AppointmentSearchFilters(
        patient_id=patient_id,
        limit=limit,
        offset=offset
    )
    return search_appointments(filters)


def get_doctor_appointments(doctor_id: uuid.UUID, limit: int = 20, offset: int = 0) -> Tuple[List[Appointment], int]:
    """Get appointments for a specific doctor."""
    filters = AppointmentSearchFilters(
        doctor_id=doctor_id,
        limit=limit,
        offset=offset
    )
    return search_appointments(filters)


def get_upcoming_appointments(user: User, limit: int = 10) -> List[Appointment]:
    """Get upcoming appointments for a user (patient or doctor)."""
    with Session(engine) as session:
        try:
            current_time = datetime.now()

            if user.is_patient:
                # Get patient profile ID
                patient_profile = session.exec(
                    select(PatientProfile).where(
                        PatientProfile.user_id == user.id)
                ).first()
                if not patient_profile:
                    return []

                query = (
                    select(Appointment)
                    .where(
                        and_(
                            Appointment.patient_id == patient_profile.id,
                            Appointment.appointment_date > current_time,
                            Appointment.status.in_(
                                [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED])
                        )
                    )
                    .order_by(Appointment.appointment_date.asc())
                    .limit(limit)
                )
            elif user.is_doctor:
                # Get doctor profile ID
                doctor_profile = session.exec(
                    select(DoctorProfile).where(
                        DoctorProfile.user_id == user.id)
                ).first()
                if not doctor_profile:
                    return []

                query = (
                    select(Appointment)
                    .where(
                        and_(
                            Appointment.doctor_id == doctor_profile.id,
                            Appointment.appointment_date > current_time,
                            Appointment.status.in_(
                                [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED])
                        )
                    )
                    .order_by(Appointment.appointment_date.asc())
                    .limit(limit)
                )
            else:
                return []

            appointments = session.exec(query).all()
            return list(appointments)

        except Exception as e:
            logger.error(
                f"Error getting upcoming appointments for user {user.id}: {e}")
            return []


def get_appointment_stats(user: User) -> AppointmentStats:
    """Get appointment statistics for a user."""
    with Session(engine) as session:
        try:
            current_date = datetime.now().date()

            if user.is_patient:
                patient_profile = session.exec(
                    select(PatientProfile).where(
                        PatientProfile.user_id == user.id)
                ).first()
                if not patient_profile:
                    return AppointmentStats(
                        total_appointments=0, scheduled=0, confirmed=0, completed=0,
                        cancelled=0, no_show=0, upcoming_count=0, today_count=0
                    )
                filter_condition = Appointment.patient_id == patient_profile.id
            elif user.is_doctor:
                doctor_profile = session.exec(
                    select(DoctorProfile).where(
                        DoctorProfile.user_id == user.id)
                ).first()
                if not doctor_profile:
                    return AppointmentStats(
                        total_appointments=0, scheduled=0, confirmed=0, completed=0,
                        cancelled=0, no_show=0, upcoming_count=0, today_count=0
                    )
                filter_condition = Appointment.doctor_id == doctor_profile.id
            else:
                return AppointmentStats(
                    total_appointments=0, scheduled=0, confirmed=0, completed=0,
                    cancelled=0, no_show=0, upcoming_count=0, today_count=0
                )

            # Get total appointments
            total_appointments = session.exec(
                select(func.count(Appointment.id)).where(filter_condition)
            ).first() or 0

            # Get status counts
            status_counts = {}
            for status in AppointmentStatus:
                count = session.exec(
                    select(func.count(Appointment.id)).where(
                        and_(filter_condition, Appointment.status == status)
                    )
                ).first() or 0
                status_counts[status.value] = count

            # Get upcoming appointments count
            upcoming_count = session.exec(
                select(func.count(Appointment.id)).where(
                    and_(
                        filter_condition,
                        Appointment.appointment_date > datetime.now(),
                        Appointment.status.in_(
                            [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED])
                    )
                )
            ).first() or 0

            # Get today's appointments count
            today_start = datetime.combine(current_date, datetime.min.time())
            today_end = datetime.combine(current_date, datetime.max.time())
            today_count = session.exec(
                select(func.count(Appointment.id)).where(
                    and_(
                        filter_condition,
                        Appointment.appointment_date >= today_start,
                        Appointment.appointment_date <= today_end
                    )
                )
            ).first() or 0

            return AppointmentStats(
                total_appointments=total_appointments,
                scheduled=status_counts.get('scheduled', 0),
                confirmed=status_counts.get('confirmed', 0),
                completed=status_counts.get('completed', 0),
                cancelled=status_counts.get('cancelled', 0),
                no_show=status_counts.get('no_show', 0),
                upcoming_count=upcoming_count,
                today_count=today_count
            )

        except Exception as e:
            logger.error(
                f"Error getting appointment stats for user {user.id}: {e}")
            return AppointmentStats(
                total_appointments=0, scheduled=0, confirmed=0, completed=0,
                cancelled=0, no_show=0, upcoming_count=0, today_count=0
            )


# Appointment Reminder CRUD
def create_appointment_reminder(reminder_data: AppointmentReminderCreate) -> AppointmentReminder:
    """Create an appointment reminder."""
    with Session(engine) as session:
        try:
            # Verify appointment exists
            appointment = session.exec(
                select(Appointment).where(
                    Appointment.id == reminder_data.appointment_id)
            ).first()
            if not appointment:
                raise ValueError("Appointment not found")

            db_reminder = AppointmentReminder(
                appointment_id=reminder_data.appointment_id,
                reminder_time=reminder_data.reminder_time,
                reminder_type=reminder_data.reminder_type
            )

            session.add(db_reminder)
            session.commit()
            session.refresh(db_reminder)
            return db_reminder

        except Exception as e:
            session.rollback()
            logger.error(f"Error creating appointment reminder: {e}")
            raise


def get_pending_reminders(limit: int = 100) -> List[AppointmentReminder]:
    """Get pending reminders that need to be sent."""
    with Session(engine) as session:
        try:
            current_time = datetime.now()

            query = (
                select(AppointmentReminder)
                .where(
                    and_(
                        AppointmentReminder.is_sent == False,
                        AppointmentReminder.reminder_time <= current_time
                    )
                )
                .limit(limit)
            )

            reminders = session.exec(query).all()
            return list(reminders)

        except Exception as e:
            logger.error(f"Error getting pending reminders: {e}")
            return []


def mark_reminder_sent(reminder_id: uuid.UUID) -> bool:
    """Mark a reminder as sent."""
    with Session(engine) as session:
        try:
            reminder = session.exec(
                select(AppointmentReminder).where(
                    AppointmentReminder.id == reminder_id)
            ).first()

            if not reminder:
                return False

            reminder.is_sent = True
            reminder.sent_at = datetime.now()
            session.add(reminder)
            session.commit()
            return True

        except Exception as e:
            session.rollback()
            logger.error(f"Error marking reminder {reminder_id} as sent: {e}")
            return False


def get_user_reminders(user: User, limit: int = 50) -> List[AppointmentReminder]:
    """Get reminders for a specific user's appointments."""
    with Session(engine) as session:
        try:
            if user.is_patient:
                # Get patient profile ID
                patient_profile = session.exec(
                    select(PatientProfile).where(
                        PatientProfile.user_id == user.id)
                ).first()
                if not patient_profile:
                    return []

                query = (
                    select(AppointmentReminder)
                    .join(Appointment, AppointmentReminder.appointment_id == Appointment.id)
                    .where(Appointment.patient_id == patient_profile.id)
                    .order_by(AppointmentReminder.reminder_time.desc())
                    .limit(limit)
                )
            elif user.is_doctor:
                # Get doctor profile ID
                doctor_profile = session.exec(
                    select(DoctorProfile).where(
                        DoctorProfile.user_id == user.id)
                ).first()
                if not doctor_profile:
                    return []

                query = (
                    select(AppointmentReminder)
                    .join(Appointment, AppointmentReminder.appointment_id == Appointment.id)
                    .where(Appointment.doctor_id == doctor_profile.id)
                    .order_by(AppointmentReminder.reminder_time.desc())
                    .limit(limit)
                )
            else:
                return []

            reminders = session.exec(query).all()
            return list(reminders)

        except Exception as e:
            logger.error(
                f"Error getting user reminders for user {user.id}: {e}")
            return []


def get_reminder_by_id(reminder_id: uuid.UUID) -> Optional[AppointmentReminder]:
    """Get reminder by ID."""
    try:
        with Session(engine) as session:
            reminder = session.exec(
                select(AppointmentReminder).where(
                    AppointmentReminder.id == reminder_id)
            ).first()
            return reminder
    except Exception as e:
        logger.error(f"Error fetching reminder {reminder_id}: {e}")
        return None


def delete_reminder(reminder_id: uuid.UUID) -> bool:
    """Delete a reminder."""
    with Session(engine) as session:
        try:
            reminder = session.exec(
                select(AppointmentReminder).where(
                    AppointmentReminder.id == reminder_id)
            ).first()

            if not reminder:
                return False

            session.delete(reminder)
            session.commit()
            return True

        except Exception as e:
            session.rollback()
            logger.error(f"Error deleting reminder {reminder_id}: {e}")
            return False
