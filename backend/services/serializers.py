from rest_framework import serializers
from services.models import Service


class ServiceSerializer(serializers.ModelSerializer):
    """Serializer for Service model."""
    
    class Meta:
        model = Service
        fields = [
            'id', 'salon', 'name', 'category', 'description',
            'duration', 'price', 'is_available', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
