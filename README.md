# Healthcare Backend System

A comprehensive Django-based healthcare backend system with Django REST Framework, JWT authentication, and PostgreSQL database.

## Features

- **User Authentication**: JWT-based authentication with registration and login
- **Patient Management**: CRUD operations for patient records
- **Doctor Management**: CRUD operations for doctor records
- **Patient-Doctor Mapping**: Assign doctors to patients and manage relationships
- **Search & Filtering**: Advanced search capabilities for patients and doctors
- **Admin Interface**: Django admin for data management
- **RESTful API**: Complete REST API with proper permissions

## Technology Stack

- **Backend**: Django 5.2.5
- **API Framework**: Django REST Framework 3.14.0
- **Authentication**: JWT with djangorestframework-simplejwt
- **Database**: PostgreSQL
- **CORS**: django-cors-headers

## Prerequisites

- Python 3.8+
- PostgreSQL database
- pip (Python package manager)

## Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Hospital
```

### 2. Create Virtual Environment
```bash
python -m venv venv

# On Windows
venv\Scripts\activate

# On macOS/Linux
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Database Setup

#### PostgreSQL Installation
- Install PostgreSQL on your system
- Create a database named `HospitalDB`
- Note down your database credentials

#### Environment Variables
Create a `.env` file in the project root:
```env
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

DB_NAME=HospitalDB
DB_USER=postgres
DB_PASSWORD=your-password-here
DB_HOST=localhost
DB_PORT=5432

JWT_ACCESS_TOKEN_LIFETIME=20
JWT_REFRESH_TOKEN_LIFETIME=1440

CORS_ALLOWED_ORIGINS=http://localhost:8080,http://127.0.0.1:9000
```

### 5. Database Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### 6. Create Superuser
```bash
python manage.py createsuperuser
```

### 7. Run the Development Server
```bash
python manage.py runserver
```

The API will be available at: `http://127.0.0.1:8000/api/`

## API Endpoints

### Authentication
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login

### Patient Management
- `GET /api/patients/` - List all patients (authenticated users)
- `POST /api/patients/create/` - Create new patient
- `GET /api/patients/<id>/` - Get patient details
- `PUT /api/patients/<id>/` - Update patient
- `DELETE /api/patients/<id>/` - Delete patient
- `GET /api/patients/search/` - Search patients

### Doctor Management
- `GET /api/doctors/` - List all doctors
- `POST /api/doctors/create/` - Create new doctor
- `GET /api/doctors/<id>/` - Get doctor details
- `PUT /api/doctors/<id>/` - Update doctor
- `DELETE /api/doctors/<id>/` - Delete doctor
- `GET /api/doctors/search/` - Search doctors

### Patient-Doctor Mapping
- `GET /api/mappings/` - List all mappings
- `POST /api/mappings/create/` - Create new mapping
- `GET /api/mappings/patient/<patient_id>/` - Get mappings by patient
- `DELETE /api/mappings/<id>/` - Remove mapping

## API Usage Examples

### 1. User Registration
```bash
curl -X POST http://127.0.0.1:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "name": "John Doe",
    "tc": true,
    "password": "password123",
    "password2": "password123"
  }'
```

### 2. User Login
```bash
curl -X POST http://127.0.0.1:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### 3. Create Patient (with authentication)
```bash
curl -X POST http://127.0.0.1:8000/api/patients/create/ \
  -H "Authorization: Bearer <your-access-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Jane",
    "last_name": "Smith",
    "date_of_birth": "1990-01-01",
    "gender": "F",
    "phone_number": "+1234567890",
    "address": "123 Main St",
    "emergency_contact": "John Smith",
    "emergency_phone": "+1234567891"
  }'
```

### 4. Create Doctor
```bash
curl -X POST http://127.0.0.1:8000/api/doctors/create/ \
  -H "Authorization: Bearer <your-access-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Dr. Michael",
    "last_name": "Johnson",
    "specialization": "CAR",
    "license_number": "MD12345",
    "phone_number": "+1234567890",
    "email": "dr.johnson@hospital.com",
    "experience_years": 10,
    "gender": "M",
    "address": "456 Medical Center Dr"
  }'
```

## Database Models

### User
- Custom user model with email authentication
- Fields: email, name, tc (terms & conditions), is_admin, timestamps

### Patient
- Patient information with medical history
- Fields: personal info, contact details, emergency contacts, medical history

### Doctor
- Doctor information with specialization
- Fields: personal info, professional details, contact information

### PatientDoctorMapping
- Relationship between patients and doctors
- Fields: patient, doctor, assignment details, notes

## Security Features

- JWT-based authentication
- Password validation
- User permission checks
- CORS configuration
- Input validation and sanitization
