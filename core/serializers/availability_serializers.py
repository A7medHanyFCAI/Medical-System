from rest_framework import serializers
from ..models.availability import Availability


class AvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Availability
        fields = ["start_time", "end_time", "day_of_week"]


class AvailabilityDoctorSerializer(serializers.ModelSerializer):
    id = serializers.ReadOnlyField()

    doctor = serializers.SerializerMethodField()

    class Meta:
        model = Availability
        fields = ["id", "doctor", "start_time", "end_time", "day_of_week"]

    def get_doctor(self, obj):
        return {"id": obj.doctor.id, "name": obj.doctor.user.username}
