from django.contrib import admin
from .models import User, Patient, Doctor, PatientDoctorMapping


@admin.register(User)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ('email', 'name', 'tc', 'is_active', 'is_admin', 'created_at')
    list_filter = ('is_active', 'is_admin', 'tc', 'created_at')
    search_fields = ('email', 'name')
    ordering = ('-created_at',)
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('name', 'tc')}),
        ('Permissions', {'fields': ('is_active', 'is_admin')}),
        ('Important dates', {'fields': ('last_login', 'created_at', 'updated_at')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'name', 'tc', 'password1', 'password2'),
        }),
    )


@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'user', 'date_of_birth', 'gender', 'phone_number', 'created_at')
    list_filter = ('gender', 'created_at', 'user')
    search_fields = ('first_name', 'last_name', 'phone_number', 'user__email')
    ordering = ('-created_at',)
    
    fieldsets = (
        ('Personal Information', {
            'fields': ('user', 'first_name', 'last_name', 'date_of_birth', 'gender')
        }),
        ('Contact Information', {
            'fields': ('phone_number', 'address', 'emergency_contact', 'emergency_phone')
        }),
        ('Medical Information', {
            'fields': ('medical_history',)
        }),
    )


@admin.register(Doctor)
class DoctorAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'specialization', 'license_number', 'phone_number', 'email', 'is_available', 'created_at')
    list_filter = ('specialization', 'gender', 'is_available', 'created_at')
    search_fields = ('first_name', 'last_name', 'license_number', 'email', 'phone_number')
    ordering = ('-created_at',)
    
    fieldsets = (
        ('Personal Information', {
            'fields': ('first_name', 'last_name', 'gender')
        }),
        ('Professional Information', {
            'fields': ('specialization', 'license_number', 'experience_years', 'is_available')
        }),
        ('Contact Information', {
            'fields': ('phone_number', 'email', 'address')
        }),
    )


@admin.register(PatientDoctorMapping)
class PatientDoctorMappingAdmin(admin.ModelAdmin):
    list_display = ('patient', 'doctor', 'assigned_date', 'is_active', 'created_at')
    list_filter = ('is_active', 'assigned_date', 'created_at', 'doctor__specialization')
    search_fields = ('patient__first_name', 'patient__last_name', 'doctor__first_name', 'doctor__last_name')
    ordering = ('-assigned_date',)
    
    fieldsets = (
        ('Mapping Information', {
            'fields': ('patient', 'doctor', 'is_active')
        }),
        ('Additional Information', {
            'fields': ('notes',)
        }),
    )