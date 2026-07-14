"""
Notification generation logic for the admin dashboard.
Generates real-time alerts based on platform activity.
Each notification type maps to a preference key from the settings page.
"""
from django.utils import timezone
from datetime import timedelta


def get_notifications(user=None):
    """
    Return a list of current actionable notifications for admin users.
    These are derived live from the DB — no separate Notification model needed.

    Each item:
      { id, type, title, message, severity, link, timestamp, read: False }
    """
    from bookings.models import Booking
    from salons.models import Salon
    from django.contrib.auth.models import User
    from admin_portal.models import SiteTestimonial

    now = timezone.now()
    notifications = []
    nid = 1  # deterministic IDs based on content

    # ── 1. Pending bookings (type: disputes / booking alerts) ──────────────
    pending_bookings = Booking.objects.filter(status='pending').order_by('-created_at')[:5]
    for booking in pending_bookings:
        notifications.append({
            'id': f'booking-pending-{booking.id}',
            'type': 'booking',
            'pref_key': 'disputes',
            'title': 'Pending Booking',
            'message': f'{booking.client_name or "A customer"} booked {booking.service.name if booking.service else "a service"} at {booking.salon.name if booking.salon else "a salon"}.',
            'severity': 'info',
            'link': '/bookings',
            'timestamp': booking.created_at.isoformat(),
            'read': False,
        })

    # ── 2. New salon registrations needing approval ─────────────────────────
    pending_salons = Salon.objects.filter(is_active=False).order_by('-created_at')[:5]
    for salon in pending_salons:
        notifications.append({
            'id': f'salon-pending-{salon.id}',
            'type': 'salon',
            'pref_key': 'suspensions',
            'title': 'Salon Awaiting Approval',
            'message': f'"{salon.name}" registered and is waiting for activation.',
            'severity': 'warning',
            'link': '/salons',
            'timestamp': salon.created_at.isoformat(),
            'read': False,
        })

    # ── 3. Pending testimonials awaiting review ─────────────────────────────
    pending_testimonials = SiteTestimonial.objects.filter(is_approved=False).order_by('-created_at')[:5]
    for t in pending_testimonials:
        notifications.append({
            'id': f'testimonial-pending-{t.id}',
            'type': 'testimonial',
            'pref_key': 'disputes',
            'title': 'New Testimonial Submitted',
            'message': f'{t.name} ({t.get_role_display()}) submitted a {t.rating}★ review awaiting approval.',
            'severity': 'info',
            'link': '/testimonials',
            'timestamp': t.created_at.isoformat(),
            'read': False,
        })

    # ── 4. New user registrations (daily) ───────────────────────────────────
    yesterday = now - timedelta(hours=24)
    new_users = User.objects.filter(date_joined__gte=yesterday).count()
    if new_users > 0:
        notifications.append({
            'id': f'users-new-{now.date().isoformat()}',
            'type': 'users',
            'pref_key': 'daily',
            'title': 'New Registrations',
            'message': f'{new_users} new user{"s" if new_users != 1 else ""} registered in the last 24 hours.',
            'severity': 'success',
            'link': '/customers',
            'timestamp': now.isoformat(),
            'read': False,
        })

    # ── 5. Failed payments ──────────────────────────────────────────────────
    try:
        from payments.models import Payment
        failed_payments = Payment.objects.filter(status='failed').count()
        if failed_payments > 0:
            notifications.append({
                'id': f'payments-failed-{now.date().isoformat()}',
                'type': 'payment',
                'pref_key': 'refunds',
                'title': 'Failed Payments',
                'message': f'{failed_payments} payment{"s" if failed_payments != 1 else ""} failed and may need attention.',
                'severity': 'error',
                'link': '/payments',
                'timestamp': now.isoformat(),
                'read': False,
            })
    except Exception:
        pass

    # ── 6. Weekly revenue summary ────────────────────────────────────────────
    from bookings.models import Booking as B
    from django.db.models import Sum
    week_start = now - timedelta(days=7)
    weekly_rev = B.objects.filter(
        status__in=['completed', 'confirmed'],
        created_at__gte=week_start
    ).aggregate(total=Sum('booking_fee'))['total'] or 0

    if weekly_rev > 0:
        notifications.append({
            'id': f'revenue-weekly-{now.isocalendar()[1]}-{now.year}',
            'type': 'revenue',
            'pref_key': 'weekly',
            'title': 'Weekly Revenue',
            'message': f'Platform collected {int(weekly_rev):,} FCFA in booking fees this week.',
            'severity': 'success',
            'link': '/reports',
            'timestamp': now.isoformat(),
            'read': False,
        })

    # Sort: errors first, then warnings, then the rest — all by timestamp desc
    severity_order = {'error': 0, 'warning': 1, 'info': 2, 'success': 3}
    notifications.sort(key=lambda n: (severity_order.get(n['severity'], 4), n['timestamp']), reverse=False)

    return notifications
