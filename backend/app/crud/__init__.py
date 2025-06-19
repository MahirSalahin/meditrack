from .auth import (
    get_user_by_id, 
    get_user_by_email, 
    create_user, 
    create_patient_user,
    create_doctor_user,
    create_admin_user
)
from .profiles import (
    get_patient_profile_by_user_id,
    create_patient_profile,
    update_patient_profile,
    get_doctor_profile_by_user_id,
    get_doctor_profile_by_license,
    create_doctor_profile,
    update_doctor_profile
)

__all__ = [
    # Auth CRUD
    "get_user_by_id",
    "get_user_by_email",
    "create_user",
    "create_patient_user",
    "create_doctor_user",
    "create_admin_user",
    
    # Profile CRUD
    "get_patient_profile_by_user_id",
    "create_patient_profile",
    "update_patient_profile",
    "get_doctor_profile_by_user_id",
    "get_doctor_profile_by_license",
    "create_doctor_profile",
    "update_doctor_profile"
]
