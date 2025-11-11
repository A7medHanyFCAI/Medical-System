from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from rest_framework import serializers
from core.models.appointment import Appointment


class AppointmentSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='patient.user.username', read_only=True)
    doctor_name = serializers.CharField(source='doctor.user.username', read_only=True)

    class Meta:
        model = Appointment
        fields = [
            'id',
            'doctor',
            'doctor_name',
            'patient',
            'patient_name',
            'start_date_time',
            'end_date_time',
            'duration',
            'date',
        ]
        read_only_fields = ['duration', 'date', 'patient_name', 'doctor_name']

    def validate(self, data):
        """
        Perform comprehensive validation for appointment creation or update:
        - Ensure start time is before end time and in the future.
        - Verify doctor availability for the requested time slot.
        - Prevent scheduling overlapping appointments for the same doctor.
        - Enforce that patients can only modify their own appointments (when updating).
        """
        start = data['start_date_time']
        end = data['end_date_time']
        doctor = data['doctor']
        # Use provided patient or fall back to existing instance (for updates)
        patient = data.get('patient', getattr(self.instance, 'patient', None))

        # Basic time validation
        if start >= end:
            raise serializers.ValidationError("Start time must be before end time.")
        if start < timezone.now():
            raise serializers.ValidationError("Appointment must be scheduled in the future.")

        # Doctor availability check: match weekday and time range
        day_of_week = start.weekday()
        start_time = start.time()
        end_time = end.time()

        availabilities = doctor.availabilities.all()
        available = any(
            slot.weekday == day_of_week and
            slot.start_time <= start_time and
            slot.end_time >= end_time
            for slot in availabilities
        )
        if not available:
            raise serializers.ValidationError("The selected doctor is not available at the requested time.")

        # Overlap detection: no other appointment for this doctor in the same interval
        overlapping = Appointment.objects.filter(
            doctor=doctor,
            start_date_time__lt=end,
            end_date_time__gt=start
        )
        if self.instance:
            overlapping = overlapping.exclude(pk=self.instance.pk)
        if overlapping.exists():
            raise serializers.ValidationError("The doctor already has an appointment during this time slot.")

        # Security: prevent users from modifying appointments they do not own
        request = self.context.get('request')
        if request and self.instance:
            if request.user != self.instance.patient.user:
                raise serializers.ValidationError("You are not authorized to modify this appointment.")

        return data

    def create(self, validated_data):
        """
        Create a new appointment and send confirmation emails to both patient and doctor.
        """
        appointment = super().create(validated_data)
        self.send_confirmation_email(appointment)
        return appointment

    def send_confirmation_email(self, appointment):
        """
        Send a confirmation email to both the patient and the doctor upon successful booking.
        """
        doctor_email = appointment.doctor.user.email
        patient_email = appointment.patient.user.email

        subject = "Appointment Confirmation"
        message = (
            f"Hello {appointment.patient.user.username},\n\n"
            f"Your appointment with Dr. {appointment.doctor.user.username} has been successfully booked.\n"
            f"Date: {appointment.start_date_time.strftime('%Y-%m-%d')}\n"
            f"Time: {appointment.start_date_time.strftime('%H:%M')} – {appointment.end_date_time.strftime('%H:%M')}\n\n"
            f"Thank you for using our service."
        )

        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[patient_email, doctor_email],
            fail_silently=True,
        )