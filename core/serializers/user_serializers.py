# serializers/user_serializers.py

from rest_framework import serializers
from ..models.user import User

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'role', 'password']
        read_only_fields = ['id']

    def create(self, validated_data):
        # Use Django's create_user to hash the password properly
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user
