# Customer Booking Backend - Implementation Complete ✅

## Overview
Complete backend implementation for customer booking system with automatic booking fee calculation.

---

## 📊 Business Model

- **Customers DO NOT pay service price on the platform**
- **Customers ONLY pay booking fee (10% of service price)**
- **Service price is paid physically at the salon**
- **No escrow system**
- **Booking fee calculated ONLY on backend** (NEVER trust frontend)

---

## 🗄️ Database Changes

### 1. Salon Model - NEW Field
```python
commission_rate = DecimalField(
    max_digits=5, 
    decimal_places=2, 
    default=10.00
)
```
- Default: 10% commission
- Used to calculate booking fee

### 2. Booking Model - NEW Fields
```python
# Pricing (calculated at booking time)
service_price = DecimalField(...)       # Service price from DB
booking_fee = DecimalField(...)         # 10% of service_price
amount_due_at_salon = DecimalField(...) # Same as service_price

# Payment tracking
payment_status = CharField(...)         # pending, paid, failed, refunded
payment_reference = CharField(...)      # Payment gateway reference
```

### 3. Removed Fields
- ❌ `price` (replaced with `service_price`, `booking_fee`, `amount_due_at_salon`)

---

## 🔌 API Endpoints

### 1. GET `/api/salons/` - List Salons
**Authentication:** Not required

**Query Parameters:**
- `city=Douala` or `city=Yaoundé`
- `search=hair` (searches name, description, location)
- `ordering=-rating` (sort by rating descending)

**Example:**
```bash
GET /api/salons/?city=Douala&ordering=-rating
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Glamour Beauty Studio",
    "location": "Akwa, Douala",
    "city": "Douala",
    "rating": 4.8,
    "review_count": 234,
    "commission_rate": "10.00",
    ...
  }
]
```

---

### 2. GET `/api/salons/{id}/` - Salon Detail
**Authentication:** Not required

**Example:**
```bash
GET /api/salons/1/
```

---

### 3. GET `/api/salons/{id}/services/` - Salon Services
**Authentication:** Not required

**Example:**
```bash
GET /api/salons/1/services/
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Haircut & Styling",
    "category": "Hair",
    "description": "Professional haircut...",
    "duration": "45 mins",
    "price": "5000.00",
    "is_available": true
  }
]
```

---

### 4. POST `/api/bookings/create/` - Create Booking ⭐
**Authentication:** REQUIRED (Customer JWT token)

**Request Body:**
```json
{
  "service": 1,                    // Service ID from database
  "booking_date": "2026-03-15",    // ISO format
  "booking_time": "14:30:00",      // ISO format
  "client_name": "John Doe",       // Optional (auto-filled from user)
  "client_email": "john@example.com", // Optional
  "client_phone": "+237 677 123 456", // Optional
  "notes": "First time visit"     // Optional
}
```

**Backend Logic:**
1. Fetches service from database
2. Gets `service.price` from DB (NEVER from frontend)
3. Fetches salon's `commission_rate`
4. Calculates: `booking_fee = service.price * (commission_rate / 100)`
5. Sets: `amount_due_at_salon = service.price`
6. Sets: `payment_status = "pending"`

**Response (Success - 201 Created):**
```json
{
  "id": 123,
  "client": 5,
  "client_name": "John Doe",
  "salon": 1,
  "salon_name": "Glamour Beauty Studio",
  "service": 1,
  "service_name": "Haircut & Styling",
  "booking_date": "2026-03-15",
  "booking_time": "14:30:00",
  "status": "pending",
  "service_price": "5000.00",
  "booking_fee": "500.00",         // 10% of 5000
  "amount_due_at_salon": "5000.00", // Pay at salon
  "payment_status": "pending",
  "payment_reference": null,
  "created_at": "2026-03-04T14:00:00Z"
}
```

**Response (Error - 400 Bad Request):**
```json
{
  "service": ["This service is no longer available"]
}
```

---

### 5. GET `/api/bookings/my_bookings/` - Customer Booking History
**Authentication:** REQUIRED

**Example:**
```bash
GET /api/bookings/my_bookings/
```

**Response:**
```json
[
  {
    "id": 123,
    "service_name": "Haircut & Styling",
    "salon_name": "Glamour Beauty Studio",
    "booking_date": "2026-03-15",
    "booking_time": "14:30:00",
    "status": "confirmed",
    "service_price": "5000.00",
    "booking_fee": "500.00",
    "payment_status": "paid",
    ...
  }
]
```

---

### 6. POST `/api/bookings/{id}/cancel/` - Cancel Booking
**Authentication:** REQUIRED (Client or Salon Owner)

**Example:**
```bash
POST /api/bookings/123/cancel/
```

**Permissions:**
- Client can cancel their own bookings
- Salon owner can cancel bookings for their salon
- Cannot cancel completed bookings

**Response:**
```json
{
  "id": 123,
  "status": "cancelled",
  ...
}
```

---

### 7. POST `/api/bookings/{id}/initiate_payment/` - Payment Placeholder
**Authentication:** REQUIRED (Client only)

**Example:**
```bash
POST /api/bookings/123/initiate_payment/
```

**Response:**
```json
{
  "booking_id": 123,
  "booking_fee": "500.00",
  "amount_to_pay": "500.00",
  "payment_status": "pending",
  "payment_reference": null,
  "message": "Payment gateway integration coming soon. Please pay at the salon."
}
```

**Future Integration:**
- Flutterwave
- CinetPay
- MTN Mobile Money
- Orange Money

---

## 🔐 Authentication

### Customer Login
```bash
POST /api/users/customer_login/
Content-Type: application/json

{
  "username": "john@example.com",  // Can be email or username
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "abc123def456...",
  "user": {
    "id": 5,
    "username": "john",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe"
  }
}
```

