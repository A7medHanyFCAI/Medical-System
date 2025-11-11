# views/user_views.py

from rest_framework import generics, permissions
from ..models.user import User
from ..serializers.user_serializers import UserRegistrationSerializer


class UserListCreateView(generics.ListCreateAPIView):
    """
    GET: List all users
    POST: Create a new user
    """

    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]
