from rest_framework import serializers
from salons.models import Salon
import os


def _abs_url(request, path):
    """Return absolute URL for a media path."""
    if not path:
        return None
    s = str(path)
    if s.startswith('http'):
        return s
    if request:
        return request.build_absolute_uri(s)
    base = os.environ.get('BACKEND_URL', '').rstrip('/')
    return f"{base}{s}" if base else s


class SalonSerializer(serializers.ModelSerializer):
    """Serializer for Salon model."""
    owner = serializers.PrimaryKeyRelatedField(read_only=True)
    city = serializers.CharField(max_length=50, required=False, allow_blank=True, default='Douala')
    image = serializers.SerializerMethodField()
    cover_image = serializers.SerializerMethodField()

    def get_image(self, obj):
        return _abs_url(self.context.get('request'), obj.image.url if obj.image else None)

    def get_cover_image(self, obj):
        return _abs_url(self.context.get('request'), obj.cover_image.url if obj.cover_image else None)

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
