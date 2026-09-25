from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


class Salon(models.Model):
    """Model for beauty salon information."""

    CITY_CHOICES = [
        ('Bamenda', 'Bamenda'),
        ('Buea', 'Buea'),
        ('Douala', 'Douala'),
        ('Yaounde', 'Yaounde'),
        ('Bafoussam', 'Bafoussam'),
    ]

    owner = models.ForeignKey(
        'auth.User', null=True, blank=True,
        on_delete=models.SET_NULL, related_name='salons'
    )
    name = models.CharField(max_length=255)
    location = models.CharField(max_length=255)
    # blank=True + no validator so existing rows with old city values (e.g. Yaoundé)
    # still pass PATCH without a 400. The choices list is for display/forms only.
    city = models.CharField(max_length=50, choices=CITY_CHOICES, blank=True, default='Douala')
    description = models.TextField()
    # optional contact fields
    phone = models.CharField(max_length=20, blank=True, null=True)
    whatsapp = models.CharField(max_length=20, blank=True, null=True)
    mobile_money = models.CharField(max_length=20, blank=True, null=True)
    workers = models.CharField(
        max_length=10,
        choices=[('1-3', '1-3'), ('4-7', '4-7'), ('8-15', '8-15'), ('15+', '15+')],
        blank=True,
        null=True
    )
    image = models.ImageField(upload_to='salon_images/', null=True, blank=True)
    cover_image = models.ImageField(upload_to='salon_covers/', null=True, blank=True)
    rating = models.FloatField(
        default=0.0,
        validators=[MinValueValidator(0.0), MaxValueValidator(5.0)]
    )
    review_count = models.IntegerField(default=0)
    starting_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    commission_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=10.00,
        help_text='Commission rate charged on bookings (default 10%)'
    )
    open_hours = models.CharField(max_length=100, blank=True, default='Mon-Sat: 8AM - 7PM')
    tags = models.JSONField(default=list, blank=True)
    is_active = models.BooleanField(default=False, help_text='Set to True by admin after approval')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-rating', '-review_count']
        verbose_name = 'Salon'
        verbose_name_plural = 'Salons'

    def __str__(self):
        return self.name

    def update_rating(self):
        """Update salon rating based on reviews."""
        from reviews.models import Review
        reviews = Review.objects.filter(salon=self)
        if reviews.exists():
            avg_rating = reviews.aggregate(models.Avg('rating'))['rating__avg']
            self.rating = avg_rating or 0.0
            self.review_count = reviews.count()
            self.save()
