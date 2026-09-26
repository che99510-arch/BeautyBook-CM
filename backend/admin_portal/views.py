from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.contrib.auth.models import User
from django.db.models import Sum, Count, Q, F
from django.utils import timezone
from datetime import timedelta, datetime

from bookings.models import Booking
from salons.models import Salon
from services.models import Service
from users.models import UserProfile

from admin_portal.permissions import IsAdmin
from admin_portal.serializers import (
    AdminUserSerializer, AdminSalonSerializer, AdminBookingSerializer,
    AdminDashboardSerializer, AdminRevenueSerializer, AdminAdvertisementSerializer,
    PlatformSettingsSerializer, SiteTestimonialSerializer,
)
from admin_portal.models import Advertisement, PlatformSettings, SiteTestimonial


class AdminBookingViewSet(viewsets.ModelViewSet):
    """
    Admin viewset for managing all bookings.
    Only admin users can access these endpoints.
    """
    queryset = Booking.objects.select_related('client', 'salon', 'service').all()
    serializer_class = AdminBookingSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'salon', 'client', 'service']
    search_fields = ['client__first_name', 'client__last_name', 'client__email', 'salon__name', 'service__name']
    ordering_fields = ['created_at', 'appointment_date', 'status']
    ordering = ['-created_at']

    def get_queryset(self):
        """Get bookings with related user, salon, and service data."""
        return Booking.objects.select_related('client', 'salon', 'service').all()

    def update(self, request, *args, **kwargs):
        """Admin updates booking details."""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        """Admin deletes a booking."""
        instance = self.get_object()
        user_name = f"{instance.user.first_name} {instance.user.last_name}"
        instance.delete()
        return Response({'message': f'Booking for "{user_name}" deleted successfully'})

    @action(detail=True, methods=['patch'])
    def approve(self, request, pk=None):
        """Admin approves a booking."""
        booking = self.get_object()
        booking.status = 'confirmed'
        booking.save()
        serializer = self.get_serializer(booking)
        return Response(serializer.data)

    @action(detail=True, methods=['patch'])
    def reject(self, request, pk=None):
        """Admin rejects a booking."""
        booking = self.get_object()
        booking.status = 'cancelled'
        booking.save()
        serializer = self.get_serializer(booking)
        return Response(serializer.data)

    @action(detail=True, methods=['patch'])
    def cancel(self, request, pk=None):
        """Admin cancels a booking."""
        booking = self.get_object()
        if booking.status == 'completed':
            return Response(
                {'error': 'Cannot cancel a completed booking.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        booking.status = 'cancelled'
        booking.save()
        serializer = self.get_serializer(booking)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get booking statistics."""
        queryset = self.get_queryset()

        stats = {
            'total_bookings': queryset.count(),
            'pending': queryset.filter(status='pending').count(),
            'confirmed': queryset.filter(status='confirmed').count(),
            'completed': queryset.filter(status='completed').count(),
            'cancelled': queryset.filter(status='cancelled').count(),
            'total_revenue': queryset.filter(
                status__in=['completed', 'confirmed']
            ).aggregate(total=Sum('service_price'))['total'] or 0,
            'total_booking_fees': queryset.filter(
                status__in=['completed', 'confirmed']
            ).aggregate(total=Sum('booking_fee'))['total'] or 0,
        }

        return Response(stats)


class AdminSalonViewSet(viewsets.ModelViewSet):
    """
    Admin viewset for managing salons.
    Only admin users can access these endpoints.
    """
    queryset = Salon.objects.select_related('owner').all()
    serializer_class = AdminSalonSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['city', 'is_active']
    search_fields = ['name', 'location', 'description']
    ordering_fields = ['rating', 'review_count', 'created_at', 'starting_price']
    ordering = ['-rating']

    def get_queryset(self):
        """Get all salons with related data."""
        return Salon.objects.select_related('owner').all()

    def update(self, request, *args, **kwargs):
        """Admin updates salon details."""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        """Admin deletes a salon."""
        instance = self.get_object()
        instance.delete()
        return Response({'message': f'Salon "{instance.name}" deleted successfully'})

    @action(detail=True, methods=['patch'])
    def approve(self, request, pk=None):
        """Admin approves a salon."""
        salon = self.get_object()
        salon.is_active = True
        salon.save()
        serializer = self.get_serializer(salon)
        return Response(serializer.data)

    @action(detail=True, methods=['patch'])
    def suspend(self, request, pk=None):
        """Admin suspends a salon."""
        salon = self.get_object()
        salon.is_active = False
        salon.save()
        serializer = self.get_serializer(salon)
        return Response(serializer.data)

    @action(detail=True, methods=['patch'])
    def feature(self, request, pk=None):
        """Admin marks a salon as featured (increases rating temporarily)."""
        salon = self.get_object()
        # Add featured tag if not present
        if 'Featured' not in salon.tags:
            salon.tags.append('Featured')
            salon.save()
        serializer = self.get_serializer(salon)
        return Response(serializer.data)


class AdminUserViewSet(viewsets.ModelViewSet):
    """
    Admin viewset for managing users.
    Only admin users can access these endpoints.
    """
    queryset = User.objects.select_related('profile').all()
    serializer_class = AdminUserSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['is_active']
    search_fields = ['username', 'email', 'first_name', 'last_name']
    ordering_fields = ['date_joined', 'username']
    ordering = ['-date_joined']

    def get_queryset(self):
        """Get only regular customers (not salon owners or admins)."""
        queryset = User.objects.select_related('profile').filter(
            profile__is_salon_owner=False,
            profile__is_admin=False
        )
        
        # Allow filtering by user type via query parameter
        user_type = self.request.query_params.get('user_type', 'customer')
        
        if user_type == 'all':
            # Return all users
            return User.objects.select_related('profile').all()
        elif user_type == 'salon_owners':
            # Return only salon owners
            queryset = User.objects.select_related('profile').filter(profile__is_salon_owner=True)
        elif user_type == 'admins':
            # Return only admins
            queryset = User.objects.select_related('profile').filter(profile__is_admin=True)
        # Default: return only customers
        
        return queryset

    def update(self, request, *args, **kwargs):
        """Admin updates user details."""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        """Admin deletes a user."""
        instance = self.get_object()
        username = instance.username
        instance.delete()
        return Response({'message': f'User "{username}" deleted successfully'})

    @action(detail=True, methods=['patch'])
    def suspend(self, request, pk=None):
        """Admin suspends a user."""
        user = self.get_object()
        user.is_active = False
        user.save()
        serializer = self.get_serializer(user)
        return Response(serializer.data)

    @action(detail=True, methods=['patch'])
    def activate(self, request, pk=None):
        """Admin activates a suspended user."""
        user = self.get_object()
        user.is_active = True
        user.save()
        serializer = self.get_serializer(user)
        return Response(serializer.data)

    @action(detail=True, methods=['patch'])
    def make_admin(self, request, pk=None):
        """Admin grants admin privileges to a user."""
        user = self.get_object()
        user.profile.is_admin = True
        user.profile.save()
        serializer = self.get_serializer(user)
        return Response(serializer.data)


class AdminAnalyticsViewSet(viewsets.ViewSet):
    """
    Admin viewset for analytics and dashboard data.
    Only admin users can access these endpoints.
    """
    permission_classes = [IsAuthenticated, IsAdmin]

    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        """
        Get comprehensive dashboard analytics.
        Returns summary stats, booking stats, payment stats, and growth metrics.
        """
        # Get current month date range
        now = timezone.now()
        month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        # Total counts
        total_customers = User.objects.filter(profile__is_salon_owner=False).count()
        total_salons = Salon.objects.count()
        total_bookings = Booking.objects.count()
        
        # Revenue calculations (from booking fees only)
        revenue_data = Booking.objects.filter(
            status__in=['completed', 'confirmed']
        ).aggregate(
            total_revenue=Sum('service_price'),
            total_booking_fees=Sum('booking_fee')
        )
        
        total_revenue = revenue_data['total_revenue'] or 0
        total_booking_fees = revenue_data['total_booking_fees'] or 0
        
        # Booking status breakdown
        pending_bookings = Booking.objects.filter(status='pending').count()
        confirmed_bookings = Booking.objects.filter(status='confirmed').count()
        completed_bookings = Booking.objects.filter(status='completed').count()
        cancelled_bookings = Booking.objects.filter(status='cancelled').count()
        
        # Payment status breakdown
        pending_payments = Booking.objects.filter(payment_status='pending').count()
        paid_payments = Booking.objects.filter(payment_status='paid').count()
        failed_payments = Booking.objects.filter(payment_status='failed').count()
        
        # Growth metrics (this month)
        new_customers_this_month = User.objects.filter(
            profile__is_salon_owner=False,
            date_joined__gte=month_start
        ).count()
        
        new_salons_this_month = Salon.objects.filter(
            created_at__gte=month_start
        ).count()
        
        bookings_this_month = Booking.objects.filter(
            created_at__gte=month_start
        ).count()
        
        revenue_this_month = Booking.objects.filter(
            status__in=['completed', 'confirmed'],
            created_at__gte=month_start
        ).aggregate(total=Sum('booking_fee'))['total'] or 0
        
        dashboard_data = {
            'summary': {
                'total_customers': total_customers,
                'total_salons': total_salons,
                'total_bookings': total_bookings,
                'total_revenue': float(total_revenue),
                'total_booking_fees': float(total_booking_fees),
            },
            'booking_stats': {
                'pending_bookings': pending_bookings,
                'confirmed_bookings': confirmed_bookings,
                'completed_bookings': completed_bookings,
                'cancelled_bookings': cancelled_bookings,
            },
            'payment_stats': {
                'pending_payments': pending_payments,
                'paid_payments': paid_payments,
                'failed_payments': failed_payments,
            },
            'growth_metrics': {
                'new_customers_this_month': new_customers_this_month,
                'new_salons_this_month': new_salons_this_month,
                'bookings_this_month': bookings_this_month,
                'revenue_this_month': float(revenue_this_month),
            }
        }
        
        return Response(dashboard_data)

    @action(detail=False, methods=['get'])
    def revenue(self, request):
        """
        Get revenue analytics (booking fees only).
        """
        # Get query parameters
        period = request.query_params.get('period', 'all')  # all, month, week, year
        
        # Calculate date range
        now = timezone.now()
        if period == 'week':
            start_date = now - timedelta(days=7)
        elif period == 'month':
            start_date = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        elif period == 'year':
            start_date = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
        else:
            start_date = None
        
        # Filter bookings
        bookings = Booking.objects.filter(status__in=['completed', 'confirmed'])
        if start_date:
            bookings = bookings.filter(created_at__gte=start_date)
        
        # Calculate revenue
        revenue_data = bookings.aggregate(
            total_revenue=Sum('service_price'),
            total_booking_fees=Sum('booking_fee'),
            total_bookings=Count('id')
        )
        
        total_revenue = revenue_data['total_revenue'] or 0
        total_booking_fees = revenue_data['total_booking_fees'] or 0
        total_bookings = revenue_data['total_bookings'] or 0
        
        # Calculate average
        average_booking_value = total_revenue / total_bookings if total_bookings > 0 else 0
        
        revenue_data = {
            'total_revenue': float(total_revenue),
            'total_booking_fees': float(total_booking_fees),
            'total_bookings': total_bookings,
            'average_booking_value': float(average_booking_value),
            'period': period,
        }
        
        return Response(revenue_data)

    @action(detail=False, methods=['get'])
    def revenue_by_salon(self, request):
        """
        Get revenue breakdown by salon (booking fees only).
        """
        salons = Salon.objects.annotate(
            total_bookings=Count('bookings', filter=Q(bookings__status__in=['completed', 'confirmed'])),
            total_revenue=Sum('bookings__service_price', filter=Q(bookings__status__in=['completed', 'confirmed'])),
            total_booking_fees=Sum('bookings__booking_fee', filter=Q(bookings__status__in=['completed', 'confirmed']))
        ).order_by('-total_revenue')
        
        revenue_by_salon = []
        for salon in salons:
            revenue_by_salon.append({
                'salon_id': salon.id,
                'salon_name': salon.name,
                'total_bookings': salon.total_bookings or 0,
                'total_revenue': float(salon.total_revenue or 0),
                'total_booking_fees': float(salon.total_booking_fees or 0),
            })
        
        return Response(revenue_by_salon)

    @action(detail=False, methods=['get'])
    def revenue_by_date(self, request):
        """
        Get revenue over time (daily for last 30 days).
        """
        days = int(request.query_params.get('days', 30))
        start_date = timezone.now() - timedelta(days=days)
        
        # Get bookings in date range
        bookings = Booking.objects.filter(
            status__in=['completed', 'confirmed'],
            created_at__gte=start_date
        )
        
        # Group by date
        revenue_by_date = []
        for i in range(days):
            date = start_date + timedelta(days=i)
            date_str = date.strftime('%Y-%m-%d')
            
            day_bookings = bookings.filter(
                created_at__date=date.date()
            ).aggregate(
                total=Sum('booking_fee')
            )['total'] or 0
            
            revenue_by_date.append({
                'date': date_str,
                'revenue': float(day_bookings),
                'bookings': bookings.filter(created_at__date=date.date()).count(),
            })
        
        return Response(revenue_by_date)

    @action(detail=False, methods=['get'])
    def top_services(self, request):
        """
        Get top services by bookings and revenue.
        """
        limit = int(request.query_params.get('limit', 10))
        
        services = Service.objects.annotate(
            total_bookings=Count('bookings', filter=Q(bookings__status__in=['completed', 'confirmed'])),
            total_revenue=Sum('bookings__service_price', filter=Q(bookings__status__in=['completed', 'confirmed']))
        ).order_by('-total_bookings')[:limit]
        
        top_services = []
        for service in services:
            top_services.append({
                'service_id': service.id,
                'service_name': service.name,
                'category': service.category,
                'total_bookings': service.total_bookings or 0,
                'total_revenue': float(service.total_revenue or 0),
            })
        
        return Response(top_services)

class ReportsViewSet(viewsets.ViewSet):
    """
    Reports viewset for generating comprehensive analytics reports.
    Only admin users can access these endpoints.
    """
    permission_classes = [IsAuthenticated, IsAdmin]

    def list(self, request):
        """Return available report endpoints."""
        return Response({
            'available_reports': {
                'overview': '/api/admin/reports/overview/',
                'revenue': '/api/admin/reports/revenue/',
                'bookings': '/api/admin/reports/bookings/',
                'salons': '/api/admin/reports/salons/',
                'export': '/api/admin/reports/export/',
            }
        })

    @action(detail=False, methods=['get'])
    def overview(self, request):
        """Get comprehensive platform overview."""
        from django.utils import timezone
        from django.db.models import Sum, Count, Avg
        from datetime import timedelta
        
        # Date range calculations
        today = timezone.now().date()
        last_month = today - timedelta(days=30)
        
        # Overall stats
        total_users = User.objects.count()
        total_salons = Salon.objects.count()
        total_services = Service.objects.count()
        total_bookings = Booking.objects.count()
        total_revenue = Booking.objects.filter(
            status__in=['completed', 'confirmed']
        ).aggregate(total=Sum('service_price'))['total'] or 0
        
        # User stats
        from django.utils import timezone
        last_month = timezone.now() - timedelta(days=30)
        new_users_this_month = User.objects.filter(date_joined__gte=last_month).count()
        active_users = User.objects.filter(is_active=True).count()
        
        # Salon stats
        active_salons = Salon.objects.filter(is_active=True).count()
        
        # Booking stats
        bookings_this_month = Booking.objects.filter(created_at__date__gte=last_month).count()
        completed_bookings = Booking.objects.filter(status='completed').count()
        
        return Response({
            'overview': {
                'total_users': total_users,
                'active_users': active_users,
                'new_users_this_month': new_users_this_month,
                'total_salons': total_salons,
                'active_salons': active_salons,
                'total_services': total_services,
                'total_bookings': total_bookings,
                'bookings_this_month': bookings_this_month,
                'completed_bookings': completed_bookings,
                'total_revenue': float(total_revenue),
                'average_booking_value': float(total_revenue / completed_bookings) if completed_bookings > 0 else 0,
            }
        })

    @action(detail=False, methods=['get'])
    def revenue(self, request):
        """Get revenue analytics with date filtering."""
        from django.db.models import Sum
        from django.utils import timezone
        from datetime import timedelta
        
        # Get date range from query params
        period = request.query_params.get('period', 'monthly')
        today = timezone.now().date()
        
        # Calculate date range based on period
        if period == 'daily':
            start_date = today
            end_date = today
        elif period == 'weekly':
            start_date = today - timedelta(days=7)
            end_date = today
        elif period == 'monthly':
            start_date = today - timedelta(days=30)
            end_date = today
        elif period == 'quarterly':
            start_date = today - timedelta(days=90)
            end_date = today
        elif period == 'yearly':
            start_date = today - timedelta(days=365)
            end_date = today
        else:
            start_date = today - timedelta(days=30)
            end_date = today
        
        # Get revenue data
        bookings = Booking.objects.filter(
            created_at__date__range=[start_date, end_date],
            status__in=['completed', 'confirmed']
        )
        
        # Group by date for trend analysis
        revenue_by_date = {}
        for booking in bookings:
            date_key = booking.created_at.date().isoformat()
            if date_key not in revenue_by_date:
                revenue_by_date[date_key] = 0
            revenue_by_date[date_key] += float(booking.service_price or 0)
        
        # Calculate totals and averages
        total_revenue = sum(revenue_by_date.values())
        average_daily_revenue = total_revenue / max(len(revenue_by_date), 1)
        
        return Response({
            'period': period,
            'date_range': {
                'start': start_date.isoformat(),
                'end': end_date.isoformat(),
            },
            'revenue': {
                'total': float(total_revenue),
                'average_daily': float(average_daily_revenue),
                'by_date': revenue_by_date,
            },
            'booking_count': bookings.count(),
        })

    @action(detail=False, methods=['get'])
    def bookings(self, request):
        """Get booking analytics with date filtering."""
        from django.db.models import Sum, Count
        from django.utils import timezone
        from datetime import timedelta
        
        period = request.query_params.get('period', 'monthly')
        today = timezone.now().date()
        
        # Calculate date range
        if period == 'daily':
            start_date = today
            end_date = today
        elif period == 'weekly':
            start_date = today - timedelta(days=7)
            end_date = today
        elif period == 'monthly':
            start_date = today - timedelta(days=30)
            end_date = today
        else:
            start_date = today - timedelta(days=30)
            end_date = today
        
        # Get booking data
        bookings = Booking.objects.filter(created_at__date__range=[start_date, end_date])
        
        # Status breakdown
        status_breakdown = {
            'pending': bookings.filter(status='pending').count(),
            'confirmed': bookings.filter(status='confirmed').count(),
            'completed': bookings.filter(status='completed').count(),
            'cancelled': bookings.filter(status='cancelled').count(),
        }
        
        # Service breakdown
        service_breakdown = bookings.values('service__name').annotate(
            count=Count('id'),
            revenue=Sum('service_price')
        ).order_by('-count')[:10]
        
        return Response({
            'period': period,
            'date_range': {
                'start': start_date.isoformat(),
                'end': end_date.isoformat(),
            },
            'total_bookings': bookings.count(),
            'status_breakdown': status_breakdown,
            'top_services': list(service_breakdown),
        })

    @action(detail=False, methods=['get'])
    def salons(self, request):
        """Get salon performance analytics."""
        from django.db.models import Sum, Count, Avg
        from django.utils import timezone
        from datetime import timedelta
        
        period = request.query_params.get('period', 'monthly')
        today = timezone.now().date()
        
        # Calculate date range
        if period == 'monthly':
            start_date = today - timedelta(days=30)
            end_date = today
        else:
            start_date = today - timedelta(days=30)
            end_date = today
        
        # Get salon performance data
        salons_data = []
        for salon in Salon.objects.filter(is_active=True):
            # Get bookings for this salon in the period
            salon_bookings = Booking.objects.filter(
                salon=salon,
                created_at__date__range=[start_date, end_date],
                status__in=['completed', 'confirmed']
            )
            
            # Calculate metrics
            booking_count = salon_bookings.count()
            total_revenue = salon_bookings.aggregate(
                total=Sum('service_price')
            )['total'] or 0
            
            # Calculate average rating if reviews exist
            avg_rating = 0
            if hasattr(salon, 'review_set'):
                reviews = salon.review_set.filter(rating__isnull=False)
                if reviews.exists():
                    avg_rating = reviews.aggregate(avg=Avg('rating'))['avg'] or 0
            
            salons_data.append({
                'id': salon.id,
                'name': salon.name,
                'booking_count': booking_count,
                'total_revenue': float(total_revenue),
                'average_booking_value': float(total_revenue / booking_count) if booking_count > 0 else 0,
                'average_rating': round(float(avg_rating), 1),
            })
        
        # Sort by revenue
        salons_data.sort(key=lambda x: x['total_revenue'], reverse=True)
        
        return Response({
            'period': period,
            'date_range': {
                'start': start_date.isoformat(),
                'end': end_date.isoformat(),
            },
            'total_salons': len(salons_data),
            'salons': salons_data,
        })

    @action(detail=False, methods=['get'])
    def export(self, request):
        """Export report data as CSV."""
        import csv
        from django.http import HttpResponse
        
        report_type = request.query_params.get('type', 'overview')
        period = request.query_params.get('period', 'monthly')
        
        # Create the HttpResponse object with CSV content type
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="{report_type}_{period}_report.csv"'
        
        # Create CSV writer
        writer = csv.writer(response)
        
        if report_type == 'overview':
            # Overview data
            writer.writerow(['Metric', 'Value', 'Change %'])
            writer.writerow(['Total Users', User.objects.count(), 'N/A'])
            writer.writerow(['Active Users', User.objects.filter(is_active=True).count(), 'N/A'])
            writer.writerow(['Total Salons', Salon.objects.count(), 'N/A'])
            writer.writerow(['Active Salons', Salon.objects.filter(is_active=True).count(), 'N/A'])
            writer.writerow(['Total Bookings', Booking.objects.count(), 'N/A'])
            writer.writerow(['Completed Bookings', Booking.objects.filter(status='completed').count(), 'N/A'])
            writer.writerow(['Total Revenue', Booking.objects.filter(status__in=['completed', 'confirmed']).aggregate(total=Sum('service_price'))['total'] or 0, 'N/A'])
            
        return response

class AdminAdvertisementViewSet(viewsets.ModelViewSet):
    """
    Admin viewset for managing advertisements.
    Only admin users can access these endpoints.
    """
    queryset = Advertisement.objects.select_related('salon').all()
    serializer_class = AdminAdvertisementSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'is_featured', 'salon']
    search_fields = ['tagline', 'salon__name', 'description']
    ordering_fields = ['created_at', 'views', 'clicks', 'start_date', 'end_date']
    ordering = ['-is_featured', '-created_at']

    def get_queryset(self):
        """Get advertisements with related salon data, auto-syncing statuses first."""
        from admin_portal.tasks import update_advertisement_status
        update_advertisement_status()
        return Advertisement.objects.select_related('salon').all()

    def update(self, request, *args, **kwargs):
        """Admin updates advertisement details."""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        """Admin deletes an advertisement."""
        instance = self.get_object()
        tagline = instance.tagline
        instance.delete()
        return Response({'message': f'Advertisement "{tagline}" deleted successfully'})

    @action(detail=True, methods=['patch'])
    def activate(self, request, pk=None):
        """Admin activates an advertisement."""
        ad = self.get_object()
        ad.status = 'active'
        ad.save()
        serializer = self.get_serializer(ad)
        return Response(serializer.data)

    @action(detail=True, methods=['patch'])
    def pause(self, request, pk=None):
        """Admin pauses an advertisement."""
        ad = self.get_object()
        ad.status = 'paused'
        ad.save()
        serializer = self.get_serializer(ad)
        return Response(serializer.data)

    @action(detail=True, methods=['patch'])
    def reactivate(self, request, pk=None):
        """Admin reactivates an expired advertisement."""
        ad = self.get_object()
        ad.status = 'active'
        ad.save()
        serializer = self.get_serializer(ad)
        return Response(serializer.data)

    @action(detail=True, methods=['patch'])
    def feature(self, request, pk=None):
        """Admin features an advertisement."""
        ad = self.get_object()
        ad.is_featured = True
        ad.save()
        serializer = self.get_serializer(ad)
        return Response(serializer.data)

    @action(detail=True, methods=['patch'])
    def unfeature(self, request, pk=None):
        """Admin unfeatures an advertisement."""
        ad = self.get_object()
        ad.is_featured = False
        ad.save()
        serializer = self.get_serializer(ad)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[])
    def increment_views(self, request, pk=None):
        """Increment view count (called when ad is displayed) — public."""
        ad = self.get_object()
        ad.increment_views()
        return Response({'views': ad.views})

    @action(detail=True, methods=['post'], permission_classes=[])
    def increment_clicks(self, request, pk=None):
        """Increment click count (called when ad is clicked) — public."""
        ad = self.get_object()
        ad.increment_clicks()
        return Response({'clicks': ad.clicks})

    @action(detail=False, methods=['get'], permission_classes=[])
    def featured(self, request):
        """Get featured advertisements for homepage carousel — public endpoint."""
        today = timezone.now().date()
        # Include ads with no dates set (always visible) OR within valid date range
        featured_ads = Advertisement.objects.select_related('salon').filter(
            is_featured=True,
            status='active',
        ).filter(
            # No dates set OR dates are valid today
            Q(start_date__isnull=True) | Q(start_date__lte=today),
        ).filter(
            Q(end_date__isnull=True) | Q(end_date__gte=today),
        )[:3]
        serializer = self.get_serializer(featured_ads, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def upload(self, request):
        """Upload a new advertisement with video and optional thumbnail."""
        try:
            data = request.data
            salon_id  = data.get('salonId') or data.get('salon_id')
            tagline   = data.get('tagline', '').strip()
            description = data.get('description', '').strip()
            start_date  = data.get('startDate') or data.get('start_date') or None
            end_date    = data.get('endDate')   or data.get('end_date')   or None
            is_featured = str(data.get('isFeatured', data.get('is_featured', 'false'))).lower() in ('true', '1', 'yes')

            # Normalize empty strings to None
            if not start_date: start_date = None
            if not end_date:   end_date   = None

            print(f"Upload: salon_id={salon_id}, tagline={tagline}, start={start_date}, end={end_date}, files={list(request.FILES.keys())}")

            if not salon_id:
                return Response({'error': 'Salon ID is required (salonId field)'}, status=400)
            if not tagline:
                return Response({'error': 'Tagline is required'}, status=400)

            try:
                salon = Salon.objects.get(id=salon_id)
            except Salon.DoesNotExist:
                return Response({'error': f'Salon with ID {salon_id} not found'}, status=400)
            except ValueError:
                return Response({'error': f'Invalid salon ID: {salon_id}'}, status=400)

            advertisement = Advertisement.objects.create(
                salon=salon,
                tagline=tagline,
                description=description,
                is_featured=is_featured,
                status='pending',
                # Set dates to None initially to avoid save() comparing str vs date
                start_date=None,
                end_date=None,
            )

            # Now set dates (already None-safe strings) and files, then save once
            if start_date:
                advertisement.start_date = start_date
            if end_date:
                advertisement.end_date = end_date
            if 'video' in request.FILES:
                advertisement.video = request.FILES['video']
            if 'thumbnail' in request.FILES:
                advertisement.video_thumbnail = request.FILES['thumbnail']

            advertisement.save()

            # Refresh from DB so all fields are proper Python types (dates not strings)
            advertisement.refresh_from_db()
            serializer = self.get_serializer(advertisement)
            return Response(serializer.data, status=201)

        except Exception as e:
            import traceback
            print(f"Upload error: {traceback.format_exc()}")
            return Response({'error': str(e)}, status=400)

    @action(detail=False, methods=['post'])
    def bulk_activate(self, request):
        """Bulk activate advertisements."""
        ad_ids = request.data.get('ad_ids', [])
        count = Advertisement.objects.filter(id__in=ad_ids).update(status='active')
        return Response({'message': f'Activated {count} advertisements'})

    @action(detail=False, methods=['post'])
    def bulk_pause(self, request):
        """Bulk pause advertisements."""
        ad_ids = request.data.get('ad_ids', [])
        count = Advertisement.objects.filter(id__in=ad_ids).update(status='paused')
        return Response({'message': f'Paused {count} advertisements'})

    @action(detail=False, methods=['post'])
    def bulk_delete(self, request):
        """Bulk delete advertisements."""
        ad_ids = request.data.get('ad_ids', [])
        count, _ = Advertisement.objects.filter(id__in=ad_ids).delete()
        return Response({'message': f'Deleted {count} advertisements'})

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get advertisement statistics."""
        from django.db.models import Sum, Count, Avg
        
        queryset = self.get_queryset()
        
        stats = {
            'total_ads': queryset.count(),
            'active_ads': queryset.filter(status='active').count(),
            'scheduled_ads': queryset.filter(status='scheduled').count(),
            'expired_ads': queryset.filter(status='expired').count(),
            'paused_ads': queryset.filter(status='paused').count(),
            'total_views': queryset.aggregate(total=Sum('views'))['total'] or 0,
            'total_clicks': queryset.aggregate(total=Sum('clicks'))['total'] or 0,
            'avg_ctr': 0,
        }
        
        # Calculate CTR
        if stats['total_views'] > 0:
            stats['avg_ctr'] = (stats['total_clicks'] / stats['total_views']) * 100
        
        return Response(stats)


class PlatformSettingsView(viewsets.ViewSet):
    """GET/PATCH /api/admin/settings/ — fetch and update platform settings."""
    permission_classes = [IsAuthenticated, IsAdmin]

    def list(self, request):
        settings = PlatformSettings.get()
        return Response(PlatformSettingsSerializer(settings).data)

    def partial_update(self, request, pk=None):
        settings = PlatformSettings.get()
        serializer = PlatformSettingsSerializer(settings, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class SiteTestimonialViewSet(viewsets.ModelViewSet):
    """
    Viewset for site-level testimonials about the BeautyBook CM platform.

    Public endpoints (no auth required):
      GET  /api/admin/testimonials/          — list approved testimonials (slideshow feed)
      POST /api/admin/testimonials/          — submit a new testimonial (pending approval)

    Admin-only endpoints:
      GET  /api/admin/testimonials/?approved=all   — list all (including pending)
      PATCH /api/admin/testimonials/{id}/approve/  — approve
      PATCH /api/admin/testimonials/{id}/reject/   — delete/reject
    """
    queryset = SiteTestimonial.objects.all()
    serializer_class = SiteTestimonialSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['role', 'is_approved']
    search_fields = ['name', 'comment', 'location']
    ordering_fields = ['created_at', 'rating']
    ordering = ['-created_at']

    def get_permissions(self):
        """
        Public: list (approved only) and create (submit for review).
        Admin: everything else.
        """
        from rest_framework.permissions import AllowAny
        if self.action in ('list', 'create'):
            return [AllowAny()]
        return [IsAuthenticated(), IsAdmin()]

    def get_queryset(self):
        """
        Non-admins only see approved testimonials.
        Admins can pass ?approved=all to see everything.
        """
        qs = SiteTestimonial.objects.all()
        request = self.request
        is_admin = (
            request.user.is_authenticated and
            (request.user.is_superuser or getattr(getattr(request.user, 'profile', None), 'is_admin', False))
        )
        if not is_admin:
            return qs.filter(is_approved=True)
        approved_filter = request.query_params.get('approved', None)
        if approved_filter and approved_filter != 'all':
            qs = qs.filter(is_approved=(approved_filter == 'true'))
        return qs

    def create(self, request, *args, **kwargs):
        """Submit a new testimonial — always starts as pending (is_approved=False)."""
        data = request.data.copy()
        # Force pending regardless of what the client sends
        data['is_approved'] = False
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save(is_approved=False)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['patch'])
    def approve(self, request, pk=None):
        """Admin approves a testimonial so it appears publicly."""
        testimonial = self.get_object()
        testimonial.is_approved = True
        testimonial.save()
        return Response(self.get_serializer(testimonial).data)

    @action(detail=True, methods=['delete'])
    def reject(self, request, pk=None):
        """Admin rejects (deletes) a testimonial."""
        testimonial = self.get_object()
        testimonial.delete()
        return Response({'message': 'Testimonial rejected and deleted.'}, status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Admin-only: counts for dashboard badge."""
        return Response({
            'total': SiteTestimonial.objects.count(),
            'pending': SiteTestimonial.objects.filter(is_approved=False).count(),
            'approved': SiteTestimonial.objects.filter(is_approved=True).count(),
        })


class AdminNotificationsView(viewsets.ViewSet):
    """
    GET  /api/admin/notifications/        — list current notifications (filtered by user prefs)
    POST /api/admin/notifications/mark_read/ — mark notification IDs as read (stored in session/cache)
    """
    permission_classes = [IsAuthenticated, IsAdmin]

    def list(self, request):
        from admin_portal.notifications import get_notifications
        from django.core.cache import cache

        prefs_param = request.query_params.get('prefs', '')
        enabled_prefs = set(prefs_param.split(',')) if prefs_param else None

        notifications = get_notifications(user=request.user)

        # Filter by enabled preferences if provided
        if enabled_prefs:
            notifications = [n for n in notifications if n.get('pref_key') in enabled_prefs]

        # Mark previously-read IDs
        cache_key = f'admin_notif_read_{request.user.id}'
        read_ids = set(cache.get(cache_key) or [])
        for n in notifications:
            n['read'] = n['id'] in read_ids

        return Response({
            'notifications': notifications,
            'unread_count': sum(1 for n in notifications if not n['read']),
            'total': len(notifications),
        })

    @action(detail=False, methods=['post'])
    def mark_read(self, request):
        """Mark one or all notifications as read."""
        from django.core.cache import cache
        ids = request.data.get('ids', [])  # empty = mark all
        cache_key = f'admin_notif_read_{request.user.id}'
        read_ids = set(cache.get(cache_key) or [])

        if not ids:
            # Mark all — rebuild from current notifications
            from admin_portal.notifications import get_notifications
            all_notifs = get_notifications(user=request.user)
            read_ids.update(n['id'] for n in all_notifs)
        else:
            read_ids.update(ids)

        cache.set(cache_key, list(read_ids), timeout=86400 * 7)  # 7 days
        return Response({'marked': len(ids) or 'all', 'read_ids': len(read_ids)})
