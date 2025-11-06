from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from ..serializers.appointment_serializers import AppointmentSerializer
from ..models.appointment import Appointment
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied, NotFound

from ..serializers.appointment_serializers import AppointmentSerializer
from ..models.appointment import Appointment



class PatientAppointmentListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role != "patient":
            raise PermissionDenied("Only patients can access their appointments")
        return Appointment.objects.filter(patient__user=user).order_by('start_date_time')

    def perform_create(self, serializer):
        user = self.request.user
        if user.role != "patient":
            raise PermissionDenied("Only patients can create appointments")
        
        patient = getattr(user, 'patient', None)
        if not patient:
            raise PermissionDenied("No patient profile found for this user")
        
        serializer.save(patient=patient)



class PatientAppointmentRetrieveUpdateAPIView(generics.RetrieveUpdateAPIView):
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'pk'

    def get_queryset(self):
        user = self.request.user
        if user.role != "patient":
            raise PermissionDenied("Only patients can access their appointments")
        return Appointment.objects.filter(patient__user=user)

    def get_object(self):
        queryset = self.get_queryset()
        try:
            return queryset.get(pk=self.kwargs['pk'])
        except Appointment.DoesNotExist:
            raise NotFound("Appointment not found")

