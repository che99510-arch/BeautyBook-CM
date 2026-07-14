from django.db import models
from salons.models import Salon
from django.core.validators import FileExtensionValidator
import os


class PlatformSettings(models.Model):
    """Singleton model for platform-wide settings."""

    PAYMENT_MODE_CHOICES = [
        ('momo', 'MoMo (Mobile Money)'),
        ('cash', 'Cash at Salon'),
        ('both', 'Both'),
    ]

    # General
    platform_name = models.CharField(max_length=100, default='BeautyBook CM')

    # Booking
    booking_fee_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=10.00)
    min_booking_amount = models.DecimalField(max_digits=10, decimal_places=2, default=500.00)
    max_booking_days_ahead = models.PositiveIntegerField(default=30)
    allow_multiple_bookings = models.BooleanField(default=True)

    # Payments
    payment_mode = models.CharField(max_length=10, choices=PAYMENT_MODE_CHOICES, default='momo')
    momo_primary_number = models.CharField(max_length=20, blank=True, default='')
    momo_secondary_number = models.CharField(max_length=20, blank=True, default='')

    # Advertisements
    max_active_ads = models.PositiveIntegerField(default=3)
    default_ad_duration_days = models.PositiveIntegerField(default=30)

    # System Control
    maintenance_mode = models.BooleanField(default=False)
    allow_new_registrations = models.BooleanField(default=True)
    # Payment control — set False to run free booking mode globally
    payment_enabled = models.BooleanField(
        default=False,
        help_text='Enable payment collection. False = free booking mode for all users.'
    )

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Platform Settings'
        verbose_name_plural = 'Platform Settings'

    def __str__(self):
        return f'Platform Settings (updated {self.updated_at})'

    @classmethod
    def get(cls):
        """Always return the single settings instance, creating it if needed."""
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj


class SiteTestimonial(models.Model):
    """
    Platform-level testimonials from clients and salon owners about BeautyBook CM.
    Separate from salon reviews — these are about the platform itself.
    """
    ROLE_CHOICES = [
        ('client', 'Client'),
        ('salon_owner', 'Salon Owner'),
    ]

    name = models.CharField(max_length=150, help_text="Full name of the reviewer")
    avatar = models.ImageField(
        upload_to='testimonials/avatars/',
        blank=True,
        null=True,
        help_text="Profile photo (optional)"
    )
    avatar_url = models.URLField(
        blank=True,
        default='',
        help_text="External avatar URL (used if no uploaded avatar)"
    )
    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='client',
        help_text="Whether this person is a client or salon owner"
    )
    location = models.CharField(
        max_length=100,
        blank=True,
        default='',
        help_text="City / location (e.g. Douala)"
    )
    comment = models.TextField(help_text="The testimonial text")
    rating = models.IntegerField(
        default=5,
        help_text="Rating 1-5"
    )
    is_approved = models.BooleanField(
        default=False,
        help_text="Only approved testimonials appear on the public site"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Site Testimonial'
        verbose_name_plural = 'Site Testimonials'

    def __str__(self):
        return f"Testimonial by {self.name} ({self.role}) — {self.rating}★"

    @property
    def avatar_display_url(self):
        """Return the best available avatar URL."""
        if self.avatar:
            return self.avatar.url
        return self.avatar_url or ''


class Advertisement(models.Model):
    """Model for managing video advertisements on the homepage."""
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('active', 'Active'),
        ('scheduled', 'Scheduled'),
        ('expired', 'Expired'),
        ('paused', 'Paused'),
    ]
    
    salon = models.ForeignKey(
        Salon, 
        on_delete=models.CASCADE, 
        related_name='advertisements',
        help_text='Salon associated with this advertisement'
    )
    video = models.FileField(
        upload_to='advertisements/videos/',
        validators=[FileExtensionValidator(allowed_extensions=['mp4', 'mov', 'avi', 'webm'])],
        help_text='Advertisement video file'
    )
    video_thumbnail = models.ImageField(
        upload_to='advertisements/thumbnails/',
        blank=True,
        null=True,
        help_text='Video thumbnail image'
    )
    tagline = models.CharField(
        max_length=200,
        help_text='Short catchy phrase for the advertisement'
    )
    description = models.TextField(
        blank=True,
        null=True,
        help_text='Additional description or details'
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending',
        help_text='Current status of the advertisement'
    )
    start_date = models.DateField(
        help_text='Advertisement start date'
    )
    end_date = models.DateField(
        help_text='Advertisement end date'
    )
    views = models.PositiveIntegerField(
        default=0,
        help_text='Number of times the ad has been viewed'
    )
    clicks = models.PositiveIntegerField(
        default=0,
        help_text='Number of clicks to salon page'
    )
    is_featured = models.BooleanField(
        default=False,
        help_text='Whether this ad appears in the featured carousel'
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text='Date and time when the ad was created'
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text='Date and time when the ad was last updated'
    )
    
    class Meta:
        ordering = ['-is_featured', '-created_at']
        verbose_name = 'Advertisement'
        verbose_name_plural = 'Advertisements'
        indexes = [
            models.Index(fields=['status', 'is_featured']),
            models.Index(fields=['start_date', 'end_date']),
        ]
    
    def __str__(self):
        return f"{self.salon.name} - {self.tagline}"
    
    def save(self, *args, **kwargs):
        """Auto-generate thumbnail from video if not provided."""
        # Auto-set status based on dates
        from django.utils import timezone
        today = timezone.now().date()
        
        # Only compare dates if they exist and are date objects
        if self.start_date and self.end_date:
            # Convert to date if they're strings
            if hasattr(self.start_date, 'strftime'):
                start_date = self.start_date
            else:
                try:
                    start_date = timezone.datetime.strptime(self.start_date, '%Y-%m-%d').date()
                except:
                    start_date = None
                    
            if hasattr(self.end_date, 'strftime'):
                end_date = self.end_date
            else:
                try:
                    end_date = timezone.datetime.strptime(self.end_date, '%Y-%m-%d').date()
                except:
                    end_date = None
            
            if start_date and end_date:
                if today < start_date:
                    self.status = 'scheduled'
                elif today > end_date:
                    self.status = 'expired'
                else:
                    self.status = 'active'
        
        super().save(*args, **kwargs)
    
    @property
    def video_url(self):
        """Get the full URL for the video file."""
        if self.video:
            return self.video.url
        return None
    
    @property
    def thumbnail_url(self):
        """Get the full URL for the thumbnail."""
        if self.video_thumbnail:
            return self.video_thumbnail.url
        return None
    
    @property
    def is_active(self):
        """Check if ad is currently active."""
        from django.utils import timezone
        today = timezone.now().date()
        return (
            self.status == 'active' and
            self.start_date <= today <= self.end_date
        )
    
    def increment_views(self):
        """Increment view count atomically using queryset update."""
        Advertisement.objects.filter(pk=self.pk).update(views=models.F('views') + 1)
        self.refresh_from_db(fields=['views'])
    
    def increment_clicks(self):
        """Increment click count atomically using queryset update."""
        Advertisement.objects.filter(pk=self.pk).update(clicks=models.F('clicks') + 1)
        self.refresh_from_db(fields=['clicks'])
