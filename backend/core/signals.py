from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings
from .models.doctor import Doctor
from .models.patient import Patient


@receiver(post_save,sender=settings.AUTH_USER_MODEL)
def create_user_profile(sender, instance, created, **kwargs):
    """
    Signal to auto-create Doctor or Patient profile after a User is created.
    """
    if created:
        role = instance.role
        if role == 'doctor':
            Doctor.objects.create(user=instance)
        elif role == 'patient':
            Patient.objects.create(user=instance)