from django.urls import path
from views.doctor_views import DoctorViewSet
from views.patient_views import  PatientAppointmentViewSet

# Doctor endpoints
doctor_list = DoctorViewSet.as_view({'get': 'list'})
doctor_detail = DoctorViewSet.as_view({'get': 'retrieve'})
doctor_availability = DoctorViewSet.as_view({'get': 'availability'})

# Patient appointment endpoints
appointment_list = PatientAppointmentViewSet.as_view({
    'get': 'list',
    'post': 'create'
})
appointment_detail = PatientAppointmentViewSet.as_view({
    'patch': 'partial_update',
    'put': 'update',
    'delete': 'destroy'
})

urlpatterns = [
    # Doctor URLs
    path('doctors/', doctor_list, name='doctor-list'),
    path('doctors/<int:pk>/', doctor_detail, name='doctor-detail'),
    path('doctors/<int:pk>/availability/', doctor_availability, name='doctor-availability'),

    # Patient Appointment URLs
    path('patient/appointments/', appointment_list, name='patient-appointments'),
    path('patient/appointments/<int:pk>/', appointment_detail, name='patient-appointment-detail'),
]
