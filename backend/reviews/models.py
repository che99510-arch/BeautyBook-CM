from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.contrib.auth.models import User
from salons.models import Salon


class Review(models.Model):
    """Model for customer reviews of salons."""
    salon = models.ForeignKey(Salon, on_delete=models.CASCADE, related_name='reviews')
    author = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    author_name = models.CharField(max_length=255, default='Anonymous')
    avatar = models.URLField(default='')
    rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    comment = models.TextField()
    verified_purchase = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = ('salon', 'author')
        verbose_name = 'Review'
        verbose_name_plural = 'Reviews'

    def __str__(self):
        return f"Review by {self.author_name} for {self.salon.name}"
    
    def save(self, *args, **kwargs):
        """Update salon rating when review is saved."""
        super().save(*args, **kwargs)
        self.salon.update_rating()
