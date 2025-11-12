from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from datetime import datetime, timedelta
from ..models.availability import Availability
from ..serializers.availability_serializers import (
    AvailabilitySerializer,
    AvailabilityCreateSerializer,
    DoctorAvailabilityListSerializer
)
from ..permissions import IsDoctor


class AvailabilityViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing doctor availabilities
    - Doctors can CRUD their own availabilities
    - Patients can view availabilities (read-only)
    """
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        
        # If doctor, show only their availabilities
        if user.role == 'doctor':
            return Availability.objects.filter(doctor=user.doctor)
        
        # If patient, show all future availabilities
        elif user.role == 'patient':
            return Availability.objects.filter(
                date__gte=timezone.now().date()
            ).order_by('date', 'start_time')
        
        return Availability.objects.none()

    def get_serializer_class(self):
        if self.action == 'create' or self.action == 'update' or self.action == 'partial_update':
            return AvailabilityCreateSerializer
        elif self.action == 'list' and self.request.user.role == 'patient':
            return DoctorAvailabilityListSerializer
        return AvailabilitySerializer

    def get_permissions(self):
        """
        Doctors can create/update/delete
        Patients can only view
        """
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsDoctor()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        """Automatically assign the doctor when creating availability"""
        serializer.save(doctor=self.request.user.doctor)

    def perform_update(self, serializer):
        """Ensure doctor can only update their own availability"""
        if serializer.instance.doctor != self.request.user.doctor:
            raise permissions.PermissionDenied("You can only update your own availability.")
        serializer.save()

    def perform_destroy(self, instance):
        """Ensure doctor can only delete their own availability"""
        if instance.doctor != self.request.user.doctor:
            raise permissions.PermissionDenied("You can only delete your own availability.")
        instance.delete()

    @action(detail=False, methods=['get'])
    def my_schedule(self, request):
        """
        Get the authenticated doctor's schedule
        Query params:
        - start_date: filter from this date (YYYY-MM-DD)
        - end_date: filter until this date (YYYY-MM-DD)
        """
        if request.user.role != 'doctor':
            return Response(
                {"error": "Only doctors can access this endpoint"},
                status=status.HTTP_403_FORBIDDEN
            )

        queryset = self.get_queryset()
        
        # Filter by date range if provided
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        if start_date:
            try:
                start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
                queryset = queryset.filter(date__gte=start_date)
            except ValueError:
                return Response(
                    {"error": "Invalid start_date format. Use YYYY-MM-DD"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        if end_date:
            try:
                end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
                queryset = queryset.filter(date__lte=end_date)
            except ValueError:
                return Response(
                    {"error": "Invalid end_date format. Use YYYY-MM-DD"},
                    status=status.HTTP_400_BAD_REQUEST
                )

        serializer = AvailabilitySerializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def by_doctor(self, request):
        """
        Get availabilities for a specific doctor
        Query params:
        - doctor_id: required
        - date: optional (YYYY-MM-DD)
        """
        doctor_id = request.query_params.get('doctor_id')
        
        if not doctor_id:
            return Response(
                {"error": "doctor_id is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        queryset = Availability.objects.filter(
            doctor_id=doctor_id,
            date__gte=timezone.now().date()
        )

        # Filter by specific date if provided
        date_param = request.query_params.get('date')
        if date_param:
            try:
                date_obj = datetime.strptime(date_param, '%Y-%m-%d').date()
                queryset = queryset.filter(date=date_obj)
            except ValueError:
                return Response(
                    {"error": "Invalid date format. Use YYYY-MM-DD"},
                    status=status.HTTP_400_BAD_REQUEST
                )

        serializer = DoctorAvailabilityListSerializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def slots(self, request, pk=None):
        """
        Get all time slots for a specific availability
        Shows which slots are available and which are booked
        """
        availability = self.get_object()
        serializer = DoctorAvailabilityListSerializer(availability)
        return Response({
            'availability': serializer.data,
            'slots': serializer.data['time_slots']
        })