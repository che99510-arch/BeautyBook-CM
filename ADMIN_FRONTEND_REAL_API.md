# Admin Frontend Connected to Real Backend ✅

## Overview
All admin portal pages now fetch real data from the Django backend API.

---

## 🔄 Pages Updated

### 1. **Dashboard** (`/dashboard`)
- ✅ Fetches from: `/api/admin/analytics/dashboard/`
- ✅ Shows: Real-time stats from your platform
- ✅ Displays:
  - Total customers, salons, bookings
  - Booking status breakdown (pending/confirmed/completed/cancelled)
  - Payment status (pending/paid/failed)
  - Growth metrics (this month)
  - Revenue from booking fees

### 2. **Salons** (`/salons`)
- ✅ Fetches from: `/api/admin/salons/`
- ✅ Features:
  - Search by salon name or owner
  - Filter by status (active/pending/suspended)
  - View all salon details
  - Actions menu (approve/suspend/feature - coming soon)

### 3. **Customers** (`/customers`)
- ✅ Fetches from: `/api/admin/users/`
- ✅ Features:
  - Search by name or email
  - View all registered customers
  - Join date and contact info
  - Actions menu (suspend/activate - coming soon)

### 4. **Bookings** (`/bookings`)
- ✅ Fetches from: `/api/admin/bookings/`
- ✅ Features:
  - Filter by status (all/pending/confirmed/completed/cancelled)
  - Search by customer, salon, or service
  - View booking details
  - Actions menu (approve/reject/cancel - coming soon)

---

## 🌐 API Endpoints Used

| Page | Endpoint | Method | Auth Required |
|------|----------|--------|---------------|
| Dashboard | `/api/admin/analytics/dashboard/` | GET | ✅ Admin Token |
| Salons | `/api/admin/salons/` | GET | ✅ Admin Token |
| Customers | `/api/admin/users/` | GET | ✅ Admin Token |
| Bookings | `/api/admin/bookings/` | GET | ✅ Admin Token |
| Revenue | `/api/admin/analytics/revenue/` | GET | ✅ Admin Token |
| Revenue by Salon | `/api/admin/analytics/revenue/by-salon/` | GET | ✅ Admin Token |
| Top Services | `/api/admin/analytics/top_services/` | GET | ✅ Admin Token |

---

## 🔐 Authentication Flow

1. User enters email/password on login page
2. Frontend calls: `POST /api/users/customer_login/`
3. Backend returns token + user data
4. Frontend checks if user has admin privileges:
   - `is_superuser == true` OR
   - `profile.is_admin == true`
5. Token saved in cookies
6. All subsequent requests include: `Authorization: Token <token>`

---

## 📊 Data Flow Example

### Dashboard Data Structure:
```json
{
  "summary": {
    "total_customers": 3,
    "total_salons": 2,
    "total_bookings": 1,
    "total_revenue": 5000.00,
    "total_booking_fees": 500.00
  },
  "booking_stats": {
    "pending_bookings": 0,
    "confirmed_bookings": 0,
    "completed_bookings": 1,
    "cancelled_bookings": 0
  },
  "payment_stats": {
    "pending_payments": 1,
    "paid_payments": 0,
    "failed_payments": 0
  },
  "growth_metrics": {
    "new_customers_this_month": 1,
    "new_salons_this_month": 0,
    "bookings_this_month": 0,
    "revenue_this_month": 0.00
  }
}
```

---

## 🧪 Testing

### 1. Login Test
```
URL: http://localhost:3000/login
Email: admin@beautybook.cm
Password: adminpass123
```

**Expected:**
- Console shows: `Login successful, token: ...`
- Redirects to `/dashboard`
- Shows real data from backend

### 2. Dashboard Test
```
Check browser console for:
- GET /api/admin/analytics/dashboard/ 200 OK

Check Django terminal for:
[04/Mar/2026 17:XX:XX] "GET /api/admin/analytics/dashboard/ HTTP/1.1" 200 XXX
```

### 3. Salons Test
```
Navigate to: http://localhost:3000/salons
Should show list of salons from Django DB
```

