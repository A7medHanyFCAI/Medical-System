from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny 
from core.serializers.user_serializers import UserRegistrationSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from core.token_utils import MyTokenObtainPairSerializer

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer
    
class UserRegistrationView(generics.CreateAPIView):
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response({
            "message": "User registered successfully.",
            "user": {
                "username": user.username,
                "email":user.email,
                "role":user.role
            }
        }, status=status.HTTP_201_CREATED)