"""
Admin account management views — separate file to keep admin_portal/views.py clean.

Endpoints added:
  GET/POST  /api/admin/setup/         — first-run setup (no auth required)
  POST      /api/admin/admin_signup/  — register a new admin (controlled by settings)
  PATCH     /api/admin/settings/      — superuser-only fields protected here

These are registered in admin_portal/urls.py alongside existing viewsets.
"""
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.authtoken.models import Token

from admin_portal.models import PlatformSettings
from admin_portal.permissions import IsAdmin
from admin_portal.serializers import PlatformSettingsSerializer


# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

def _admin_exists():
    """Return True if at least one superuser or is_admin profile exists."""
    from django.contrib.auth.models import User
    return (
        User.objects.filter(is_superuser=True).exists()
        or User.objects.filter(profile__is_admin=True).exists()
    )


def _create_admin_user(name, email, password, is_superuser=False):
    """Create a Django User with admin privileges. Returns (user, error_dict)."""
    from django.contrib.auth.models import User

    errors = {}
    if not name:
        errors['name'] = 'Name is required.'
    if not email:
        errors['email'] = 'Email is required.'
    if not password:
        errors['password'] = 'Password is required.'
    elif len(password) < 8:
        errors['password'] = 'Password must be at least 8 characters.'
    if email and User.objects.filter(email=email).exists():
        errors['email'] = 'A user with this email already exists.'
    if errors:
        return None, errors

    username = email.split('@')[0]
    base, i = username, 1
    while User.objects.filter(username=username).exists():
        username = f'{base}{i}'
        i += 1

    parts = name.strip().split(' ', 1)
    user = User.objects.create_user(
        username=username,
        email=email,
        password=password,
        first_name=parts[0],
        last_name=parts[1] if len(parts) > 1 else '',
        is_staff=True,
        is_superuser=is_superuser,
    )
    user.profile.is_admin = True
    user.profile.save()
    return user, {}


# ─────────────────────────────────────────────────────────────────────────────
# 1. First-Run Setup
# ─────────────────────────────────────────────────────────────────────────────

class AdminSetupView(viewsets.ViewSet):
    """
    GET  /api/admin/setup/ — check if setup is available
    POST /api/admin/setup/ — create the very first administrator account

    Permanently unavailable once any admin/superuser exists.
    No authentication required (there are no admins yet).
    """
    permission_classes = []  # intentionally public

    def list(self, request):
        if _admin_exists():
            return Response({
                'available': False,
                'message': 'Administrator setup has already been completed.',
            })
        return Response({'available': True, 'message': 'Setup is available. Create your administrator account.'})

    def create(self, request):
        if _admin_exists():
            return Response(
                {'error': 'Administrator setup has already been completed.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        name     = request.data.get('name', '').strip()
        email    = request.data.get('email', '').strip()
        password = request.data.get('password', '')
        confirm  = request.data.get('confirm_password', '')

        if password != confirm:
            return Response({'confirm_password': 'Passwords do not match.'}, status=status.HTTP_400_BAD_REQUEST)

        user, errors = _create_admin_user(name, email, password, is_superuser=True)
        if errors:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)

        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            'message': 'Administrator account created successfully.',
            'token': token.key,
            'user': {
                'id': user.id,
                'name': user.get_full_name() or user.username,
                'email': user.email,
                'is_superuser': user.is_superuser,
            },
        }, status=status.HTTP_201_CREATED)


# ─────────────────────────────────────────────────────────────────────────────
# 2. Admin Signup (controlled by PlatformSettings.allow_admin_signup)
# ─────────────────────────────────────────────────────────────────────────────

class AdminSignupView(viewsets.ViewSet):
    """
    POST /api/admin/admin_signup/

    Backend enforces:
    - PlatformSettings.allow_admin_signup must be True
    - If admin_invitation_code is set, request must include matching code
    """
    permission_classes = []  # public — logic enforces the ON/OFF flag

    def create(self, request):
        settings = PlatformSettings.get()

        if not settings.allow_admin_signup:
            return Response(
                {'error': 'Administrator registration is currently disabled.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Invitation code check (if configured)
        if settings.admin_invitation_code:
            provided = request.data.get('invitation_code', '').strip()
            if provided != settings.admin_invitation_code:
                return Response(
                    {'error': 'Invalid or missing invitation code.'},
                    status=status.HTTP_403_FORBIDDEN,
                )

        name     = request.data.get('name', '').strip()
        email    = request.data.get('email', '').strip()
        password = request.data.get('password', '')
        confirm  = request.data.get('confirm_password', '')

        if password != confirm:
            return Response({'confirm_password': 'Passwords do not match.'}, status=status.HTTP_400_BAD_REQUEST)

        # New admins are staff but NOT superuser
        user, errors = _create_admin_user(name, email, password, is_superuser=False)
        if errors:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)

        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            'message': 'Administrator account created. You can now log in.',
            'token': token.key,
            'user': {
                'id': user.id,
                'name': user.get_full_name() or user.username,
                'email': user.email,
            },
        }, status=status.HTTP_201_CREATED)


# ─────────────────────────────────────────────────────────────────────────────
# 3. Protected PlatformSettings — superuser-only fields
# ─────────────────────────────────────────────────────────────────────────────

SUPERUSER_ONLY_FIELDS = {'allow_admin_signup', 'admin_invitation_code'}


class ProtectedPlatformSettingsView(viewsets.ViewSet):
    """
    Replaces the original PlatformSettingsView.

    GET  /api/admin/settings/   — readable by all admins
    PATCH /api/admin/settings/  — allow_admin_signup and admin_invitation_code
                                   are writable ONLY by superusers
    """
    permission_classes = [IsAuthenticated, IsAdmin]

    def list(self, request):
        s = PlatformSettings.get()
        data = PlatformSettingsSerializer(s).data
        # Expose whether the current user is superuser so frontend can
        # show/hide the admin signup controls accordingly
        data['_is_superuser'] = request.user.is_superuser
        return Response(data)

    def partial_update(self, request, pk=None):
        data = dict(request.data)

        # Reject if non-superuser tries to change superuser-only fields
        attempted_restricted = SUPERUSER_ONLY_FIELDS & set(data.keys())
        if attempted_restricted and not request.user.is_superuser:
            return Response(
                {'error': 'Only the super administrator can change administrator registration settings.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        s = PlatformSettings.get()
        serializer = PlatformSettingsSerializer(s, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        result = serializer.data
        result['_is_superuser'] = request.user.is_superuser
        return Response(result)
