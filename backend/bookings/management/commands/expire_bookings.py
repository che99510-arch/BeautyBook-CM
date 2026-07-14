"""
Management command: expire_bookings
Run via: python manage.py expire_bookings

Marks any 'pending' booking older than 24 hours as 'expired'
and notifies the customer.

Schedule via cron / task scheduler to run every 15-30 minutes.
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from bookings.models import Booking
from bookings import notification_service as ns


class Command(BaseCommand):
    help = 'Expire pending bookings that have not been responded to within 24 hours.'

    def handle(self, *args, **options):
        cutoff = timezone.now() - timedelta(hours=24)
        expired = Booking.objects.filter(status='pending', created_at__lte=cutoff)
        count = expired.count()
        for booking in expired:
            booking.status = 'expired'
            booking.save(update_fields=['status', 'updated_at'])
            ns.notify_customer_expired(booking)

        if count:
            self.stdout.write(self.style.SUCCESS(f'Expired {count} booking(s).'))
        else:
            self.stdout.write('No bookings to expire.')