### 4. Bookings Test
```
Navigate to: http://localhost:3000/bookings
Should show list of bookings from Django DB
Filter by status to test API parameters
```

---

## 🎯 Features Working

### ✅ Fully Functional:
- Admin login with JWT authentication
- Dashboard with real-time analytics
- Salon listing with search/filter
- Customer listing with search
- Booking listing with status filter
- Revenue tracking (booking fees only)

### 🚧 Coming Soon:
- Approve/suspend salon actions
- Approve/reject booking actions
- Suspend/activate user actions
- Payment release/refund
- Dispute management
- Advertisement management
- Export to CSV/PDF
- Advanced analytics charts

---

## 📁 Files Modified

| File | Status | Changes |
|------|--------|---------|
| `services/api.ts` | ✅ Rewritten | Real API calls instead of mocks |
| `context/AuthContext.tsx` | ✅ Updated | Added logging, better error handling |
| `app/(dashboard)/dashboard/page.tsx` | ✅ Rewritten | Fetches from `/api/admin/analytics/dashboard/` |
| `app/(dashboard)/salons/page.tsx` | ✅ Rewritten | Fetches from `/api/admin/salons/` |
| `app/(dashboard)/customers/page.tsx` | ✅ Rewritten | Fetches from `/api/admin/users/` |
| `app/(dashboard)/bookings/page.tsx` | ✅ Rewritten | Fetches from `/api/admin/bookings/` |

---

## 🔧 Configuration

### Environment Variables (Optional)
Create `.env.local` in `admin-frontend/`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/admin
```

### CORS Configuration
Backend (`settings.py`) already configured:
```python
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',  # Admin frontend
    'http://localhost:8080',  # Customer frontend
]
```

---

## 🐛 Troubleshooting

### Issue: "Failed to fetch user profile"
**Solution:** Check that `/api/users/current_user/` endpoint is accessible
```bash
curl http://localhost:8000/api/users/current_user/ \
  -H "Authorization: Token YOUR_TOKEN"
```

### Issue: "User does not have admin privileges"
**Solution:** Set is_admin flag
```bash
python manage.py shell -c "
from django.contrib.auth.models import User
u = User.objects.get(email='admin@beautybook.cm')
u.profile.is_admin = True
u.is_superuser = True
u.save()
"
```

### Issue: CORS errors
**Solution:** 
1. Ensure backend is running on port 8000
2. Check `CORS_ALLOWED_ORIGINS` in `settings.py`
3. Restart both backend and frontend

### Issue: 404 on admin endpoints
**Solution:** Verify URLs are registered
```bash
python manage.py show_urls | grep admin
# Should show:
# /api/admin/analytics/dashboard/
# /api/admin/bookings/
# /api/admin/salons/
# /api/admin/users/
```

---

## ✅ Success Indicators

### Browser Console (F12):
```
Logging in with: admin@beautybook.cm
Login successful, token: d2eb0166df0a3feb7d41...
User profile: {id: 1, username: 'admin', is_superuser: true, ...}
Is admin? true
```

### Django Terminal:
```
[04/Mar/2026 17:XX:XX] "POST /api/users/customer_login/ HTTP/1.1" 200 422
[04/Mar/2026 17:XX:XX] "GET /api/users/current_user/ HTTP/1.1" 200 362
[04/Mar/2026 17:XX:XX] "GET /api/admin/analytics/dashboard/ HTTP/1.1" 200 512
[04/Mar/2026 17:XX:XX] "GET /api/admin/salons/ HTTP/1.1" 200 1024
```

### UI Shows:
- ✅ Dashboard with real numbers from your database
- ✅ Salon list from Django DB
- ✅ Customer list from Django DB
- ✅ Booking list from Django DB
- ✅ Revenue stats (booking fees only)

---

## 🎉 Admin Portal is LIVE!

**Your admin frontend now displays real data from Django backend!**

Access it at: `http://localhost:3000/dashboard`

Login with:
- **Email:** `admin@beautybook.cm`
- **Password:** `adminpass123`

All data is live from your Django database! 🚀
