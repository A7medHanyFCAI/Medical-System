from rest_framework import viewsets, permissions
from ..models.availability import Availability
from ..serializers.availability_serializers import AvailabilitySerializer
from ..permissions import IsDoctor


class AvailabilityViewSet(viewsets.ModelViewSet):
    serializer_class = AvailabilitySerializer
    permission_classes = [permissions.IsAuthenticated, IsDoctor]

    def get_queryset(self):
        user = self.request.user
        return Availability.objects.filter(doctor=user.doctor)