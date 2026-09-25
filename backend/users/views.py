from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from users.models import UserProfile
from users.serializers import UserSerializer, UserRegistrationSerializer, UserProfileSerializer


class UserViewSet(viewsets.ModelViewSet):
    """ViewSet for User model."""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

    @action(detail=False, methods=['post'])
    def register(self, request):
        """Register a new user."""
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(
                UserSerializer(user).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def current_user(self, request):
        """Get the current authenticated user."""
        if request.user.is_authenticated:
            serializer = self.get_serializer(request.user)
            return Response(serializer.data)
        return Response(
            {'detail': 'Not authenticated.'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def salon_login(self, request):
        """Authenticate a salon owner and return token."""
        raw_username = request.data.get('username') or request.data.get('email')
        password = request.data.get('password')
        if not raw_username or not password:
            return Response({'error': 'Username and password required.'}, status=status.HTTP_400_BAD_REQUEST)
        # if email provided, translate to username
        username = raw_username
        if '@' in raw_username:
            try:
                user_obj = User.objects.get(email=raw_username)
                username = user_obj.username
            except User.DoesNotExist:
                username = raw_username
        user = authenticate(request, username=username, password=password)
        if user is None:
            return Response({'error': 'Invalid credentials.'}, status=status.HTTP_400_BAD_REQUEST)
        # ensure the user is marked as salon owner
        profile = getattr(user, 'profile', None)
        if not profile or not profile.is_salon_owner:
            return Response({'error': 'Not a salon owner.'}, status=status.HTTP_403_FORBIDDEN)
        token, _ = Token.objects.get_or_create(user=user)
        return Response({'token': token.key, 'user': UserSerializer(user).data})

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def customer_login(self, request):
        """Authenticate a customer and return token."""
        raw_username = request.data.get('username') or request.data.get('email')
        password = request.data.get('password')
        if not raw_username or not password:
            return Response({'error': 'Username/email and password required.'}, status=status.HTTP_400_BAD_REQUEST)
        # if email provided, translate to username
        username = raw_username
        if '@' in raw_username:
            try:
                user_obj = User.objects.get(email=raw_username)
                username = user_obj.username
            except User.DoesNotExist:
                username = raw_username
        user = authenticate(request, username=username, password=password)
        if user is None:
            return Response({'error': 'Invalid credentials.'}, status=status.HTTP_400_BAD_REQUEST)
        # ensure the user is NOT a salon owner (regular customer)
        profile = getattr(user, 'profile', None)
        if profile and profile.is_salon_owner:
            return Response({'error': 'Please use salon owner login instead.'}, status=status.HTTP_403_FORBIDDEN)
        token, _ = Token.objects.get_or_create(user=user)
        return Response({'token': token.key, 'user': UserSerializer(user).data})

    @action(detail=False, methods=['put'], permission_classes=[IsAuthenticated])
    def update_profile(self, request):
        """Update the current user's profile."""
        user = request.user
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def request_password_reset(self, request):
        """Generate a password reset token for the given email."""
        email = request.data.get('email', '').strip()
        if not email:
            return Response({'error': 'Email is required.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # Don't reveal whether the email exists
            return Response({'message': 'If that email is registered, a reset code has been sent.'})

        import random, string
        from django.core.cache import cache
        code = ''.join(random.choices(string.digits, k=6))
        cache.set(f'pwd_reset_{email}', code, timeout=600)  # 10 min TTL

        # In production: send email. For now return code in response (dev only).
        return Response({
            'message': 'Reset code generated.',
            'dev_code': code,  # Remove in production
        })

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def confirm_password_reset(self, request):
        """Verify reset code and set new password."""
        email = request.data.get('email', '').strip()
        code = request.data.get('code', '').strip()
        new_password = request.data.get('new_password', '')

        if not email or not code or not new_password:
            return Response({'error': 'Email, code, and new_password are required.'}, status=status.HTTP_400_BAD_REQUEST)

        if len(new_password) < 8:
            return Response({'error': 'Password must be at least 8 characters.'}, status=status.HTTP_400_BAD_REQUEST)

        from django.core.cache import cache
        cached_code = cache.get(f'pwd_reset_{email}')
        if not cached_code or cached_code != code:
            return Response({'error': 'Invalid or expired reset code.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        user.set_password(new_password)
        user.save()
        cache.delete(f'pwd_reset_{email}')
        # Invalidate existing tokens
        Token.objects.filter(user=user).delete()
        return Response({'message': 'Password reset successfully. Please log in with your new password.'})

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def change_password(self, request):
        """Change password for the currently authenticated user."""
        user = request.user
        current_password = request.data.get('current_password', '')
        new_password = request.data.get('new_password', '')
        confirm_password = request.data.get('confirm_password', '')

        if not current_password or not new_password:
            return Response({'error': 'current_password and new_password are required.'}, status=status.HTTP_400_BAD_REQUEST)
        if not user.check_password(current_password):
            return Response({'error': 'Current password is incorrect.'}, status=status.HTTP_400_BAD_REQUEST)
        if new_password != confirm_password:
            return Response({'error': 'New passwords do not match.'}, status=status.HTTP_400_BAD_REQUEST)
        if len(new_password) < 8:
            return Response({'error': 'Password must be at least 8 characters.'}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        # Re-issue token so the user stays logged in
        Token.objects.filter(user=user).delete()
        new_token, _ = Token.objects.get_or_create(user=user)
        return Response({'message': 'Password changed successfully.', 'token': new_token.key})

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def google_auth(self, request):
        """
        Verify a Google ID token and return a BeautyBook CM auth token.
        The frontend sends: { id_token: <Google JWT> }
        We verify the token with Google, find-or-create the user, return our token.
        """
        import urllib.request
        import json as json_lib

        id_token = request.data.get('id_token', '').strip()
        if not id_token:
            return Response({'error': 'id_token is required.'}, status=status.HTTP_400_BAD_REQUEST)

        # Verify the token with Google's tokeninfo endpoint
        try:
            url = f'https://oauth2.googleapis.com/tokeninfo?id_token={id_token}'
            with urllib.request.urlopen(url, timeout=10) as resp:
                payload = json_lib.loads(resp.read())
        except Exception as e:
            return Response({'error': f'Google token verification failed: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

        # Validate audience — accept any client_id for now (dev mode)
        email = payload.get('email')
        if not email or not payload.get('email_verified'):
            return Response({'error': 'Email not verified by Google.'}, status=status.HTTP_400_BAD_REQUEST)

        given_name = payload.get('given_name', '')
        family_name = payload.get('family_name', '')

        # Find or create user
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # Auto-create account
            username = email.split('@')[0]
            # sanitise and ensure unique
            import re as _re
            username = _re.sub(r'[^\w]', '_', username)[:30] or 'user'
            base = username
            i = 1
            while User.objects.filter(username=username).exists():
                username = f'{base}{i}'
                i += 1
            user = User.objects.create_user(
                username=username,
                email=email,
                first_name=given_name,
                last_name=family_name,
                # Random unusable password — user will always log in via Google
                password=User.objects.make_random_password(),
            )

        token, _ = Token.objects.get_or_create(user=user)
        user_data = UserSerializer(user).data
        # Tell the frontend whether this is a salon owner so it can redirect correctly
        profile = getattr(user, 'profile', None)
        user_data['is_salon_owner'] = profile.is_salon_owner if profile else False
        return Response({'token': token.key, 'user': user_data})


class UserProfileViewSet(viewsets.ModelViewSet):
    """ViewSet for UserProfile model."""
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def my_profile(self, request):
        """Get the current user's profile."""
        profile = request.user.profile
        serializer = self.get_serializer(profile)
        return Response(serializer.data)
