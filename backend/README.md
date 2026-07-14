# Beauty Book Backend - Django REST API

Complete Django REST Framework backend for the Beaty CM beauty booking platform.

## Setup & Installation

### Prerequisites
- Python 3.12+
- pip
- Virtual environment

### Installation Steps

1. **Navigate to backend directory**
```bash
cd backend
```

2. **Create and activate virtual environment**
```bash
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # macOS/Linux
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Create .env file** (copy from .env.example)
```bash
copy .env.example .env
```

5. **Run migrations**
```bash
python manage.py makemigrations
python manage.py migrate
```

6. **Create superuser**
```bash
python manage.py createsuperuser
```

7. **Run development server**
```bash
python manage.py runserver 8000
```

The API will be available at `http://localhost:8000/api/`

## Project Structure

```
backend/
├── beautybook_backend/     # Main project configuration
│   ├── settings.py         # Django settings
│   ├── urls.py            # URL routing
│   └── wsgi.py            # WSGI configuration
├── salons/                # Salon management app
│   ├── models.py          # Salon model
│   ├── serializers.py     # DRF serializers
│   ├── views.py           # API views
│   └── admin.py           # Admin configuration
├── services/              # Service management app
│   ├── models.py          # Service model
│   ├── serializers.py     # DRF serializers
│   ├── views.py           # API views
│   └── admin.py           # Admin configuration
├── bookings/              # Booking management app
│   ├── models.py          # Booking model
│   ├── serializers.py     # DRF serializers
│   ├── views.py           # API views
│   └── admin.py           # Admin configuration
├── reviews/               # Review management app
│   ├── models.py          # Review model
│   ├── serializers.py     # DRF serializers
│   ├── views.py           # API views
│   └── admin.py           # Admin configuration
├── users/                 # User management app
│   ├── models.py          # UserProfile model
│   ├── serializers.py     # DRF serializers
│   ├── views.py           # API views
│   └── admin.py           # Admin configuration
├── api/                   # API routing app
│   └── urls.py            # API endpoints
├── manage.py              # Django management script
└── requirements.txt       # Python dependencies
```

## API Endpoints

### Salons
- `GET /api/salons/` - List all salons
- `GET /api/salons/{id}/` - Get salon details
- `GET /api/salons/{id}/services/` - Get salon services
- `GET /api/salons/{id}/reviews/` - Get salon reviews
- `GET /api/salons/featured/` - Get top-rated salons

### Services
- `GET /api/services/` - List all services
- `GET /api/services/{id}/` - Get service details
- `POST /api/services/` - Create new service (admin only)
- `PUT /api/services/{id}/` - Update service (admin only)

### Bookings
- `GET /api/bookings/` - List user's bookings
- `POST /api/bookings/` - Create new booking
- `GET /api/bookings/{id}/` - Get booking details
- `PUT /api/bookings/{id}/` - Update booking
- `POST /api/bookings/{id}/cancel/` - Cancel booking

### Reviews
- `GET /api/reviews/` - List all reviews
- `POST /api/reviews/` - Create new review (authenticated users)
- `GET /api/reviews/{id}/` - Get review details

### Users
- `POST /api/users/register/` - Register new user (client)
- `GET /api/users/current_user/` - Get current user
- `PUT /api/users/update_profile/` - Update profile

### Salon Owner Registration
- `POST /api/salons/register_owner/` - Register a salon owner and create associated salon. Accepts multipart form data including owner info, salon details, and up to 5 images. (client should use this endpoint for salon registration)

## Features

✅ Complete REST API for beauty salon bookings
✅ User authentication & authorization
✅ Salon management with ratings & reviews
✅ Service catalog with pricing
✅ Booking system with status tracking
✅ Review system with user ratings
✅ CORS support for frontend integration
✅ Admin dashboard (Django Admin)
✅ Token-based authentication
✅ Filtering, searching, and sorting
✅ Database models with relationships

## Authentication

The API uses Token Authentication. Get a token by:

```bash
curl -X POST http://localhost:8000/api-token-auth/ \
  -d "username=your_username&password=your_password"
```

Include the token in subsequent requests:
```bash
Authorization: Token your_token_here
```

## Deployment

### For Production:
1. Set `DEBUG = False` in settings.py
2. Update `ALLOWED_HOSTS` with your domain
3. Use PostgreSQL instead of SQLite
4. Set up proper environment variables
5. Use Gunicorn or similar WSGI server
6. Configure static files and media storage

## Dependencies

- Django 6.0.2 - Web framework
- djangorestframework 3.16.1 - REST API framework
- django-cors-headers 4.9.0 - CORS support
- django-filter 25.2 - Advanced filtering
- python-decouple 3.8 - Environment variables
- Pillow 12.1.1 - Image processing
- psycopg2-binary 2.9.11 - PostgreSQL adapter

## Notes

- Default admin user: `admin` (password setup during creation)
- Admin panel: `http://localhost:8000/admin/`
- API documentation: `http://localhost:8000/api/`
