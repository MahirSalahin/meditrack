# 🏥 Meditrack - Medical Management System

## 📖 About the Project

Meditrack is a comprehensive medical management platform designed to streamline healthcare operations. It provides a modern, user-friendly interface for managing patient records, appointments, medications, medical conditions, and more. Built with cutting-edge technologies, Meditrack aims to digitize and optimize healthcare workflows for medical professionals and patients alike.

### 🚀 Key Features

- **Patient Management**: Comprehensive patient profiles with medical history
- **Appointment Scheduling**: Advanced appointment booking and management system
- **Medication Tracking**: Monitor medications, dosages, and schedules
- **Medical Records**: Secure storage and management of medical documents
- **Health Metrics**: Track vital signs and health indicators
- **Notifications**: Appointment reminders and medication alerts
- **Prescription Generation**: PDF prescription generation with templates
- **Secure Authentication**: Role-based access control (Doctor, Patient)

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15.3.2 (React-based)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with Radix UI components
- **State Management**: TanStack Query (React Query)
- **Authentication**: NextAuth.js 5.0
- **HTTP Client**: Axios
- **UI Components**: Shadcn/ui, Lucide React icons

### Backend
- **Framework**: FastAPI (Python)
- **Database**: PostgreSQL
- **ORM**: SQLModel (SQLAlchemy-based)
- **Migration**: Alembic
- **Authentication**: JWT with python-jose
- **Password Hashing**: bcrypt via passlib
- **File Upload**: python-multipart
- **PDF Generation**: ReportLab, WeasyPrint
- **Cloud Storage**: Google Cloud Storage
- **Template Engine**: Jinja2

### Development Tools
- **Package Managers**: pnpm (frontend), pip (backend)
- **Containerization**: Docker & Docker Compose
- **Linting**: ESLint (frontend)
- **Environment**: python-dotenv for environment variables

## 📋 Prerequisites

Choose one of the following setup methods:

### Option 1: Docker Setup (Recommended - Easiest)
- **Docker** and **Docker Compose**
- **Git**

### Option 2: Local Development Setup
- **Node.js** (v18 or later)
- **pnpm** (recommended package manager for frontend)
- **Python** (v3.11 or later)
- **pip** (Python package manager)
- **PostgreSQL** (v13 or later)
- **Git**

## 🚀 Getting Started

### Option 1: Docker Setup (Recommended) 🐳

This is the easiest way to get Meditrack running with minimal setup.

#### 1. Clone the Repository

```bash
git clone https://github.com/MahirSalahin/meditrack.git
cd meditrack
```

#### 2. Create Environment Files

**Backend Environment (.env in backend folder):**
```bash
# Create backend .env file
touch backend/.env
```

Add the following to `backend/.env`:
```env
DATABASE_URL=postgresql://postgres:admin@db:5432/meditrack
SECRET_KEY=your-super-secret-key-here-make-it-long-and-random
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=300000000
BACKEND_URL=http://localhost:8000
BACKEND_CORS_ORIGINS=http://localhost:3000
DATABASE_HOST=db
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=admin
```

**Frontend Environment (.env.local in frontend folder):**
```bash
# Create frontend .env.local file
touch frontend/.env.local
```

Add the following to `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=1mfjv+1FrbRHWsZKvaPIS1NL4To2zS6TumsrxCJdXAk=
AUTH_SECRET=1mfjv+1FrbRHWsZKvaPIS1NL4To2zS6TumsrxCJdXAk=
```

#### 3. Run with Docker Compose

```bash
# Build and start all services
docker-compose up --build

# Or run in background
docker-compose up --build -d
```

#### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Database**: localhost:5432 (postgres/admin)

