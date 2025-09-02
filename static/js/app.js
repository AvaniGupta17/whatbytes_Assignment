// Healthcare Management System Frontend JavaScript

// Global variables
let currentUser = null;
let accessToken = localStorage.getItem('accessToken');
const API_BASE = 'http://127.0.0.1:8000/api';

// Bootstrap modal instances
let loginModal, registerModal, addPatientModal, addDoctorModal, addMappingModal;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeModals();
    checkAuthStatus();
    loadDashboard();
    
    // Add event listeners
    document.getElementById('patientSearch').addEventListener('input', debounce(searchPatients, 300));
    document.getElementById('doctorSearch').addEventListener('input', debounce(searchDoctors, 300));
});

// Initialize Bootstrap modals
function initializeModals() {
    loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
    registerModal = new bootstrap.Modal(document.getElementById('registerModal'));
    addPatientModal = new bootstrap.Modal(document.getElementById('addPatientModal'));
    addDoctorModal = new bootstrap.Modal(document.getElementById('addDoctorModal'));
    addMappingModal = new bootstrap.Modal(document.getElementById('addMappingModal'));
}

// Check authentication status
function checkAuthStatus() {
    if (accessToken) {
        // Verify token is still valid
        fetch(`${API_BASE}/patients/`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        })
        .then(response => {
            if (response.ok) {
                setAuthenticatedState();
                loadAllData();
            } else {
                logout();
            }
        })
        .catch(() => logout());
    }
}

// Set authenticated state
function setAuthenticatedState() {
    currentUser = JSON.parse(localStorage.getItem('user'));
    document.getElementById('authSection').innerHTML = `
        <span class="navbar-text me-3">Welcome, ${currentUser.name}</span>
        <button class="btn btn-outline-light" onclick="logout()">Logout</button>
    `;
}

// Logout function
function logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    accessToken = null;
    currentUser = null;
    document.getElementById('authSection').innerHTML = `
        <button class="btn btn-outline-light" onclick="showLoginModal()">Login</button>
    `;
    clearAllData();
}

// Show login modal
function showLoginModal() {
    loginModal.show();
}

// Show register modal
function showRegisterModal() {
    registerModal.show();
}

// Show add patient modal
function showAddPatientModal() {
    if (!accessToken) {
        showAlert('Please login first', 'warning');
        return;
    }
    addPatientModal.show();
}

// Show add doctor modal
function showAddDoctorModal() {
    if (!accessToken) {
        showAlert('Please login first', 'warning');
        return;
    }
    addDoctorModal.show();
}

// Show add mapping modal
function showAddMappingModal() {
    if (!accessToken) {
        showAlert('Please login first', 'warning');
        return;
    }
    loadPatientsForMapping();
    loadDoctorsForMapping();
    addMappingModal.show();
}

