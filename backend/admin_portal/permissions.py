from rest_framework import permissions


class IsAdmin(permissions.BasePermission):
    """
    Custom permission to allow only admin users to access admin endpoints.
    """
    message = 'You do not have admin privileges to access this resource.'

    def has_permission(self, request, view):
        # Check if user is authenticated
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Check if user is admin (via profile)
        if hasattr(request.user, 'profile') and request.user.profile.is_admin:
            return True
        
        # Fallback: check if user is superuser
        return request.user.is_superuser

    def has_object_permission(self, request, view, obj):
        # Check if user is authenticated
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Check if user is admin
        if hasattr(request.user, 'profile') and request.user.profile.is_admin:
            return True
        
        # Fallback: check if user is superuser
        return request.user.is_superuser
