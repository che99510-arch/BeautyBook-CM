# Salon Dashboard Backend Setup

## Overview
Created backend endpoints for the salon dashboard to provide real-time data on bookings, revenue, clients, and analytics.

## New Endpoint

### GET `/api/salons/dashboard/`
- **Authentication**: Required (Token-based)
- **Permission**: Only accessible to authenticated salon owners
- **URL**: `http://localhost:8000/api/salons/dashboard/`

#### Response Structure
```json
{
  "salon": {
    "id": 1,
    "name": "Salon Name",
    "location": "Address",
    "rating": 4.5
  },
  "stats": {
    "total_bookings": 24,
    "monthly_revenue": 450000,
    "total_clients": 50,
    "rating": 4.5
  },
  "upcoming_bookings": [
    {
      "id": 1,
      "client_name": "Client Name",
      "service_name": "Service",
      "booking_date": "2025-02-27",
      "booking_time": "14:30:00",
      "status": "confirmed"
    }
  ],
  "services": [
    {
      "id": 1,
      "name": "Hair Braiding",
      "category": "Hair",
      "price": 50.00
    }
  ],
  "analytics": {
    "status_breakdown": {
      "pending": 5,
      "confirmed": 10,
      "completed": 20,
      "cancelled": 2
    },
    "category_breakdown": {
      "Hair": 15,
      "Nails": 8,
      "Makeup": 7
    },
    "revenue_by_month": {
      "February": 100000,
      "January": 95000
    }
  }
}
```

## Changes Made

### Backend (`backend/salons/views.py`)
1. Added imports for booking, service models, aggregation functions
2. Created `dashboard` action on `SalonViewSet`
   - Fetches salon owned by authenticated user
   - Calculates stats: total bookings, monthly revenue, client count, rating
   - Returns upcoming bookings (next 7 days)
   - Lists all services
   - Provides analytics: status breakdown, category breakdown, revenue by month

### Frontend Changes

#### Updated `SalonDashboard.tsx`
- Removed hardcoded mock data
- Added state management for dashboard data, loading, and errors
- Implemented `useEffect` hook to fetch data from API
- Added loading spinner during data fetch
- Added error handling and retry button
- Uses token from localStorage (`salonOwnerToken`)

#### Updated `SalonLogin.tsx`
- Fixed backend URL to use `localhost:8000` instead of `127.0.0.1:8000`
- Now saves token as `salonOwnerToken` in localStorage
- Also saves email and login flag

## Test Credentials

To test the dashboard API manually:
```
Email: test@salon.com
Password: testpass123
Token: {will be generated on login}
```

## Running the System

### Start Backend
```bash
cd backend
python manage.py runserver 8000
```

### Start Frontend
```bash
npm run dev
# Opens at http://localhost:8082/
```

### Test Flow
1. Navigate to http://localhost:8082/salon-login
2. Login with test@salon.com / testpass123
3. Redirects to /salon-dashboard
4. Dashboard fetches real data from API endpoint
5. Displays stats, bookings, services, and analytics

## Database Models Used

- **Salon**: Owner salons (owner FK, revenue, rating)
- **Booking**: Client bookings linked to salons
- **Service**: Beauty services offered by each salon
- **Token**: Authentication tokens for salon owners

## Error Handling

- 401 Unauthorized: User not authenticated → redirects to login
- 403 Forbidden: User is not a salon owner
- 404 Not Found: Salon not found for user
- Other errors: Display error message with retry option