#### 5. Stop the Application

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (clears database)
docker-compose down -v
```

---

### Option 2: Local Development Setup 💻

#### 1. Clone the Repository

```bash
git clone https://github.com/MahirSalahin/meditrack.git
cd meditrack
```

#### 2. Database Setup

1. **Install PostgreSQL** if not already installed
2. **Create a database** for the project:
   ```sql
   CREATE DATABASE meditrack_db;
   ```
3. **Create a user** (optional but recommended):
   ```sql
   CREATE USER meditrack_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE meditrack_db TO meditrack_user;
   ```

#### 3. Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Create virtual environment**:
   ```bash
   python -m venv venv
   ```

3. **Activate virtual environment**:

   **macOS/Linux:**
   ```bash
   source venv/bin/activate
   ```
   
   **Windows (Command Prompt):**
   ```cmd
   venv\Scripts\activate
   ```
   
   **Windows (PowerShell):**
   ```powershell
   venv\Scripts\Activate.ps1
   ```
   
   **Windows (Git Bash):**
   ```bash
   source venv/Scripts/activate
   ```

4. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

5. **Create environment file**:
   ```bash
   # Copy example file (if available) or create new
   cp .env.example .env  # or touch .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/meditrack_db
   SECRET_KEY=your-super-secret-key-here
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   BACKEND_URL=http://localhost:8000
   BACKEND_CORS_ORIGINS=http://localhost:3000
   ```

6. **Add GCP Service Account File** (Optional):
   - Download your Google Cloud service account JSON file from GCP Console
   - Place it in the backend folder and rename it to match your configuration
   - The file should be referenced in your environment variables or code
   - **Important**: Never commit this file to version control (add to .gitignore)

7. **Run database migrations**:
   ```bash
   alembic upgrade head
   ```

8. **Start the backend server**:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

   The backend API will be available at `http://localhost:8000`
   - API documentation: `http://localhost:8000/docs`
   - Alternative docs: `http://localhost:8000/redoc`

#### 4. Frontend Setup

1. **Open a new terminal** and navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   
   # If you don't have pnpm installed:
   npm install -g pnpm
   pnpm install
   
   # Or use npm:
   npm install
   ```

3. **Create environment file**:
   ```bash
   # Copy example file (if available) or create new
   cp .env.example .env.local  # or touch .env.local
   ```
   
   Update the `.env.local` file:
   ```env
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-nextauth-secret-make-it-long-and-random
   NEXT_PUBLIC_API_URL=http://localhost:8000
   AUTH_SECRET=your-nextauth-secret-make-it-long-and-random
   ```

4. **Start the development server**:
   ```bash
   pnpm dev
   
   # Or with npm:
   npm run dev
   ```

   The frontend will be available at `http://localhost:3000`

## 🔧 Development Commands

### Docker Commands

```bash
# Start all services
docker-compose up

# Start with rebuild
docker-compose up --build

# Start in background
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs

# View specific service logs
docker-compose logs backend
docker-compose logs frontend

# Restart specific service
docker-compose restart backend

# Execute commands in running container
docker-compose exec backend bash
docker-compose exec frontend sh
```

### Backend Commands (Local Development)

```bash
# Activate virtual environment first
# macOS/Linux:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# Start development server
uvicorn app.main:app --reload

# Run database migrations
alembic upgrade head

# Create new migration
alembic revision --autogenerate -m "migration message"

# Seed admin user
python scripts/seed_admin.py

# Run with specific host/port
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Commands (Local Development)

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linting
pnpm lint

# Install new package
pnpm add package-name

# Using npm instead of pnpm:
npm run dev
npm run build
npm start
npm run lint
npm install package-name
```

## 📁 Project Structure

```
meditrack/
├── backend/                    # FastAPI backend application
│   ├── app/
│   │   ├── api/               # API routes
│   │   ├── core/              # Core configuration
│   │   ├── crud/              # Database operations
│   │   ├── db/                # Database configuration
│   │   ├── middleware/        # Custom middleware
│   │   ├── models/            # SQLModel models
│   │   ├── schemas/           # Pydantic schemas
│   │   ├── services/          # Business logic services
│   │   ├── templates/         # Jinja2 templates
│   │   └── utils/             # Utility functions
│   ├── alembic/               # Database migrations
│   ├── scripts/               # Utility scripts
│   ├── uploads/               # File uploads directory
│   ├── requirements.txt       # Python dependencies
│   ├── Dockerfile            # Docker configuration
│   ├── entrypoint.sh         # Docker entrypoint script
│   └── alembic.ini           # Alembic configuration
│
├── frontend/                   # Next.js frontend application
│   ├── src/
│   │   ├── app/               # App router (Next.js 13+)
│   │   ├── components/        # Reusable components
│   │   ├── hooks/             # Custom React hooks
│   │   ├── lib/               # Utility libraries
│   │   └── types/             # TypeScript type definitions
│   ├── public/                # Static assets
│   ├── package.json           # Node.js dependencies
│   ├── Dockerfile            # Docker configuration
│   └── next.config.ts         # Next.js configuration
│
├── docker-compose.yml          # Docker Compose configuration
└── README.md                   # Project documentation
```

