from django.urls import path, include
from rest_framework.routers import DefaultRouter
from admin_portal.views import (
    AdminBookingViewSet,
    AdminSalonViewSet,
    AdminUserViewSet,
    AdminAnalyticsViewSet,
    AdminAdvertisementViewSet,
    ReportsViewSet,
    PlatformSettingsView,
    SiteTestimonialViewSet,
    AdminNotificationsView,
)

router = DefaultRouter()
router.register(r'bookings', AdminBookingViewSet, basename='admin-booking')
router.register(r'salons', AdminSalonViewSet, basename='admin-salon')
router.register(r'users', AdminUserViewSet, basename='admin-user')
router.register(r'analytics', AdminAnalyticsViewSet, basename='admin-analytics')
router.register(r'advertisements', AdminAdvertisementViewSet, basename='admin-advertisement')
router.register(r'reports', ReportsViewSet, basename='admin-reports')
router.register(r'settings', PlatformSettingsView, basename='admin-settings')
router.register(r'testimonials', SiteTestimonialViewSet, basename='admin-testimonials')
router.register(r'notifications', AdminNotificationsView, basename='admin-notifications')

from payments.urls import admin_urlpatterns as payment_admin_urls

app_name = 'admin_portal'

urlpatterns = [
    path('', include(router.urls)),
    path('payments/', include(payment_admin_urls)),
]
