from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from rest_framework import serializers
from core.models.appointment import Appointment
from datetime import datetime, timedelta


class AppointmentSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='patient.user.username', read_only=True)
    doctor_name = serializers.CharField(source='doctor.user.username', read_only=True)
    specialty = serializers.CharField(source='doctor.specialty.name', read_only=True)

    class Meta:
        model = Appointment
        fields = [
            'id',
            'doctor',
            'doctor_name',
            'specialty',
            'patient',
            'patient_name',
            'start_date_time',
            'end_date_time',
            'duration',
            'date',
        ]
        read_only_fields = ['duration', 'date', 'patient_name', 'doctor_name', 'specialty']

    def validate(self, data):
        """
        Comprehensive validation for appointments based on doctor's availability slots
        """
        start = data['start_date_time']
        end = data['end_date_time']
        doctor = data['doctor']
        patient = data.get('patient', getattr(self.instance, 'patient', None))

        # Basic time validation
        if start >= end:
            raise serializers.ValidationError("Start time must be before end time.")
        if start < timezone.now():
            raise serializers.ValidationError("Appointment must be scheduled in the future.")

        # Get the date and times
        appointment_date = start.date()
        appointment_start_time = start.time()
        appointment_end_time = end.time()

        # Check if doctor has availability for this date and time
        from core.models.availability import Availability
        
        availabilities = Availability.objects.filter(
            doctor=doctor,
            date=appointment_date,
            start_time__lte=appointment_start_time,
            end_time__gte=appointment_end_time
        )

        if not availabilities.exists():
            raise serializers.ValidationError(
                "The doctor is not available at this date and time. "
                "Please check the doctor's availability schedule."
            )

        # Verify the appointment matches a valid time slot
        availability = availabilities.first()
        valid_slot = False
        
        for slot in availability.get_time_slots():
            slot_start = datetime.strptime(slot['start_time'], '%H:%M').time()
            slot_end = datetime.strptime(slot['end_time'], '%H:%M').time()
            
            if appointment_start_time == slot_start and appointment_end_time == slot_end:
                valid_slot = True
                break

        if not valid_slot:
            raise serializers.ValidationError(
                f"The selected time does not match the doctor's available time slots. "
                f"Please select a valid slot from the doctor's schedule."
            )

        # Check for overlapping appointments
        overlapping = Appointment.objects.filter(
            doctor=doctor,
            start_date_time__lt=end,
            end_date_time__gt=start
        )
        if self.instance:
            overlapping = overlapping.exclude(pk=self.instance.pk)
        
        if overlapping.exists():
            raise serializers.ValidationError(
                "This time slot is already booked. Please choose another time."
            )

        # Security: prevent users from modifying appointments they don't own
        request = self.context.get('request')
        if request and self.instance:
            if request.user != self.instance.patient.user:
                raise serializers.ValidationError(
                    "You are not authorized to modify this appointment."
                )

        return data

    def create(self, validated_data):
        """Create appointment and send confirmation emails"""
        appointment = super().create(validated_data)
        self.send_confirmation_email(appointment)
        return appointment

    def send_confirmation_email(self, appointment):
        """Send confirmation email to both patient and doctor"""
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

        if doctor_email and patient_email:
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[patient_email, doctor_email],
                fail_silently=True,
            )


class AppointmentCreateSerializer(serializers.ModelSerializer):
    """Simplified serializer for creating appointments"""
    
    class Meta:
        model = Appointment
        fields = [
            'doctor',
            'start_date_time',
            'end_date_time',
        ]

    def validate(self, data):
        # Use the same validation as AppointmentSerializer
        serializer = AppointmentSerializer(context=self.context)
        return serializer.validate(data)