# 💳 BeautyBook Payment Page

A modern, professional payment page for beauty service bookings with **10% booking fee logic**.

## 🎯 Features

### Payment Logic
- ✅ **Booking Fee = 10%** of service price
- ✅ Platform only collects booking fee (not full service payment)
- ✅ Remaining amount paid physically at the salon
- ✅ Clear communication of payment structure

### UI/UX Features
- ✅ Modern, clean, mobile-friendly design
- ✅ Two-column layout (Booking Summary + Payment Section)
- ✅ Real-time booking fee calculation
- ✅ Mobile Money payment options (MTN & Orange)
- ✅ Payment processing simulation
- ✅ Success modal with booking confirmation
- ✅ Confetti animation on success
- ✅ Trust badges and security indicators

## 📁 Files

```
payment-page/
├── index.html      # Main HTML structure
├── style.css       # Styles and animations
├── script.js       # Payment logic and interactions
└── README.md       # This file
```

## 🚀 How to Use

### Option 1: Direct Open
Simply open `index.html` in your browser:
```bash
# Windows
start index.html

# Mac
open index.html

# Linux
xdg-open index.html
```

### Option 2: Local Server (Recommended)
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx http-server

# Then visit: http://localhost:8000
```

## ⚙️ Configuration

### Customize Booking Details

Edit `script.js` and modify the `bookingData` object:

```javascript
let bookingData = {
    salonName: 'Your Salon Name',
    serviceName: 'Service Name',
    servicePrice: 50000,  // Service price in FCFA
    bookingDateTime: 'Date & Time',
    date: 'Date',
    time: 'Time',
};
```

### Change Booking Fee Percentage

Edit `script.js`:

```javascript
const CONFIG = {
    bookingFeePercentage: 0.10, // Change to 0.15 for 15%, etc.
    currency: 'FCFA',
};
```

### Load Booking from URL

The page supports URL parameters for dynamic booking data:

```
index.html?service=Hair%20Treatment&price=75000&salon=Salon%20Elite&date=Tomorrow&time=3:00%20PM
```

To enable this feature, uncomment this line in `script.js`:

```javascript
// In initPaymentPage() function:
loadBookingFromURL(); // Uncomment this line
```

## 🎨 Design Features

### Color Scheme
- **Primary**: `#6C63FF` (Purple)
- **Secondary**: `#F5F6FA` (Light Gray)
- **Accent**: `#FF6584` (Pink)
- **Success**: `#4CAF50` (Green)
- **Warning**: `#FFA726` (Orange)

### Payment Methods
- MTN Mobile Money (Yellow branding)
- Orange Money (Orange branding)

### Responsive Breakpoints
- Desktop: Full two-column layout
- Tablet (≤968px): Single column
- Mobile (≤768px): Optimized touch interface
- Small (≤480px): Compact layout

## 💡 Payment Flow

1. **Customer views booking summary** (left section)
   - Salon name and location
   - Service details
   - Service price display
   - Booking fee calculation (10%)
   - Important notice about payment structure

2. **Customer completes payment** (right section)
   - Selects Mobile Money provider
   - Enters phone number
   - Clicks "Pay Booking Fee"

3. **Payment processing**
   - Loading spinner appears
   - 2.5 second simulation delay

4. **Success confirmation**
   - Confetti animation
   - Booking reference generated
   - Full booking details displayed
   - Reminder about remaining payment at salon

## 🔧 JavaScript Functions

### Core Functions
| Function | Description |
|----------|-------------|
| `formatCurrency(amount)` | Format number as FCFA currency |
| `calculateBookingFee(price)` | Calculate 10% booking fee |
| `calculateRemainingAmount(price, fee)` | Calculate amount due at salon |
| `generateBookingRef()` | Generate unique booking reference |

### UI Functions
| Function | Description |
|----------|-------------|
| `updatePriceDisplays()` | Update all price displays |
| `updateBookingDisplays()` | Update booking information |
| `setPaymentLoading(isLoading)` | Show/hide loading state |
| `showSuccessModal()` | Display success modal |
| `closeModal()` | Close success modal |

### Event Handlers
| Function | Description |
|----------|-------------|
| `handlePaymentSubmit(event)` | Process payment form |
| `handlePaymentMethodChange(event)` | Handle payment method selection |
| `simulatePaymentProcessing()` | Simulate API delay |

## 📱 Mobile Money Integration (Future)

To integrate real Mobile Money APIs:

### MTN MoMo API
```javascript
async function processMTNPayment(phoneNumber, amount) {
    const response = await fetch('https://sandbox.momodeveloper.mtn.com/collection/v1_0/requesttopay', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer YOUR_ACCESS_TOKEN',
            'X-Reference-Id': generateUUID(),
            'X-Target-Environment': 'sandbox'
        },
        body: JSON.stringify({
            amount: amount.toString(),
            currency: 'XAF',
            externalId: bookingData.bookingRef,
            payer: { partyIdType: 'MSISDN', partyId: phoneNumber },
            payerMessage: 'BeautyBook Booking Fee',
            payeeNote: 'Thank you for booking!'
        })
    });
    return response.json();
}
```

### Orange Money API
```javascript
async function processOrangePayment(phoneNumber, amount) {
    const response = await fetch('https://api.orange.com/orange-money-webpay/dev/v1/webpayment', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer YOUR_ACCESS_TOKEN',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            merchant_key: 'YOUR_MERCHANT_KEY',
            amount: amount,
            currency: 'XAF',
            order_id: bookingData.bookingRef,
            customer_phone_number: phoneNumber
        })
    });
    return response.json();
}
```

## 🎯 Next Steps

### Phase 1: Backend Integration
- [ ] Create booking API endpoint
- [ ] Integrate Mobile Money payment gateway
- [ ] Implement payment verification webhook
- [ ] Store bookings in database
- [ ] Send confirmation SMS/email

### Phase 2: Enhanced Features
- [ ] Multiple service booking
- [ ] Coupon/discount code support
- [ ] Recurring appointments
- [ ] Payment plans/installments
- [ ] Multi-language support

### Phase 3: Analytics
- [ ] Track conversion rates
- [ ] Monitor payment failures
- [ ] A/B test payment flow
- [ ] Revenue analytics dashboard

## 📞 Support

For questions or issues:
- Email: support@beautybook.cm
- Documentation: https://beautybook.cm/docs

## 📄 License

Copyright © 2024 BeautyBook. All rights reserved.

---

**Built with ❤️ for BeautyBook CM**