// Login function
async function login() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const response = await fetch(`${API_BASE}/auth/login/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            accessToken = data.tokens.access;
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('user', JSON.stringify(data.user));
            currentUser = data.user;
            
            setAuthenticatedState();
            loginModal.hide();
            showAlert('Login successful!', 'success');
            loadAllData();
        } else {
            showAlert(data.detail || 'Login failed', 'danger');
        }
    } catch (error) {
        showAlert('Network error. Please try again.', 'danger');
    }
}

// Register function
async function register() {
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const password2 = document.getElementById('registerPassword2').value;
    const tc = document.getElementById('registerTc').checked;
    
    if (password !== password2) {
        showAlert('Passwords do not match', 'danger');
        return;
    }
    
    if (!tc) {
        showAlert('Please accept terms and conditions', 'warning');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/auth/register/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password, password2, tc })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            registerModal.hide();
            showAlert('Registration successful! Please login.', 'success');
            showLoginModal();
        } else {
            showAlert(data.detail || 'Registration failed', 'danger');
        }
    } catch (error) {
        showAlert('Network error. Please try again.', 'danger');
    }
}

// Load dashboard data
async function loadDashboard() {
    if (!accessToken) return;
    
    try {
        const [patientsRes, doctorsRes, mappingsRes] = await Promise.all([
            fetch(`${API_BASE}/patients/`, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            }),
            fetch(`${API_BASE}/doctors/`, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            }),
            fetch(`${API_BASE}/mappings/`, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            })
        ]);
        
        const patients = await patientsRes.json();
        const doctors = await doctorsRes.json();
        const mappings = await mappingsRes.json();
        
        document.getElementById('totalPatients').textContent = patients.length;
        document.getElementById('totalDoctors').textContent = doctors.length;
        document.getElementById('totalMappings').textContent = mappings.length;
        document.getElementById('totalUsers').textContent = currentUser ? 1 : 0;
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

// Load all data
function loadAllData() {
    loadPatients();
    loadDoctors();
    loadMappings();
    loadDashboard();
}

// Clear all data
function clearAllData() {
    document.getElementById('patientsList').innerHTML = '';
    document.getElementById('doctorsList').innerHTML = '';
    document.getElementById('mappingsList').innerHTML = '';
    document.getElementById('totalPatients').textContent = '0';
    document.getElementById('totalDoctors').textContent = '0';
    document.getElementById('totalMappings').textContent = '0';
    document.getElementById('totalUsers').textContent = '0';
}

// Load patients
async function loadPatients() {
    if (!accessToken) return;
    
    showLoading('patientLoading', true);
    
    try {
        const response = await fetch(`${API_BASE}/patients/`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        
        if (response.ok) {
            const patients = await response.json();
            displayPatients(patients);
        } else {
            showAlert('Failed to load patients', 'danger');
        }
    } catch (error) {
        showAlert('Network error loading patients', 'danger');
    } finally {
        showLoading('patientLoading', false);
    }
}

// Display patients
function displayPatients(patients) {
    const container = document.getElementById('patientsList');
    
    if (patients.length === 0) {
        container.innerHTML = '<div class="alert alert-info">No patients found.</div>';
        return;
    }
    
    const html = patients.map(patient => `
        <div class="card patient-card mb-3" onclick="viewPatient(${patient.id})">
            <div class="card-body">
                <div class="row align-items-center">
                    <div class="col-md-8">
                        <h5 class="card-title">${patient.first_name} ${patient.last_name}</h5>
                        <p class="card-text">
                            <span class="gender-badge ${patient.gender === 'M' ? 'male' : patient.gender === 'F' ? 'female' : 'other'}">
                                ${patient.gender === 'M' ? 'Male' : patient.gender === 'F' ? 'Female' : 'Other'}
                            </span>
                            <span class="ms-2">DOB: ${patient.date_of_birth}</span>
                        </p>
                        <p class="card-text">
                            <i class="fas fa-phone me-2"></i>${patient.phone_number}<br>
                            <i class="fas fa-map-marker-alt me-2"></i>${patient.address}
                        </p>
                    </div>
                    <div class="col-md-4 text-end">
                        <button class="btn btn-sm btn-outline-primary" onclick="editPatient(${patient.id}); event.stopPropagation();">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deletePatient(${patient.id}); event.stopPropagation();">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = html;
}

