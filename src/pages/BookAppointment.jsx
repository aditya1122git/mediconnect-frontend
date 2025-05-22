import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { doctorAPI, appointmentAPI } from '../api';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import '../styles/appointment.css';
import TimeSlot from '../components/TimeSlot';

const BookAppointment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const searchParams = new URLSearchParams(location.search);
  
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    date: searchParams.get('date') || format(new Date(), 'yyyy-MM-dd'),
    timeSlot: searchParams.get('slot') || '',
    reason: '',
    notes: ''
  });
  
  const [availableSlots, setAvailableSlots] = useState([]);

  const fetchDoctorDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await doctorAPI.getDoctorById(id);
      
      if (response.data.success) {
        setDoctor(response.data.data);
      } else {
        setError('Failed to fetch doctor details');
      }
    } catch (err) {
      console.error('Error fetching doctor details:', err);
      setError('Error loading doctor information. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchAvailability = useCallback(async () => {
    try {
      const response = await doctorAPI.getDoctorAvailability(id, formData.date);
      
      if (response.data.success) {
        setAvailableSlots(response.data.availableSlots);
        
        // If the current selected slot is not available, reset it
        if (formData.timeSlot && !response.data.availableSlots.includes(formData.timeSlot)) {
          setFormData(prev => ({ ...prev, timeSlot: '' }));
        }
      }
    } catch (err) {
      console.error('Error fetching availability:', err);
    }
  }, [id, formData.date, formData.timeSlot]);

  useEffect(() => {
    // Redirect if user is not a patient
    if (currentUser && currentUser.role !== 'patient') {
      setError('Only patients can book appointments');
      return;
    }
    
    fetchDoctorDetails();
  }, [currentUser, fetchDoctorDetails]);

  useEffect(() => {
    if (doctor) {
      fetchAvailability();
    }
  }, [doctor, fetchAvailability]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTimeSlotChange = (slot) => {
    setFormData(prev => ({
      ...prev,
      timeSlot: slot
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.timeSlot) {
      setError('Please select a time slot');
      return;
    }
    
    if (!formData.reason.trim()) {
      setError('Please provide a reason for the appointment');
      return;
    }
    
    try {
      setSubmitting(true);
      setError('');
      
      const appointmentData = {
        doctorId: id,
        date: formData.date,
        timeSlot: formData.timeSlot,
        reason: formData.reason,
        notes: formData.notes
      };
      
      const response = await appointmentAPI.createAppointment(appointmentData);
      
      if (response.data.success) {
        setSuccess(true);
        // Reset form
        setFormData({
          date: format(new Date(), 'yyyy-MM-dd'),
          timeSlot: '',
          reason: '',
          notes: ''
        });
        
        // Redirect after 2 seconds
        setTimeout(() => {
          navigate('/appointments');
        }, 2000);
      } else {
        setError('Failed to book appointment');
      }
    } catch (err) {
      console.error('Error booking appointment:', err);
      if (err.response && err.response.data) {
        setError(err.response.data.error || 'Failed to book appointment');
      } else {
        setError('Failed to book appointment. Please try again later.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate minimum date (today)
  const today = new Date();
  const minDate = format(today, 'yyyy-MM-dd');
  
  // Calculate maximum date (3 months from now)
  const maxDate = format(new Date(today.setMonth(today.getMonth() + 3)), 'yyyy-MM-dd');

  const timeSlotStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
    gap: '10px',
    marginTop: '10px'
  };

  const formCheckStyle = {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 12px',
    borderRadius: '8px',
    backgroundColor: '#f5f5f5',
    transition: 'all 0.2s',
    cursor: 'pointer',
    margin: '0 0 8px 0'
  };

  const radioStyle = {
    marginRight: '10px',
    marginTop: '0',
    position: 'static'
  };

  const labelStyle = {
    marginBottom: '0',
    fontWeight: '500',
    whiteSpace: 'nowrap'
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!doctor) {
    return <div className="error alert alert-danger">Doctor not found</div>;
  }

  return (
    <div className="book-appointment">
      <h1>Book an Appointment</h1>
      
      {success && (
        <div className="alert alert-success">
          Appointment booked successfully! Redirecting to your appointments...
        </div>
      )}
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <div className="doctor-info card mb-4">
        <div className="card-body">
          <h3>Doctor: {doctor.name}</h3>
          <p><strong>Specialization:</strong> {doctor.specialization}</p>
        </div>
      </div>
      
      <div className="appointment-form card">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="date">Appointment Date:</label>
              <input
                type="date"
                id="date"
                name="date"
                className="form-control"
                value={formData.date}
                onChange={handleInputChange}
                min={minDate}
                max={maxDate}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="timeSlot">Available Time Slots:</label>
              {availableSlots.length === 0 ? (
                <p className="text-danger">No available slots for the selected date.</p>
              ) : (
                <div style={timeSlotStyle}>
                  {availableSlots.map(slot => (
                    <div key={slot} style={formCheckStyle}>
                      <input
                        style={radioStyle}
                        type="radio"
                        name="timeSlot"
                        id={`slot-${slot.replace(/\s+/g, '')}`}
                        value={slot}
                        checked={formData.timeSlot === slot}
                        onChange={handleInputChange}
                      />
                      <label style={labelStyle} htmlFor={`slot-${slot.replace(/\s+/g, '')}`}>
                        {slot}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="reason">Reason for Appointment:</label>
              <input
                type="text"
                id="reason"
                name="reason"
                className="form-control"
                value={formData.reason}
                onChange={handleInputChange}
                placeholder="Brief reason for your visit"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="notes">Additional Notes (Optional):</label>
              <textarea
                id="notes"
                name="notes"
                className="form-control"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Any additional information you'd like to share"
                rows="3"
              ></textarea>
            </div>
            
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting || availableSlots.length === 0 || !formData.timeSlot}
            >
              {submitting ? 'Booking...' : 'Book Appointment'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment; 