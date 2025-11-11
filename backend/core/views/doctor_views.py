from rest_framework.views import APIView
from rest_framework import generics
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied, NotFound
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from ..serializers.doctor_serializers import DoctorProfileSerializer
from ..models.doctor import Doctor


class DoctorDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role != "doctor":
            return Response({"error": "You are not a doctor"}, status=403)
        return Response({"message": f"Welcome Dr. {user.username}"})


class DoctorRetrieveUpdateAPIView(generics.RetrieveUpdateAPIView):
    serializer_class = DoctorProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        user = self.request.user

        if user.role != "doctor":
            raise PermissionDenied("Not a doctor")

        try:
            return Doctor.objects.get(user=user)
        except Doctor.DoesNotExist:
            raise NotFound("Doctor not found")

class DoctorDashboardView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self,request):
        user = request.user
        if user.role != 'doctor':
            return Response({"error": "You are not a doctor"}, status=403)
        return Response({"message": f"Welcome Dr. {user.username}"})
