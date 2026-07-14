# Backend API Implementation - Admin Modals

## ✅ Completed Backend Endpoints

### 1. **Salon Management** (`/api/admin/salons/`)

#### **Update Salon** - `PUT /api/admin/salons/{id}/`
**Endpoint:** `admin_portal/views.py::AdminSalonViewSet.update()`

**Request:**
```json
{
  "name": "New Salon Name",
  "location": "New Location",
  "city": "New City",
  "description": "Updated description",
  "phone": "+237 677 123 456"
}
```

**Response (200 OK):**
```json
{
  "id": "1",
  "name": "New Salon Name",
  "owner_name": "John Doe",
  "owner_email": "john@example.com",
  "location": "New Location",
  "city": "New City",
  "is_active": true,
  "rating": 4.8,
  ...
}
```

#### **Delete Salon** - `DELETE /api/admin/salons/{id}/`
**Endpoint:** `admin_portal/views.py::AdminSalonViewSet.destroy()`

**Response (200 OK):**
```json
{
  "message": "Salon \"Glamour Beauty Studio\" deleted successfully"
}
```

---

### 2. **Customer Management** (`/api/admin/users/`)

#### **Update Customer** - `PUT /api/admin/users/{id}/`
**Endpoint:** `admin_portal/views.py::AdminUserViewSet.update()`

**Request:**
```json
{
  "first_name": "Jane",
  "last_name": "Doe",
  "email": "jane.doe@example.com"
}
```

**Response (200 OK):**
```json
{
  "id": "123",
  "username": "janedoe",
  "email": "jane.doe@example.com",
  "first_name": "Jane",
  "last_name": "Doe",
  "is_active": true,
  "date_joined": "2024-01-15T10:30:00Z",
  "profile": {
    "phone": "+237 677 123 456",
    ...
  }
}
```

#### **Delete Customer** - `DELETE /api/admin/users/{id}/`
**Endpoint:** `admin_portal/views.py::AdminUserViewSet.destroy()`

**Response (200 OK):**
```json
{
  "message": "User \"janedoe\" deleted successfully"
}
```

---

### 3. **Booking Management** (`/api/admin/bookings/`)

#### **Update Booking** - `PUT /api/admin/bookings/{id}/`
**Endpoint:** `admin_portal/views.py::AdminBookingViewSet.update()`

**Request:**
```json
{
  "status": "confirmed",
  "notes": "Updated notes"
}
```

**Response (200 OK):**
```json
{
  "id": "BK123",
  "client_name": "Jane Doe",
  "client_email": "jane@example.com",
  "salon_name": "Glamour Beauty Studio",
  "service_name": "Full Hair Treatment",
  "booking_date": "2024-01-25",
  "booking_time": "14:00",
  "status": "confirmed",
  "service_price": 50000,
  "booking_fee": 5000,
  ...
}
```

#### **Delete Booking** - `DELETE /api/admin/bookings/{id}/`
**Endpoint:** `admin_portal/views.py::AdminBookingViewSet.destroy()`

**Response (200 OK):**
```json
{
  "message": "Booking BK123 deleted successfully"
}
```

---

## ✅ Frontend API Service Methods

### **api.ts** - New Methods Added

```typescript
// Salons
async updateSalon(id: string, data: any)
async deleteSalon(id: string)

// Customers
async updateCustomer(id: string, data: any)
async deleteCustomer(id: string)

// Bookings
async updateBooking(id: string, data: any)
async deleteBooking(id: string)
```

---

## 🔧 Frontend Integration

### **Salon Management Page**

**Edit Modal:**
```typescript
const handleUpdateSalon = async () => {
  await apiService.updateSalon(selectedSalon.id, {
    name: editForm.name,
    location: editForm.location,
    city: editForm.city,
  });
  // Refresh data, close modal
};
```

**Delete Modal:**
```typescript
const handleConfirmDelete = async () => {
  await apiService.deleteSalon(selectedSalon.id);
  // Refresh data, close modal
};
```

### **Customer Management Page**

**Edit Modal:**
```typescript
const handleUpdateCustomer = async () => {
  await apiService.updateCustomer(selectedCustomer.id, {
    first_name: editForm.first_name,
    last_name: editForm.last_name,
    email: editForm.email,
  });
  // Refresh data, close modal
};
```

