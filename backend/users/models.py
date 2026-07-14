from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from datetime import timedelta

FREE_PERIOD_MONTHS = 3  # configurable — change here or move to PlatformSettings later


class UserProfile(models.Model):
    """Extended user profile model."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    bio = models.TextField(blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    address = models.CharField(max_length=255, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    is_salon_owner = models.BooleanField(default=False)
    is_stylist = models.BooleanField(default=False)
    is_admin = models.BooleanField(default=False, help_text='Admin user with platform access')
    # Free booking period — set automatically on registration
    free_booking_until = models.DateTimeField(
        null=True, blank=True,
        help_text='User can book for free until this date. Null = no free period.'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'User Profile'
        verbose_name_plural = 'User Profiles'

    def __str__(self):
        return f"{self.user.username} Profile"

    @property
    def is_in_free_period(self) -> bool:
        """True if the user is currently within their free booking period."""
        if not self.free_booking_until:
            return False
        return timezone.now() <= self.free_booking_until


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """Create user profile when a new user is created."""
    if created:
        free_until = timezone.now() + timedelta(days=FREE_PERIOD_MONTHS * 30)
        UserProfile.objects.create(user=instance, free_booking_until=free_until)


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    """Save user profile when user is updated."""
    instance.profile.save()
