from enum import Enum


# Enum for user types
class UserType(str, Enum):
    PATIENT = "patient"
    DOCTOR = "doctor"
    SYSTEM_ADMIN = "system_admin"


# Enum for blood groups
class BloodGroup(str, Enum):
    A_POSITIVE = "A+"
    A_NEGATIVE = "A-"
    B_POSITIVE = "B+"
    B_NEGATIVE = "B-"
    AB_POSITIVE = "AB+"
    AB_NEGATIVE = "AB-"
    O_POSITIVE = "O+"
    O_NEGATIVE = "O-"


# Enum for gender
class Gender(str, Enum):
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"
    PREFER_NOT_TO_SAY = "prefer_not_to_say"


# Medical Records Enums
class RecordCategory(str, Enum):
    CHECKUP = "checkup"
    LAB_RESULT = "lab"
    IMAGING = "imaging"
    SPECIALIST = "specialist"
    VACCINATION = "vaccination"
    PRESCRIPTION = "prescription"
    EMERGENCY = "emergency"


class Priority(str, Enum):
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    URGENT = "urgent"


# Appointment Enums
class AppointmentStatus(str, Enum):
    SCHEDULED = "scheduled"
    CONFIRMED = "confirmed"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    NO_SHOW = "no_show"


class AppointmentType(str, Enum):
    CONSULTATION = "consultation"
    FOLLOW_UP = "follow_up"
    CHECKUP = "checkup"
    EMERGENCY = "emergency"
    VIRTUAL = "virtual"


# Medication Enums
class MedicationStatus(str, Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    DISCONTINUED = "discontinued"
    PAUSED = "paused"


class PrescriptionStatus(str, Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    DISCONTINUED = "discontinued"


# Health Metrics Enums
class VitalType(str, Enum):
    BLOOD_PRESSURE = "blood_pressure"
    HEART_RATE = "heart_rate"
    TEMPERATURE = "temperature"
    WEIGHT = "weight"
    HEIGHT = "height"
    BMI = "bmi"
    BLOOD_SUGAR = "blood_sugar"
    OXYGEN_SATURATION = "oxygen_saturation"


# Notification Enums
class NotificationType(str, Enum):
    MEDICATION_REMINDER = "medication_reminder"
    APPOINTMENT_REMINDER = "appointment_reminder"
    TEST_RESULT = "test_result"
    GENERAL = "general"


class NotificationStatus(str, Enum):
    PENDING = "pending"
    SENT = "sent"
    DELIVERED = "delivered"
    FAILED = "failed"
    READ = "read"


# Medical Condition Enums
class ConditionType(str, Enum):
    MEDICAL_CONDITION = "medical_condition"
    ALLERGY = "allergy"


class ConditionStatus(str, Enum):
    ACTIVE = "active"
    RESOLVED = "resolved"
    MONITORING = "monitoring"
    INACTIVE = "inactive"


class AllergySeverity(str, Enum):
    MILD = "mild"
    MODERATE = "moderate"
    SEVERE = "severe"
    LIFE_THREATENING = "life_threatening" 