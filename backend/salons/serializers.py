from rest_framework import serializers
from salons.models import Salon


class SalonSerializer(serializers.ModelSerializer):
    """Serializer for Salon model."""
    owner = serializers.PrimaryKeyRelatedField(read_only=True)

    # Override city to be a plain CharField so old values (e.g. Yaoundé) pass through
    city = serializers.CharField(max_length=50, required=False, allow_blank=True, default='Douala')

    class Meta:
        model = Salon
        fields = [
            'id', 'owner', 'name', 'location', 'city', 'description',
            'phone', 'whatsapp', 'mobile_money', 'workers',
            'image', 'cover_image', 'rating', 'review_count',
            'starting_price', 'open_hours', 'tags',
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'rating', 'review_count', 'owner']
