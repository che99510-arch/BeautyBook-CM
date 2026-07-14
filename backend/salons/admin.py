from django.contrib import admin
from salons.models import Salon


@admin.register(Salon)
class SalonAdmin(admin.ModelAdmin):
    list_display = ['name', 'city', 'rating', 'review_count', 'is_active', 'created_at']
    list_filter = ['city', 'is_active', 'created_at']
    search_fields = ['name', 'location', 'description']
    readonly_fields = ['rating', 'review_count', 'created_at', 'updated_at']
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'location', 'city', 'description')
        }),
        ('Images', {
            'fields': ('image', 'cover_image')
        }),
        ('Details', {
            'fields': ('phone', 'open_hours', 'tags', 'starting_price')
        }),
        ('Rating & Reviews', {
            'fields': ('rating', 'review_count'),
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
