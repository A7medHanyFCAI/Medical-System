from rest_framework import serializers
from .availability_serializers import AvailabilitySerializer
from ..models.doctor import Doctor
from .user_serializers import UserProfileSerializer

class DoctorProfileSerializer(serializers.ModelSerializer):
    doctor_id = serializers.IntegerField(source='id', read_only=True)
    user = UserProfileSerializer(required=False)

    class Meta:
        model = Doctor
        fields = ["doctor_id", "user", "contact", "bio", "specialty"]

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
