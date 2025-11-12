from rest_framework import serializers
from ..models.availability import Availability


class AvailabilitySerializer(serializers.ModelSerializer):
    time_slots = serializers.SerializerMethodField()
    duration_minutes = serializers.ReadOnlyField()
    doctor_name = serializers.CharField(source='doctor.user.username', read_only=True)

    class Meta:
        model = Availability
        fields = [
            "id",
            "doctor",
            "doctor_name",
            "date",
            "start_time",
            "end_time",
            "slot_duration",
            "duration_minutes",
            "time_slots"
        ]
        read_only_fields = ["id", "duration_minutes", "time_slots", "doctor_name"]

    def get_time_slots(self, obj):
        """Get all time slots for this availability"""
        return obj.get_time_slots()


class AvailabilityCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating availabilities"""
    
    class Meta:
        model = Availability
        fields = [
            "date",
            "start_time",
            "end_time",
            "slot_duration",
        ]

    def validate(self, data):
        """Additional validation"""
        # Check if date is not in the past
        from django.utils import timezone
        if data['date'] < timezone.now().date():
            raise serializers.ValidationError("Cannot create availability for past dates.")
        
        # Check if end_time is after start_time
        if data['end_time'] <= data['start_time']:
            raise serializers.ValidationError("End time must be after start time.")
        
        return data


class DoctorAvailabilityListSerializer(serializers.ModelSerializer):
    """Serializer for listing all availabilities with doctor info"""
    doctor_id = serializers.IntegerField(source='doctor.id', read_only=True)
    doctor_name = serializers.CharField(source='doctor.user.username', read_only=True)
    specialty = serializers.CharField(source='doctor.specialty.name', read_only=True)
    time_slots = serializers.SerializerMethodField()

    class Meta:
        model = Availability
        fields = [
            "id",
            "doctor_id",
            "doctor_name",
            "specialty",
            "date",
            "start_time",
            "end_time",
            "slot_duration",
            "time_slots"
        ]

    def get_time_slots(self, obj):
        """Get available time slots (not already booked)"""
        from ..models.appointment import Appointment
        from django.utils import timezone
        import datetime

        all_slots = obj.get_time_slots()
        
        # Get all booked appointments for this availability
        booked_appointments = Appointment.objects.filter(
            doctor=obj.doctor,
            start_date_time__date=obj.date
        )
        
        # Mark slots as available or booked
        for slot in all_slots:
            slot_start_str = slot['start_time']
            slot_end_str = slot['end_time']
            
            # Convert to datetime for comparison
            slot_start = datetime.datetime.strptime(slot_start_str, '%H:%M').time()
            slot_end = datetime.datetime.strptime(slot_end_str, '%H:%M').time()
            
            # Check if this slot is booked
            is_booked = booked_appointments.filter(
                start_date_time__time=slot_start,
                end_date_time__time=slot_end
            ).exists()
            
            slot['is_available'] = not is_booked
            
            # Check if slot is in the past
            if obj.date == timezone.now().date():
                current_time = timezone.now().time()
                if slot_start < current_time:
                    slot['is_available'] = False
        
        return all_slots