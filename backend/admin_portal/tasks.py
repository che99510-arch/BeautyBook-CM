from django.utils import timezone
from admin_portal.models import Advertisement


def update_advertisement_status():
    """
    Bulk-update advertisement statuses based on current date.
    - Skips 'paused' ads (admin manually paused them).
    - expired:   end_date < today
    - active:    start_date <= today <= end_date
    - scheduled: start_date > today
    """
    today = timezone.now().date()

    # 1. Expire ads whose end_date has passed (exclude paused)
    expired_count = Advertisement.objects.filter(
        end_date__lt=today
    ).exclude(status='paused').update(status='expired')

    # 2. Activate ads whose window is now valid (exclude paused)
    active_count = Advertisement.objects.filter(
        start_date__lte=today,
        end_date__gte=today
    ).exclude(status='paused').update(status='active')

    # 3. Schedule ads whose start_date is in the future (exclude paused)
    scheduled_count = Advertisement.objects.filter(
        start_date__gt=today
    ).exclude(status='paused').update(status='scheduled')

    return {
        'expired': expired_count,
        'activated': active_count,
        'scheduled': scheduled_count,
    }
