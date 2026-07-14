from rest_framework import serializers
from bookings.models import Booking, CustomerNotification, SalonOwnerNotification
from salons.models import Salon
from services.models import Service


class BookingSerializer(serializers.ModelSerializer):
    """Serializer for Booking model."""
    salon_name = serializers.CharField(source='salon.name', read_only=True)
    service_price_display = serializers.DecimalField(
        source='service_price', max_digits=10, decimal_places=2, read_only=True
    )
    booking_fee_display = serializers.DecimalField(
        source='booking_fee', max_digits=10, decimal_places=2, read_only=True
    )
    amount_due_at_salon_display = serializers.DecimalField(
        source='amount_due_at_salon', max_digits=10, decimal_places=2, read_only=True
    )

    class Meta:
        model = Booking
        fields = [
            'id', 'client', 'client_name', 'client_email', 'client_phone',
            'salon', 'salon_name', 'service', 'service_name',
            'booking_date', 'booking_time', 'status', 'notes',
            'service_price', 'service_price_display',
            'booking_fee', 'booking_fee_display',
            'amount_due_at_salon', 'amount_due_at_salon_display',
            'payment_status', 'payment_reference', 'payment_required',
            # New workflow fields
            'decline_reason', 'decline_message',
            'reschedule_date', 'reschedule_time', 'reschedule_message',
            'created_at', 'updated_at',
        ]
        read_only_fields = [
            'client', 'booking_fee', 'amount_due_at_salon',
            'payment_status', 'payment_reference', 'payment_required',
            'created_at', 'updated_at',
        ]

    def validate(self, data):
        if not data.get('service'):
            raise serializers.ValidationError({'service': 'Service is required'})
        service = data['service']
        if not service.is_available:
            raise serializers.ValidationError({'service': 'This service is no longer available'})
        salon = service.salon
        if not salon.is_active:
            raise serializers.ValidationError({'salon': 'This salon is no longer active'})
        return data

    def create(self, validated_data):
        from admin_portal.models import PlatformSettings
        service = validated_data['service']
        salon = service.salon
        validated_data['service_price'] = service.price
        validated_data['booking_fee'] = service.price * (salon.commission_rate / 100)
        validated_data['amount_due_at_salon'] = service.price
        validated_data['payment_status'] = 'pending'
        validated_data['service_name'] = service.name
        validated_data['salon'] = salon
        request = self.context.get('request')
        user = request.user if request and request.user.is_authenticated else None
        if user:
            validated_data['client'] = user
        settings = PlatformSettings.get()
        in_free_period = user and hasattr(user, 'profile') and user.profile.is_in_free_period
        validated_data['payment_required'] = settings.payment_enabled and not in_free_period
        return Booking.objects.create(**validated_data)


class CustomerNotificationSerializer(serializers.ModelSerializer):
    booking_detail = serializers.SerializerMethodField()

    class Meta:
        model = CustomerNotification
        fields = [
            'id', 'notification_type', 'title', 'message',
            'is_read', 'created_at', 'booking_detail',
        ]
        read_only_fields = ['created_at']

    def get_booking_detail(self, obj):
        if not obj.booking:
            return None
        b = obj.booking
        return {
            'id': b.id,
            'salon_name': b.salon.name if b.salon else '',
            'service_name': b.service_name,
            'booking_date': str(b.booking_date),
            'booking_time': str(b.booking_time)[:5],
            'status': b.status,
        }


class SalonOwnerNotificationSerializer(serializers.ModelSerializer):
    booking_detail = serializers.SerializerMethodField()

    class Meta:
        model = SalonOwnerNotification
        fields = [
            'id', 'notification_type', 'title', 'message',
            'is_read', 'created_at', 'booking_detail',
        ]
        read_only_fields = ['created_at']

    def get_booking_detail(self, obj):
        if not obj.booking:
            return None
        b = obj.booking
        return {
            'id': b.id,
            'client_name': b.client_name,
            'client_email': b.client_email or '',
            'service_name': b.service_name,
            'booking_date': str(b.booking_date),
            'booking_time': str(b.booking_time)[:5],
            'status': b.status,
        }
