from fastapi import APIRouter
from app.api.routes import (
    auth_router,
    appointments_router,
    medications_router,
    profiles_router,
    medical_conditions_router,
    medical_records,
)
from app.api.routes.health_metrics import router as health_metrics_router

api_router = APIRouter()
api_router.include_router(auth_router, prefix="/auth", tags=["Authentication"])
api_router.include_router(
    appointments_router, prefix="/appointments", tags=["Appointments"]
)
api_router.include_router(profiles_router, prefix="/profiles", tags=["Profiles"])
api_router.include_router(medications_router, tags=["Medications"])
api_router.include_router(
    medical_conditions_router, prefix="/medical-conditions", tags=["Medical Conditions"]
)
api_router.include_router(
    medical_records.router, prefix="/records", tags=["Medical Records"]
)
api_router.include_router(
    health_metrics_router, tags=["Health Metrics"]
)
