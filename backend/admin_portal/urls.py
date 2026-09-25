from django.urls import path, include
from rest_framework.routers import DefaultRouter
from admin_portal.views import (
    AdminBookingViewSet,
    AdminSalonViewSet,
    AdminUserViewSet,
    AdminAnalyticsViewSet,
    AdminAdvertisementViewSet,
    ReportsViewSet,
    SiteTestimonialViewSet,
    AdminNotificationsView,
)
from admin_portal.admin_account_views import (
    AdminSetupView,
    AdminSignupView,
    ProtectedPlatformSettingsView,
    PublicAdminSettingsView,
    AdminUsersManagementView,
    AdminLoginView,
)

router = DefaultRouter()
router.register(r'bookings',       AdminBookingViewSet,           basename='admin-booking')
router.register(r'salons',         AdminSalonViewSet,             basename='admin-salon')
router.register(r'users',          AdminUserViewSet,              basename='admin-user')
router.register(r'analytics',      AdminAnalyticsViewSet,         basename='admin-analytics')
router.register(r'advertisements', AdminAdvertisementViewSet,     basename='admin-advertisement')
router.register(r'reports',        ReportsViewSet,                basename='admin-reports')
router.register(r'testimonials',   SiteTestimonialViewSet,        basename='admin-testimonials')
router.register(r'notifications',  AdminNotificationsView,        basename='admin-notifications')

# New admin account management endpoints
router.register(r'setup',           AdminSetupView,                basename='admin-setup')
router.register(r'admin_signup',    AdminSignupView,               basename='admin-signup')
router.register(r'settings',        ProtectedPlatformSettingsView, basename='admin-settings')
router.register(r'public_settings', PublicAdminSettingsView,       basename='admin-public-settings')
router.register(r'admin_users',     AdminUsersManagementView,      basename='admin-users-mgmt')
router.register(r'login',           AdminLoginView,                basename='admin-login')

from payments.urls import admin_urlpatterns as payment_admin_urls

app_name = 'admin_portal'

urlpatterns = [
    path('', include(router.urls)),
    path('payments/', include(payment_admin_urls)),
]
