from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from services.models import Service
from services.serializers import ServiceSerializer


class ServiceViewSet(viewsets.ModelViewSet):
    """ViewSet for Service model."""
    queryset = Service.objects.filter(is_available=True)
    serializer_class = ServiceSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['salon', 'category']
    search_fields = ['name', 'description']
    ordering_fields = ['price', 'created_at']
    ordering = ['price']

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_services(self, request):
        """Get all services for the authenticated salon owner's salon."""
        from salons.models import Salon
        try:
            salon = Salon.objects.get(owner=request.user)
        except Salon.DoesNotExist:
            return Response(
                {'error': 'You do not own a salon.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        services = Service.objects.filter(salon=salon).order_by('category', 'name')
        serializer = self.get_serializer(services, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def create_service(self, request):
        """Create a new service for the authenticated salon owner's salon."""
        from salons.models import Salon
        try:
            salon = Salon.objects.get(owner=request.user)
        except Salon.DoesNotExist:
            return Response(
                {'error': 'You do not own a salon.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        data = request.data.copy()
        data['salon'] = salon.id
        
        serializer = self.get_serializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['put', 'patch'], permission_classes=[IsAuthenticated])
    def update_service(self, request, pk=None):
        """Update a service belonging to the authenticated salon owner."""
        service = self.get_object()
        
        if service.salon.owner != request.user:
            return Response(
                {'error': 'You do not own this service.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = self.get_serializer(service, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['delete'], permission_classes=[IsAuthenticated])
    def delete_service(self, request, pk=None):
        """Delete a service belonging to the authenticated salon owner."""
        service = self.get_object()
        
        if service.salon.owner != request.user:
            return Response(
                {'error': 'You do not own this service.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        service.delete()
        return Response({'success': 'Service deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)
