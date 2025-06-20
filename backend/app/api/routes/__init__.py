from .auth import router as auth_router
from .appointments import router as appointments_router

__all__ = ["auth_router", "appointments_router"]