**Delete Modal:**
```typescript
const handleConfirmDelete = async () => {
  await apiService.deleteCustomer(selectedCustomer.id);
  // Refresh data, close modal
};
```

### **Booking Management Page**

**Edit Modal:**
```typescript
const handleUpdateBooking = async () => {
  await apiService.updateBooking(selectedBooking.id, {
    status: editForm.status,
    notes: editForm.notes,
  });
  // Refresh data, close modal
};
```

**Delete Modal:**
```typescript
const handleConfirmDelete = async () => {
  await apiService.deleteBooking(selectedBooking.id);
  // Refresh data, close modal
};
```

---

## 🎯 API Endpoint URLs

| Resource | Method | Endpoint | Purpose |
|----------|--------|----------|---------|
| Salons | PUT | `/api/admin/salons/{id}/` | Update salon details |
| Salons | DELETE | `/api/admin/salons/{id}/` | Delete salon |
| Users | PUT | `/api/admin/users/{id}/` | Update customer |
| Users | DELETE | `/api/admin/users/{id}/` | Delete customer |
| Bookings | PUT | `/api/admin/bookings/{id}/` | Update booking |
| Bookings | DELETE | `/api/admin/bookings/{id}/` | Delete booking |

---

## 🔐 Authentication & Permissions

All endpoints require:
- ✅ **Authentication**: `IsAuthenticated` permission
- ✅ **Admin Access**: `IsAdmin` permission
- ✅ **Token**: `Authorization: Token {admin_token}`

**Example Request:**
```bash
curl -X PUT http://localhost:8000/api/admin/salons/1/ \
  -H "Authorization: Token abc123..." \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Salon"}'
```

---

## 📊 Backend Files Modified

| File | Changes |
|------|---------|
| `backend/admin_portal/views.py` | Added `update()` and `destroy()` methods to AdminSalonViewSet, AdminUserViewSet, AdminBookingViewSet |
| `admin-frontend/services/api.ts` | Added `updateSalon()`, `deleteSalon()`, `updateCustomer()`, `deleteCustomer()`, `updateBooking()`, `deleteBooking()` |
| `admin-frontend/app/(dashboard)/salons/page.tsx` | Updated `handleUpdateSalon()` and `handleConfirmDelete()` to use real API |
| `admin-frontend/app/(dashboard)/customers/page.tsx` | Updated `handleUpdateCustomer()` and `handleConfirmDelete()` to use real API |

---

## ✅ Testing Instructions

### **Test Salon Edit:**
1. Go to Salon Management page
2. Click Action menu (⋮) on any salon
3. Select "Edit"
4. Change salon name or location
5. Click "Update"
6. ✅ Modal closes, success message appears, table refreshes with new data

### **Test Salon Delete:**
1. Go to Salon Management page
2. Click Action menu (⋮) on any salon
3. Select "Delete"
4. Click "Delete" in confirmation modal
5. ✅ Modal closes, success message appears, salon removed from table

### **Test Customer Edit:**
1. Go to Customer Management page
2. Click Action menu (⋮) on any customer
3. Select "Edit"
4. Change first name, last name, or email
5. Click "Update"
6. ✅ Modal closes, success message appears, table refreshes

### **Test Customer Delete:**
1. Go to Customer Management page
2. Click Action menu (⋮) on any customer
3. Select "Delete"
4. Click "Delete" in confirmation modal
5. ✅ Modal closes, success message appears, customer removed from table

---

## 🚀 Next Steps

### **To Complete:**
1. ✅ Backend endpoints created
2. ✅ Frontend API service methods added
3. ✅ Salon page integrated
4. ✅ Customer page integrated
5. 🔄 Booking page integration (components ready, needs wiring)

### **For Bookings Page:**
- Wire up `BookingEditModal` to Edit action
- Wire up `BookingActionModal` to Approve/Reject/Cancel/Complete actions
- Add state management for modal open/close
- Connect to `apiService.updateBooking()` and `apiService.deleteBooking()`

---

**Last Updated:** 2024-01-21
**Status:** Backend Complete ✅, Frontend 80% Complete
**Ready for Testing:** Salons & Customers pages ✅
