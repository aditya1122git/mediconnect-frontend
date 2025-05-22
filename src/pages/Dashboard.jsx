// src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { healthAPI, patientAPI, appointmentAPI } from '../api';
import HealthSummary from '../components/HealthSummary';
import { format } from 'date-fns';

// Icons (using emoji for simplicity, can be replaced with proper icons)
const icons = {
  heart: "❤️",
  bloodPressure: "🩸",
  weight: "⚖️",
  glucose: "🔬",
  record: "📝",
  history: "📊",
  patient: "👤",
  doctor: "👨‍⚕️",
  qualification: "🎓",
  calendar: "📅",
  symptoms: "🤒",
  medications: "💊",
  notes: "📋",
  recordedBy: "👩‍⚕️",
  trash: "🗑️"
};

const Dashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [healthData, setHealthData] = useState({
    recentEntries: [],
    summary: {}
  });
  const [patientCount, setPatientCount] = useState(0);
  const [appointmentsCount, setAppointmentsCount] = useState(0);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  const isDoctor = currentUser?.role === 'doctor';
  const isAdmin = currentUser?.role === 'admin';

  // Redirect admin users to the admin dashboard
  useEffect(() => {
    if (isAdmin) {
      navigate('/admin/dashboard');
    }
  }, [isAdmin, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Don't fetch data if user is admin
        if (isAdmin) {
          setLoading(false);
          return;
        }

        if (isDoctor) {
          // For doctor dashboard, fetch doctor's patients only
          const patientsResponse = await patientAPI.getVisitedPatients();
          if (patientsResponse.data && patientsResponse.data.success) {
            setPatientCount(patientsResponse.data.count || 0);
          }
          
          // Fetch both confirmed and pending appointments for doctors
          const confirmedAppointmentResponse = await appointmentAPI.getMyAppointments({
            status: 'confirmed'
          });
          
          if (confirmedAppointmentResponse.data && confirmedAppointmentResponse.data.success) {
            const confirmedAppointments = confirmedAppointmentResponse.data.data;
            setAppointments(confirmedAppointments);
            setAppointmentsCount(confirmedAppointments.length);
          }
          
          // Fetch pending appointment requests count
          const pendingAppointmentResponse = await appointmentAPI.getMyAppointments({
            status: 'pending'
          });
          
          if (pendingAppointmentResponse.data && pendingAppointmentResponse.data.success) {
            setPendingRequestsCount(pendingAppointmentResponse.data.count || 0);
          }
        } else {
          // Fetch health data for patients
          const response = await healthAPI.getDashboardData();
          // Check if the response has the correct structure
          if (response.data && response.data.data) {
            setHealthData(response.data.data);
          } else {
            setHealthData({ recentEntries: [], summary: {} });
            setError('Invalid data structure received from server');
          }
        }
      } catch (error) {
        setError(isDoctor ? 'Failed to load doctor dashboard data' : 'Failed to load dashboard data');
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isDoctor, isAdmin, currentUser, navigate]);

  // Format date for appointments
  const formatAppointmentDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, 'MMMM d, yyyy');
  };

  // Format time for appointments
  const formatTimeSlot = (timeSlot) => {
    if (!timeSlot) return '';
    // Make sure time displays in a consistent format (e.g., "10:00 AM" instead of "10:00AM")
    return timeSlot.replace(/([0-9]):([0-9]{2})([AP]M)/, '$1:$2 $3');
  };

  // Function to capitalize first letter of each word
  const capitalizeFirstLetter = (string) => {
    if (!string) return '';
    return string.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Handle click on health entry
  const handleEntryClick = (entry) => {
    if (selectedEntry && selectedEntry._id === entry._id) {
      // If clicking on the same entry that's already selected, collapse it
      setSelectedEntry(null);
    } else {
      // Otherwise, select the new entry (and collapse any previously expanded one)
      setSelectedEntry(entry);
    }
  };

  const handleDeleteClick = (e, entry) => {
    e.stopPropagation(); // Prevent triggering the handleEntryClick
    setConfirmDelete(entry);
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;
    
    try {
      setDeleteLoading(true);
      console.log('Deleting health record with ID:', confirmDelete._id);
      
      // Try the delete operation
      await healthAPI.deleteHealthRecord(confirmDelete._id);
      
      // Remove the record from state
      setHealthData(prevData => ({
        ...prevData,
        recentEntries: prevData.recentEntries.filter(entry => entry._id !== confirmDelete._id)
      }));
      
      // Reset states
      setConfirmDelete(null);
      setSelectedEntry(null);
      
    } catch (err) {
      console.error('Error details:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Failed to delete record');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCancelDelete = () => {
    setConfirmDelete(null);
  };

  // Check if user can delete the record
  const canDelete = (entry) => {
    if (!currentUser || !entry) return false;
    
    // Doctors can ONLY delete records they created
    if (currentUser.role === 'doctor') {
      return entry.doctor && entry.doctor._id === currentUser.id;
    }
    
    // Patients can ONLY delete records they created themselves (self-recorded)
    if (currentUser.role === 'patient') {
      return !entry.doctor; // Only allow deleting self-recorded entries (no doctor field)
    }
    
    return false;
  };

  if (loading) {
    return <div className="loading">Loading dashboard data...</div>;
  }

  // Doctor Dashboard
  if (isDoctor) {
    return (
      <div className="dashboard animate-fade-in">
        {error && <div className="alert alert-danger">{error}</div>}
        
        <header className="dashboard-header animate-slide-in">
          <h1>Welcome, Dr. {capitalizeFirstLetter(currentUser?.name) || 'User'}!</h1>
          <p className="subtitle">Your doctor dashboard at MediConnect</p>
        </header>
        
        <div className="dashboard-actions animate-slide-in">
          <Link to="/patients" className="btn btn-primary">
            <span className="health-icon">{icons.patient}</span>
            View My Patients
          </Link>
          <Link to="/appointments" className="btn btn-primary">
            <span className="health-icon">{icons.calendar}</span>
            Manage Appointments
          </Link>
          <Link to="/profile" className="btn btn-secondary">
            <span className="health-icon">{icons.qualification}</span>
            Update Profile
          </Link>
        </div>

        {/* Upcoming Confirmed Appointments */}
        <div className="upcoming-appointments">
          <h2 className="med-card-title">
            Upcoming Appointments
            {pendingRequestsCount > 0 && (
              <span className="badge badge-warning ml-2">
                {pendingRequestsCount} pending request{pendingRequestsCount !== 1 ? 's' : ''}
              </span>
            )}
          </h2>
          {appointments.length > 0 ? (
            <div className="appointments-list animate-stagger">
              {appointments.map(appointment => (
                <div key={appointment._id} className="med-card">
                  <h3>
                    <span className="health-icon">{icons.calendar}</span>
                    {formatAppointmentDate(appointment.date)} at {formatTimeSlot(appointment.timeSlot)}
                  </h3>
                  <div className="appointment-details">
                    <p><strong>Patient:</strong> {appointment.patient.name}</p>
                    <p><strong>Reason:</strong> {appointment.reason}</p>
                    <div className="appointment-actions">
                      <Link 
                        to={`/appointments`} 
                        className="btn btn-sm btn-primary"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state animate-fade-in med-card">
              <p>No upcoming appointments. 
                {pendingRequestsCount > 0 ? ` You have ${pendingRequestsCount} pending request${pendingRequestsCount !== 1 ? 's' : ''}.` : ' Check your appointment requests in the Appointment Management section.'}
              </p>
              <Link to="/appointments?status=pending" className="btn btn-primary btn-sm">
                View Appointment Requests
              </Link>
            </div>
          )}
        </div>
        
        <div className="doctor-summary">
          <div className="med-card">
            <h2>Your Practice Summary</h2>
            <div className="doctor-stats">
              <Link to="/patients" className="stat-item" style={{ textDecoration: 'none', color: 'inherit' }}>
                <span className="stat-value">{patientCount}</span>
                <span className="stat-label">Patients</span>
                <small className="d-block text-muted mt-1">
                  Total patients you've treated
                </small>
              </Link>
              <div className="stat-item">
                <span className="stat-value">{capitalizeFirstLetter(currentUser?.specialization || 'General')}</span>
                <span className="stat-label">Specialization</span>
              </div>
            </div>
            
            {currentUser?.qualifications?.length > 0 ? (
              <div className="qualifications-section animate-fade-in">
                <h3>Your Qualifications</h3>
                <div className="qualifications-list">
                  {currentUser.qualifications.map((qualification, index) => (
                    <div key={index} className="qualification-item">
                      <div className="qualification-degree">
                        <span className="degree-icon">{icons.qualification}</span>
                        {qualification.degree}
                      </div>
                      <div className="qualification-details">
                        <span className="institution">{qualification.institution}</span>
                        <span className="year">{qualification.year}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="empty-qualifications animate-fade-in">
                <p>No qualifications added yet. Add your professional qualifications to build trust with patients.</p>
                <Link to="/profile" className="btn btn-outline-primary btn-sm">
                  Add Qualifications
                </Link>
              </div>
            )}
          </div>
        </div>
        
        <div className="recent-actions animate-stagger">
          <h2>What would you like to do?</h2>
          <div className="doctor-action-cards">
            <div className="med-card action-card">
              <h3>Patient Management</h3>
              <p>View and manage your patients' medical records</p>
              <Link to="/patients" className="btn btn-outline">View My Patients</Link>
            </div>
            
            <div className="med-card action-card">
              <h3>Appointment Requests</h3>
              <p>Review and respond to new appointment requests</p>
              <Link to="/appointments?status=pending" className="btn btn-outline">View Requests</Link>
            </div>
            
            <div className="med-card action-card">
              <h3>Add Health Record</h3>
              <p>Create a new health record for a patient</p>
              <Link to="/patients" className="btn btn-outline">Select Patient</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Patient Dashboard
  return (
    <div className="dashboard animate-fade-in">
      {error && <div className="alert alert-danger">{error}</div>}
      
      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h2>Confirm Delete</h2>
            <p>Are you sure you want to delete this health record from {new Date(confirmDelete.date).toLocaleDateString()}?</p>
            <p>This action cannot be undone.</p>
            <div className="modal-actions">
              <button 
                className="btn btn-danger" 
                onClick={handleConfirmDelete}
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </button>
              <button 
                className="btn btn-secondary" 
                onClick={handleCancelDelete}
                disabled={deleteLoading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      <header className="dashboard-header animate-slide-in">
        <h1>Welcome, {capitalizeFirstLetter(currentUser?.name) || 'Patient'}!</h1>
        <p className="subtitle">Your health dashboard at a glance</p>
      </header>
      
      <div className="dashboard-actions animate-slide-in">
        <Link to="/record" className="btn btn-primary">
          <span className="health-icon">{icons.record}</span>
          Record Health Data
        </Link>
        <Link to="/history" className="btn btn-secondary">
          <span className="health-icon">{icons.history}</span>
          View Health History
        </Link>
      </div>
      
      <HealthSummary summary={healthData.summary} selectedEntry={selectedEntry} />
      
      <div className="recent-entries">
        <h2 className="med-card-title">Recent Health Entries</h2>
        {healthData.recentEntries && healthData.recentEntries.length > 0 ? (
          <div className="entries-list animate-stagger">
            {healthData.recentEntries.map(entry => (
              <div 
                key={entry._id} 
                className={`med-card entry-card ${selectedEntry === entry ? 'selected' : ''}`}
                onClick={() => handleEntryClick(entry)}
              >
                <h3>
                  <div className="entry-date-section">
                    {new Date(entry.date).toLocaleDateString()}
                    <span className="recorded-by">
                      {entry.doctor ? `Recorded by Dr. ${entry.doctor.name || 'Unknown'}` : 'Self-recorded'}
                    </span>
                  </div>
                </h3>
                
                <div className="entry-details">
                  {entry.bloodPressure && (
                    <div>
                      <span className="health-icon blood-pressure">{icons.bloodPressure}</span>
                      Blood Pressure: {entry.bloodPressure.systolic}/{entry.bloodPressure.diastolic}
                    </div>
                  )}
                  {entry.heartRate && (
                    <div>
                      <span className="health-icon heart">{icons.heart}</span>
                      Heart Rate: {entry.heartRate} bpm
                    </div>
                  )}
                  {entry.weight && (
                    <div>
                      <span className="health-icon weight">{icons.weight}</span>
                      Weight: {entry.weight} kg
                    </div>
                  )}
                  {entry.glucoseLevel && (
                    <div>
                      <span className="health-icon glucose">{icons.glucose}</span>
                      Glucose: {entry.glucoseLevel} mg/dL
                    </div>
                  )}
                  
                  {/* Additional health information */}
                  {selectedEntry === entry && (
                    <div className="expanded-details">
                      {entry.symptoms && (
                        <div>
                          <span className="health-icon symptoms">{icons.symptoms}</span>
                          <strong>Symptoms:</strong> {entry.symptoms}
                        </div>
                      )}
                      {entry.medications && (
                        <div>
                          <span className="health-icon medications">{icons.medications}</span>
                          <strong>Medications:</strong> {entry.medications}
                        </div>
                      )}
                      {entry.notes && (
                        <div>
                          <span className="health-icon notes">{icons.notes}</span>
                          <strong>Notes:</strong> {entry.notes}
                        </div>
                      )}
                      <div className="recorded-info">
                        <span className="health-icon recorded-by">{icons.recordedBy}</span>
                        <strong>Recorded by:</strong> {entry.doctor ? `Dr. ${entry.doctor.name}` : 'Self'}
                      </div>
                    </div>
                  )}
                  
                  {/* Delete button - positioned at bottom right */}
                  {canDelete(entry) && (
                    <div className="delete-entry-container">
                      <button 
                        className="btn btn-delete-entry" 
                        onClick={(e) => handleDeleteClick(e, entry)}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state animate-fade-in">
            <p>No recent health entries. Start recording your health data today!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;