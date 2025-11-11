from rest_framework import serializers
from core.models.user import User

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, min_length=6)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'role']
        
    def create(self, validate_data):
        """
        Create a new user with a hashed password.
        """
        user = User.objects.create_user(
            username=validate_data['username'],
            email=validate_data.get('email',''),
            password=validate_data['password'],
            role=validate_data['role']
        )
        return user