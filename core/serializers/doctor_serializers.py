from rest_framework import serializers
from .availability_serializers import AvailabilitySerializer
from ..models.doctor import Doctor

class DoctorProfileSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()

    class Meta:
        model = Doctor
        fields = ["id", "user", "contact", "bio", "specialty"]
        read_only_fields = ['id']

    def get_user(self, obj):
        return obj.user.username


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