### Using Token
Include in all authenticated requests:
```
Authorization: Token abc123def456...
```

---

## 🧪 Testing Guide

### 1. Create Test User (Customer)
```bash
cd backend
python manage.py createsuperuser
# Email: customer@test.com
# Password: testpass123
```

Or use the registration endpoint:
```bash
POST /api/users/register/
{
  "username": "customer1",
  "email": "customer@test.com",
  "password": "testpass123",
  "password2": "testpass123",
  "first_name": "Test",
  "last_name": "Customer"
}
```

### 2. Login and Get Token
```bash
POST /api/users/customer_login/
{
  "username": "customer@test.com",
  "password": "testpass123"
}
```

Save the token: `CUSTOMER_TOKEN="abc123..."`

### 3. Get Available Salons
```bash
GET /api/salons/?city=Douala
```

### 4. Get Salon Services
```bash
GET /api/salons/1/services/
```

Note the service ID (e.g., `service_id: 1`, `price: 5000`)

### 5. Create Booking
```bash
curl -X POST http://localhost:8000/api/bookings/ \
  -H "Authorization: Token $CUSTOMER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "service": 1,
    "booking_date": "2026-03-15",
    "booking_time": "14:30:00",
    "client_name": "Test Customer",
    "notes": "Test booking"
  }'
```

**Expected Response:**
```json
{
  "service_price": "5000.00",      // From database
  "booking_fee": "500.00",         // 10% of 5000
  "amount_due_at_salon": "5000.00" // Pay at salon
}
```

### 6. View Booking History
```bash
curl -X GET http://localhost:8000/api/bookings/my_bookings/ \
  -H "Authorization: Token $CUSTOMER_TOKEN"
```

### 7. Cancel Booking (if needed)
```bash
curl -X POST http://localhost:8000/api/bookings/123/cancel/ \
  -H "Authorization: Token $CUSTOMER_TOKEN"
```

---

## 📝 Key Implementation Details

### 1. Booking Fee Calculation (Backend Only)
```python
# In BookingSerializer.create()
service = validated_data['service']
validated_data['service_price'] = service.price  # From DB

commission_rate = salon.commission_rate  # Default 10%
validated_data['booking_fee'] = service.price * (commission_rate / 100)
validated_data['amount_due_at_salon'] = service.price
```

### 2. Permissions
- **Create Booking:** Authenticated customers only
- **View Bookings:** Customers see only their own
- **Cancel Booking:** Client or salon owner
- **Initiate Payment:** Client only

### 3. Database Indexes
```python
indexes = [
    Index(fields=['client', 'status']),
    Index(fields=['salon', 'status']),
    Index(fields=['booking_date']),
]
```

### 4. Status Choices
```python
# Booking Status
STATUS_CHOICES = [
    ('pending', 'Pending'),
    ('confirmed', 'Confirmed'),
    ('completed', 'Completed'),
    ('cancelled', 'Cancelled'),
]

# Payment Status
PAYMENT_STATUS_CHOICES = [
    ('pending', 'Pending'),
    ('paid', 'Paid'),
    ('failed', 'Failed'),
    ('refunded', 'Refunded'),
]
```

---

## 🚨 Important Notes

### ⚠️ Security
1. **NEVER accept `booking_fee` from frontend**
2. **NEVER accept `service_price` from frontend**
3. Always fetch from database
4. All price calculations done on backend

### ⚠️ Data Integrity
1. Service price stored at booking time (immutable)
2. Booking fee calculated from stored service price
3. Commission rate can change, but historical bookings remain unchanged

### ⚠️ Payment Flow
1. Customer pays **booking fee only** on platform
2. Customer pays **service price** at salon physically
3. Platform earns commission from booking fees
4. No money held in escrow

---

## 🔜 Future Enhancements

### Phase 1: Payment Gateway Integration
```python
# In BookingViewSet.initiate_payment()
# TODO: Integrate with Flutterwave/CinetPay
payment_url = flutterwave.generate_payment_url(
    amount=booking.booking_fee,
    customer_email=booking.client_email,
    booking_id=booking.id
)
return Response({'payment_url': payment_url})
```

### Phase 2: Webhooks
```python
@csrf_exempt
def payment_webhook(request):
    """Handle payment gateway webhooks"""
    # Update booking.payment_status
    # Save payment_reference
    pass
```

### Phase 3: Notifications
- Email confirmation on booking
- SMS reminders 24h before appointment
- Push notifications for status updates

---

## 📊 API Summary Table

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/salons/` | GET | Optional | List salons |
| `/api/salons/{id}/` | GET | Optional | Salon detail |
| `/api/salons/{id}/services/` | GET | Optional | Get salon services |
| `/api/bookings/` | POST | ✅ Required | Create booking |
| `/api/bookings/my_bookings/` | GET | ✅ Required | Booking history |
| `/api/bookings/{id}/cancel/` | POST | ✅ Required | Cancel booking |
| `/api/bookings/{id}/initiate_payment/` | POST | ✅ Required | Payment placeholder |

---

## ✅ Checklist

- [x] Salon model updated with `commission_rate`
- [x] Booking model updated with pricing fields
- [x] BookingSerializer with fee calculation
- [x] BookingViewSet with permissions
- [x] Customer booking history endpoint
- [x] Cancel booking endpoint
- [x] Payment placeholder endpoint
- [x] Database migrations created and applied
- [x] Admin interface updated
- [x] API documentation

---

**Backend is now ready for customer bookings! 🎉**

Next steps:
1. Test booking creation flow
2. Integrate frontend with new endpoints
3. Implement payment gateway when ready
