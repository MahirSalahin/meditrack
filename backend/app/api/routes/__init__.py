from .auth import router as auth_router
from .appointments import router as appointments_router
from .profiles import router as profiles_router

__all__ = ["auth_router", "appointments_router", "profiles_router"]
