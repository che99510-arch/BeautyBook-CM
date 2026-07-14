from django.urls import path
from payments.views import (
    create_payment,
    AdminPaymentListView,
    AdminPaymentDetailView,
    AdminPaymentActionView,
    AdminPaymentStatsView,
)

# Customer URLs  →  /api/payments/...
customer_urlpatterns = [
    path('create/<int:booking_id>/', create_payment, name='payment-create'),
]

# Admin URLs  →  /api/admin/payments/...
admin_urlpatterns = [
    path('', AdminPaymentListView.as_view(), name='admin-payment-list'),
    path('stats/', AdminPaymentStatsView.as_view(), name='admin-payment-stats'),
    path('<int:pk>/', AdminPaymentDetailView.as_view(), name='admin-payment-detail'),
    path('<int:pk>/<str:action>/', AdminPaymentActionView.as_view(), name='admin-payment-action'),
]
