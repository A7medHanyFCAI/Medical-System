from django.urls import path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from core.views.doctor_views import DoctorDashboardView
from core.views.patient_views import PatientDashboardView
from core.views.auth_views import (
    UserRegistrationView,
    MyTokenObtainPairView,
    LogoutView,
)
from core.views.availabilities_views import AvailabilityViewSet
from core.views.user_views import UserListCreateView
from core.views.doctor_views import DoctorRetrieveUpdateAPIView


router = DefaultRouter()
router.register(
    "api/doctor/availabilities", AvailabilityViewSet, basename="doctor-availability"
)

urlpatterns = [
    path("token/", MyTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/register/", UserRegistrationView.as_view(), name="user-register"),
    path(
        "api/doctor/dashboard/", DoctorDashboardView.as_view(), name="doctor-dashboard"
    ),
    path(
        "api/patient/dashboard/",
        PatientDashboardView.as_view(),
        name="patient-dashboard",
    ),
    path("api/logout/", LogoutView.as_view(), name="token_logout"),
    path(
        "api/doctor/profile/",
        DoctorRetrieveUpdateAPIView.as_view(),
        name="doctor-profile",
    ),
    path("users/", UserListCreateView.as_view(), name="user-view"),
] + router.urls
