from fastapi import APIRouter
from app.api.routes import auth_router, appointments_router, profiles_router

api_router = APIRouter()
api_router.include_router(auth_router, prefix="/auth", tags=["Authentication"])
api_router.include_router(appointments_router, prefix="/appointments", tags=["Appointments"])
api_router.include_router(profiles_router, prefix="/profiles", tags=["Profiles"])
