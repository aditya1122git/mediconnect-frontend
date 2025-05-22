import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { patientAPI, healthAPI } from '../api';
import { useAuth } from '../contexts/AuthContext';
import HealthSummary from '../components/HealthSummary';

// Icons for health metrics
const icons = {
  heart: "❤️",
  bloodPressure: "🩸",
  weight: "⚖️",
  glucose: "🔬",
  symptoms: "🤒",
  medications: "💊",
  notes: "📋",
  calendar: "📅"
};

// Function to capitalize first letter of each word
const capitalizeWords = (str) => {
  if (!str) return '';
  return str.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const PatientRecords = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [patient, setPatient] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    // Only doctors should access this page
    if (currentUser?.role !== 'doctor') {
      setError('Access denied. Only doctors can view patient records.');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch patient details
        const patientResponse = await patientAPI.getPatientById(patientId);
        
        if (patientResponse.data.success) {
          setPatient(patientResponse.data.data);
        } else {
          setError('Failed to fetch patient details');
          setLoading(false);
          return;
        }
        
        // Fetch patient's health records
        const recordsResponse = await patientAPI.getPatientRecords(patientId);
        
        if (recordsResponse.data.success) {
          setRecords(recordsResponse.data.data);
        } else {
          setError('Failed to fetch health records');
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser, patientId]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleRecordClick = (record) => {
    setSelectedRecord(record === selectedRecord ? null : record);
  };

  const handleDeleteClick = (e, record) => {
    e.stopPropagation(); // Prevent triggering the handleRecordClick
    setConfirmDelete(record);
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;
    
    try {
      setDeleteLoading(true);
      console.log('Deleting health record with ID:', confirmDelete._id);
      
      // Try the delete operation
      await healthAPI.deleteHealthRecord(confirmDelete._id);
      
      // Remove the record from state
      setRecords(prevRecords => 
        prevRecords.filter(record => record._id !== confirmDelete._id)
      );
      
      // Reset states
      setConfirmDelete(null);
      setSelectedRecord(null);
      
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

  // Check if doctor can delete the record (only records created by this doctor)
  const canDelete = (record) => {
    if (!currentUser || !record) return false;
    
    // Doctors can only delete records they created
    if (currentUser.role === 'doctor') {
      return record.doctor && record.doctor._id === currentUser.id;
    }
    
    return false;
  };

  if (loading) {
    return <div className="loading">Loading patient records...</div>;
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  return (
    <div className="patient-records">
      {confirmDelete && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h2>Confirm Delete</h2>
            <p>Are you sure you want to delete this health record from {formatDate(confirmDelete.date)}?</p>
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
      
      <div className="page-header">
        <h1>Health Records for {capitalizeWords(patient?.name)}</h1>
        <Link 
          to={`/patients/${patientId}/add-record`}
          className="btn btn-primary"
        >
          Add New Record
        </Link>
      </div>
      
      <div className="patient-info med-card">
        <h2 className="med-card-title">Patient Information</h2>
        <p><strong>Name:</strong> {capitalizeWords(patient?.name)}</p>
        <p><strong>Email:</strong> {patient?.email}</p>
        {patient?.gender && (
          <p><strong>Gender:</strong> {capitalizeWords(patient.gender)}</p>
        )}
        {patient?.dateOfBirth && (
          <p><strong>Date of Birth:</strong> {formatDate(patient.dateOfBirth)}</p>
        )}
      </div>
      
      {selectedRecord && (
        <div className="selected-record-details">
          <HealthSummary summary={{}} selectedEntry={selectedRecord} />
        </div>
      )}
      
      {records.length === 0 ? (
        <div className="no-records med-card">
          <p>No health records found for this patient.</p>
          <button 
            className="btn btn-primary" 
            onClick={() => navigate(`/patients/${patientId}/add-record`)}
          >
            Create First Record
          </button>
        </div>
      ) : (
        <div className="recent-entries">
          <h2 className="med-card-title">Health Records</h2>
          <div className="entries-list animate-stagger">
            {records.map(record => (
              <div 
                key={record._id} 
                className={`med-card entry-card ${selectedRecord === record ? 'selected' : ''}`}
                onClick={() => handleRecordClick(record)}
              >
                <h3>
                  <div className="entry-date-section">
                    {formatDate(record.date)}
                    <span className="recorded-by">
                      {record.doctor ? `Recorded by Dr. ${capitalizeWords(record.doctor.name || 'Unknown')}` : 'Self-recorded'}
                    </span>
                  </div>
                </h3>
                
                <div className="entry-details">
                  {record.bloodPressure && (
                    <div>
                      <span className="health-icon blood-pressure">{icons.bloodPressure}</span>
                      Blood Pressure: {record.bloodPressure.systolic}/{record.bloodPressure.diastolic}
                    </div>
                  )}
                  {record.heartRate && (
                    <div>
                      <span className="health-icon heart">{icons.heart}</span>
                      Heart Rate: {record.heartRate} bpm
                    </div>
                  )}
                  {record.weight && (
                    <div>
                      <span className="health-icon weight">{icons.weight}</span>
                      Weight: {record.weight} kg
                    </div>
                  )}
                  {record.glucoseLevel && (
                    <div>
                      <span className="health-icon glucose">{icons.glucose}</span>
                      Glucose: {record.glucoseLevel} mg/dL
                    </div>
                  )}
                  
                  {/* Additional health information when selected */}
                  {selectedRecord === record && (
                    <div className="expanded-details">
                      {record.symptoms && (
                        <div>
                          <span className="health-icon symptoms">{icons.symptoms}</span>
                          <strong>Symptoms:</strong> {record.symptoms}
                        </div>
                      )}
                      {record.medications && (
                        <div>
                          <span className="health-icon medications">{icons.medications}</span>
                          <strong>Medications:</strong> {record.medications}
                        </div>
                      )}
                      {record.notes && (
                        <div>
                          <span className="health-icon notes">{icons.notes}</span>
                          <strong>Notes:</strong> {record.notes}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Delete button */}
                  {canDelete(record) && (
                    <div className="delete-entry-container">
                      <button 
                        className="btn btn-delete-entry" 
                        onClick={(e) => handleDeleteClick(e, record)}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="back-link">
        <Link to="/patients">Back to Patients List</Link>
      </div>
    </div>
  );
};

export default PatientRecords; 