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
from core.views.patient_views import (
    PatientAppointmentListCreateAPIView,
    PatientAppointmentRetrieveUpdateAPIView,
)
from core.views.doctor_views import DoctorAppointmentListView
from core.views.patient_views import DoctorListView
from core.views.specialty_views import SpecialtyListView


router = DefaultRouter()
# Register availability routes
router.register(
    "api/availabilities", 
    AvailabilityViewSet, 
    basename="availability"
)

urlpatterns = [
    # Authentication
    path("token/", MyTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/register/", UserRegistrationView.as_view(), name="user-register"),
    path("api/logout/", LogoutView.as_view(), name="token_logout"),
    
    # Dashboards
    path(
        "api/doctor/dashboard/", 
        DoctorDashboardView.as_view(), 
        name="doctor-dashboard"
    ),
    path(
        "api/patient/dashboard/",
        PatientDashboardView.as_view(),
        name="patient-dashboard",
    ),
    
    # Doctor Profile
    path(
        "api/doctor/profile/",
        DoctorRetrieveUpdateAPIView.as_view(),
        name="doctor-profile",
    ),
    
    # Users
    path("users/", UserListCreateView.as_view(), name="user-view"),
    
    # Patient Appointments
    path(
        "api/patient/appointments/",
        PatientAppointmentListCreateAPIView.as_view(),
        name="patient-appointment-list-create",
    ),
    path(
        "api/patient/appointments/<int:pk>/",
        PatientAppointmentRetrieveUpdateAPIView.as_view(),
        name="patient-appointment-detail",
    ),
    path('api/doctor/appointments/', DoctorAppointmentListView.as_view(), name='doctor-appointments'),
    
    # Patient - browse doctors
    path('api/doctors/', DoctorListView.as_view(), name='doctors-list'),
    
    # Specialties
    path('api/specialties/', SpecialtyListView.as_view(), name='specialties-list'),
] + router.urls