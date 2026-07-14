from django.contrib import admin
from users.models import UserProfile


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'is_salon_owner', 'is_stylist', 'city', 'created_at']
    list_filter = ['is_salon_owner', 'is_stylist', 'city', 'created_at']
    search_fields = ['user__username', 'user__email', 'phone', 'address']
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        ('User', {
            'fields': ('user',)
        }),
        ('Profile Information', {
            'fields': ('avatar', 'bio', 'phone', 'address', 'city')
        }),
        ('Roles', {
            'fields': ('is_salon_owner', 'is_stylist')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
