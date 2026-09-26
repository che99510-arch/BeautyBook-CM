from rest_framework import serializers
from django.contrib.auth.models import User
from users.models import UserProfile
import os


def _field_url(field, request=None):
    """Safely get URL from an ImageField that may store a full Cloudinary URL."""
    if not field:
        return None
    name = str(field.name) if hasattr(field, 'name') else str(field)
    if name.startswith('http://') or name.startswith('https://'):
        return name
    try:
        url = field.url
        if url.startswith('http'):
            return url
        if request:
            return request.build_absolute_uri(url)
        base = os.environ.get('BACKEND_URL', '').rstrip('/')
        return f"{base}{url}" if base else url
    except Exception:
        return None


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for UserProfile model."""
    is_in_free_period = serializers.BooleanField(read_only=True)
    avatar = serializers.SerializerMethodField()

    def get_avatar(self, obj):
        return _field_url(obj.avatar, self.context.get('request'))

    class Meta:
        model = UserProfile
        fields = [
            'id', 'avatar', 'bio', 'phone', 'address', 'city',
            'is_salon_owner', 'is_stylist', 'is_in_free_period',
            'free_booking_until', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'is_in_free_period', 'free_booking_until']


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model."""
    profile = UserProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'is_active', 'is_superuser', 'is_staff', 'date_joined', 'profile'
        ]
        read_only_fields = ['id', 'date_joined']


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""
    password = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2', 'first_name', 'last_name']

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({'password': 'Passwords must match.'})
        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user
