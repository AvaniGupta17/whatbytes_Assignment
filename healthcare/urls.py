from django.urls import path
from . import views

app_name = 'healthcare'

urlpatterns = [
    # Frontend
    path('', views.frontend_view, name='frontend'),
    
    # Authentication APIs
    path('auth/register/', views.UserRegistrationView.as_view(), name='user-register'),
    path('auth/login/', views.UserLoginView.as_view(), name='user-login'),
    
    # Patient Management APIs
    path('patients/', views.PatientListView.as_view(), name='patient-list'),
    path('patients/create/', views.PatientCreateView.as_view(), name='patient-create'),
    path('patients/<int:pk>/', views.PatientDetailView.as_view(), name='patient-detail'),
    path('patients/search/', views.PatientSearchView.as_view(), name='patient-search'),
    
    # Doctor Management APIs
    path('doctors/', views.DoctorListView.as_view(), name='doctor-list'),
    path('doctors/create/', views.DoctorCreateView.as_view(), name='doctor-create'),
    path('doctors/<int:pk>/', views.DoctorDetailView.as_view(), name='doctor-detail'),
    path('doctors/search/', views.DoctorSearchView.as_view(), name='doctor-search'),
    
    # Patient-Doctor Mapping APIs
    path('mappings/', views.PatientDoctorMappingListView.as_view(), name='mapping-list'),
    path('mappings/create/', views.PatientDoctorMappingCreateView.as_view(), name='mapping-create'),
    path('mappings/patient/<int:patient_id>/', views.PatientDoctorMappingByPatientView.as_view(), name='mapping-by-patient'),
    path('mappings/<int:pk>/', views.PatientDoctorMappingDeleteView.as_view(), name='mapping-delete'),
]
