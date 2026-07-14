from django.utils import timezone
from django.db.models import Sum, Q
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from rest_framework.generics import ListAPIView, RetrieveAPIView

from bookings.models import Booking
from payments.models import Payment
from payments.serializers import PaymentSerializer, AdminPaymentSerializer, PaymentStatsSerializer
from payments.utils import calculate_booking_fee
from admin_portal.permissions import IsAdmin


# ─── Customer endpoint ────────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_payment(request, booking_id):
    """Create a payment record for a booking (customer only)."""
    try:
        booking = Booking.objects.select_related('salon', 'service').get(
            id=booking_id, client=request.user
        )
    except Booking.DoesNotExist:
        return Response({'error': 'Booking not found.'}, status=status.HTTP_404_NOT_FOUND)

    if hasattr(booking, 'payment'):
        return Response(
            PaymentSerializer(booking.payment).data,
            status=status.HTTP_200_OK
        )

    fee = calculate_booking_fee(booking.service_price)

    payment = Payment.objects.create(
        booking=booking,
        customer=request.user,
        service_price=booking.service_price,
        booking_fee=fee,
    )

    return Response({
        'booking_id': booking.id,
        'service_price': str(payment.service_price),
        'booking_fee': str(payment.booking_fee),
        'payment_status': payment.status,
    }, status=status.HTTP_201_CREATED)


# ─── Admin endpoints ───────────────────────────────────────────────────────────

class AdminPaymentListView(ListAPIView):
    """GET /api/admin/payments/ — list all payments with filters."""
    serializer_class = AdminPaymentSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['status', 'payment_method']
    ordering_fields = ['created_at', 'paid_at', 'booking_fee']
    ordering = ['-created_at']

    def get_queryset(self):
        qs = Payment.objects.select_related(
            'booking', 'booking__salon', 'booking__service', 'customer'
        )
        # filter by date
        date = self.request.query_params.get('date')
        if date:
            qs = qs.filter(created_at__date=date)
        # filter by salon
        salon_id = self.request.query_params.get('salon')
        if salon_id:
            qs = qs.filter(booking__salon_id=salon_id)
        # filter by customer
        customer_id = self.request.query_params.get('customer')
        if customer_id:
            qs = qs.filter(customer_id=customer_id)
        return qs


class AdminPaymentDetailView(RetrieveAPIView):
    """GET /api/admin/payments/{id}/ — payment details."""
    serializer_class = AdminPaymentSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    queryset = Payment.objects.select_related(
        'booking', 'booking__salon', 'booking__service', 'customer'
    )


class AdminPaymentActionView(APIView):
    """PATCH /api/admin/payments/{id}/{action}/ — verify / mark-paid / fail."""
    permission_classes = [IsAuthenticated, IsAdmin]

    def patch(self, request, pk, action):
        try:
            payment = Payment.objects.select_related('booking').get(pk=pk)
        except Payment.DoesNotExist:
            return Response({'error': 'Payment not found.'}, status=status.HTTP_404_NOT_FOUND)

        if action == 'verify':
            payment.status = 'verified'
            payment.booking.status = 'confirmed'
            payment.booking.save()
        elif action == 'mark-paid':
            payment.status = 'paid'
            payment.paid_at = timezone.now()
        elif action == 'fail':
            payment.status = 'failed'
        else:
            return Response({'error': 'Invalid action.'}, status=status.HTTP_400_BAD_REQUEST)

        payment.save()
        return Response(AdminPaymentSerializer(payment).data)


class AdminPaymentStatsView(APIView):
    """GET /api/admin/payments/stats/ — revenue & transaction stats."""
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        today = timezone.now().date()
        qs = Payment.objects.all()

        total_revenue = qs.filter(
            status__in=['paid', 'verified']
        ).aggregate(total=Sum('booking_fee'))['total'] or 0

        today_revenue = qs.filter(
            status__in=['paid', 'verified'], created_at__date=today
        ).aggregate(total=Sum('booking_fee'))['total'] or 0

        data = {
            'total_revenue': total_revenue,
            'today_revenue': today_revenue,
            'pending_payments': qs.filter(status='pending').count(),
            'verified_payments': qs.filter(status='verified').count(),
            'failed_payments': qs.filter(status='failed').count(),
            'total_transactions': qs.count(),
        }
        return Response(PaymentStatsSerializer(data).data)
