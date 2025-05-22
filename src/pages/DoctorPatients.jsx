import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { patientAPI } from '../api';
import { useAuth } from '../contexts/AuthContext';

const DoctorPatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { currentUser } = useAuth();

  useEffect(() => {
    // Only doctors should access this page
    if (currentUser?.role !== 'doctor') {
      setError('Access denied. Only doctors can view patients.');
      setLoading(false);
      return;
    }

    const fetchPatients = async () => {
      try {
        setLoading(true);
        // Get only patients who have visited the doctor
        const response = await patientAPI.getVisitedPatients();
        
        if (response.data.success) {
          setPatients(response.data.data);
        } else {
          setError('Failed to fetch patients');
        }
      } catch (err) {
        console.error('Error fetching patients:', err);
        setError('Failed to fetch patients. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, [currentUser]);

  if (loading) {
    return <div className="loading">Loading patients...</div>;
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  return (
    <div className="doctor-patients">
      <h1>My Patients</h1>
      <div className="alert alert-info">
        <strong>Note:</strong> This list shows patients who have visited you or have confirmed appointments with you.
      </div>
      
      {patients.length === 0 ? (
        <div className="no-patients">
          <p>No patients found.</p>
          <p>Patients appear here when they have visited you or have confirmed appointments.</p>
          <Link to="/appointments?status=pending" className="btn btn-primary">
            Check Pending Appointment Requests
          </Link>
        </div>
      ) : (
        <div className="patient-list">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Gender</th>
                <th>Age</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.map(patient => {
                // Calculate age
                const age = patient.dateOfBirth ? 
                  Math.floor((new Date() - new Date(patient.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000)) : 
                  'N/A';
                
                return (
                  <tr key={patient._id}>
                    <td>{patient.name}</td>
                    <td>{patient.gender || 'Not specified'}</td>
                    <td>{age}</td>
                    <td>
                      <div className="action-buttons">
                        <Link 
                          to={`/patients/${patient._id}`} 
                          className="btn btn-primary btn-sm"
                        >
                          View Details
                        </Link>
                        <Link 
                          to={`/patients/${patient._id}/records`}
                          className="btn btn-info btn-sm"
                        >
                          Health Records
                        </Link>
                        <Link 
                          to={`/patients/${patient._id}/add-record`}
                          className="btn btn-success btn-sm"
                        >
                          Add Record
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DoctorPatients; 