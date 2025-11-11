from rest_framework import permissions

class IsDoctor(permissions.BasePermission):
    """
    Custom permission to allow only users with role='doctor' to access the view.
    """

    def has_permission(self, request, view):
        return bool(
            request.user and  
            request.user.role == 'doctor'
        )
