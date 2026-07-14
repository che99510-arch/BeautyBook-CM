from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from django_filters.rest_framework import DjangoFilterBackend
from reviews.models import Review
from reviews.serializers import ReviewSerializer


class ReviewViewSet(viewsets.ModelViewSet):
    """ViewSet for Review model."""
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['salon', 'rating']
    ordering_fields = ['rating', 'created_at']
    ordering = ['-created_at']

    def perform_create(self, serializer):
        """Set the author and auto-populate author_name from the real user profile."""
        user = self.request.user
        # Build the best display name from the user's actual profile
        full_name = f"{user.first_name} {user.last_name}".strip()
        display_name = full_name or user.username or 'Anonymous'
        serializer.save(author=user, author_name=display_name)
