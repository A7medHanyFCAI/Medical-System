from django.db import models
from .doctor import Doctor


class Availability(models.Model):
    class WeekDays(models.TextChoices):
        MONDAY = "mon", "Monday"
        TUESDAY = "tue", "Tuesday"
        WEDNESDAY = "wed", "Wednesday"
        THURSDAY = "thu", "Thursday"
        FRIDAY = "fri", "Friday"
        SATURDAY = "sat", "Saturday"
        SUNDAY = "sun", "Sunday"

    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name="availabilities")
    day_of_week = models.CharField(choices=WeekDays.choices, max_length=10)
    start_time = models.TimeField()
    end_time = models.TimeField()
