from rest_framework import serializers
from reviews.models import Review


class ReviewSerializer(serializers.ModelSerializer):
    """Serializer for Review model."""

    # Computed display name: prefer full name > username > author_name fallback
    display_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Review
        fields = [
            'id', 'salon', 'author', 'author_name', 'display_name',
            'avatar', 'rating', 'comment', 'verified_purchase',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'author', 'display_name']

    def get_display_name(self, obj) -> str:
        """Return the best available human-readable name for the reviewer."""
        if obj.author:
            full = f"{obj.author.first_name} {obj.author.last_name}".strip()
            if full:
                return full
            if obj.author.username:
                return obj.author.username
        return obj.author_name or 'Anonymous'
