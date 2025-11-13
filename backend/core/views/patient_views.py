from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied, NotFound
from ..serializers.appointment_serializers import AppointmentSerializer
from ..models.appointment import Appointment
from ..serializers.doctor_serializers import DoctorListSerializer
from ..models.doctor import Doctor
from ..serializers.patient_serializers import PatientProfileSerializer
from ..models.patient import Patient


class PatientDashboardView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        if user.role != 'patient':
            return Response({"error": "You are not a patient"}, status=403)
        return Response({"message": f"Welcome {user.username}!"})


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
        
        # Get patient profile - check both possible related names
        patient = None
        if hasattr(user, 'patient_profile'):
            patient = user.patient_profile
        elif hasattr(user, 'patient'):
            patient = user.patient
        
        if not patient:
            raise PermissionDenied("No patient profile found for this user")
        
        # Save with patient automatically set
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


class DoctorListView(generics.ListAPIView):
    """List all approved doctors with proper serialization"""
    serializer_class = DoctorListSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Doctor.objects.filter(is_approved=True).select_related('user', 'specialty')


class PatientRetrieveUpdateAPIView(generics.RetrieveUpdateAPIView):
    """Retrieve and update authenticated patient's profile"""
    serializer_class = PatientProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        user = self.request.user
        
        if user.role != "patient":
            raise PermissionDenied("Not a patient")
        
        try:
            # Check both possible related names
            if hasattr(user, 'patient_profile'):
                return user.patient_profile
            elif hasattr(user, 'patient'):
                return user.patient
            else:
                raise Patient.DoesNotExist
        except Patient.DoesNotExist:
            raise NotFound("Patient profile not found")