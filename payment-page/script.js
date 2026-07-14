/**
 * BeautyBook Payment Page - Frontend Logic
 * Handles booking fee calculation and payment simulation
 */

// ========================================
// CONFIGURATION & STATE
// ========================================

const CONFIG = {
    bookingFeePercentage: 0.10, // 10% booking fee
    currency: 'FCFA',
    defaultServicePrice: 50000,
};

let bookingData = {
    salonName: 'Glamour Beauty Studio',
    serviceName: 'Full Hair Treatment',
    servicePrice: CONFIG.defaultServicePrice,
    bookingDateTime: 'Tomorrow, 2:00 PM',
    date: 'Tomorrow',
    time: '2:00 PM',
    phoneNumber: '',
    paymentMethod: 'mtn',
    bookingRef: ''
};

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Format number as currency
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' ' + CONFIG.currency;
}

/**
 * Calculate booking fee (10% of service price)
 * @param {number} servicePrice - Service price
 * @returns {number} Booking fee amount
 */
function calculateBookingFee(servicePrice) {
    return Math.round(servicePrice * CONFIG.bookingFeePercentage);
}

/**
 * Calculate remaining amount to pay at salon
 * @param {number} servicePrice - Service price
 * @param {number} bookingFee - Booking fee already paid
 * @returns {number} Remaining amount
 */
function calculateRemainingAmount(servicePrice, bookingFee) {
    return servicePrice - bookingFee;
}

/**
 * Generate random booking reference
 * @returns {string} Booking reference ID
 */
function generateBookingRef() {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(Math.random() * 900000) + 100000;
    return `BB-${year}-${randomNum}`;
}

// ========================================
// UI UPDATE FUNCTIONS
// ========================================

/**
 * Update all price displays on the page
 */
function updatePriceDisplays() {
    const bookingFee = calculateBookingFee(bookingData.servicePrice);
    const remainingAmount = calculateRemainingAmount(bookingData.servicePrice, bookingFee);

    // Update DOM elements
    document.getElementById('servicePrice').textContent = formatCurrency(bookingData.servicePrice);
    document.getElementById('bookingFee').textContent = formatCurrency(bookingFee);
    document.getElementById('amountToPay').textContent = formatCurrency(bookingFee);
    document.getElementById('remainingAmount').textContent = formatCurrency(remainingAmount);
    
    // Update modal displays
    document.getElementById('confirmAmount').textContent = formatCurrency(bookingFee);
    document.getElementById('confirmRemaining').textContent = formatCurrency(remainingAmount);
}

/**
 * Update booking information displays
 */
function updateBookingDisplays() {
    document.getElementById('salonName').textContent = bookingData.salonName;
    document.getElementById('serviceName').textContent = bookingData.serviceName;
    document.getElementById('bookingDateTime').textContent = bookingData.bookingDateTime;
    
    // Update modal displays
    document.getElementById('confirmSalon').textContent = bookingData.salonName;
    document.getElementById('confirmService').textContent = bookingData.serviceName;
    document.getElementById('confirmDate').textContent = bookingData.date;
    document.getElementById('confirmTime').textContent = bookingData.time;
    document.getElementById('bookingRef').textContent = bookingData.bookingRef;
}

/**
 * Show payment processing state
 * @param {boolean} isLoading - Whether payment is processing
 */
function setPaymentLoading(isLoading) {
    const btn = document.getElementById('confirmBtn');
    const btnText = btn.querySelector('.btn-text');
    const btnLoader = btn.querySelector('.btn-loader');

    if (isLoading) {
        btn.disabled = true;
        btnText.style.display = 'none';
        btnLoader.style.display = 'flex';
    } else {
        btn.disabled = false;
        btnText.style.display = 'block';
        btnLoader.style.display = 'none';
    }
}

/**
 * Show success modal with booking confirmation
 */
function showSuccessModal() {
    const modal = document.getElementById('successModal');
    modal.style.display = 'flex';
    
    // Add confetti effect (simple CSS animation trigger)
    triggerConfetti();
}

/**
 * Close success modal
 */
function closeModal() {
    const modal = document.getElementById('successModal');
    modal.style.display = 'none';
    
    // Optional: Redirect to confirmation page or dashboard
    // window.location.href = '/confirmation.html';
}

/**
 * Simple confetti animation trigger
 */
function triggerConfetti() {
    const colors = ['#6C63FF', '#FF6584', '#4CAF50', '#FFCC00', '#2196F3'];
    
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.style.position = 'fixed';
            confetti.style.width = '10px';
            confetti.style.height = '10px';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.top = '-10px';
            confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
            confetti.style.zIndex = '1001';
            confetti.style.pointerEvents = 'none';
            document.body.appendChild(confetti);

            const animation = confetti.animate([
                { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
                { transform: `translateY(100vh) rotate(${Math.random() * 720}deg)`, opacity: 0 }
            ], {
                duration: 2000 + Math.random() * 1000,
                easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            });

            animation.onfinish = () => confetti.remove();
        }, i * 50);
    }
}

