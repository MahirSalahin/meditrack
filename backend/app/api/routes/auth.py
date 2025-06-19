from fastapi import APIRouter, HTTPException, status, Depends
from app.schemas.auth import (
    LoginRequest, 
    PatientRegisterRequest, 
    DoctorRegisterRequest, 
    AdminRegisterRequest,
    Token, 
    UserRead
)
from app.crud.auth import (
    get_user_by_email, 
    create_patient_user, 
    create_doctor_user, 
    create_admin_user
)
from app.utils.auth import verify_password, create_access_token, get_token_expires_in
from app.db.session import SessionDep
from app.middleware.auth import get_current_admin_user
from app.models.auth import User
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/login", response_model=Token)
async def login(
    login_data: LoginRequest,
    session: SessionDep
):
    """Authenticate user and return JWT token."""
    # Get user by email
    user = get_user_by_email(login_data.email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Verify password
    if not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Create access token
    token_data = {
        "sub": str(user.id),
        "email": user.email,
        "user_type": user.user_type
    }
    access_token = create_access_token(token_data)
    
    # Convert user to UserRead format
    user_read = UserRead.model_validate(user)
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        expires_in=get_token_expires_in(),
        user=user_read
    )


@router.post("/register/patient", response_model=Token)
async def register_patient(
    register_data: PatientRegisterRequest,
    session: SessionDep
):
    """Register a new patient and return JWT token."""
    # Check if user already exists
    existing_user = get_user_by_email(register_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    try:
        # Create patient user with profile (atomic transaction)
        user = create_patient_user(register_data)
        
        # Create access token
        token_data = {
            "sub": str(user.id),
            "email": user.email,
            "user_type": user.user_type
        }
        access_token = create_access_token(token_data)
        
        # Convert user to UserRead format
        user_read = UserRead.model_validate(user)
        
        return Token(
            access_token=access_token,
            token_type="bearer",
            expires_in=get_token_expires_in(),
            user=user_read
        )
        
    except ValueError as e:
        # Validation errors (bad input data)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        # Log the full error for debugging
        logger.error(f"Error creating patient account: {str(e)}", exc_info=True)
        
        # Return concise error to client
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create patient account: {str(e)}"
        )


@router.post("/register/doctor", response_model=Token)
async def register_doctor(
    register_data: DoctorRegisterRequest,
    session: SessionDep
):
    """Register a new doctor and return JWT token."""
    # Check if user already exists
    existing_user = get_user_by_email(register_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    try:
        # Create doctor user with profile
        user = create_doctor_user(register_data)
        
        # Create access token
        token_data = {
            "sub": str(user.id),
            "email": user.email,
            "user_type": user.user_type
        }
        access_token = create_access_token(token_data)
        
        # Convert user to UserRead format
        user_read = UserRead.model_validate(user)
        
        return Token(
            access_token=access_token,
            token_type="bearer",
            expires_in=get_token_expires_in(),
            user=user_read
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        # Log the full error for debugging
        logger.error(f"Error creating doctor account: {str(e)}", exc_info=True)
        
        # Return concise error to client
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create doctor account: {str(e)}"
        )


@router.post("/register/admin", response_model=UserRead)
async def register_admin(
    register_data: AdminRegisterRequest,
    session: SessionDep,
    current_admin: User = Depends(get_current_admin_user)
):
    """Register a new system admin. Only accessible by existing admins."""
    # Check if user already exists
    existing_user = get_user_by_email(register_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    try:
        # Create admin user
        user = create_admin_user(register_data)
        
        # Convert user to UserRead format and return (no token needed)
        user_read = UserRead.model_validate(user)
        return user_read
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        # Log the full error for debugging
        logger.error(f"Error creating admin account: {str(e)}", exc_info=True)
        
        # Return concise error to client
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create admin account: {str(e)}"
        ) 