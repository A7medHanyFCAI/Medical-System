from django.utils import timezone
from rest_framework import serializers
from models.appointment import Appointment

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
        start = data['start_date_time']
        end = data['end_date_time']
        doctor = data['doctor']
        patient = data.get('patient', getattr(self.instance, 'patient', None))  # For updates

        # 1️⃣ Basic time validation
        if start >= end:
            raise serializers.ValidationError("Start time must be before end time")
        if start < timezone.now():
            raise serializers.ValidationError("Appointment must be in the future")

        # 2️⃣ Doctor availability check
        day_of_week = start.weekday()  # Monday=0, Sunday=6
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
            raise serializers.ValidationError("Doctor is not available at this time")

        # 3️⃣ Overlap check
        overlapping = Appointment.objects.filter(
            doctor=doctor,
            start_date_time__lt=end,
            end_date_time__gt=start
        )
        if self.instance:
            overlapping = overlapping.exclude(pk=self.instance.pk)
        if overlapping.exists():
            raise serializers.ValidationError("This doctor already has an appointment in this time range")

        # 4️⃣ Patient-only restriction (for updates/patch)
        request = self.context.get('request')
        if request and self.instance:  # Update or delete
            if request.user != self.instance.patient.user:
                raise serializers.ValidationError("You can only modify your own appointments")

        return data
