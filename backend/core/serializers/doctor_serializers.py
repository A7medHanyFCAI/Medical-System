from rest_framework import serializers
from .availability_serializers import AvailabilitySerializer
from ..models.doctor import Doctor
from .user_serializers import UserProfileSerializer

class DoctorProfileSerializer(serializers.ModelSerializer):
    doctor_id = serializers.IntegerField(source='id', read_only=True)
    user = UserProfileSerializer(required=False)
    specialty_name = serializers.CharField(source='specialty.name', read_only=True)

    class Meta:
        model = Doctor
        fields = ["doctor_id", "user", "contact", "bio", "specialty", "specialty_name"]

    def update(self, instance, validated_data):
        # Update doctor fields
        for field in ['contact', 'bio', 'specialty']:
            if field in validated_data:
                setattr(instance, field, validated_data[field])
        instance.save()

        # Update nested user (using UserProfileSerializer)
        user_data = validated_data.get('user')
        if user_data:
            self.fields['user'].update(instance.user, user_data)

        return instance


class DoctorListSerializer(serializers.ModelSerializer):
    """Serializer specifically for listing doctors in patient view"""
    doctor_id = serializers.IntegerField(source='id', read_only=True)
    user = serializers.SerializerMethodField()
    specialty = serializers.SerializerMethodField()
    
    class Meta:
        model = Doctor
        fields = ["doctor_id", "user", "specialty", "contact", "bio"]
    
    def get_user(self, obj):
        return {
            "id": obj.user.id,
            "username": obj.user.username,
            "email": obj.user.email
        }
    
    def get_specialty(self, obj):
        if obj.specialty:
            return {
                "id": obj.specialty.id,
                "name": obj.specialty.name
            }
        return None


class DoctorAvailabilitiesSerializer(serializers.ModelSerializer):
    id = serializers.ReadOnlyField()
    user = serializers.SerializerMethodField()

    class Meta:
        model = Doctor
        fields = ["id", "user", "contact", "bio", "specialty", "availabilities"]

    def get_user(self, obj):
        return {"id": obj.user.id, "name": obj.user.username}

    def get_availabilities(self, obj):
        return AvailabilitySerializer(obj.availabilities.all(), many=True).data