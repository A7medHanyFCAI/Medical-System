from rest_framework import generics, permissions, exceptions

from ..models.doctor import Doctor
from ..serializers.doctor_serializers import DoctorProfileSerializer


class DoctorRetrieveUpdateAPIView(generics.RetrieveUpdateAPIView):
    # GET	/doctor/profile/	Retrieve your own doctor profile
    # PUT	/doctor/profile/	Update all fields (contact, bio, specialty)
    # PATCH	/doctor/profile/	Partially update fields

    serializer_class = DoctorProfileSerializer
    permission_classes = [permissions.AllowAny]

    def get_object(self):
        try:
            return Doctor.objects.get(user=self.request.user)
        except Doctor.DoesNotExist:
            raise exceptions.NotFound("Doctor profile not found")
