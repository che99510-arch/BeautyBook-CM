"""
Admin account management views — separate file to keep admin_portal/views.py clean.

Endpoints added:
  GET/POST  /api/admin/setup/         — first-run setup (no auth required)
  POST      /api/admin/admin_signup/  — register a new admin (controlled by settings)
  PATCH     /api/admin/settings/      — superuser-only fields protected here

These are registered in admin_portal/urls.py alongside existing viewsets.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.db.models import Q

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


class PublicAdminSettingsView(viewsets.ViewSet):
    """
    GET /api/admin/public_settings/

    Returns only the fields the login/signup pages need — no auth required.
    This prevents 401 errors on the login page.
    """
    permission_classes = []

    def list(self, request):
        s = PlatformSettings.get()
        return Response({
            'allow_admin_signup': s.allow_admin_signup,
            # Tell frontend whether an invite code is required (not the code itself)
            'requires_invitation_code': bool(s.admin_invitation_code),
        })


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


# ─────────────────────────────────────────────────────────────────────────────
# 4. Admin Users Management — superuser can list, promote, demote, delete admins
# ─────────────────────────────────────────────────────────────────────────────

class AdminUsersManagementView(viewsets.ViewSet):
    """
    GET    /api/admin/admin_users/          — list all admin accounts (superuser only)
    POST   /api/admin/admin_users/promote/  — grant admin to any user by email
    DELETE /api/admin/admin_users/{id}/     — revoke admin / delete account
    """
    permission_classes = [IsAuthenticated, IsAdmin]

    def list(self, request):
        """Return all users with admin/staff privileges."""
        if not request.user.is_superuser:
            return Response({'error': 'Superuser access required.'}, status=status.HTTP_403_FORBIDDEN)

        from django.contrib.auth.models import User
        admins = User.objects.filter(
            Q(is_superuser=True) | Q(is_staff=True) | Q(profile__is_admin=True)
        ).distinct().select_related('profile')

        data = []
        for u in admins:
            data.append({
                'id': u.id,
                'name': u.get_full_name() or u.username,
                'email': u.email,
                'username': u.username,
                'is_superuser': u.is_superuser,
                'is_active': u.is_active,
                'date_joined': u.date_joined.isoformat(),
                'role': 'superadmin' if u.is_superuser else 'admin',
            })
        return Response(data)

    @action(detail=False, methods=['post'])
    def promote(self, request):
        """Grant admin privileges to a user by email (superuser only)."""
        if not request.user.is_superuser:
            return Response({'error': 'Superuser access required.'}, status=status.HTTP_403_FORBIDDEN)

        from django.contrib.auth.models import User
        email = request.data.get('email', '').strip()
        if not email:
            return Response({'error': 'Email is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'error': f'No user found with email {email}.'}, status=status.HTTP_404_NOT_FOUND)

        user.is_staff = True
        user.save()
        user.profile.is_admin = True
        user.profile.save()

        return Response({
            'message': f'{email} has been granted admin access.',
            'user': {'id': user.id, 'email': user.email, 'name': user.get_full_name() or user.username},
        })

    @action(detail=True, methods=['patch'])
    def revoke(self, request, pk=None):
        """Revoke admin privileges from an admin (superuser only). Cannot revoke yourself."""
        if not request.user.is_superuser:
            return Response({'error': 'Superuser access required.'}, status=status.HTTP_403_FORBIDDEN)

        from django.contrib.auth.models import User
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        if user.pk == request.user.pk:
            return Response({'error': 'You cannot revoke your own admin privileges.'}, status=status.HTTP_400_BAD_REQUEST)

        if user.is_superuser:
            return Response({'error': 'Cannot revoke a superuser. Demote them first via Django admin.'}, status=status.HTTP_400_BAD_REQUEST)

        user.is_staff = False
        user.save()
        user.profile.is_admin = False
        user.profile.save()

        return Response({'message': f'Admin access revoked for {user.email}.'})

    def destroy(self, request, pk=None):
        """Delete an admin account entirely (superuser only)."""
        if not request.user.is_superuser:
            return Response({'error': 'Superuser access required.'}, status=status.HTTP_403_FORBIDDEN)

        from django.contrib.auth.models import User
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        if user.pk == request.user.pk:
            return Response({'error': 'You cannot delete your own account.'}, status=status.HTTP_400_BAD_REQUEST)

        user.delete()
        return Response({'message': 'Admin account deleted.'}, status=status.HTTP_204_NO_CONTENT)


# ─────────────────────────────────────────────────────────────────────────────
# 5. Admin Login — dedicated endpoint, works regardless of salon owner status
# ─────────────────────────────────────────────────────────────────────────────

class AdminLoginView(viewsets.ViewSet):
    """
    POST /api/admin/login/

    Authenticates any user and verifies they have admin/superuser privileges.
    Unlike customer_login, this does NOT block salon owners.
    """
    permission_classes = []

    def create(self, request):
        from django.contrib.auth import authenticate
        from rest_framework.authtoken.models import Token
        from django.contrib.auth.models import User

        email    = request.data.get('email', '').strip()
        password = request.data.get('password', '')

        if not email or not password:
            return Response({'error': 'Email and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

        # Resolve email → username
        try:
            user_obj = User.objects.get(email=email)
            username = user_obj.username
        except User.DoesNotExist:
            return Response({'error': 'No account found with that email address.'}, status=status.HTTP_400_BAD_REQUEST)
        except User.MultipleObjectsReturned:
            user_obj = User.objects.filter(email=email).first()
            username = user_obj.username

        user = authenticate(request, username=username, password=password)
        if user is None:
            return Response({'error': 'Incorrect password.'}, status=status.HTTP_400_BAD_REQUEST)

        # Check admin privileges
        is_admin = (
            user.is_superuser
            or user.is_staff
            or (hasattr(user, 'profile') and user.profile.is_admin)
        )
        if not is_admin:
            return Response(
                {'error': 'User does not have admin privileges.'},
                status=status.HTTP_403_FORBIDDEN
            )

        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user': {
                'id': str(user.id),
                'name': user.get_full_name() or user.username,
                'email': user.email,
                'is_superuser': user.is_superuser,
                'role': 'admin',
            }
        })
