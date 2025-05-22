import React, { useState, useEffect, useCallback } from 'react';
import { appointmentAPI } from '../api';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const { currentUser } = useAuth();

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      } else {
        // Always explicitly set status=all to override the default behavior in backend
        params.status = 'all';
      }
      
      console.log('Fetching appointments with params:', params);
      const response = await appointmentAPI.getMyAppointments(params);
      
      if (response.data.success) {
        console.log(`Received ${response.data.data.length} appointments`);
        setAppointments(response.data.data);
        setError('');
      } else {
        setError('Failed to fetch appointments');
      }
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Failed to fetch appointments. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleStatusChange = async (appointmentId, newStatus, notes = '') => {
    try {
      setActionLoading(true);
      
      const response = await appointmentAPI.updateAppointmentStatus(appointmentId, newStatus, notes);
      
      if (response.data.success) {
        // Update the appointment in the state
        setAppointments(prevAppointments => 
          prevAppointments.map(app => 
            app._id === appointmentId ? response.data.data : app
          )
        );
      } else {
        setError('Failed to update appointment status');
      }
    } catch (err) {
      console.error('Error updating appointment status:', err);
      setError('Failed to update status. Please try again later.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkVisited = async (appointmentId, notes = '') => {
    try {
      setActionLoading(true);
      
      const response = await appointmentAPI.markAppointmentVisited(appointmentId, notes);
      
      if (response.data.success) {
        // Update the appointment in the state
        setAppointments(prevAppointments => 
          prevAppointments.map(app => 
            app._id === appointmentId ? response.data.data : app
          )
        );
      } else {
        setError('Failed to mark appointment as visited');
      }
    } catch (err) {
      console.error('Error marking appointment as visited:', err);
      setError('Failed to mark as visited. Please try again later.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }
    
    try {
      setActionLoading(true);
      
      const response = await appointmentAPI.cancelAppointment(appointmentId);
      
      if (response.data.success) {
        // Refresh appointments
        fetchAppointments();
      } else {
        setError('Failed to cancel appointment');
      }
    } catch (err) {
      console.error('Error cancelling appointment:', err);
      setError('Failed to cancel appointment. Please try again later.');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, 'MMMM d, yyyy');
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
        return 'badge badge-warning';
      case 'confirmed':
        return 'badge badge-success';
      case 'cancelled':
        return 'badge badge-danger';
      case 'completed':
        return 'badge badge-info';
      default:
        return 'badge badge-secondary';
    }
  };

  // Function to display formatted status text
  const getStatusText = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (loading) {
    return <div className="loading">Loading appointments...</div>;
  }

  const isDoctorView = currentUser.role === 'doctor';

  return (
    <div className="my-appointments">
      <h1>{isDoctorView ? 'Patient Appointments' : 'My Appointments'}</h1>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <div className="filters mb-4">
        <div className="form-group">
          <label htmlFor="statusFilter">Filter by Status:</label>
          <select
            id="statusFilter"
            className="form-control"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Appointments</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>
      
      {appointments.length === 0 ? (
        <div className="no-appointments">
          <p>No appointments found for the selected filter.</p>
        </div>
      ) : (
        <div className="appointment-list">
          {appointments.map(appointment => (
            <div key={appointment._id} className="appointment-card card mb-3">
              <div className="card-header d-flex justify-content-between align-items-center">
                <div>
                  <span className={getStatusBadgeClass(appointment.status)}>
                    {getStatusText(appointment.status)}
                  </span>
                  {appointment.visited && (
                    <span className="badge badge-success ml-2">Visited</span>
                  )}
                  <span className="ml-2">{formatDate(appointment.date)} at {appointment.timeSlot}</span>
                </div>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    {currentUser.role === 'patient' ? (
                      <p><strong>Doctor:</strong> {appointment.doctor ? `${appointment.doctor.name} (${appointment.doctor.specialization})` : 'Not assigned'}</p>
                    ) : (
                      <p><strong>Patient:</strong> {appointment.patient ? appointment.patient.name : 'Unknown patient'}</p>
                    )}
                    <p><strong>Reason:</strong> {appointment.reason}</p>
                    {appointment.notes && <p><strong>Notes:</strong> {appointment.notes}</p>}
                  </div>
                  <div className="col-md-6 text-right">
                    {/* Doctor actions */}
                    {currentUser.role === 'doctor' && appointment.status === 'pending' && (
                      <div className="doctor-actions">
                        <button
                          className="btn btn-success mr-2"
                          onClick={() => handleStatusChange(appointment._id, 'confirmed')}
                          disabled={actionLoading}
                        >
                          Confirm
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => handleCancelAppointment(appointment._id)}
                          disabled={actionLoading}
                        >
                          Decline
                        </button>
                      </div>
                    )}
                    
                    {/* Doctor actions for confirmed appointments */}
                    {currentUser.role === 'doctor' && appointment.status === 'confirmed' && !appointment.visited && (
                      <div className="doctor-actions">
                        <button
                          className="btn btn-info mr-2"
                          onClick={() => handleMarkVisited(appointment._id)}
                          disabled={actionLoading}
                        >
                          Mark as Completed (Visited)
                        </button>
                        <button
                          className="btn btn-secondary"
                          onClick={() => handleStatusChange(appointment._id, 'completed')}
                          disabled={actionLoading}
                        >
                          Complete (No Visit)
                        </button>
                      </div>
                    )}
                    
                    {/* Patient actions */}
                    {currentUser.role === 'patient' && 
                     (appointment.status === 'pending' || appointment.status === 'confirmed') && (
                      <button
                        className="btn btn-danger"
                        onClick={() => handleCancelAppointment(appointment._id)}
                        disabled={actionLoading}
                      >
                        Cancel Appointment
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyAppointments; 