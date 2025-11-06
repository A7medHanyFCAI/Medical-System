from django.db import models
from django.core.exceptions import ValidationError
from django.utils import timezone
from core.models.doctor import Doctor
from core.models.patient import Patient

class Appointment(models.Model):

    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE)
    start_date_time = models.DateTimeField()
    end_date_time = models.DateTimeField()


    @property
    def duration(self):
        return self.end_date_time - self.start_date_time

    @property
    def date(self):
        return self.start_date_time.date()

    def __str__(self):
        return f"{self.patient} - {self.start_date_time:%Y-%m-%d %H:%M} to {self.end_date_time:%H:%M} ({self.status})"

    def clean(self):
        if self.start_date_time >= self.end_date_time:
            raise ValidationError("Start Time must be before End Time")

        if self.duration.total_seconds() <= 0:
            raise ValidationError("Appointment duration must be greater than zero")

        if self.start_date_time < timezone.now():
            raise ValidationError("Appointments must be in the future")

        # Doctor availability check
        availabilities = self.doctor.availabilities.all()
        valid = False
        day_of_week = self.start_date_time.weekday()
        start_time = self.start_date_time.time()
        end_time = self.end_date_time.time()

        for available_time in availabilities:
            if available_time.weekday != day_of_week:
                continue
            if start_time >= available_time.start_time and end_time <= available_time.end_time:
                valid = True

        if not valid:
            raise ValidationError("Appointment is outside doctor's availability")

        # Overlapping check
        overlapping = Appointment.objects.filter(
            doctor=self.doctor,
            start_date_time__lt=self.end_date_time,
            end_date_time__gt=self.start_date_time
        ).exclude(pk=self.pk)
        if overlapping.exists():
            raise ValidationError("This doctor already has an appointment in this time range")

    class Meta:
        ordering = ['start_date_time']
