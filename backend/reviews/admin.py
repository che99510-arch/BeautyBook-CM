from django.contrib import admin
from reviews.models import Review


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['author_name', 'salon', 'rating', 'verified_purchase', 'created_at']
    list_filter = ['rating', 'verified_purchase', 'salon', 'created_at']
    search_fields = ['author_name', 'comment', 'salon__name']
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        ('Review Information', {
            'fields': ('salon', 'author', 'author_name', 'rating')
        }),
        ('Content', {
            'fields': ('comment', 'avatar')
        }),
        ('Verification', {
            'fields': ('verified_purchase',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
