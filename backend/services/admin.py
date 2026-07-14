from django.contrib import admin
from services.models import Service


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ['name', 'salon', 'category', 'price', 'is_available', 'created_at']
    list_filter = ['category', 'is_available', 'salon', 'created_at']
    search_fields = ['name', 'description', 'salon__name']
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        ('Basic Information', {
            'fields': ('salon', 'name', 'category', 'description')
        }),
        ('Service Details', {
            'fields': ('duration', 'price', 'is_available')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
