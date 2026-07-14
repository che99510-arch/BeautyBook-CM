from django.urls import path, include
from rest_framework.routers import DefaultRouter
from salons.views import SalonViewSet
from services.views import ServiceViewSet
from reviews.views import ReviewViewSet
from bookings.views import BookingViewSet, CustomerNotificationViewSet, SalonOwnerNotificationViewSet
from users.views import UserViewSet, UserProfileViewSet

router = DefaultRouter()
router.register(r'salons', SalonViewSet, basename='salon')
router.register(r'services', ServiceViewSet, basename='service')
router.register(r'reviews', ReviewViewSet, basename='review')
router.register(r'bookings', BookingViewSet, basename='booking')
router.register(r'users', UserViewSet, basename='user')
router.register(r'profiles', UserProfileViewSet, basename='profile')
router.register(r'notifications/customer', CustomerNotificationViewSet, basename='customer-notifications')
router.register(r'notifications/salon', SalonOwnerNotificationViewSet, basename='salon-notifications')

from payments.urls import customer_urlpatterns as payment_urls

app_name = 'api'

urlpatterns = [
    path('', include(router.urls)),
    path('admin/', include('admin_portal.urls')),
    path('payments/', include(payment_urls)),
]
