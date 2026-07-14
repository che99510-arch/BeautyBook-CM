from django.contrib import admin
from bookings.models import Booking


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = [
        'client_name', 'service_name', 'salon', 'booking_date', 
        'booking_time', 'status', 'service_price', 'booking_fee', 'payment_status'
    ]
    list_filter = ['status', 'payment_status', 'booking_date', 'salon', 'created_at']
    search_fields = ['client_name', 'client_email', 'service_name', 'salon__name']
    readonly_fields = ['created_at', 'updated_at', 'booking_fee', 'amount_due_at_salon']
    fieldsets = (
        ('Client Information', {
            'fields': ('client', 'client_name', 'client_email', 'client_phone')
        }),
        ('Service Details', {
            'fields': ('salon', 'service', 'service_name', 'service_price')
        }),
        ('Booking Details', {
            'fields': ('booking_date', 'booking_time', 'status', 'notes')
        }),
        ('Payment Information', {
            'fields': ('booking_fee', 'amount_due_at_salon', 'payment_status', 'payment_reference'),
            'description': 'Booking fee is calculated automatically based on salon commission rate'
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
