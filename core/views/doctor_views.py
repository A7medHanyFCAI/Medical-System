from django.shortcuts import get_object_or_404
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta, datetime
from core.models import Doctor, Appointment
from core.serializers import DoctorSerializer

class DoctorViewSet(viewsets.ViewSet):
    """
    A ViewSet for listing, retrieving doctors and getting availability.
    """

    def list(self, request):
        queryset = Doctor.objects.filter(is_active=True)
        name = request.query_params.get('name')
        specialty = request.query_params.get('specialty')

        if name:
            for term in name.strip().split():
                queryset = queryset.filter(user__username__icontains=term)
        if specialty:
            for term in specialty.strip().split():
                queryset = queryset.filter(specialty__name__icontains=term)

        queryset = queryset.order_by('user__username')
        serializer = DoctorSerializer(queryset, many=True)
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        queryset = Doctor.objects.filter(is_active=True)
        doctor = get_object_or_404(queryset, pk=pk)
        serializer = DoctorSerializer(doctor)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def availability(self, request, pk=None):
        doctor = get_object_or_404(Doctor, pk=pk, is_active=True)
        today = timezone.now().date()
        booked = Appointment.objects.filter(
            doctor=doctor,
            start_date_time__date__gte=today,
            start_date_time__date__lte=today + timedelta(days=7)
        )

        availability_slots = []

        for avail in doctor.availabilities.all():
            for i in range(7):
                day = today + timedelta(days=i)
                if day.weekday() != avail.weekday:
                    continue

                start_dt = datetime.combine(day, avail.start_time)
                end_dt = datetime.combine(day, avail.end_time)

                day_slots = []
                current_start = start_dt
                while current_start + timedelta(minutes=30) <= end_dt:
                    current_end = current_start + timedelta(minutes=30)

                    overlap = booked.filter(
                        start_date_time__lt=current_end,
                        end_date_time__gt=current_start
                    ).exists()

                    if not overlap and current_start > timezone.now():
                        day_slots.append({
                            "start": current_start,
                            "end": current_end
                        })

                    current_start = current_end

                if day_slots:
                    availability_slots.append({
                        "date": day,
                        "slots": day_slots
                    })

        return Response({
            "doctor_id": doctor.id,
            "doctor_name": doctor.user.username,
            "availability": availability_slots
        })
