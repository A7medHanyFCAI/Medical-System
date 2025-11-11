from rest_framework import serializers
from ..models.availability import Availability


class AvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Availability
        fields = ["id", "start_time", "end_time"]
        read_only_fields = ["id"]


# could be used by admin to view all aval. with corresponding doctors
class AvailabilityDoctorSerializer(serializers.ModelSerializer):
    id = serializers.ReadOnlyField()

    doctor = serializers.SerializerMethodField()

    class Meta:
        model = Availability
        fields = ["id", "doctor", "start_time", "end_time"]

    def get_doctor(self, obj):
        return {"id": obj.doctor.id, "name": obj.doctor.user.username}
