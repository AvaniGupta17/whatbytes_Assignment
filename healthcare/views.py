from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.shortcuts import get_object_or_404, render
from django.db.models import Q

from .models import User, Patient, Doctor, PatientDoctorMapping
from .serializers import (
    UserRegistrationSerializer, UserLoginSerializer, UserSerializer,
    PatientSerializer, PatientCreateSerializer, DoctorSerializer,
    PatientDoctorMappingSerializer, PatientDoctorMappingListSerializer
)

# Frontend view
def frontend_view(request):
    return render(request, 'index.html')


class UserRegistrationView(APIView):
    """
    Register a new user with name, email, and password
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'message': 'User registered successfully',
                'user': UserSerializer(user).data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserLoginView(APIView):
    """
    Log in a user and return a JWT token
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            refresh = RefreshToken.for_user(user)
            return Response({
                'message': 'Login successful',
                'user': UserSerializer(user).data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PatientCreateView(generics.CreateAPIView):
    """
    Add a new patient (Authenticated users only)
    """
    serializer_class = PatientCreateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class PatientListView(generics.ListAPIView):
    """
    Retrieve all patients created by the authenticated user
    """
    serializer_class = PatientSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Patient.objects.filter(user=self.request.user)


class PatientDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Get, update, or delete details of a specific patient
    """
    serializer_class = PatientSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Patient.objects.filter(user=self.request.user)


class DoctorCreateView(generics.CreateAPIView):
    """
    Add a new doctor (Authenticated users only)
    """
    serializer_class = DoctorSerializer
    permission_classes = [permissions.IsAuthenticated]


class DoctorListView(generics.ListAPIView):
    """
    Retrieve all doctors
    """
    serializer_class = DoctorSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Doctor.objects.all()


class DoctorDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Get, update, or delete details of a specific doctor
    """
    serializer_class = DoctorSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Doctor.objects.all()


class PatientDoctorMappingCreateView(generics.CreateAPIView):
    """
    Assign a doctor to a patient
    """
    serializer_class = PatientDoctorMappingSerializer
    permission_classes = [permissions.IsAuthenticated]


class PatientDoctorMappingListView(generics.ListAPIView):
    """
    Retrieve all patient-doctor mappings
    """
    serializer_class = PatientDoctorMappingListSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = PatientDoctorMapping.objects.filter(is_active=True)


class PatientDoctorMappingByPatientView(generics.ListAPIView):
    """
    Get all doctors assigned to a specific patient
    """
    serializer_class = PatientDoctorMappingListSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        patient_id = self.kwargs.get('patient_id')
        # Check if the patient belongs to the authenticated user
        try:
            patient = Patient.objects.get(id=patient_id, user=self.request.user)
            return PatientDoctorMapping.objects.filter(patient=patient, is_active=True)
        except Patient.DoesNotExist:
            return PatientDoctorMapping.objects.none()


class PatientDoctorMappingDeleteView(generics.DestroyAPIView):
    """
    Remove a doctor from a patient (soft delete by setting is_active=False)
    """
    serializer_class = PatientDoctorMappingListSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = PatientDoctorMapping.objects.all()
    
    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save()


# Additional utility views
class DoctorSearchView(generics.ListAPIView):
    """
    Search doctors by specialization, name, or availability
    """
    serializer_class = DoctorSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = Doctor.objects.all()
        
        # Search by specialization
        specialization = self.request.query_params.get('specialization', None)
        if specialization:
            queryset = queryset.filter(specialization=specialization)
        
        # Search by name
        name = self.request.query_params.get('name', None)
        if name:
            queryset = queryset.filter(
                Q(first_name__icontains=name) | Q(last_name__icontains=name)
            )
        
        # Filter by availability
        available = self.request.query_params.get('available', None)
        if available is not None:
            available_bool = available.lower() == 'true'
            queryset = queryset.filter(is_available=available_bool)
        
        return queryset


class PatientSearchView(generics.ListAPIView):
    """
    Search patients by name or other criteria (for authenticated user's patients only)
    """
    serializer_class = PatientSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = Patient.objects.filter(user=self.request.user)
        
        # Search by name
        name = self.request.query_params.get('name', None)
        if name:
            queryset = queryset.filter(
                Q(first_name__icontains=name) | Q(last_name__icontains=name)
            )
        
        # Filter by gender
        gender = self.request.query_params.get('gender', None)
        if gender:
            queryset = queryset.filter(gender=gender)
        
        return queryset
