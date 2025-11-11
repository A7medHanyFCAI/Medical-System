from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL

class Doctor(models.Model):
    user = models.OneToOneField(User,on_delete=models.CASCADE, related_name='doctor')
    specialty = models.CharField(max_length=120, blank=True)
    bio = models.TextField(blank=True)
    contact = models.CharField(max_length=80, blank=True)
    is_approved = models.BooleanField(default=False)
    
    def __str__(self):
        try:
            username = self.user.username
        except Exception:
            username = str(self.user)
        
        return f"Dr. {username} - {self.specialty or 'No Specialty'}"
    