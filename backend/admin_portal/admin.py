from django.contrib import admin
from .models import Advertisement, SiteTestimonial


@admin.register(Advertisement)
class AdvertisementAdmin(admin.ModelAdmin):
    """Admin configuration for Advertisement model."""
    list_display = ['tagline', 'salon', 'status', 'is_featured', 'views', 'clicks', 'start_date', 'end_date']
    list_filter = ['status', 'is_featured', 'start_date', 'end_date']
    search_fields = ['tagline', 'description', 'salon__name']
    readonly_fields = ['views', 'clicks', 'created_at', 'updated_at', 'is_active']
    date_hierarchy = 'created_at'
    ordering = ['-is_featured', '-created_at']

    fieldsets = (
        ('Basic Information', {
            'fields': ('salon', 'tagline', 'description')
        }),
        ('Video Content', {
            'fields': ('video', 'video_thumbnail')
        }),
        ('Status & Dates', {
            'fields': ('status', 'is_featured', 'start_date', 'end_date')
        }),
        ('Analytics', {
            'fields': ('views', 'clicks'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'is_active'),
            'classes': ('collapse',)
        }),
    )


@admin.register(SiteTestimonial)
class SiteTestimonialAdmin(admin.ModelAdmin):
    """Admin configuration for SiteTestimonial model."""
    list_display = ['name', 'role', 'location', 'rating', 'is_approved', 'created_at']
    list_filter = ['is_approved', 'role', 'rating']
    search_fields = ['name', 'comment', 'location']
    readonly_fields = ['created_at', 'updated_at', 'avatar_display_url']
    ordering = ['-created_at']
    list_editable = ['is_approved']
    date_hierarchy = 'created_at'

    fieldsets = (
        ('Author', {
            'fields': ('name', 'role', 'location', 'avatar', 'avatar_url', 'avatar_display_url')
        }),
        ('Content', {
            'fields': ('comment', 'rating')
        }),
        ('Moderation', {
            'fields': ('is_approved',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
