from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from django.core.mail import send_mail
from django.conf import settings
from django.shortcuts import get_object_or_404
from models.appointment import Appointment, Patient
from models.patient import Patient
from serializers.appointment_serializers import AppointmentSerializer

class IsPatientOwner(permissions.BasePermission):
    """
    Custom permission: patient can only access their own appointments
    """
    def has_object_permission(self, request, view, obj):
        return obj.patient.user == request.user

class PatientAppointmentViewSet(viewsets.ModelViewSet):
    """
    Patient appointment API:
    - GET: list patient's appointments
    - POST: book new appointment
    - PATCH: reschedule
    - DELETE: cancel appointment
    """
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated, IsPatientOwner]

    def get_queryset(self):
        # Only return appointments for the logged-in patient
        patient = get_object_or_404(Patient, user=self.request.user)
        return Appointment.objects.filter(patient=patient).order_by('start_date_time')

    def perform_create(self, serializer):
        # Automatically assign the logged-in patient
        patient = get_object_or_404(Patient, user=self.request.user)
        appointment = serializer.save(patient=patient)

        # Send booking confirmation email
        send_mail(
            subject=f"Appointment booked with Dr. {appointment.doctor.user.username}",
            message=f"Your appointment is scheduled for {appointment.start_date_time} to {appointment.end_date_time}.",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[appointment.patient.user.email],
            fail_silently=False,
        )

    def perform_update(self, serializer):
        # Update appointment (reschedule)
        appointment = serializer.save()

        # Send email notification about reschedule
        send_mail(
            subject=f"Appointment rescheduled with Dr. {appointment.doctor.user.username}",
            message=f"Your appointment has been rescheduled to {appointment.start_date_time} to {appointment.end_date_time}.",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[appointment.patient.user.email],
            fail_silently=False,
        )

    def perform_destroy(self, instance):
        # Send email before deletion
        send_mail(
            subject=f"Appointment cancelled with Dr. {instance.doctor.user.username}",
            message=f"Your appointment on {instance.start_date_time} has been cancelled.",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[instance.patient.user.email],
            fail_silently=False,
        )
        instance.delete()
