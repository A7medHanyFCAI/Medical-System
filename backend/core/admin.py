from django.contrib import admin
from .models import Doctor,Specialty,Patient,Appointment,Availability
# Register your models here.

@admin.register(Specialty)
class SpecialtyAdmin(admin.ModelAdmin):
    list_display=['id','name']
    search_fields = ['name',]
    ordering = ['name']
    

class AvailabilityInline(admin.TabularInline):
    model = Availability
    extra = 0 
    readonly_fields = ['start_time', 'end_time']
    can_delete = False 
    verbose_name = "Doctor Availability"
    verbose_name_plural = "Availabilities"

# Doctor Admin
@admin.register(Doctor)
class DoctorAdmin(admin.ModelAdmin):
    list_display = ['get_username', 'get_email', 'specialty', 'contact', 'is_approved']
    list_filter = ['specialty', 'is_approved']
    search_fields = ['user__username', 'user__email']
    ordering = ['user__username']
    actions = ['approve_doctors', 'block_doctors']
    inlines = [AvailabilityInline]  

    # Getters
    def get_username(self, obj):
        return obj.user.username
    get_username.short_description = 'Username'

    def get_email(self, obj):
        return obj.user.email
    get_email.short_description = 'Email'

    # Actions
    @admin.action(description="Approve selected doctors")
    def approve_doctors(self, request, queryset):
        updated = queryset.update(is_approved=True)
        self.message_user(request, f"{updated} doctor(s) approved successfully!")

    @admin.action(description="Block selected doctors")
    def block_doctors(self, request, queryset):
        updated = queryset.update(is_approved=False)
        self.message_user(request, f"{updated} doctor(s) blocked successfully!")
        
        
@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = ['get_username','age','contact']
    list_filter = ['appointments__status']
    search_fields = ['user__username', 'user__email', 'contact']
    ordering = ['user__username']
    
    # Methods
    def get_username(self,obj):
        return obj.user.username
    get_username.short_description = 'Username'
    
    def get_email(self,obj):
        return obj.user.email
    get_email.short_description = 'Email'
    
    
    

@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ['get_doctor', 'get_patient', 'get_date', 'get_time_range', 'duration']
    list_filter = ['doctor', 'start_date_time']
    search_fields = ['doctor__user__username', 'patient__user__username']
    ordering = ['-start_date_time']

    # Read-only mode
    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

    
    def get_doctor(self, obj):
        return obj.doctor.user.username
    get_doctor.short_description = 'Doctor'

    def get_patient(self, obj):
        return obj.patient.user.username
    get_patient.short_description = 'Patient'

    def get_date(self, obj):
        return obj.start_date_time.date()
    get_date.short_description = 'Date'

    def get_time_range(self, obj):
        return f"{obj.start_date_time.strftime('%H:%M')} - {obj.end_date_time.strftime('%H:%M')}"
    get_time_range.short_description = 'Time Range'
