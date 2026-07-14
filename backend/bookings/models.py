from django.db import models
from django.contrib.auth.models import User
from services.models import Service
from salons.models import Salon


class Booking(models.Model):
    """Model for service bookings."""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('declined', 'Declined'),
        ('reschedule_requested', 'Reschedule Requested'),
        ('completed', 'Completed'),
        ('expired', 'Expired'),
        ('cancelled', 'Cancelled'),
    ]

    DECLINE_REASON_CHOICES = [
        ('fully_booked', 'Fully booked'),
        ('staff_unavailable', 'Staff unavailable'),
        ('salon_closed', 'Salon closed'),
        ('service_unavailable', 'Requested service unavailable'),
        ('emergency_closure', 'Emergency closure'),
        ('other', 'Other'),
    ]

    PAYMENT_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    ]

    client = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings', null=True, blank=True)
    client_name = models.CharField(max_length=255)
    client_email = models.EmailField(null=True, blank=True)
    client_phone = models.CharField(max_length=20, null=True, blank=True)
    salon = models.ForeignKey(Salon, on_delete=models.CASCADE, related_name='bookings')
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name='bookings', null=True, blank=True)
    service_name = models.CharField(max_length=255)
    booking_date = models.DateField()
    booking_time = models.TimeField()
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='pending')
    notes = models.TextField(blank=True, null=True)

    # Decline fields
    decline_reason = models.CharField(
        max_length=30, choices=DECLINE_REASON_CHOICES,
        blank=True, null=True
    )
    decline_message = models.TextField(
        blank=True, null=True,
        help_text='Custom message when decline_reason is "other"'
    )

    # Reschedule fields
    reschedule_date = models.DateField(blank=True, null=True)
    reschedule_time = models.TimeField(blank=True, null=True)
    reschedule_message = models.TextField(blank=True, null=True)
    
    # Pricing fields - calculated at booking time
    service_price = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=0,
        help_text='Service price at time of booking'
    )
    booking_fee = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=0,
        help_text='Platform booking fee (10% commission)'
    )
    amount_due_at_salon = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=0,
        help_text='Amount to pay at salon (service price)'
    )
    
    # Payment tracking
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending')
    payment_reference = models.CharField(max_length=255, blank=True, null=True, help_text='Payment gateway reference')
    # Free period flag — True if booking was made outside the user's free period
    # Kept for future billing; does NOT block booking while payment_enabled=False
    payment_required = models.BooleanField(
        default=False,
        help_text='True if this booking was created outside the free period (for future billing).'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-booking_date', '-booking_time']
        verbose_name = 'Booking'
        verbose_name_plural = 'Bookings'
        indexes = [
            models.Index(fields=['client', 'status']),
            models.Index(fields=['salon', 'status']),
            models.Index(fields=['booking_date']),
        ]

    def __str__(self):
        return f"{self.client_name} - {self.service_name} at {self.salon.name}"

    def calculate_booking_fee(self):
        """Calculate booking fee based on salon's commission rate."""
        commission_rate = self.salon.commission_rate
        self.booking_fee = self.service_price * (commission_rate / 100)
        self.amount_due_at_salon = self.service_price
        return self.booking_fee


class CustomerNotification(models.Model):
    """
    In-app notifications delivered to customers.
    Architecture supports future email/WhatsApp via notification_type field.
    """
    TYPE_CHOICES = [
        ('booking_confirmed', 'Booking Confirmed'),
        ('booking_declined', 'Booking Declined'),
        ('booking_reschedule', 'Reschedule Requested'),
        ('booking_expired', 'Booking Expired'),
        ('booking_completed', 'Booking Completed'),
        ('booking_cancelled', 'Booking Cancelled'),
        ('general', 'General'),
    ]

    recipient = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='customer_notifications'
    )
    booking = models.ForeignKey(
        Booking, on_delete=models.CASCADE,
        related_name='notifications', null=True, blank=True
    )
    notification_type = models.CharField(max_length=30, choices=TYPE_CHOICES, default='general')
    title = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    # Hooks for future channels — set to True once sent via that channel
    email_sent = models.BooleanField(default=False)
    whatsapp_sent = models.BooleanField(default=False)

    class Meta:
        ordering = ['-created_at']
        indexes = [models.Index(fields=['recipient', 'is_read'])]

    def __str__(self):
        return f"[{self.notification_type}] → {self.recipient.username}: {self.title}"


class SalonOwnerNotification(models.Model):
    """
    In-app notifications for salon owners (new bookings, cancellations).
    Stored in DB so they persist across sessions.
    """
    TYPE_CHOICES = [
        ('new_booking', 'New Booking'),
        ('booking_cancelled', 'Booking Cancelled by Customer'),
        ('general', 'General'),
    ]

    recipient = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='salon_notifications'
    )
    booking = models.ForeignKey(
        Booking, on_delete=models.CASCADE,
        related_name='salon_notifications', null=True, blank=True
    )
    notification_type = models.CharField(max_length=30, choices=TYPE_CHOICES, default='general')
    title = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [models.Index(fields=['recipient', 'is_read'])]

    def __str__(self):
        return f"[{self.notification_type}] → {self.recipient.username}: {self.title}"