// ========================================
// FORM HANDLING
// ========================================

/**
 * Handle payment form submission
 * @param {Event} event - Form submit event
 */
async function handlePaymentSubmit(event) {
    event.preventDefault();

    // Get form values
    const phoneNumber = document.getElementById('phoneNumber').value;
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;

    // Validate phone number (9 digits for Cameroon)
    if (!/^[0-9]{9}$/.test(phoneNumber)) {
        alert('Please enter a valid 9-digit phone number');
        return;
    }

    // Update booking data
    bookingData.phoneNumber = phoneNumber;
    bookingData.paymentMethod = paymentMethod;
    bookingData.bookingRef = generateBookingRef();

    // Show loading state
    setPaymentLoading(true);

    // Simulate payment processing (2-3 seconds)
    await simulatePaymentProcessing();

    // Hide loading state
    setPaymentLoading(false);

    // Show success modal
    showSuccessModal();

    // Log booking confirmation (for debugging)
    console.log('Booking Confirmed:', bookingData);
}

/**
 * Simulate payment processing delay
 * @returns {Promise} Promise that resolves after delay
 */
function simulatePaymentProcessing() {
    return new Promise((resolve) => {
        setTimeout(resolve, 2500);
    });
}

/**
 * Handle payment method selection
 * @param {Event} event - Change event
 */
function handlePaymentMethodChange(event) {
    bookingData.paymentMethod = event.target.value;
    console.log('Payment method selected:', bookingData.paymentMethod);
}

// ========================================
// INITIALIZATION
// ========================================

/**
 * Initialize the payment page
 */
function initPaymentPage() {
    // Update all displays with initial values
    updatePriceDisplays();
    updateBookingDisplays();

    // Add event listeners
    const paymentForm = document.getElementById('paymentForm');
    paymentForm.addEventListener('submit', handlePaymentSubmit);

    // Payment method radio buttons
    const paymentMethods = document.querySelectorAll('input[name="paymentMethod"]');
    paymentMethods.forEach(radio => {
        radio.addEventListener('change', handlePaymentMethodChange);
    });

    // Phone number input formatting
    const phoneNumberInput = document.getElementById('phoneNumber');
    phoneNumberInput.addEventListener('input', (e) => {
        // Remove non-numeric characters
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
        
        // Limit to 9 digits
        if (e.target.value.length > 9) {
            e.target.value = e.target.value.slice(0, 9);
        }
    });

    console.log('Payment page initialized');
    console.log('Service Price:', formatCurrency(bookingData.servicePrice));
    console.log('Booking Fee (10%):', formatCurrency(calculateBookingFee(bookingData.servicePrice)));
}

// ========================================
// CUSTOMIZATION FUNCTIONS (For Future Use)
// ========================================

/**
 * Set booking data dynamically (can be called from URL params or API)
 * @param {Object} data - Booking data object
 */
function setBookingData(data) {
    if (data.salonName) bookingData.salonName = data.salonName;
    if (data.serviceName) bookingData.serviceName = data.serviceName;
    if (data.servicePrice) bookingData.servicePrice = data.servicePrice;
    if (data.bookingDateTime) bookingData.bookingDateTime = data.bookingDateTime;
    if (data.date) bookingData.date = data.date;
    if (data.time) bookingData.time = data.time;
    
    // Update displays
    updatePriceDisplays();
    updateBookingDisplays();
}

/**
 * Example: Load booking from URL parameters
 * Usage: index.html?service=Hair%20Treatment&price=75000&salon=Salon%20Elite
 */
function loadBookingFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    
    const bookingDataFromURL = {
        serviceName: urlParams.get('service'),
        servicePrice: urlParams.get('price') ? parseInt(urlParams.get('price')) : null,
        salonName: urlParams.get('salon'),
        date: urlParams.get('date'),
        time: urlParams.get('time')
    };

    // Filter out null values
    const validData = Object.fromEntries(
        Object.entries(bookingDataFromURL).filter(([_, v]) => v != null)
    );

    if (Object.keys(validData).length > 0) {
        setBookingData(validData);
    }
}

// ========================================
// RUN ON PAGE LOAD
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    initPaymentPage();
    // Uncomment below to enable URL parameter loading
    // loadBookingFromURL();
});

// Make closeModal available globally for the onclick handler
window.closeModal = closeModal;
