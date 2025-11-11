from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

class DoctorDashboardView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self,request):
        user = request.user
        if user.role != 'doctor':
            return Response({"error": "You are not a doctor"}, status=403)
        return Response({"message": f"Welcome Dr. {user.username}"})