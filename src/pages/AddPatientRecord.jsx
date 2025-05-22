import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { patientAPI } from '../api';
import { useAuth } from '../contexts/AuthContext';

const AddPatientRecord = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [patientData, setPatientData] = useState(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().slice(0, 10),
    bloodPressure: { systolic: '', diastolic: '' },
    heartRate: '',
    weight: '',
    glucoseLevel: '',
    symptoms: '',
    medications: '',
    notes: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Only doctors should access this page
    if (currentUser?.role !== 'doctor') {
      setError('Access denied. Only doctors can add patient records.');
      setLoading(false);
      return;
    }

    const fetchPatientData = async () => {
      try {
        const response = await patientAPI.getPatientById(patientId);
        
        if (response.data.success) {
          setPatientData(response.data.data);
        } else {
          setError('Failed to fetch patient details');
        }
      } catch (err) {
        console.error('Error fetching patient:', err);
        setError('Failed to fetch patient details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [currentUser, patientId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    
    try {
      const dataToSubmit = {
        ...formData,
        bloodPressure: {
          systolic: formData.bloodPressure.systolic ? parseInt(formData.bloodPressure.systolic) : null,
          diastolic: formData.bloodPressure.diastolic ? parseInt(formData.bloodPressure.diastolic) : null
        },
        heartRate: formData.heartRate ? parseInt(formData.heartRate) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        glucoseLevel: formData.glucoseLevel ? parseInt(formData.glucoseLevel) : null
      };
      
      const response = await patientAPI.createPatientRecord(patientId, dataToSubmit);
      
      if (response.data.success) {
        navigate(`/patients/${patientId}/records`);
      } else {
        setError(response.data.error || 'Failed to create record');
      }
    } catch (err) {
      console.error('Error creating health record:', err);
      setError(err.response?.data?.error || 'Failed to create health record. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading patient data...</div>;
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  return (
    <div className="add-patient-record">
      <h1>Add Health Record for {patientData?.name}</h1>
      <div className="patient-info">
        <p><strong>Patient:</strong> {patientData?.name}</p>
        <p><strong>Email:</strong> {patientData?.email}</p>
        {patientData?.gender && (
          <p><strong>Gender:</strong> {patientData.gender}</p>
        )}
        {patientData?.dateOfBirth && (
          <p><strong>Date of Birth:</strong> {new Date(patientData.dateOfBirth).toLocaleDateString()}</p>
        )}
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="date">Date</label>
          <input
            type="date"
            id="date"
            name="date"
            className="form-control"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Blood Pressure (mmHg)</label>
          <div className="blood-pressure-inputs">
            <input
              type="number"
              name="bloodPressure.systolic"
              placeholder="Systolic"
              className="form-control"
              value={formData.bloodPressure.systolic}
              onChange={handleChange}
              min="60"
              max="250"
            />
            <span>/</span>
            <input
              type="number"
              name="bloodPressure.diastolic"
              placeholder="Diastolic"
              className="form-control"
              value={formData.bloodPressure.diastolic}
              onChange={handleChange}
              min="40"
              max="150"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="heartRate">Heart Rate (bpm)</label>
          <input
            type="number"
            id="heartRate"
            name="heartRate"
            className="form-control"
            value={formData.heartRate}
            onChange={handleChange}
            min="30"
            max="220"
          />
        </div>

        <div className="form-group">
          <label htmlFor="weight">Weight (kg)</label>
          <input
            type="number"
            id="weight"
            name="weight"
            step="0.1"
            className="form-control"
            value={formData.weight}
            onChange={handleChange}
            min="20"
            max="500"
          />
        </div>

        <div className="form-group">
          <label htmlFor="glucoseLevel">Glucose Level (mg/dL)</label>
          <input
            type="number"
            id="glucoseLevel"
            name="glucoseLevel"
            className="form-control"
            value={formData.glucoseLevel}
            onChange={handleChange}
            min="20"
            max="600"
          />
        </div>

        <div className="form-group">
          <label htmlFor="symptoms">Symptoms</label>
          <textarea
            id="symptoms"
            name="symptoms"
            className="form-control"
            value={formData.symptoms}
            onChange={handleChange}
            rows="3"
          ></textarea>
        </div>

        <div className="form-group">
          <label htmlFor="medications">Medications</label>
          <textarea
            id="medications"
            name="medications"
            className="form-control"
            value={formData.medications}
            onChange={handleChange}
            rows="3"
          ></textarea>
        </div>

        <div className="form-group">
          <label htmlFor="notes">Additional Notes</label>
          <textarea
            id="notes"
            name="notes"
            className="form-control"
            value={formData.notes}
            onChange={handleChange}
            rows="3"
          ></textarea>
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={() => navigate(`/patients/${patientId}`)}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={submitting}
          >
            {submitting ? 'Saving...' : 'Save Health Record'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddPatientRecord; 