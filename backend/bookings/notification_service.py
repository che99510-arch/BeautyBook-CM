"""
Notification service for the booking workflow.

All notification creation goes through here so future channels
(email, WhatsApp, push) can be added in one place without
touching booking views.
"""
from bookings.models import CustomerNotification, SalonOwnerNotification


def _fmt_date(d):
    """Format a date or None gracefully."""
    if not d:
        return '—'
    try:
        from datetime import date as date_type
        if isinstance(d, str):
            return d
        return d.strftime('%d %b %Y')
    except Exception:
        return str(d)


def _fmt_time(t):
    """Format a time or None gracefully."""
    if not t:
        return '—'
    try:
        return t.strftime('%H:%M')
    except Exception:
        return str(t)[:5]


# ── Salon Owner Notifications ──────────────────────────────────────────────

def notify_owner_new_booking(booking):
    """Called when a customer submits a new booking."""
    owner = booking.salon.owner
    SalonOwnerNotification.objects.create(
        recipient=owner,
        booking=booking,
        notification_type='new_booking',
        title='New Booking Request',
        message=(
            f'{booking.client_name} has requested {booking.service_name} '
            f'on {_fmt_date(booking.booking_date)} at {_fmt_time(booking.booking_time)}.'
        ),
    )
    # Future: trigger_email(owner, ...) / trigger_whatsapp(owner, ...)


def notify_owner_booking_cancelled(booking):
    """Called when a customer cancels their booking."""
    owner = booking.salon.owner
    SalonOwnerNotification.objects.create(
        recipient=owner,
        booking=booking,
        notification_type='booking_cancelled',
        title='Booking Cancelled by Customer',
        message=(
            f'{booking.client_name} cancelled their booking for '
            f'{booking.service_name} on {_fmt_date(booking.booking_date)}.'
        ),
    )


# ── Customer Notifications ─────────────────────────────────────────────────

def notify_customer_confirmed(booking):
    """Booking was approved by salon owner."""
    if not booking.client:
        return
    CustomerNotification.objects.create(
        recipient=booking.client,
        booking=booking,
        notification_type='booking_confirmed',
        title='Booking Confirmed ✅',
        message=(
            f'Great news! {booking.salon.name} confirmed your booking for '
            f'{booking.service_name} on {_fmt_date(booking.booking_date)} '
            f'at {_fmt_time(booking.booking_time)}. See you there!'
        ),
    )


def notify_customer_declined(booking):
    """Booking was declined by salon owner."""
    if not booking.client:
        return
    reason_labels = dict(booking.DECLINE_REASON_CHOICES)
    reason_text = reason_labels.get(booking.decline_reason, booking.decline_reason or 'unspecified')
    extra = f' — {booking.decline_message}' if booking.decline_message else ''
    CustomerNotification.objects.create(
        recipient=booking.client,
        booking=booking,
        notification_type='booking_declined',
        title='Booking Declined ❌',
        message=(
            f'Unfortunately {booking.salon.name} could not accept your booking for '
            f'{booking.service_name} on {_fmt_date(booking.booking_date)}. '
            f'Reason: {reason_text}{extra}.'
        ),
    )


def notify_customer_reschedule(booking):
    """Salon owner proposed a new date/time."""
    if not booking.client:
        return
    extra = f' Message: "{booking.reschedule_message}"' if booking.reschedule_message else ''
    CustomerNotification.objects.create(
        recipient=booking.client,
        booking=booking,
        notification_type='booking_reschedule',
        title='Reschedule Requested 📅',
        message=(
            f'{booking.salon.name} has proposed a new time for your '
            f'{booking.service_name} booking: '
            f'{_fmt_date(booking.reschedule_date)} at {_fmt_time(booking.reschedule_time)}.{extra}'
        ),
    )


def notify_customer_expired(booking):
    """Booking auto-expired because the salon did not respond in 24h."""
    if not booking.client:
        return
    CustomerNotification.objects.create(
        recipient=booking.client,
        booking=booking,
        notification_type='booking_expired',
        title='Booking Expired ⏰',
        message=(
            f'The salon did not respond to your booking for {booking.service_name} '
            f'at {booking.salon.name} within the required time. '
            f'Your booking has expired. Please try booking again.'
        ),
    )


def notify_customer_completed(booking):
    """Booking marked as completed."""
    if not booking.client:
        return
    CustomerNotification.objects.create(
        recipient=booking.client,
        booking=booking,
        notification_type='booking_completed',
        title='Booking Completed 🎉',
        message=(
            f'Your {booking.service_name} appointment at {booking.salon.name} '
            f'has been marked as completed. Thank you for your visit!'
        ),
    )
