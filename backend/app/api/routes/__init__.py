from .auth import router as auth_router
from .appointments import router as appointments_router
from .profiles import router as profiles_router
from .medications import router as medications_router
from .medical_conditions import router as medical_conditions_router
from .medical_records import router as records_router

__all__ = ["auth_router", "appointments_router", "medications_router", "medical_conditions_router", "profiles_router", "records_router"]
