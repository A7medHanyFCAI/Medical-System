from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from ..models import Specialty
from ..serializers.specialty_serializers import SpecialtySerializer

class SpecialtyListView(generics.ListAPIView):
    queryset = Specialty.objects.all()
    serializer_class = SpecialtySerializer
    permission_classes = [IsAuthenticated]