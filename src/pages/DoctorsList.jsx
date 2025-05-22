import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { doctorAPI } from '../api';
import { useAuth } from '../contexts/AuthContext';

const DoctorsList = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchParams, setSearchParams] = useState({
    name: '',
    specialization: ''
  });
  // eslint-disable-next-line no-unused-vars
  const { currentUser } = useAuth();

  // Specialization options
  const specializations = [
    'Cardiology',
    'Dermatology',
    'Endocrinology',
    'Family Medicine',
    'Gastroenterology',
    'General Practice',
    'Neurology',
    'Obstetrics/Gynecology',
    'Oncology',
    'Orthopedics',
    'Pediatrics',
    'Psychiatry',
    'Pulmonology',
    'Radiology',
    'Urology'
  ];

  const fetchDoctors = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchParams.name) params.name = searchParams.name;
      if (searchParams.specialization) params.specialization = searchParams.specialization;
      
      const response = await doctorAPI.getDoctors(params);
      
      if (response.data.success) {
        setDoctors(response.data.data);
        setError('');
      } else {
        setError('Failed to fetch doctors');
      }
    } catch (err) {
      console.error('Error fetching doctors:', err);
      setError('Failed to fetch doctors. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchDoctors();
  };

  const handleClearFilters = () => {
    setSearchParams({
      name: '',
      specialization: ''
    });
    fetchDoctors();
  };

  if (loading) {
    return <div className="loading">Loading doctors...</div>;
  }

  return (
    <div className="doctors-list">
      <h1>Find a Doctor</h1>
      
      <div className="search-filters">
        <form onSubmit={handleSearch}>
          <div className="form-row">
            <div className="form-group col-md-5">
              <label htmlFor="name">Doctor Name</label>
              <input
                type="text"
                className="form-control"
                id="name"
                name="name"
                value={searchParams.name}
                onChange={handleInputChange}
                placeholder="Search by name..."
              />
            </div>
            
            <div className="form-group col-md-5">
              <label htmlFor="specialization">Specialization</label>
              <select
                className="form-control"
                id="specialization"
                name="specialization"
                value={searchParams.specialization}
                onChange={handleInputChange}
              >
                <option value="">All Specializations</option>
                {specializations.map(spec => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group col-md-2 d-flex align-items-end">
              <button type="submit" className="btn btn-primary mb-2 mr-2">Search</button>
              <button type="button" className="btn btn-secondary mb-2" onClick={handleClearFilters}>Clear</button>
            </div>
          </div>
        </form>
      </div>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      {doctors.length === 0 ? (
        <div className="no-results">
          <p>No doctors found matching your criteria. Please try different search terms.</p>
        </div>
      ) : (
        <div className="doctor-cards">
          {doctors.map(doctor => (
            <div key={doctor._id} className="doctor-card">
              <div className="doctor-info">
                <h3>{doctor.name}</h3>
                <p className="specialization">{doctor.specialization}</p>
                <p className="gender">{doctor.gender || 'Not specified'}</p>
              </div>
              <div className="doctor-actions">
                <Link 
                  to={`/doctors/${doctor._id}`}
                  className="btn btn-primary"
                >
                  View Profile
                </Link>
                <Link 
                  to={`/book-appointment/${doctor._id}`}
                  className="btn btn-success"
                >
                  Book Appointment
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorsList; 