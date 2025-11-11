from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role'] = user.role
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        # Add extra fields to the response
        data['role'] = self.user.role
        data['username'] = self.user.username
        return data
    

class LogoutSerializer(serializers.Serializer):
    """
    Used for blacklisting refresh tokens during logout.
    """
    refresh = serializers.CharField()