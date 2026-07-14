from rest_framework import viewsets, filters, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from bookings.models import Booking, CustomerNotification, SalonOwnerNotification
from bookings.serializers import (
    BookingSerializer,
    CustomerNotificationSerializer,
    SalonOwnerNotificationSerializer,
)
from bookings import notification_service as ns


class BookingViewSet(viewsets.ModelViewSet):
    """ViewSet for Booking model."""
    serializer_class = BookingSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['salon', 'status', 'booking_date', 'payment_status']
    ordering_fields = ['booking_date', 'booking_time', 'created_at']
    ordering = ['-booking_date']

    def get_queryset(self):
        if self.request.user.is_authenticated:
            return Booking.objects.filter(client=self.request.user)
        return Booking.objects.none()

    def get_permissions(self):
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        booking = serializer.save(client=self.request.user)
        # Notify salon owner about the new booking
        ns.notify_owner_new_booking(booking)

    @action(detail=False, methods=['get'])
    def my_bookings(self, request):
        """Customer: list own bookings."""
        bookings = self.get_queryset().order_by('-created_at')
        serializer = self.get_serializer(bookings, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def salon_bookings(self, request):
        """Salon owner: list all bookings for their salon."""
        from salons.models import Salon
        try:
            salon = Salon.objects.get(owner=request.user)
        except Salon.DoesNotExist:
            return Response({'error': 'You do not own a salon.'}, status=status.HTTP_403_FORBIDDEN)
        bookings = Booking.objects.filter(salon=salon).order_by('-created_at')
        serializer = self.get_serializer(bookings, many=True)
        return Response(serializer.data)

    # ── Salon owner actions ────────────────────────────────────────────────

    def _get_owner_booking(self, request, pk):
        """Helper: get booking and verify ownership."""
        try:
            booking = Booking.objects.get(pk=pk)
        except Booking.DoesNotExist:
            return None, Response({'detail': 'Booking not found.'}, status=status.HTTP_404_NOT_FOUND)
        if booking.salon.owner != request.user:
            return None, Response({'error': 'You do not own this salon booking.'}, status=status.HTTP_403_FORBIDDEN)
        return booking, None

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def confirm(self, request, pk=None):
        """Salon owner approves a pending booking → status: confirmed."""
        booking, err = self._get_owner_booking(request, pk)
        if err:
            return err
        if booking.status != 'pending':
            return Response({'error': 'Only pending bookings can be confirmed.'}, status=status.HTTP_400_BAD_REQUEST)
        booking.status = 'confirmed'
        booking.save()
        ns.notify_customer_confirmed(booking)
        return Response(self.get_serializer(booking).data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def decline(self, request, pk=None):
        """
        Salon owner declines a booking.
        Body: { decline_reason: str, decline_message?: str }
        """
        booking, err = self._get_owner_booking(request, pk)
        if err:
            return err
        if booking.status not in ('pending', 'confirmed'):
            return Response({'error': 'This booking cannot be declined.'}, status=status.HTTP_400_BAD_REQUEST)

        reason = request.data.get('decline_reason', '')
        message = request.data.get('decline_message', '')

        valid_reasons = [r[0] for r in Booking.DECLINE_REASON_CHOICES]
        if reason not in valid_reasons:
            return Response(
                {'error': f'Invalid reason. Choose from: {valid_reasons}'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if reason == 'other' and not message.strip():
            return Response({'error': 'A message is required when reason is "other".'}, status=status.HTTP_400_BAD_REQUEST)

        booking.status = 'declined'
        booking.decline_reason = reason
        booking.decline_message = message.strip() or None
        booking.save()
        ns.notify_customer_declined(booking)
        return Response(self.get_serializer(booking).data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def request_reschedule(self, request, pk=None):
        """
        Salon owner proposes a new date/time.
        Body: { reschedule_date: 'YYYY-MM-DD', reschedule_time: 'HH:MM', reschedule_message?: str }
        """
        booking, err = self._get_owner_booking(request, pk)
        if err:
            return err
        if booking.status not in ('pending', 'confirmed'):
            return Response({'error': 'This booking cannot be rescheduled.'}, status=status.HTTP_400_BAD_REQUEST)

        new_date = request.data.get('reschedule_date')
        new_time = request.data.get('reschedule_time')
        msg = request.data.get('reschedule_message', '').strip()

        if not new_date or not new_time:
            return Response({'error': 'reschedule_date and reschedule_time are required.'}, status=status.HTTP_400_BAD_REQUEST)

        from datetime import date, time as time_type
        try:
            from django.utils.dateparse import parse_date, parse_time
            parsed_date = parse_date(new_date)
            parsed_time = parse_time(new_time)
            if not parsed_date or not parsed_time:
                raise ValueError
        except (ValueError, TypeError):
            return Response({'error': 'Invalid date or time format. Use YYYY-MM-DD and HH:MM.'}, status=status.HTTP_400_BAD_REQUEST)

        booking.status = 'reschedule_requested'
        booking.reschedule_date = parsed_date
        booking.reschedule_time = parsed_time
        booking.reschedule_message = msg or None
        booking.save()
        ns.notify_customer_reschedule(booking)
        return Response(self.get_serializer(booking).data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def complete(self, request, pk=None):
        """Salon owner marks a booking as completed."""
        booking, err = self._get_owner_booking(request, pk)
        if err:
            return err
        if booking.status not in ('confirmed', 'pending'):
            return Response({'error': 'Only confirmed or pending bookings can be completed.'}, status=status.HTTP_400_BAD_REQUEST)
        booking.status = 'completed'
        booking.save()
        ns.notify_customer_completed(booking)
        return Response(self.get_serializer(booking).data)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel a booking — customer or salon owner."""
        try:
            booking = Booking.objects.get(pk=pk)
        except Booking.DoesNotExist:
            return Response({'detail': 'Booking not found.'}, status=status.HTTP_404_NOT_FOUND)

        is_client = booking.client == request.user
        is_owner = booking.salon.owner == request.user
        if not is_client and not is_owner:
            return Response({'detail': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
        if booking.status == 'completed':
            return Response({'detail': 'Cannot cancel a completed booking.'}, status=status.HTTP_400_BAD_REQUEST)

        booking.status = 'cancelled'
        booking.save()

        # If customer cancels, notify owner; if owner cancels, nothing extra for now
        if is_client:
            ns.notify_owner_booking_cancelled(booking)

        return Response(self.get_serializer(booking).data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def initiate_payment(self, request, pk=None):
        """Placeholder for payment gateway."""
        try:
            booking = Booking.objects.get(pk=pk)
        except Booking.DoesNotExist:
            return Response({'detail': 'Booking not found.'}, status=status.HTTP_404_NOT_FOUND)
        if booking.client != request.user:
            return Response({'detail': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
        if booking.payment_status == 'paid':
            return Response({'detail': 'Payment already completed.'}, status=status.HTTP_400_BAD_REQUEST)
        return Response({
            'booking_id': booking.id,
            'booking_fee': str(booking.booking_fee),
            'payment_status': booking.payment_status,
            'message': 'Payment gateway integration coming soon. Please pay at the salon.',
        })


# ── Notification ViewSets ─────────────────────────────────────────────────

class CustomerNotificationViewSet(viewsets.ViewSet):
    """
    GET  /api/notifications/customer/        — customer's notifications
    POST /api/notifications/customer/mark_read/ — mark read
    """
    permission_classes = [IsAuthenticated]

    def list(self, request):
        notifs = CustomerNotification.objects.filter(recipient=request.user)
        serializer = CustomerNotificationSerializer(notifs, many=True)
        return Response({
            'notifications': serializer.data,
            'unread_count': notifs.filter(is_read=False).count(),
        })

    @action(detail=False, methods=['post'])
    def mark_read(self, request):
        ids = request.data.get('ids', [])
        qs = CustomerNotification.objects.filter(recipient=request.user)
        if ids:
            qs = qs.filter(id__in=ids)
        qs.update(is_read=True)
        return Response({'marked': len(ids) or 'all'})


class SalonOwnerNotificationViewSet(viewsets.ViewSet):
    """
    GET  /api/notifications/salon/        — salon owner's notifications
    POST /api/notifications/salon/mark_read/ — mark read
    """
    permission_classes = [IsAuthenticated]

    def list(self, request):
        notifs = SalonOwnerNotification.objects.filter(recipient=request.user)
        serializer = SalonOwnerNotificationSerializer(notifs, many=True)
        return Response({
            'notifications': serializer.data,
            'unread_count': notifs.filter(is_read=False).count(),
        })

    @action(detail=False, methods=['post'])
    def mark_read(self, request):
        ids = request.data.get('ids', [])
        qs = SalonOwnerNotification.objects.filter(recipient=request.user)
        if ids:
            qs = qs.filter(id__in=ids)
        qs.update(is_read=True)
        return Response({'marked': len(ids) or 'all'})
