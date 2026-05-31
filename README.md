# MedSphere LMS

MedSphere LMS is a full-stack learning management system designed for healthcare and professional training environments. It provides a learner portal, an administrative dashboard, course delivery tools, progress tracking, messaging, schedules, certificates, and analytics in one web application.

The project is built with a modern React frontend and a FastAPI backend, with support for local SQLite development and Supabase/PostgreSQL deployment.

Visit our [Website](https://med-sphere-lms.vercel.app/)

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Seeding](#database-seeding)
- [Available Scripts](#available-scripts)
- [Deployment Notes](#deployment-notes)
- [Demo Accounts](#demo-accounts)

## Overview

MedSphere LMS supports two main user experiences:

- **Learners** can browse courses, enroll in training, view course content, track completion progress, manage schedules, communicate with others, and access certificates.
- **Administrators** can manage users, courses, teams, schedules, community channels, certificates, roles, and platform analytics.

The application is suitable for academic demonstration, capstone submission, and as a foundation for a production-ready LMS.

## Features

### Learner Portal

- Secure registration and login
- Learner dashboard with activity and progress summaries
- Browse available courses
- View assigned and enrolled courses
- Access video and PDF course content
- Track course completion progress
- Submit quizzes and view results
- View upcoming schedules and deadlines
- Download or view earned certificates
- Update profile information and profile picture
- Send direct messages
- Participate in community channels
- Receive notifications

### Admin Dashboard

- Admin-only dashboard and navigation
- Course creation, editing, publishing, archiving, and deletion
- Upload course content including videos and PDFs
- User management for learners and admins
- Team and group management
- Bulk course assignment
- Role and permission management
- Schedule management
- Community channel management
- Certificate generation and management
- Platform analytics and reporting
- System settings management

### Backend Capabilities

- JWT-based authentication
- Password hashing with Passlib
- Role-protected API routes
- SQLAlchemy ORM models
- SQLite fallback for local development
- PostgreSQL/Supabase support for deployment
- Supabase Storage support for course files and profile images
- Local file upload fallback when Supabase is not configured
- REST API endpoints for courses, users, enrollments, quizzes, certificates, schedules, community, messaging, notifications, and analytics

## Tech Stack

### Frontend

- React 18
- TypeScript
- Vite
- React Router
- Tailwind CSS
- Radix UI
- shadcn-style UI components
- Material UI icons
- Lucide React icons
- Recharts
- Sonner notifications
- jsPDF and html2canvas for certificate/document export features

### Backend

- Python
- FastAPI
- Uvicorn
- SQLAlchemy
- SQLite for local development
- PostgreSQL/Supabase for hosted database
- Supabase Storage for hosted file storage
- python-jose for JWT handling
- Passlib with bcrypt for password hashing

## Project Structure

```text
MedSphere-LMS/
|-- backend/
|   |-- main.py                 # FastAPI application and API routes
|   |-- models.py               # SQLAlchemy database models
|   |-- schemas.py              # Pydantic request/response schemas
|   |-- auth.py                 # Authentication and authorization helpers
|   |-- database.py             # Database and Supabase client setup
|   |-- storage.py              # Local/Supabase upload handling
|   |-- seed_db.py              # Demo database seed script
|   `-- requirements.txt        # Python dependencies
|-- public/
|   |-- favicon.ico
|   |-- logo.svg
|   `-- logo2.svg
|-- src/
|   |-- app/
|   |   |-- components/         # Shared UI and layout components
|   |   |-- pages/              # Learner-facing pages
|   |   |-- pages/admin/        # Admin-facing pages
|   |   |-- App.tsx             # Main application shell
|   |   `-- routes.tsx          # Dashboard route definitions
|   |-- lib/                    # API client and utility helpers
|   |-- styles/                 # Global styles and themes
|   `-- main.tsx                # React entry point
|-- .env.example                # Example environment variables
|-- SUPABASE_SETUP.md           # Supabase deployment setup guide
|-- package.json                # Frontend dependencies and scripts
|-- vite.config.ts              # Vite configuration
`-- start_project.bat           # Windows helper script to start both services
```

## Getting Started

### Prerequisites

Install the following before running the project:

- Node.js 18 or later
- npm
- Python 3.10 or later
- pip

Optional for hosted deployment:

- Supabase project
- Render account for backend deployment
- Vercel account for frontend deployment

### 1. Clone the Repository

```bash
git clone <repository-url>
cd MedSphere-LMS
```

### 2. Install Frontend Dependencies

```bash
npm install
```

### 3. Install Backend Dependencies

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

For macOS/Linux:

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 4. Configure Environment Variables

For local development, create a frontend `.env` file in the project root:

```env
VITE_API_URL=http://localhost:8000/api
```

If you want to use Supabase locally, create `backend/.env` and add the backend variables listed in [Environment Variables](#environment-variables).

If no database variables are provided, the backend falls back to local SQLite.

### 5. Start the Backend

From the `backend` directory:

```bash
python main.py
```

The API will run at:

```text
http://localhost:8000
```

FastAPI interactive documentation is available at:

```text
http://localhost:8000/docs
```

### 6. Start the Frontend

From the project root:

```bash
npm run dev
```

The frontend will run at:

```text
http://localhost:5173
```

### Windows Quick Start

On Windows, you can also run:

```bash
start_project.bat
```

This opens the backend and frontend in separate terminal windows.

## Environment Variables

The project includes `.env.example` as a reference.

### Frontend

Create `.env` in the project root:

```env
VITE_API_URL=http://localhost:8000/api
```

For production:

```env
VITE_API_URL=https://your-backend-domain.com/api
```

### Backend

Create `backend/.env`:

```env
DATABASE_URL=sqlite:///./test.db
SECRET_KEY=change-me-to-a-long-random-string
PUBLIC_API_URL=http://localhost:8000
```

For Supabase/PostgreSQL:

```env
DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres
SUPABASE_URL=https://[PROJECT-REF].supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_COURSE_BUCKET=course-content
SUPABASE_PROFILE_BUCKET=profile-pictures
PUBLIC_API_URL=https://your-backend-domain.com
SECRET_KEY=change-me-to-a-long-random-string
```

Important: never expose `SUPABASE_SERVICE_ROLE_KEY` in the frontend. It must only be used by the backend.

## Database Seeding

To create demo data for local development:

```bash
cd backend
python seed_db.py
```

The seed script creates sample users, channels, courses, enrollments, and notifications.

Warning: `seed_db.py` drops and recreates all tables before inserting demo data. Do not run it against production data.

## Available Scripts

### Frontend

```bash
npm run dev
```

Starts the Vite development server.

```bash
npm run build
```

Builds the frontend for production.

```bash
npm run preview
```

Previews the production build locally.

### Backend

```bash
python main.py
```

Starts the FastAPI backend on port `8000`.

```bash
python seed_db.py
```

Recreates the database tables and inserts demo data.

## Deployment Notes

Recommended deployment setup:

- **Frontend:** Vercel
- **Backend:** Render
- **Database:** Supabase PostgreSQL
- **File Storage:** Supabase Storage

For a complete Supabase setup guide, see [`SUPABASE_SETUP.md`](SUPABASE_SETUP.md).

### Backend Deployment Checklist

- Set `DATABASE_URL` to the Supabase PostgreSQL connection string.
- Set `SECRET_KEY` to a secure random value.
- Set `SUPABASE_URL`.
- Set `SUPABASE_SERVICE_ROLE_KEY`.
- Create public Supabase Storage buckets for course content and profile pictures.
- Set `PUBLIC_API_URL` to the deployed backend URL.
- Redeploy the backend after changing environment variables.

### Frontend Deployment Checklist

- Set `VITE_API_URL` to the deployed backend API URL.
- Example: `https://your-backend-domain.com/api`
- Redeploy the frontend after changing environment variables.

## Demo Accounts

If the database is seeded with `backend/seed_db.py`, the following demo accounts are available:

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@gmail.com` | `admin123` |
| Learner | `ram@gmail.com` | `password123` |

## API Documentation

When the backend is running locally, visit:

```text
http://localhost:8000/docs
```

This opens the automatically generated FastAPI Swagger documentation.

## Security Notes

- Passwords are stored as hashed values.
- Authentication uses bearer tokens.
- Admin routes are protected by role-based backend checks.
- Production deployments should use a strong `SECRET_KEY`.
- Supabase service-role credentials must remain backend-only.
- CORS is currently permissive for development and should be restricted for production deployments.

## License

This project was developed for academic and capstone submission purposes. Add a license file if the project will be released publicly or reused beyond the original submission context.
