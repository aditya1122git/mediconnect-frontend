import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { userAPI, adminAPI } from '../api';

const AdminProfile = () => {
  const { currentUser, updateCurrentUser } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    dateOfBirth: currentUser?.dateOfBirth ? new Date(currentUser.dateOfBirth).toISOString().split('T')[0] : ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [updateLoading, setUpdateLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [editMode, setEditMode] = useState(false);

  // Check if user is admin
  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  // Handle form initialization when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        dateOfBirth: currentUser.dateOfBirth ? new Date(currentUser.dateOfBirth).toISOString().split('T')[0] : ''
      });
    }
  }, [currentUser]);

  const toggleEditMode = () => {
    setEditMode(!editMode);
    if (!editMode) {
      // Entering edit mode - form is already set with current values
    } else {
      // Canceling edit mode - reset form data to current user data
      setFormData({
        name: currentUser?.name || '',
        email: currentUser?.email || '',
        phone: currentUser?.phone || '',
        dateOfBirth: currentUser?.dateOfBirth ? new Date(currentUser.dateOfBirth).toISOString().split('T')[0] : ''
      });
      setError('');
      setSuccess('');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setUpdateLoading(true);
      setError('');
      setSuccess('');
      
      // Create update data but exclude email
      const { email, ...updateData } = formData;
      
      // Ensure we are only sending non-empty fields that have changed
      const changedFields = {};
      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== '' && updateData[key] !== currentUser[key]) {
          changedFields[key] = updateData[key];
        }
      });
      
      // Skip update if no fields changed
      if (Object.keys(changedFields).length === 0) {
        setSuccess('No changes to save');
        setEditMode(false);
        return;
      }
      
      console.log('Updating admin profile with data:', changedFields);
      const response = await adminAPI.updateProfile(changedFields);
      
      if (response.data && response.data.success) {
        setSuccess('Profile updated successfully!');
        // Update the current user in context
        if (updateCurrentUser) {
          updateCurrentUser({
            ...currentUser,
            ...changedFields // Update with all changed fields
          });
        }
        setEditMode(false); // Exit edit mode after successful update
      } else {
        setError('Failed to update profile: ' + (response.data?.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Profile update error:', err);
      let errorMessage = 'Failed to update profile. Please try again later.';
      
      if (err.response) {
        const status = err.response.status;
        if (err.response.data && err.response.data.error) {
          errorMessage = err.response.data.error;
        } else if (status === 400) {
          errorMessage = 'Invalid data. Please check your inputs.';
        } else if (status === 401) {
          errorMessage = 'Not authorized. Please log in again.';
          // Don't display the browser alert - just show in our UI
          err.preventAlert = true;
        } else if (status === 404) {
          errorMessage = 'Profile not found. Please try logging out and back in.';
        } else if (status === 500) {
          errorMessage = 'Server error. Please try again later.';
        }
      }
      
      setError(errorMessage);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    
    // Validate password length
    if (passwordData.newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long');
      return;
    }
    
    try {
      setPasswordLoading(true);
      setPasswordError('');
      setPasswordSuccess('');
      
      console.log('Submitting admin password change request');
      const response = await adminAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      if (response.data && response.data.success) {
        console.log('Password changed successfully');
        setPasswordSuccess('Password changed successfully! You will need to log in again with your new password.');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        console.error('Failed to change password:', response.data);
        setPasswordError(response.data.error || 'Failed to change password');
      }
    } catch (err) {
      console.error('Password change error:', err);
      
      if (err.response) {
        const status = err.response.status;
        const errorMessage = err.response.data?.error || err.response.data?.message || 'An unknown error occurred';
        
        if (status === 401) {
          setPasswordError('Current password is incorrect');
        } else if (status === 400) {
          setPasswordError(errorMessage);
        } else if (status === 404) {
          setPasswordError('Password change endpoint not found. Please contact support.');
        } else {
          setPasswordError(`Error (${status}): ${errorMessage}`);
        }
      } else if (err.request) {
        setPasswordError('No response from server. Please check your internet connection.');
      } else {
        setPasswordError('Failed to change password. Please try again later.');
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="admin-profile">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Admin Profile</h1>
        <div>
          <button 
            className={`btn ${editMode ? 'btn-secondary' : 'btn-primary'}`}
            onClick={toggleEditMode}
          >
            {editMode ? 'Cancel Edit' : 'Edit Profile'}
          </button>
        </div>
      </div>
      <p className="text-muted">Manage your admin account settings</p>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      
      <div className="card mb-4">
        <div className="card-header">
          <h3>Profile Information</h3>
        </div>
        <div className="card-body">
          <div className="text-center mb-4">
            <div className="admin-photo" style={{ width: '120px', height: '120px', overflow: 'hidden', borderRadius: '50%', margin: '0 auto' }}>
              <img src="/images/person1.jpeg" alt="Aditya Raj" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <h4 className="mt-3">Aditya Raj</h4>
            <p className="text-muted">Administrator</p>
          </div>
          
          {!editMode ? (
            <div className="row">
              <div className="col-md-3 font-weight-bold">Name:</div>
              <div className="col-md-9">{currentUser?.name}</div>
              <div className="col-md-3 font-weight-bold mt-3">Email:</div>
              <div className="col-md-9 mt-3">{currentUser?.email}</div>
              <div className="col-md-3 font-weight-bold mt-3">Phone:</div>
              <div className="col-md-9 mt-3">{currentUser?.phone || 'Not specified'}</div>
              <div className="col-md-3 font-weight-bold mt-3">Date of Birth:</div>
              <div className="col-md-9 mt-3">
                {currentUser?.dateOfBirth ? new Date(currentUser.dateOfBirth).toLocaleDateString() : 'Not specified'}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled
                />
                <small className="form-text text-muted">Email cannot be changed</small>
              </div>
              
              <div className="form-group">
                <label htmlFor="phone">Phone</label>
                <input
                  type="tel"
                  className="form-control"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="dateOfBirth">Date of Birth</label>
                <input
                  type="date"
                  className="form-control"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                />
              </div>
              
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={updateLoading}
              >
                {updateLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          )}
        </div>
      </div>
      
      <div className="card mb-4">
        <div className="card-header">
          <h3>Change Password</h3>
        </div>
        <div className="card-body">
          {passwordError && <div className="alert alert-danger">{passwordError}</div>}
          {passwordSuccess && <div className="alert alert-success">{passwordSuccess}</div>}
          
          <form onSubmit={handlePasswordSubmit}>
            <div className="form-group">
              <label htmlFor="currentPassword">Current Password</label>
              <input
                type="password"
                className="form-control"
                id="currentPassword"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <input
                type="password"
                className="form-control"
                id="newPassword"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                required
              />
              <small className="form-text text-muted">Password must be at least 8 characters long</small>
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input
                type="password"
                className="form-control"
                id="confirmPassword"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                required
              />
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={passwordLoading}
            >
              {passwordLoading ? 'Updating...' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile; 