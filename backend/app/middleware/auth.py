from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer
from fastapi.requests import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from app.utils.auth import verify_token
from app.crud.auth import get_user_by_id
from app.models.auth import User
from typing import Optional
import logging

logger = logging.getLogger(__name__)
security = HTTPBearer(auto_error=False)


class AuthMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, exclude_paths: Optional[list] = None):
        super().__init__(app)
        self.exclude_paths = exclude_paths or [
            "/docs",
            "/redoc",
            "/openapi.json",
            "/api/v1/auth/login",
            "/api/v1/auth/register/patient",
            "/api/v1/auth/register/doctor",
            "/api/v1/profiles/doctors/search",
            "/",
            "/uploads/abd50c5c-7939-4465-92ea-3c00ce41dd6d.pdf",
        ]

    async def dispatch(self, request: Request, call_next):
        # Skip auth for excluded paths
        if request.url.path in self.exclude_paths:
            return await call_next(request)

        # Skip auth for doctor profile endpoints (pattern matching)
        if request.url.path.startswith("/api/v1/profiles/doctors/") and request.method == "GET":
            return await call_next(request)

        # Skip auth for static files and OPTIONS requests
        if (
            request.url.path.startswith("/static") or
            request.url.path.startswith("/files") or
            request.method == "OPTIONS"
        ):
            return await call_next(request)

        # Extract token from Authorization header
        auth_header = request.headers.get("authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"detail": "Authorization header missing or invalid"}
            )

        token = auth_header.split(" ")[1]

        # Verify token
        token_data = verify_token(token)
        if not token_data:
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"detail": "Invalid or expired token"}
            )

        # Get user from database
        user = get_user_by_id(token_data.user_id)
        if not user:
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"detail": "User not found"}
            )

        # Add user to request state
        request.state.user = user

        response = await call_next(request)
        return response


# Dependency functions for route-level authentication
async def get_current_user(request: Request) -> User:
    """Get the current authenticated user from request state."""
    if not hasattr(request.state, 'user'):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )
    return request.state.user


async def get_current_admin_user(current_user: User = Depends(get_current_user)) -> User:
    """Get the current user and verify they are an admin."""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user
 