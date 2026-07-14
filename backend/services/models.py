from django.db import models
from salons.models import Salon


class Service(models.Model):
    """Model for beauty services offered by salons."""
    CATEGORY_CHOICES = [
        ('Hair', 'Hair'),
        ('Nails', 'Nails'),
        ('Makeup', 'Makeup'),
        ('Massage', 'Massage'),
    ]

    salon = models.ForeignKey(Salon, on_delete=models.CASCADE, related_name='services')
    name = models.CharField(max_length=255)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    description = models.TextField()
    duration = models.CharField(max_length=50)  # e.g., "2-3 hours"
    price = models.DecimalField(max_digits=10, decimal_places=2)
    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['category', 'name']
        verbose_name = 'Service'
        verbose_name_plural = 'Services'

    def __str__(self):
        return f"{self.name} - {self.salon.name}"
