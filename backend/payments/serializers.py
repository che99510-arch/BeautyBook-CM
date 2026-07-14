from rest_framework import serializers
from payments.models import Payment


class PaymentSerializer(serializers.ModelSerializer):
    """Customer-facing payment serializer."""
    booking_id = serializers.IntegerField(source='booking.id', read_only=True)
    service_name = serializers.CharField(source='booking.service_name', read_only=True)
    booking_date = serializers.DateField(source='booking.booking_date', read_only=True)

    class Meta:
        model = Payment
        fields = [
            'id', 'booking_id', 'service_name', 'booking_date',
            'service_price', 'booking_fee', 'payment_method',
            'momo_reference', 'status', 'created_at', 'paid_at',
        ]
        read_only_fields = ['service_price', 'booking_fee', 'status', 'created_at', 'paid_at']


class AdminPaymentSerializer(serializers.ModelSerializer):
    """Admin-facing payment serializer with full details."""
    booking_id = serializers.IntegerField(source='booking.id', read_only=True)
    booking_date = serializers.DateField(source='booking.booking_date', read_only=True)
    booking_status = serializers.CharField(source='booking.status', read_only=True)
    service_name = serializers.CharField(source='booking.service_name', read_only=True)
    salon_name = serializers.CharField(source='booking.salon.name', read_only=True)
    customer_name = serializers.SerializerMethodField()
    customer_email = serializers.EmailField(source='customer.email', read_only=True)

    def get_customer_name(self, obj):
        return obj.customer.get_full_name() or obj.customer.username

    class Meta:
        model = Payment
        fields = [
            'id', 'booking_id', 'booking_date', 'booking_status',
            'service_name', 'salon_name',
            'customer_name', 'customer_email',
            'service_price', 'booking_fee',
            'payment_method', 'momo_reference',
            'status', 'created_at', 'paid_at',
        ]
        read_only_fields = fields


class PaymentStatsSerializer(serializers.Serializer):
    total_revenue = serializers.DecimalField(max_digits=15, decimal_places=2)
    today_revenue = serializers.DecimalField(max_digits=15, decimal_places=2)
    pending_payments = serializers.IntegerField()
    verified_payments = serializers.IntegerField()
    failed_payments = serializers.IntegerField()
    total_transactions = serializers.IntegerField()
