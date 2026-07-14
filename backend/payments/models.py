from django.db import models
from django.contrib.auth.models import User
from bookings.models import Booking


class Payment(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('verified', 'Verified'),
        ('failed', 'Failed'),
    ]

    booking = models.OneToOneField(Booking, on_delete=models.CASCADE, related_name='payment')
    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payments')
    service_price = models.DecimalField(max_digits=10, decimal_places=2)
    booking_fee = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=50, default='momo')
    momo_reference = models.CharField(max_length=255, blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    paid_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Payment #{self.id} - {self.customer.username} - {self.status}"
