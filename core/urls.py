from django.urls import path
from .views.doctor_views import DoctorRetrieveUpdateAPIView
from .views.user_views import UserListCreateView

urlpatterns = [
    path("users/", UserListCreateView.as_view()),
    path("doctor/profile", DoctorRetrieveUpdateAPIView.as_view()),
]