## 🌐 API Endpoints

The backend provides a RESTful API with the following main endpoints:

- **Authentication**: `/api/v1/auth/*`
- **Users**: `/api/v1/users/*`
- **Patients**: `/api/v1/patients/*`
- **Doctors**: `/api/v1/doctors/*`
- **Appointments**: `/api/v1/appointments/*`
- **Medications**: `/api/v1/medications/*`
- **Medical Records**: `/api/v1/medical-records/*`
- **Health Metrics**: `/api/v1/health-metrics/*`

Full API documentation is available at `http://localhost:8000/docs` when the backend is running.

## 🔐 Authentication & Authorization

The system implements role-based access control with three user types:

1. **Admin**: Full system access, user management
2. **Doctor**: Patient management, appointments, prescriptions
3. **Patient**: Personal health records, appointments

JWT tokens are used for authentication with configurable expiration times.

## 📤 File Upload & Storage

- **Local Development**: Files stored in `backend/uploads/`
- **Production**: Integration with Google Cloud Storage
- **Supported Formats**: PDF, images (JPEG, PNG)
- **Security**: File type validation and size limits

## 🐛 Troubleshooting

### Docker Issues

1. **Port Already in Use**:
   ```bash
   # Check what's using the port
   lsof -i :3000  # or :8000, :5432
   
   # Kill the process or use different ports in docker-compose.yml
   ```

2. **Docker Build Fails**:
   ```bash
   # Clean up Docker cache
   docker system prune -a
   
   # Rebuild without cache
   docker-compose build --no-cache
   ```

3. **Permission Denied (entrypoint.sh)**:
   ```bash
   # Make script executable
   chmod +x backend/entrypoint.sh
   
   # Then rebuild
   docker-compose up --build
   ```

### Local Development Issues

1. **Database Connection Error**:
   - Verify PostgreSQL is running
   - Check DATABASE_URL in `.env` file
   - Ensure database exists and user has permissions

2. **Virtual Environment Issues**:
   ```bash
   # Make sure you're in the right directory
   cd backend
   
   # Recreate virtual environment
   rm -rf venv
   python -m venv venv
   
   # Activate (choose your OS):
   source venv/bin/activate        # macOS/Linux
   venv\Scripts\activate          # Windows CMD
   venv\Scripts\Activate.ps1      # Windows PowerShell
   
   # Reinstall dependencies
   pip install -r requirements.txt
   ```

3. **Module Not Found Error**:
   - Ensure virtual environment is activated (backend)
   - Run `pip install -r requirements.txt` (backend)
   - Run `pnpm install` or `npm install` (frontend)

4. **CORS Issues**:
   - Check BACKEND_CORS_ORIGINS in backend config
   - Verify frontend URL is whitelisted

5. **Port Already in Use**:
   - Kill existing processes or use different ports
   - Default ports: 8000 (backend), 3000 (frontend), 5432 (database)

6. **pnpm Not Found**:
   ```bash
   # Install pnpm globally
   npm install -g pnpm
   
   # Or use npm instead
   npm install
   npm run dev
   ```

### Environment Variables

Ensure all required environment variables are set:

**Backend (.env)**:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/meditrack_db
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
BACKEND_URL=http://localhost:8000
BACKEND_CORS_ORIGINS=http://localhost:3000
# Optional GCP settings
GCP_PROJECT_ID=your-project-id
GCS_BUCKET_NAME=your-bucket-name
GOOGLE_APPLICATION_CREDENTIALS=path/to/your/service-account-file.json
```

**Frontend (.env.local)**:
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret
NEXT_PUBLIC_API_URL=http://localhost:8000
AUTH_SECRET=your-nextauth-secret
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **MahirSalahin** - Developer
- **Mohammed Sajidul Islam** - Developer
- **Noor E Shams Niloy** - Designer

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Contact the development team

---

**Happy Coding! 🚀**

### Quick Start Summary

**Want to get started quickly?** Follow these steps:

1. **Clone the repo**: `git clone https://github.com/MahirSalahin/meditrack.git`
2. **Enter directory**: `cd meditrack`
3. **Create environment files** (see Docker setup section above)
4. **Run with Docker**: `docker-compose up --build`
5. **Visit**: http://localhost:3000

That's