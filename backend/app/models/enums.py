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