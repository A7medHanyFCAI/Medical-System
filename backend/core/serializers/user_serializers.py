from rest_framework import serializers
from core.models.user import User


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, min_length=6)

    class Meta:
        model = User
        fields = ["username", "email", "password", "role"]

    def create(self, validate_data):
        """
        Create a new user with a hashed password.
        """
        user = User.objects.create_user(
            username=validate_data["username"],
            email=validate_data.get("email", ""),
            password=validate_data["password"],
            role=validate_data["role"],
        )
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ["id", "username", "email", "password", "role"]
        read_only_fields = ["id"]

    def validate_username(self, value):
        """
        Check that username is unique, but allow keeping the same username on update
        """
        # If this is an update (instance exists) and username hasn't changed, skip validation
        if self.instance and self.instance.username == value:
            return value
        
        # Otherwise, check if username already exists
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("A user with that username already exists.")
        
        return value

    def update(self, instance, validated_data):
        # Only update provided fields
        for field in ["username", "email", "role"]:
            if field in validated_data:
                setattr(instance, field, validated_data[field])

        if "password" in validated_data:
            instance.set_password(validated_data["password"])

        instance.save()
        return instance