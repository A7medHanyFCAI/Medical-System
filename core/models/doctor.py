from django.db import models
from django.core.exceptions import ValidationError
from .user import User

class Doctor(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    specialty = models.CharField(max_length=100)
    contact = models.CharField(max_length=100)
    bio = models.TextField(blank=True)

    def clean(self):
        if self.user.role != "doctor":
            raise ValidationError("Assigned User doens't have the doctor role")

    def save(self, *args, **kwargs):
        # before saving make sure it's a doctor
        self.full_clean()
        super.save(*args, **kwargs)

    def __str__(self):
        return f"Dr: {self.user.username}. Spec: {self.specialty}"