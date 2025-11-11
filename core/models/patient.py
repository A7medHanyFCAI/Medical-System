from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL

class Patient(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='patient_profile')
    age = models.PositiveIntegerField(null=True, blank=True)
    contact = models.CharField(max_length=80, blank=True)
    def __str__(self):
        try:
            username = self.user.username
        except Exception:
            username = str(self.user)
        return f"Patient: {username}"