// Search patients
async function searchPatients() {
    const query = document.getElementById('patientSearch').value;
    if (!query.trim()) {
        loadPatients();
        return;
    }
    
    if (!accessToken) return;
    
    try {
        const response = await fetch(`${API_BASE}/patients/search/?name=${encodeURIComponent(query)}`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        
        if (response.ok) {
            const patients = await response.json();
            displayPatients(patients);
        }
    } catch (error) {
        console.error('Search error:', error);
    }
}

// Load doctors
async function loadDoctors() {
    if (!accessToken) return;
    
    showLoading('doctorLoading', true);
    
    try {
        const response = await fetch(`${API_BASE}/doctors/`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        
        if (response.ok) {
            const doctors = await response.json();
            displayDoctors(doctors);
        } else {
            showAlert('Failed to load doctors', 'danger');
        }
    } catch (error) {
        showAlert('Network error loading doctors', 'danger');
    } finally {
        showLoading('doctorLoading', false);
    }
}

// Display doctors
function displayDoctors(doctors) {
    const container = document.getElementById('doctorsList');
    
    if (doctors.length === 0) {
        container.innerHTML = '<div class="alert alert-info">No doctors found.</div>';
        return;
    }
    
    const html = doctors.map(doctor => `
        <div class="card doctor-card mb-3" onclick="viewDoctor(${doctor.id})">
            <div class="card-body">
                <div class="row align-items-center">
                    <div class="col-md-8">
                        <h5 class="card-title">${doctor.first_name} ${doctor.last_name}</h5>
                        <p class="card-text">
                            <span class="specialization-badge">${doctor.specialization_display}</span>
                            <span class="ms-2">License: ${doctor.license_number}</span>
                        </p>
                        <p class="card-text">
                            <i class="fas fa-phone me-2"></i>${doctor.phone_number}<br>
                            <i class="fas fa-envelope me-2"></i>${doctor.email}<br>
                            <i class="fas fa-briefcase me-2"></i>${doctor.experience_years} years experience
                        </p>
                    </div>
                    <div class="col-md-4 text-end">
                        <button class="btn btn-sm btn-outline-primary" onclick="editDoctor(${doctor.id}); event.stopPropagation();">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteDoctor(${doctor.id}); event.stopPropagation();">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = html;
}

// Search doctors
async function searchDoctors() {
    const query = document.getElementById('doctorSearch').value;
    if (!query.trim()) {
        loadDoctors();
        return;
    }
    
    if (!accessToken) return;
    
    try {
        const response = await fetch(`${API_BASE}/doctors/search/?name=${encodeURIComponent(query)}`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        
        if (response.ok) {
            const doctors = await response.json();
            displayDoctors(doctors);
        }
    } catch (error) {
        console.error('Search error:', error);
    }
}

// Load mappings
async function loadMappings() {
    if (!accessToken) return;
    
    showLoading('mappingLoading', true);
    
    try {
        const response = await fetch(`${API_BASE}/mappings/`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        
        if (response.ok) {
            const mappings = await response.json();
            displayMappings(mappings);
        } else {
            showAlert('Failed to load mappings', 'danger');
        }
    } catch (error) {
        showAlert('Network error loading mappings', 'danger');
    } finally {
        showLoading('mappingLoading', false);
    }
}

// Display mappings
function displayMappings(mappings) {
    const container = document.getElementById('mappingsList');
    
    if (mappings.length === 0) {
        container.innerHTML = '<div class="alert alert-info">No mappings found.</div>';
        return;
    }
    
    const html = mappings.map(mapping => `
        <div class="card mb-3">
            <div class="card-body">
                <div class="row align-items-center">
                    <div class="col-md-8">
                        <h6 class="card-title">
                            <i class="fas fa-user-injured me-2"></i>${mapping.patient.first_name} ${mapping.patient.last_name}
                            <i class="fas fa-arrow-right mx-3"></i>
                            <i class="fas fa-user-md me-2"></i>${mapping.doctor.first_name} ${mapping.doctor.last_name}
                        </h6>
                        <p class="card-text">
                            <small class="text-muted">
                                <i class="fas fa-calendar me-2"></i>Assigned: ${new Date(mapping.assigned_date).toLocaleDateString()}
                                ${mapping.notes ? `<br><i class="fas fa-sticky-note me-2"></i>${mapping.notes}` : ''}
                            </small>
                        </p>
                    </div>
                    <div class="col-md-4 text-end">
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteMapping(${mapping.id})">
                            <i class="fas fa-trash"></i> Remove
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = html;
}

// Add patient
async function addPatient() {
    const formData = {
        first_name: document.getElementById('patientFirstName').value,
        last_name: document.getElementById('patientLastName').value,
        date_of_birth: document.getElementById('patientDob').value,
        gender: document.getElementById('patientGender').value,
        phone_number: document.getElementById('patientPhone').value,
        address: document.getElementById('patientAddress').value,
        medical_history: document.getElementById('patientMedicalHistory').value,
        emergency_contact: document.getElementById('patientEmergencyContact').value,
        emergency_phone: document.getElementById('patientEmergencyPhone').value
    };
    
    try {
        const response = await fetch(`${API_BASE}/patients/create/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            addPatientModal.hide();
            showAlert('Patient added successfully!', 'success');
            loadPatients();
            loadDashboard();
            // Reset form
            document.getElementById('addPatientForm').reset();
        } else {
            const data = await response.json();
            showAlert(data.detail || 'Failed to add patient', 'danger');
        }
    } catch (error) {
        showAlert('Network error. Please try again.', 'danger');
    }
}

// Add doctor
async function addDoctor() {
    const formData = {
        first_name: document.getElementById('doctorFirstName').value,
        last_name: document.getElementById('doctorLastName').value,
        specialization: document.getElementById('doctorSpecialization').value,
        license_number: document.getElementById('doctorLicense').value,
        phone_number: document.getElementById('doctorPhone').value,
        email: document.getElementById('doctorEmail').value,
        experience_years: parseInt(document.getElementById('doctorExperience').value),
        gender: document.getElementById('doctorGender').value,
        address: document.getElementById('doctorAddress').value
    };
    
    try {
        const response = await fetch(`${API_BASE}/doctors/create/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            addDoctorModal.hide();
            showAlert('Doctor added successfully!', 'success');
            loadDoctors();
            loadDashboard();
            // Reset form
            document.getElementById('addDoctorForm').reset();
        } else {
            const data = await response.json();
            showAlert(data.detail || 'Failed to add doctor', 'danger');
        }
    } catch (error) {
        showAlert('Network error. Please try again.', 'danger');
    }
}

// Load patients for mapping
async function loadPatientsForMapping() {
    try {
        const response = await fetch(`${API_BASE}/patients/`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        
        if (response.ok) {
            const patients = await response.json();
            const select = document.getElementById('mappingPatient');
            select.innerHTML = '<option value="">Select Patient</option>';
            patients.forEach(patient => {
                select.innerHTML += `<option value="${patient.id}">${patient.first_name} ${patient.last_name}</option>`;
            });
        }
    } catch (error) {
        console.error('Error loading patients for mapping:', error);
    }
}

// Load doctors for mapping
async function loadDoctorsForMapping() {
    try {
        const response = await fetch(`${API_BASE}/doctors/`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        
        if (response.ok) {
            const doctors = await response.json();
            const select = document.getElementById('mappingDoctor');
            select.innerHTML = '<option value="">Select Doctor</option>';
            doctors.forEach(doctor => {
                select.innerHTML += `<option value="${doctor.id}">${doctor.first_name} ${doctor.last_name} - ${doctor.specialization_display}</option>`;
            });
        }
    } catch (error) {
        console.error('Error loading doctors for mapping:', error);
    }
}

// Add mapping
async function addMapping() {
    const patientId = document.getElementById('mappingPatient').value;
    const doctorId = document.getElementById('mappingDoctor').value;
    const notes = document.getElementById('mappingNotes').value;
    
    if (!patientId || !doctorId) {
        showAlert('Please select both patient and doctor', 'warning');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/mappings/create/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({ patient_id: patientId, doctor_id: doctorId, notes })
        });
        
        if (response.ok) {
            addMappingModal.hide();
            showAlert('Mapping created successfully!', 'success');
            loadMappings();
            loadDashboard();
            // Reset form
            document.getElementById('addMappingForm').reset();
        } else {
            const data = await response.json();
            showAlert(data.detail || 'Failed to create mapping', 'danger');
        }
    } catch (error) {
        showAlert('Network error. Please try again.', 'danger');
    }
}

// Delete functions
async function deletePatient(id) {
    if (confirm('Are you sure you want to delete this patient?')) {
        try {
            const response = await fetch(`${API_BASE}/patients/${id}/`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            
            if (response.ok) {
                showAlert('Patient deleted successfully!', 'success');
                loadPatients();
                loadDashboard();
            } else {
                showAlert('Failed to delete patient', 'danger');
            }
        } catch (error) {
            showAlert('Network error. Please try again.', 'danger');
        }
    }
}

async function deleteDoctor(id) {
    if (confirm('Are you sure you want to delete this doctor?')) {
        try {
            const response = await fetch(`${API_BASE}/doctors/${id}/`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            
            if (response.ok) {
                showAlert('Doctor deleted successfully!', 'success');
                loadDoctors();
                loadDashboard();
            } else {
                showAlert('Failed to delete doctor', 'danger');
            }
        } catch (error) {
            showAlert('Network error. Please try again.', 'danger');
        }
    }
}

async function deleteMapping(id) {
    if (confirm('Are you sure you want to remove this mapping?')) {
        try {
            const response = await fetch(`${API_BASE}/mappings/${id}/`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            
            if (response.ok) {
                showAlert('Mapping removed successfully!', 'success');
                loadMappings();
                loadDashboard();
            } else {
                showAlert('Failed to remove mapping', 'danger');
            }
        } catch (error) {
            showAlert('Network error. Please try again.', 'danger');
        }
    }
}

// View functions (placeholder for future implementation)
function viewPatient(id) {
    showAlert('View patient functionality coming soon!', 'info');
}

function viewDoctor(id) {
    showAlert('View doctor functionality coming soon!', 'info');
}

// Edit functions (placeholder for future implementation)
function editPatient(id) {
    showAlert('Edit patient functionality coming soon!', 'info');
}

function editDoctor(id) {
    showAlert('Edit doctor functionality coming soon!', 'info');
}

// Utility functions
function showLoading(elementId, show) {
    const element = document.getElementById(elementId);
    element.style.display = show ? 'block' : 'none';
}

function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    // Insert at the top of the container
    const container = document.querySelector('.container');
    container.insertBefore(alertDiv, container.firstChild);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
