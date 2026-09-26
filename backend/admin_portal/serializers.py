from rest_framework import serializers
from django.contrib.auth.models import User
from bookings.models import Booking
from salons.models import Salon
from services.models import Service
from users.models import UserProfile
from admin_portal.models import Advertisement, PlatformSettings, SiteTestimonial


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile."""
    class Meta:
        model = UserProfile
        fields = ['id', 'avatar', 'bio', 'phone', 'address', 'city', 
                  'is_salon_owner', 'is_stylist', 'is_admin', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class AdminUserSerializer(serializers.ModelSerializer):
    """Serializer for user with profile."""
    profile = UserProfileSerializer(read_only=True)
    phone = serializers.SerializerMethodField()

    def get_phone(self, obj):
        return getattr(obj.profile, 'phone', None) if hasattr(obj, 'profile') else None
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 
                  'is_active', 'date_joined', 'profile', 'phone']
        read_only_fields = ['date_joined']


class AdminServiceSerializer(serializers.ModelSerializer):
    """Serializer for service with salon info."""
    salon_name = serializers.CharField(source='salon.name', read_only=True)
    
    class Meta:
        model = Service
        fields = ['id', 'salon', 'salon_name', 'name', 'category', 'description', 
                  'duration', 'price', 'is_available', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class AdminSalonSerializer(serializers.ModelSerializer):
    """Serializer for salon with owner info."""
    owner_name = serializers.SerializerMethodField()
    owner_email = serializers.EmailField(source='owner.email', read_only=True)
    # Override city as plain CharField so old values (e.g. Yaoundé) pass validation
    city = serializers.CharField(max_length=50, required=False, allow_blank=True, default='Douala')

    def get_owner_name(self, obj):
        if not obj.owner:
            return None
        return obj.owner.get_full_name() or obj.owner.username
    
    class Meta:
        model = Salon
        fields = ['id', 'owner', 'owner_name', 'owner_email', 'name', 'location', 
                  'city', 'description', 'phone', 'whatsapp', 'mobile_money',
                  'workers', 'image', 'cover_image', 'rating', 'review_count',
                  'starting_price', 'commission_rate', 'open_hours', 'tags',
                  'is_active', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class AdminBookingSerializer(serializers.ModelSerializer):
    """Serializer for booking with all related info."""
    client_name = serializers.CharField(source='client.get_full_name', read_only=True)
    client_email = serializers.EmailField(source='client.email', read_only=True)
    salon_name = serializers.CharField(source='salon.name', read_only=True)
    service_name = serializers.CharField(source='service.name', read_only=True)
    service_price_display = serializers.DecimalField(
        source='service_price', max_digits=10, decimal_places=2, read_only=True
    )
    booking_fee_display = serializers.DecimalField(
        source='booking_fee', max_digits=10, decimal_places=2, read_only=True
    )
    amount_due_at_salon_display = serializers.DecimalField(
        source='amount_due_at_salon', max_digits=10, decimal_places=2, read_only=True
    )
    
    class Meta:
        model = Booking
        fields = [
            'id', 'client', 'client_name', 'client_email',
            'salon', 'salon_name', 'service', 'service_name',
            'booking_date', 'booking_time', 'status', 'notes',
            'service_price', 'service_price_display',
            'booking_fee', 'booking_fee_display',
            'amount_due_at_salon', 'amount_due_at_salon_display',
            'payment_status', 'payment_reference',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'service_price', 'booking_fee', 'amount_due_at_salon',
            'payment_status', 'payment_reference',
            'created_at', 'updated_at'
        ]


class AdminRevenueSerializer(serializers.Serializer):
    """Serializer for revenue analytics."""
    total_revenue = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_bookings = serializers.IntegerField()
    total_booking_fees = serializers.DecimalField(max_digits=15, decimal_places=2)
    average_booking_value = serializers.DecimalField(max_digits=10, decimal_places=2)
    period = serializers.CharField()


class AdminDashboardSerializer(serializers.Serializer):
    """Serializer for admin dashboard analytics."""
    # Summary stats
    total_customers = serializers.IntegerField()
    total_salons = serializers.IntegerField()
    total_bookings = serializers.IntegerField()
    total_revenue = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_booking_fees = serializers.DecimalField(max_digits=15, decimal_places=2)
    
    # Booking stats
    pending_bookings = serializers.IntegerField()
    confirmed_bookings = serializers.IntegerField()
    completed_bookings = serializers.IntegerField()
    cancelled_bookings = serializers.IntegerField()
    
    # Payment stats
    pending_payments = serializers.IntegerField()
    paid_payments = serializers.IntegerField()
    failed_payments = serializers.IntegerField()
    
    # Growth metrics
    new_customers_this_month = serializers.IntegerField()
    new_salons_this_month = serializers.IntegerField()
    bookings_this_month = serializers.IntegerField()
    revenue_this_month = serializers.DecimalField(max_digits=15, decimal_places=2)


class PlatformSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlatformSettings
        fields = [
            'platform_name',
            'booking_fee_percentage', 'min_booking_amount',
            'max_booking_days_ahead', 'allow_multiple_bookings',
            'payment_mode', 'momo_primary_number', 'momo_secondary_number',
            'payment_enabled',
            'max_active_ads', 'default_ad_duration_days',
            'maintenance_mode', 'allow_new_registrations',
            # Admin signup control — readable by all admins, writable only by superusers
            'allow_admin_signup', 'admin_invitation_code',
            'updated_at',
        ]
        read_only_fields = ['updated_at']


class SiteTestimonialSerializer(serializers.ModelSerializer):
    """Serializer for SiteTestimonial model."""
    avatar_display_url = serializers.CharField(read_only=True)

    class Meta:
        model = SiteTestimonial
        fields = [
            'id', 'name', 'avatar', 'avatar_url', 'avatar_display_url',
            'role', 'location', 'comment', 'rating', 'is_approved',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at', 'avatar_display_url']


class AdminAdvertisementSerializer(serializers.ModelSerializer):
    """Serializer for Advertisement model."""
    salon_name = serializers.CharField(source='salon.name', read_only=True)
    salon_id = serializers.CharField(source='salon.id', read_only=True)
    is_active = serializers.BooleanField(read_only=True)
    video_url = serializers.SerializerMethodField()
    thumbnail_url = serializers.SerializerMethodField()

    def _build_url(self, field_value):
        """
        Build a usable URL for a media field value.

        Priority:
        1. Already an absolute URL → return as-is.
        2. Cloudinary is configured → build proper Cloudinary delivery URL.
        3. Fallback → use request or BACKEND_URL to build absolute URL.
        """
        import os
        if not field_value:
            return None

        # Get the raw stored name (relative path like "advertisements/videos/foo.mp4")
        name = str(field_value)

        # Already absolute
        if name.startswith('http://') or name.startswith('https://'):
            return name

        # Cloudinary configured — build URL manually so we don't depend on
        # DEFAULT_FILE_STORAGE being active at serialisation time.
        cloudinary_url = os.environ.get('CLOUDINARY_URL', '')
        if cloudinary_url:
            import re as _re
            m = _re.match(r'cloudinary://\d+:[^@]+@(.+)', cloudinary_url)
            if m:
                cloud_name = m.group(1)
                # Strip leading slash/media prefix if present
                clean = name.lstrip('/')
                if clean.startswith('media/'):
                    clean = clean[len('media/'):]
                return f"https://res.cloudinary.com/{cloud_name}/video/upload/{clean}"

        # Local / relative path fallback
        if not name.startswith('/'):
            name = f"/media/{name}"
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(name)
        base = os.environ.get('BACKEND_URL', '').rstrip('/')
        return f"{base}{name}" if base else name

    def get_video_url(self, obj):
        if obj.video:
            return self._build_url(obj.video.name if hasattr(obj.video, 'name') else obj.video)
        return None

    def get_thumbnail_url(self, obj):
        if obj.video_thumbnail:
            raw = obj.video_thumbnail.name if hasattr(obj.video_thumbnail, 'name') else obj.video_thumbnail
            # Thumbnails are images → swap video/upload for image/upload
            import os, re as _re
            if not str(raw).startswith('http'):
                cloudinary_url = os.environ.get('CLOUDINARY_URL', '')
                if cloudinary_url:
                    m = _re.match(r'cloudinary://\d+:[^@]+@(.+)', cloudinary_url)
                    if m:
                        cloud_name = m.group(1)
                        clean = str(raw).lstrip('/')
                        if clean.startswith('media/'):
                            clean = clean[len('media/'):]
                        return f"https://res.cloudinary.com/{cloud_name}/image/upload/{clean}"
            return self._build_url(raw)
        return None
    
    class Meta:
        model = Advertisement
        fields = [
            'id', 'salon', 'salon_id', 'salon_name',
            'video', 'video_url', 'video_thumbnail', 'thumbnail_url',
            'tagline', 'description', 'status', 'is_featured',
            'start_date', 'end_date', 'views', 'clicks',
            'is_active', 'created_at', 'updated_at',
        ]
        read_only_fields = ['views', 'clicks', 'created_at', 'updated_at']
    
    def validate(self, data):
        """Validate date range."""
        if data.get('start_date') and data.get('end_date'):
            if data['start_date'] > data['end_date']:
                raise serializers.ValidationError({
                    'end_date': 'End date must be after start date'
                })
        return data
