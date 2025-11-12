from django.db import models
from django.core.exceptions import ValidationError
from django.utils import timezone
from datetime import datetime, timedelta
from ..models.doctor import Doctor


class Availability(models.Model):
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='availabilities')
    date = models.DateField(null=True)  # The specific date the doctor is available
    start_time = models.TimeField()  # When the doctor starts on this date
    end_time = models.TimeField()  # When the doctor ends on this date
    slot_duration = models.IntegerField(default=30, help_text="Duration of each slot in minutes (e.g., 15, 30, 60)")

    class Meta:
        ordering = ['date', 'start_time']
        unique_together = ['doctor', 'date', 'start_time']

    def __str__(self):
        return f"Dr. {self.doctor.user.username} - {self.date} ({self.start_time}-{self.end_time})"

    def clean(self):
        # Validate end time is after start time
        if self.end_time <= self.start_time:
            raise ValidationError("End time must be after start time.")

        # Validate date is not in the past
        if self.date < timezone.now().date():
            raise ValidationError("Cannot create availability for past dates.")

        # Validate slot duration is reasonable
        if self.slot_duration < 5 or self.slot_duration > 240:
            raise ValidationError("Slot duration must be between 5 and 240 minutes.")

        # Check for overlapping availabilities on the same date
        overlapping = Availability.objects.filter(
            doctor=self.doctor,
            date=self.date,
            start_time__lt=self.end_time,
            end_time__gt=self.start_time,
        )

        if self.pk:
            overlapping = overlapping.exclude(pk=self.pk)

        if overlapping.exists():
            raise ValidationError("This availability overlaps with an existing slot on the same date.")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    @property
    def duration_minutes(self):
        """Calculate total duration in minutes"""
        start_dt = datetime.combine(self.date, self.start_time)
        end_dt = datetime.combine(self.date, self.end_time)
        return int((end_dt - start_dt).total_seconds() / 60)

    def get_time_slots(self):
        """Generate all possible time slots based on slot_duration"""
        slots = []
        current_time = self.start_time
        
        while True:
            # Calculate end time for this slot
            current_dt = datetime.combine(self.date, current_time)
            slot_end_dt = current_dt + timedelta(minutes=self.slot_duration)
            slot_end_time = slot_end_dt.time()
            
            # If slot end time exceeds availability end time, break
            if slot_end_time > self.end_time:
                break
            
            slots.append({
                'start_time': current_time.strftime('%H:%M'),
                'end_time': slot_end_time.strftime('%H:%M'),
            })
            
            # Move to next slot
            current_dt = slot_end_dt
            current_time = current_dt.time()
        
        return slots