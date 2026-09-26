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


def _field_url(field, request):
    """Safely get URL from an ImageField/FileField that may store a full URL."""
    if not field:
        return None
    name = str(field.name) if hasattr(field, 'name') else str(field)
    if name.startswith('http://') or name.startswith('https://'):
        return name
    try:
        return _abs_url(request, field.url)
    except Exception:
        return _abs_url(request, f"/media/{name}")


class SalonSerializer(serializers.ModelSerializer):
    """Serializer for Salon model."""
    owner = serializers.PrimaryKeyRelatedField(read_only=True)
    city = serializers.CharField(max_length=50, required=False, allow_blank=True, default='Douala')
    image = serializers.SerializerMethodField()
    cover_image = serializers.SerializerMethodField()

    def get_image(self, obj):
        return _field_url(obj.image, self.context.get('request'))

    def get_cover_image(self, obj):
        return _field_url(obj.cover_image, self.context.get('request'))

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
