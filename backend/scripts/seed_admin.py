import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from getpass import getpass
from sqlmodel import select, Session
from app.models.auth import User
from app.db.session import engine
from app.crud.auth import get_user_by_email, create_admin_user
from app.schemas.auth import AdminRegisterRequest
from app.models.enums import UserType


def create_admin():
    # Get admin credentials from environment or prompt
    email = os.getenv("ADMIN_EMAIL")
    password = os.getenv("ADMIN_PASSWORD")
    
    if not email:
        email = input("Admin email: ").strip()
    
    if not password:
        password = getpass("Admin password: ").strip()
    
    if not email or not password:
        print("Error: Email and password are required")
        return False
    
    # Check if admin already exists
    existing_admin = get_user_by_email(email)
    if existing_admin:
        print(f"Error: User with email {email} already exists")
        return False
    
    # Create admin user
    admin_data = AdminRegisterRequest(
        email=email,
        password=password,
        first_name="System",
        last_name="Administrator",
    )
    
    try:
        admin_user = create_admin_user(admin_data)
        print(f"✅ Admin user created successfully: {admin_user.email}")
        print(f"User ID: {admin_user.id}")
        return True
    except Exception as e:
        print(f"Error creating admin: {e}")
        return False


def check_and_create_admin():
    """Check if any admin exists, create one if none exist"""
    
    with Session(engine) as session:
        # Check if any system admin exists
        stmt = select(User).where(User.user_type == UserType.SYSTEM_ADMIN)
        result = session.exec(stmt)
        existing_admin = result.first()
        
        if existing_admin:
            print(f"Admin already exists: {existing_admin.email}")
            return True
        
        print("No admin found. Creating first admin...")
        return create_admin()


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--force":
        # Force create admin even if one exists
        success = create_admin()
    else:
        # Only create if no admin exists
        success = check_and_create_admin()
    
    sys.exit(0 if success else 1) 