# 🏥 MediTrack: A Holistic Approach to Digital Health and Wellness
MediTrack revolutionizes healthcare delivery by putting patients at the center of their wellness journey. Our sophisticated platform empowers patients with complete control over their health data while enabling healthcare professionals to deliver personalized, efficient care. 

Built with cutting-edge technology, MediTrack transforms complex medical workflows into intuitive experiences that improve patient outcomes, enhance care coordination, and create meaningful connections between patients and their healthcare providers.

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
- **Linting**: ESLint (frontend)
- **Environment**: python-dotenv for environment variables

## 📋 Prerequisites

- **Node.js** (v18 or later)
- **pnpm** (recommended package manager for frontend)
- **Python** (v3.11 or later)
- **pip** (Python package manager)
- **PostgreSQL** (v13 or later)
- **Git**

## 🚀 Getting Started

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

6. **Run database migrations**:
   ```bash
   alembic upgrade head
   ```

7. **Start the backend server**:
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
   ```

   The frontend will be available at `http://localhost:3000`

   **Note**: `pnpm dev` is the primary command to run the frontend. If you don't have pnpm, you can install it with `npm install -g pnpm` or alternatively use `npm run dev`.

## 🔧 Development Commands

### Backend Commands

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

### Frontend Commands

```bash
# Start development server (Primary command)
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linting
pnpm lint

# Install new package
pnpm add package-name

# Alternative commands (if not using pnpm):
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
│   └── next.config.ts         # Next.js configuration
│
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

### Common Development Issues

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
3. **Setup database**: Create PostgreSQL database and configure environment files
4. **Setup backend**: Navigate to backend, create venv, install dependencies, run migrations
5. **Setup frontend**: Navigate to frontend, run `pnpm install`, then `pnpm dev`
6. **Visit**: http://localhost:3000

**Note**: Use `pnpm dev` as the primary command to run the frontend development server.