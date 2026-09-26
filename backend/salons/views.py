from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from django_filters.rest_framework import DjangoFilterBackend
from django.contrib.auth.models import User
from django.db.models import Count, Sum, Q
from django.utils import timezone
from datetime import timedelta
from salons.models import Salon
from salons.serializers import SalonSerializer
from bookings.models import Booking
from services.models import Service


def _upload_to_cloudinary(file_obj, folder, resource_type='image'):
    """Upload a file directly to Cloudinary. Returns the secure URL or None on failure."""
    import os
    cloudinary_url = os.environ.get('CLOUDINARY_URL', '')
    if not cloudinary_url:
        return None
    try:
        import cloudinary.uploader
        result = cloudinary.uploader.upload(
            file_obj,
            resource_type=resource_type,
            folder=folder,
            overwrite=True,
        )
        return result['secure_url']
    except Exception as e:
        print(f"Cloudinary upload error: {e}")
        return None


class SalonViewSet(viewsets.ModelViewSet):
    """ViewSet for Salon model."""
    queryset = Salon.objects.filter(is_active=True)
    serializer_class = SalonSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['city']
    search_fields = ['name', 'description', 'location']
    ordering_fields = ['rating', 'review_count', 'created_at', 'starting_price']
    ordering = ['-rating', '-review_count']

    def get_queryset(self):
        qs = Salon.objects.filter(is_active=True)
        search = self.request.query_params.get('search', '').strip()
        if search:
            from services.models import Service
            # Find salons whose services match the search term (name or category)
            matching_salon_ids = Service.objects.filter(
                Q(name__icontains=search) |
                Q(category__icontains=search) |
                Q(description__icontains=search)
            ).values_list('salon_id', flat=True)

            qs = qs.filter(
                Q(name__icontains=search) |
                Q(description__icontains=search) |
                Q(location__icontains=search) |
                Q(tags__icontains=search) |
                Q(id__in=matching_salon_ids)
            ).distinct()
        return qs

    @action(detail=True, methods=['get'])
    def services(self, request, pk=None):
        """Get all services for a specific salon."""
        salon = self.get_object()
        services = salon.services.all()
        from services.serializers import ServiceSerializer
        serializer = ServiceSerializer(services, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def reviews(self, request, pk=None):
        """Get all reviews for a specific salon."""
        salon = self.get_object()
        reviews = salon.reviews.all()
        from reviews.serializers import ReviewSerializer
        serializer = ReviewSerializer(reviews, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], permission_classes=[AllowAny], parser_classes=[MultiPartParser, FormParser])
    def register_owner(self, request):
        """Register a new salon owner along with their salon."""
        data = request.data
        # basic user validation
        email = data.get('email')
        password = data.get('password')
        password2 = data.get('password2')
        if not email or not password or not password2:
            return Response({'error': 'Email and password required.'}, status=status.HTTP_400_BAD_REQUEST)
        if password != password2:
            return Response({'error': 'Passwords must match.'}, status=status.HTTP_400_BAD_REQUEST)
        if User.objects.filter(email=email).exists():
            return Response({'error': 'A user with that email already exists.'}, status=status.HTTP_400_BAD_REQUEST)

        # Ensure username is unique — derive from email prefix, append number if taken
        base_username = data.get('username') or email.split('@')[0]
        # sanitise: only keep alphanumeric + underscores
        import re as _re
        base_username = _re.sub(r'[^\w]', '_', base_username)[:30] or 'user'
        username = base_username
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f'{base_username}{counter}'
            counter += 1
        user = User.objects.create_user(username=username, email=email, password=password)
        user.first_name = data.get('first_name', '')
        user.last_name = data.get('last_name', '')
        user.save()
        # mark profile
        profile = user.profile
        profile.phone = data.get('phone', '')
        profile.is_salon_owner = True
        profile.save()

        # create salon
        salon = Salon.objects.create(
            owner=user,
            name=data.get('business_name', ''),
            location=data.get('address', ''),
            city=data.get('city', ''),
            description=data.get('description', ''),
            phone=data.get('phone', ''),
            whatsapp=data.get('whatsapp', ''),
            mobile_money=data.get('mobile_money', ''),
            workers=data.get('workers', ''),
        )
        # handle images
        images = request.FILES.getlist('images')
        if images:
            url = _upload_to_cloudinary(images[0], 'salon_images')
            salon.image = url if url else images[0]
            if len(images) > 1:
                cover_url = _upload_to_cloudinary(images[1], 'salon_covers')
                salon.cover_image = cover_url if cover_url else images[1]
            salon.save()

        serializer = SalonSerializer(salon)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Get featured salons (highest rated)."""
        featured = self.queryset.order_by('-rating')[:5]
        serializer = self.get_serializer(featured, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def dashboard(self, request):
        """Get salon owner's dashboard data."""
        # Get the salon owned by the current user
        try:
            salon = Salon.objects.get(owner=request.user)
        except Salon.DoesNotExist:
            return Response(
                {'error': 'You do not own a salon.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get all bookings for this salon
        all_bookings = Booking.objects.filter(salon=salon)
        
        # Calculate stats
        total_bookings = all_bookings.count()
        
        # Calculate monthly revenue (bookings from last 30 days)
        thirty_days_ago = timezone.now() - timedelta(days=30)
        monthly_bookings = all_bookings.filter(
            created_at__gte=thirty_days_ago,
            status__in=['completed', 'confirmed']
        )
        monthly_revenue = monthly_bookings.aggregate(Sum('service_price'))['service_price__sum'] or 0
        
        # Get unique clients
        total_clients = all_bookings.values('client_email').distinct().count()
        
        # Upcoming bookings (next 7 days, sorted by date/time)
        today = timezone.now().date()
        upcoming_date = today + timedelta(days=7)
        upcoming_bookings = all_bookings.filter(
            booking_date__gte=today,
            booking_date__lte=upcoming_date
        ).order_by('booking_date', 'booking_time')[:5]
        
        # Serialize upcoming bookings
        from bookings.serializers import BookingSerializer
        bookings_serializer = BookingSerializer(upcoming_bookings, many=True)
        
        # Get services for this salon
        services = Service.objects.filter(salon=salon)
        from services.serializers import ServiceSerializer
        services_serializer = ServiceSerializer(services, many=True)
        
        # Calculate analytics
        # Bookings by status
        status_breakdown = {}
        for status_choice in ['pending', 'confirmed', 'completed', 'cancelled']:
            count = all_bookings.filter(status=status_choice).count()
            status_breakdown[status_choice] = count
        
        # Bookings by category (from services)
        category_breakdown = {}
        for service in services:
            count = all_bookings.filter(service=service).count()
            if service.category not in category_breakdown:
                category_breakdown[service.category] = 0
            category_breakdown[service.category] += count
        
        # Revenue by month (last 6 months)
        revenue_by_month = {}
        for i in range(6):
            month_start = timezone.now() - timedelta(days=30*i)
            month_end = month_start + timedelta(days=30)
            month_revenue = all_bookings.filter(
                created_at__gte=month_start,
                created_at__lte=month_end,
                status__in=['completed', 'confirmed']
            ).aggregate(Sum('service_price'))['service_price__sum'] or 0
            month_label = month_start.strftime('%B')
            revenue_by_month[month_label] = float(month_revenue)
        
        dashboard_data = {
            'salon': SalonSerializer(salon).data,
            'stats': {
                'total_bookings': total_bookings,
                'monthly_revenue': float(monthly_revenue),
                'total_clients': total_clients,
                'rating': float(salon.rating),
            },
            'upcoming_bookings': bookings_serializer.data,
            'services': services_serializer.data,
            'analytics': {
                'status_breakdown': status_breakdown,
                'category_breakdown': category_breakdown,
                'revenue_by_month': revenue_by_month,
            }
        }
        
        return Response(dashboard_data)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def analytics(self, request):
        """Get detailed analytics for salon owner."""
        try:
            salon = Salon.objects.get(owner=request.user)
        except Salon.DoesNotExist:
            return Response(
                {'error': 'You do not own a salon.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        all_bookings = Booking.objects.filter(salon=salon)
        
        # Revenue metrics
        total_revenue = all_bookings.filter(
            status__in=['completed', 'confirmed']
        ).aggregate(Sum('service_price'))['service_price__sum'] or 0
        
        thirty_days_ago = timezone.now() - timedelta(days=30)
        monthly_revenue = all_bookings.filter(
            created_at__gte=thirty_days_ago,
            status__in=['completed', 'confirmed']
        ).aggregate(Sum('service_price'))['service_price__sum'] or 0
        
        # Booking metrics
        total_bookings = all_bookings.count()
        completed_bookings = all_bookings.filter(status='completed').count()
        pending_bookings = all_bookings.filter(status='pending').count()
        cancelled_bookings = all_bookings.filter(status='cancelled').count()
        
        # Client metrics
        total_clients = all_bookings.values('client_email').distinct().count()
        repeat_clients = all_bookings.values('client_email')\
            .annotate(count=Count('id'))\
            .filter(count__gt=1).count()
        
        # Status breakdown
        status_breakdown = {
            'pending': all_bookings.filter(status='pending').count(),
            'confirmed': all_bookings.filter(status='confirmed').count(),
            'completed': all_bookings.filter(status='completed').count(),
            'cancelled': all_bookings.filter(status='cancelled').count(),
        }
        
        # Category breakdown (from services)
        services = Service.objects.filter(salon=salon)
        category_breakdown = {}
        for service in services:
            count = all_bookings.filter(service=service).count()
            if count > 0:
                if service.category not in category_breakdown:
                    category_breakdown[service.category] = 0
                category_breakdown[service.category] += count
        
        # Revenue by month (last 12 months)
        revenue_by_month = {}
        for i in range(12):
            month_date = timezone.now() - timedelta(days=30*i)
            month_start = month_date.replace(day=1)
            if i == 0:
                month_end = timezone.now()
            else:
                month_end = (month_date.replace(day=1) + timedelta(days=32)).replace(day=1) - timedelta(days=1)
            
            month_revenue = all_bookings.filter(
                created_at__gte=month_start,
                created_at__lte=month_end,
                status__in=['completed', 'confirmed']
            ).aggregate(Sum('service_price'))['service_price__sum'] or 0
            month_label = month_start.strftime('%b %Y')
            revenue_by_month[month_label] = float(month_revenue)
        
        # Top services
        top_services = []
        for service in services.order_by('-price')[:5]:
            count = all_bookings.filter(service=service).count()
            if count > 0:
                top_services.append({
                    'name': service.name,
                    'bookings': count,
                    'revenue': float(service.price * count),
                    'category': service.category,
                })
        
        analytics_data = {
            'summary': {
                'total_revenue': float(total_revenue),
                'monthly_revenue': float(monthly_revenue),
                'total_bookings': total_bookings,
                'completed_bookings': completed_bookings,
                'pending_bookings': pending_bookings,
                'cancelled_bookings': cancelled_bookings,
                'completion_rate': (completed_bookings / total_bookings * 100) if total_bookings > 0 else 0,
                'total_clients': total_clients,
                'repeat_clients': repeat_clients,
            },
            'status_breakdown': status_breakdown,
            'category_breakdown': category_breakdown,
            'revenue_by_month': revenue_by_month,
            'top_services': top_services,
        }
        
        return Response(analytics_data)

