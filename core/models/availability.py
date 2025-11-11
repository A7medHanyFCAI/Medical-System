from django.core.exceptions import ValidationError
from django.db import models
from ..models.doctor import Doctor


class Availability(models.Model):
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE)
    start_time = models.TimeField()
    end_time = models.TimeField()

    # prevent overlapping records
    def clean(self):
        if self.end_time <= self.start_time:
            raise ValidationError("End time must be after start time.")

        overlapping = Availability.objects.filter(
            doctor=self.doctor,
            start_time__lt=self.end_time,
            end_time__gt=self.start_time,
        )

        # exculde yourself in case of update
        if self.pk:
            overlapping = overlapping.exclude(pk=self.pk)

        if overlapping.exists():
            raise ValidationError("This availability overlaps with an existing slot.")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)
