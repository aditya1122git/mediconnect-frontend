import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doctorAPI } from '../api';
import { format } from 'date-fns';

const DoctorProfile = () => {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [availability, setAvailability] = useState([]);
  const [loadingAvailability, setLoadingAvailability] = useState(false);

  const fetchDoctorProfile = useCallback(async () => {
    try {
      setLoading(true);
      const response = await doctorAPI.getDoctorById(id);
      
      if (response.data.success) {
        console.log('Doctor profile data:', response.data.data);
        setDoctor(response.data.data);
        setError('');
      } else {
        setError('Failed to fetch doctor profile');
      }
    } catch (err) {
      console.error('Error fetching doctor profile:', err);
      setError('Failed to fetch doctor profile. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchAvailability = useCallback(async () => {
    try {
      setLoadingAvailability(true);
      const response = await doctorAPI.getDoctorAvailability(id, selectedDate);
      
      if (response.data.success) {
        setAvailability(response.data.availableSlots);
      } else {
        console.error('Failed to fetch availability');
      }
    } catch (err) {
      console.error('Error fetching availability:', err);
    } finally {
      setLoadingAvailability(false);
    }
  }, [id, selectedDate]);

  useEffect(() => {
    fetchDoctorProfile();
  }, [fetchDoctorProfile]);

  useEffect(() => {
    if (doctor) {
      fetchAvailability();
    }
  }, [doctor, fetchAvailability]);

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  if (loading) {
    return <div className="loading">Loading doctor profile...</div>;
  }

  if (error) {
    return <div className="error alert alert-danger">{error}</div>;
  }

  if (!doctor) {
    return <div className="not-found">Doctor not found</div>;
  }

  // Calculate minimum date (today)
  const today = new Date();
  const minDate = format(today, 'yyyy-MM-dd');
  
  // Calculate maximum date (3 months from now)
  const maxDate = format(new Date(today.setMonth(today.getMonth() + 3)), 'yyyy-MM-dd');

  return (
    <div className="doctor-profile">
      <div className="profile-header">
        <h1>{doctor.name}</h1>
        <p className="specialization">{doctor.specialization}</p>
      </div>

      <div className="profile-details">
        <div className="row">
          <div className="col-md-6">
            <div className="card mb-4">
              <div className="card-header">
                <h3>Doctor Information</h3>
              </div>
              <div className="card-body">
                <p><strong>Gender:</strong> {doctor.gender || 'Not specified'}</p>
                <p><strong>Specialization:</strong> {doctor.specialization}</p>
                {doctor.profile && (
                  <>
                    {doctor.profile.experience && (
                      <p><strong>Experience:</strong> {doctor.profile.experience} years</p>
                    )}
                    {doctor.profile.about && (
                      <div>
                        <strong>About:</strong>
                        <p>{doctor.profile.about}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
            
            {doctor.profile?.qualifications && doctor.profile.qualifications.length > 0 && (
              <div className="card mb-4">
                <div className="card-header">
                  <h3>Professional Qualifications</h3>
                </div>
                <div className="card-body">
                  <div className="qualifications-list">
                    {doctor.profile.qualifications.map((qualification, index) => (
                      <div key={index} className="qualification-item mb-3">
                        <div className="qualification-degree">
                          <span className="degree-icon">🎓</span>
                          {qualification.degree}
                        </div>
                        <div className="qualification-details">
                          <span className="institution">{qualification.institution}</span>
                          {qualification.year && <span className="year">{qualification.year}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="col-md-6">
            <div className="card">
              <div className="card-header">
                <h3>Book an Appointment</h3>
              </div>
              <div className="card-body">
                <div className="form-group">
                  <label htmlFor="appointmentDate">Select Date:</label>
                  <input
                    type="date"
                    id="appointmentDate"
                    className="form-control"
                    value={selectedDate}
                    onChange={handleDateChange}
                    min={minDate}
                    max={maxDate}
                  />
                </div>

                {loadingAvailability ? (
                  <p>Loading availability...</p>
                ) : (
                  <div className="available-slots mt-3">
                    <h4>Available Time Slots:</h4>
                    {availability.length === 0 ? (
                      <p>No available slots for the selected date.</p>
                    ) : (
                      <div className="time-slots">
                        {availability.map(slot => (
                          <Link
                            key={slot}
                            to={`/book-appointment/${doctor._id}?date=${selectedDate}&slot=${encodeURIComponent(slot)}`}
                            className="btn btn-outline-primary time-slot-btn"
                          >
                            {slot}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile; 