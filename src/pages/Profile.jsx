// src/pages/Profile.js
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { userAPI } from '../api';

// Common medical specializations
const specializations = [
  "General Medicine",
  "Family Medicine",
  "Internal Medicine",
  "Pediatrics",
  "Cardiology",
  "Dermatology",
  "Neurology",
  "Orthopedics",
  "Gynecology",
  "Obstetrics",
  "Oncology",
  "Ophthalmology",
  "Otolaryngology",
  "Psychiatry",
  "Radiology",
  "Urology",
  "Anesthesiology",
  "Endocrinology",
  "Gastroenterology",
  "Hematology",
  "Nephrology",
  "Pulmonology",
  "Rheumatology",
  "Surgery",
  "Emergency Medicine"
];

const Profile = () => {
  const { currentUser, updateCurrentUser, logout } = useAuth();
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    dateOfBirth: currentUser?.dateOfBirth ? new Date(currentUser.dateOfBirth).toISOString().split('T')[0] : '',
    gender: currentUser?.gender || '',
    height: currentUser?.height || '',
    weight: currentUser?.weight || '',
    conditions: Array.isArray(currentUser?.conditions) ? currentUser.conditions.join(', ') : currentUser?.conditions || '',
    allergies: Array.isArray(currentUser?.allergies) ? currentUser.allergies.join(', ') : currentUser?.allergies || '',
    emergencyContact: {
      name: currentUser?.emergencyContact?.name || '',
      relationship: currentUser?.emergencyContact?.relationship || '',
      phone: currentUser?.emergencyContact?.phone || ''
    },
    specialization: currentUser?.specialization || '',
    experience: currentUser?.experience || '',
    about: currentUser?.about || '',
    qualifications: currentUser?.qualifications || []
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // New state for qualification form
  const [newQualification, setNewQualification] = useState({
    degree: '',
    institution: '',
    year: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [addingQualification, setAddingQualification] = useState(false);
  const [dataFetched, setDataFetched] = useState(false);

  // Admin users don't have a detailed profile
  const isAdmin = currentUser?.role === 'admin';

  // Use useCallback to memoize fetchProfile function
  const fetchProfile = useCallback(async () => {
    // If admin, don't try to fetch profile data
    if (isAdmin) {
      setLoading(false);
      setDataFetched(true);
      return;
    }
    
    try {
      setLoading(true);
      console.log('Fetching profile data...');
      const response = await userAPI.getProfile();
      console.log('Profile API response:', response);
      
      // Handle both direct user data and profile with user field
      const userData = response.data.user || response.data.data || response.data;
      
      if (!userData) {
        console.error('No data returned from API');
        throw new Error('Invalid response format from server');
      }
      
      // Check if we have direct user data or nested user data
      const user = userData.user || userData;
      
      // Only update the form if we actually received data from the server
      if (user) {
        setFormData(prevData => ({
          ...prevData,
          name: user?.name || prevData.name,
          email: user?.email || prevData.email,
          phone: user?.phone || prevData.phone,
          dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : prevData.dateOfBirth,
          gender: user?.gender || prevData.gender,
          height: user?.height || prevData.height,
          weight: user?.weight || prevData.weight,
          conditions: Array.isArray(user?.conditions) ? user.conditions.join(', ') : user?.conditions || prevData.conditions,
          allergies: Array.isArray(user?.allergies) ? user.allergies.join(', ') : user?.allergies || prevData.allergies,
          emergencyContact: {
            name: user?.emergencyContact?.name || prevData.emergencyContact.name,
            relationship: user?.emergencyContact?.relationship || prevData.emergencyContact.relationship,
            phone: user?.emergencyContact?.phone || prevData.emergencyContact.phone
          },
          specialization: user?.specialization || prevData.specialization,
          experience: user?.experience || prevData.experience,
          about: user?.about || prevData.about,
          qualifications: user?.qualifications || prevData.qualifications
        }));

        setDataFetched(true);
      }
      
      setError('');
    } catch (err) {
      console.error('Profile fetch error:', err);
      setError('Failed to load profile data. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

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

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handlers for qualification form
  const handleQualificationChange = (e) => {
    const { name, value } = e.target;
    setNewQualification(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const addQualification = () => {
    if (!newQualification.degree || !newQualification.institution) {
      setError('Degree and Institution are required');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      qualifications: [...prev.qualifications, { ...newQualification }]
    }));
    
    // Reset the form
    setNewQualification({
      degree: '',
      institution: '',
      year: ''
    });
    
    setAddingQualification(false);
    setSuccess('Qualification added. Don\'t forget to save your profile.');
  };
  
  const removeQualification = (index) => {
    setFormData(prev => ({
      ...prev,
      qualifications: prev.qualifications.filter((_, i) => i !== index)
    }));
    setSuccess('Qualification removed. Don\'t forget to save your profile.');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setUpdateLoading(true);
      setError('');
      setSuccess('');
      
      // Create update data but exclude email
      const { email, ...updateData } = formData;
      
      // Keep only fields that have changed
      const changedFields = {};
      Object.keys(updateData).forEach(key => {
        // Special handling for arrays and objects
        if (key === 'qualifications') {
          changedFields.qualifications = updateData.qualifications;
        } else if (key === 'emergencyContact') {
          // Only include emergency contact if any of its fields have data
          if (updateData.emergencyContact.name ||
              updateData.emergencyContact.relationship ||
              updateData.emergencyContact.phone) {
            changedFields.emergencyContact = updateData.emergencyContact;
          }
        } else if (updateData[key] !== '') {
          changedFields[key] = updateData[key];
        }
      });
      
      // Process arrays for conditions and allergies
      if (changedFields.conditions) {
        changedFields.conditions = changedFields.conditions ? 
          changedFields.conditions.split(',').map(item => item.trim()).filter(item => item) : 
          [];
      }
      
      if (changedFields.allergies) {
        changedFields.allergies = changedFields.allergies ? 
          changedFields.allergies.split(',').map(item => item.trim()).filter(item => item) : 
          [];
      }
      
      console.log('Sending profile update:', changedFields);
      const response = await userAPI.updateProfile(changedFields);
      
      if (response.data.success) {
        setSuccess('Profile updated successfully!');
        // Update the current user in context if needed
        if (updateCurrentUser) {
          updateCurrentUser({
            ...currentUser,
            name: formData.name,
            phone: formData.phone,
            specialization: formData.specialization,
            qualifications: formData.qualifications
          });
        }
        setEditMode(false);
        fetchProfile(); // Refresh data after update
      } else {
        setError('Failed to update profile: ' + (response.data.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Profile update error:', err);
      let errorMessage = 'Failed to update profile. Please try again later.';
      
      if (err.response) {
        const status = err.response.status;
        if (err.response.data && err.response.data.error) {
          errorMessage = err.response.data.error;
          if (err.response.data.details) {
            errorMessage += ` (${err.response.data.details})`;
          }
        } else if (status === 400) {
          errorMessage = 'Invalid data. Please check your inputs.';
        } else if (status === 401) {
          errorMessage = 'Not authorized. Please log in again.';
        } else if (status === 500) {
          errorMessage = 'Server error. Please try again later.';
        }
      } else if (err.request) {
        errorMessage = 'No response from server. Please check your internet connection.';
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
      
      console.log('Submitting password change request');
      const response = await userAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      if (response.data.success) {
        console.log('Password changed successfully');
        setPasswordSuccess('Password changed successfully! Please log out and sign in again with your new password for the changes to take effect.');
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
      
      // Improved error handling with more specific messages
      if (err.response) {
        const status = err.response.status;
        const errorMessage = err.response.data?.error || err.response.data?.message || 'An unknown error occurred';
        
        if (status === 401) {
          setPasswordError('Current password is incorrect');
        } else if (status === 400) {
          setPasswordError(errorMessage);
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

  const toggleEditMode = () => {
    if (editMode) {
      // If exiting edit mode without saving, restore the original data
      setFormData({
        name: currentUser?.name || '',
        email: currentUser?.email || '',
        phone: currentUser?.phone || '',
        dateOfBirth: currentUser?.dateOfBirth ? new Date(currentUser.dateOfBirth).toISOString().split('T')[0] : '',
        gender: currentUser?.gender || '',
        height: currentUser?.height || '',
        weight: currentUser?.weight || '',
        conditions: Array.isArray(currentUser?.conditions) ? currentUser.conditions.join(', ') : currentUser?.conditions || '',
        allergies: Array.isArray(currentUser?.allergies) ? currentUser.allergies.join(', ') : currentUser?.allergies || '',
        emergencyContact: {
          name: currentUser?.emergencyContact?.name || '',
          relationship: currentUser?.emergencyContact?.relationship || '',
          phone: currentUser?.emergencyContact?.phone || ''
        },
        specialization: currentUser?.specialization || '',
        experience: currentUser?.experience || '',
        about: currentUser?.about || '',
        qualifications: currentUser?.qualifications || []
      });
    }
    setEditMode(!editMode);
    setSuccess('');
    setError('');
  };

  if (loading && !dataFetched) {
    return <div className="loading">Loading profile data...</div>;
  }

  // Special handler for admin users
  if (isAdmin) {
    return (
      <div className="profile">
        <h1>Admin Profile</h1>
        <div className="alert alert-info">
          <h4>Admin Account</h4>
          <p>As an administrator, you have access to system management functions and user controls. Your profile is simplified to focus on essential information.</p>
        </div>
        <div className="card mb-4">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h3>Account Information</h3>
            <button 
              className={`btn ${editMode ? 'btn-secondary' : 'btn-primary'}`}
              onClick={toggleEditMode}
            >
              {editMode ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>
          <div className="card-body">
            {!editMode ? (
              <div className="profile-info">
                <div className="row mb-3">
                  <div className="col-md-3 font-weight-bold">Name:</div>
                  <div className="col-md-9">{currentUser?.name}</div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-3 font-weight-bold">Email:</div>
                  <div className="col-md-9">{currentUser?.email}</div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-3 font-weight-bold">Phone:</div>
                  <div className="col-md-9">{currentUser?.phone || 'Not specified'}</div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-3 font-weight-bold">Date of Birth:</div>
                  <div className="col-md-9">{currentUser?.dateOfBirth ? new Date(currentUser.dateOfBirth).toLocaleDateString() : 'Not specified'}</div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-3 font-weight-bold">Role:</div>
                  <div className="col-md-9">
                    <span className="badge badge-primary">Administrator</span>
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-3 font-weight-bold">Account Status:</div>
                  <div className="col-md-9">
                    <span className="badge badge-success">Active</span>
                  </div>
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
                  className="btn btn-primary mt-3"
                  disabled={updateLoading}
                >
                  {updateLoading ? 'Saving...' : 'Save Changes'}
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary mt-3 ml-2"
                  onClick={toggleEditMode}
                  disabled={updateLoading}
                >
                  Cancel
                </button>
              </form>
            )}
          </div>
        </div>
        
        {/* Password change card */}
        <div className="card mb-4">
          <div className="card-header">
            <h3>Security Settings</h3>
          </div>
          <div className="card-body">
            {passwordError && <div className="alert alert-danger">{passwordError}</div>}
            {passwordSuccess && (
              <div className="alert alert-success">
                <div>{passwordSuccess}</div>
                <button 
                  type="button" 
                  className="btn btn-outline-primary btn-sm mt-2"
                  onClick={logout}
                >
                  Logout Now
                </button>
              </div>
            )}
            
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
  }

  return (
    <div className="profile">
      <h1>Your Profile</h1>
      
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      
      <div className="card mb-4">
        <div className="card-header d-flex justify-content-between">
          <h3>Personal Information</h3>
          <button 
            className={`btn ${editMode ? 'btn-secondary' : 'btn-primary'}`}
            onClick={toggleEditMode}
          >
            {editMode ? 'Cancel Editing' : 'Edit Profile'}
          </button>
        </div>
        <div className="card-body">
          {!editMode ? (
            <div className="profile-info">
              <div className="row mb-3">
                <div className="col-md-3 font-weight-bold">Name:</div>
                <div className="col-md-9">{formData.name}</div>
              </div>
              
              <div className="row mb-3">
                <div className="col-md-3 font-weight-bold">Email:</div>
                <div className="col-md-9">{formData.email}</div>
              </div>
              
              <div className="row mb-3">
                <div className="col-md-3 font-weight-bold">Phone:</div>
                <div className="col-md-9">{formData.phone || 'Not specified'}</div>
              </div>
              
              <div className="row mb-3">
                <div className="col-md-3 font-weight-bold">Date of Birth:</div>
                <div className="col-md-9">{formData.dateOfBirth || 'Not specified'}</div>
              </div>
              
              <div className="row mb-3">
                <div className="col-md-3 font-weight-bold">Gender:</div>
                <div className="col-md-9">{formData.gender || 'Not specified'}</div>
              </div>
              
              {/* Doctor-specific fields */}
              {currentUser?.role === 'doctor' && (
                <>
                  <div className="row mb-3">
                    <div className="col-md-3 font-weight-bold">Specialization:</div>
                    <div className="col-md-9">{formData.specialization}</div>
                  </div>
                  
                  <div className="row mb-3">
                    <div className="col-md-3 font-weight-bold">Years of Experience:</div>
                    <div className="col-md-9">{formData.experience || 'Not specified'}</div>
                  </div>
                  
                  <div className="row mb-3">
                    <div className="col-md-3 font-weight-bold">About:</div>
                    <div className="col-md-9">{formData.about || 'Not specified'}</div>
                  </div>
                  
                  {/* Display qualifications */}
                  <div className="row mb-3">
                    <div className="col-md-3 font-weight-bold">Qualifications:</div>
                    <div className="col-md-9">
                      {formData.qualifications && formData.qualifications.length > 0 ? (
                        <div className="qualifications-list">
                          {formData.qualifications.map((qual, index) => (
                            <div key={index} className="qualification-item mb-2">
                              <div className="qualification-degree">
                                <span className="degree-icon">🎓</span>
                                {qual.degree}
                              </div>
                              <div className="qualification-details">
                                <span className="institution">{qual.institution}</span>
                                {qual.year && <span className="year">{qual.year}</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted">No qualifications added yet</span>
                      )}
                    </div>
                  </div>
                </>
              )}
              
              {/* Patient-specific fields */}
              {currentUser?.role === 'patient' && (
                <>
                  <div className="row mb-3">
                    <div className="col-md-3 font-weight-bold">Height:</div>
                    <div className="col-md-9">{formData.height ? `${formData.height} cm` : 'Not specified'}</div>
                  </div>
                  
                  <div className="row mb-3">
                    <div className="col-md-3 font-weight-bold">Weight:</div>
                    <div className="col-md-9">{formData.weight ? `${formData.weight} kg` : 'Not specified'}</div>
                  </div>
                  
                  <div className="row mb-3">
                    <div className="col-md-3 font-weight-bold">Medical Conditions:</div>
                    <div className="col-md-9">{formData.conditions || 'None'}</div>
                  </div>
                  
                  <div className="row mb-3">
                    <div className="col-md-3 font-weight-bold">Allergies:</div>
                    <div className="col-md-9">{formData.allergies || 'None'}</div>
                  </div>
                  
                  <div className="row mb-3">
                    <div className="col-md-3 font-weight-bold">Emergency Contact:</div>
                    <div className="col-md-9">
                      {formData.emergencyContact.name ? (
                        <>
                          <div>{formData.emergencyContact.name}</div>
                          <div>{formData.emergencyContact.relationship}</div>
                          <div>{formData.emergencyContact.phone}</div>
                        </>
                      ) : (
                        'Not specified'
                      )}
                    </div>
                  </div>
                </>
              )}
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
              
              <div className="form-group">
                <label htmlFor="gender">Gender</label>
                <select
                  className="form-control custom-select"
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  style={{ 
                    color: '#495057', 
                    backgroundColor: '#fff', 
                    appearance: 'auto',
                    backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='4' height='5' viewBox='0 0 4 5'%3e%3cpath fill='%23343a40' d='M2 0L0 2h4zm0 5L0 3h4z'/%3e%3c/svg%3e\")",
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0.75rem center'
                  }}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>
              
              {/* Doctor-specific fields */}
              {currentUser?.role === 'doctor' && (
                <>
                  <div className="form-group">
                    <label htmlFor="specialization">Specialization</label>
                    <select
                      className="form-control custom-select"
                      id="specialization"
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleChange}
                      style={{ 
                        color: '#495057', 
                        backgroundColor: '#fff', 
                        appearance: 'auto',
                        backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='4' height='5' viewBox='0 0 4 5'%3e%3cpath fill='%23343a40' d='M2 0L0 2h4zm0 5L0 3h4z'/%3e%3c/svg%3e\")",
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 0.75rem center'
                      }}
                    >
                      <option value="">Select Specialization</option>
                      {specializations.map((spec) => (
                        <option key={spec} value={spec}>{spec}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="experience">Years of Experience</label>
                    <input
                      type="text"
                      className="form-control"
                      id="experience"
                      name="experience"
                      value={formData.experience}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="about">About Me</label>
                    <textarea
                      className="form-control"
                      id="about"
                      name="about"
                      rows="3"
                      value={formData.about}
                      onChange={handleChange}
                    ></textarea>
                  </div>
                  
                  {/* Qualifications Section */}
                  <div className="form-section">
                    <h4 className="mb-3">Professional Qualifications</h4>
                    
                    {/* List existing qualifications with remove option */}
                    {formData.qualifications && formData.qualifications.length > 0 && (
                      <div className="qualifications-list mb-4">
                        {formData.qualifications.map((qual, index) => (
                          <div key={index} className="qualification-item d-flex align-items-center mb-2">
                            <div className="flex-grow-1">
                              <strong>{qual.degree}</strong> - {qual.institution} {qual.year && `(${qual.year})`}
                            </div>
                            <button 
                              type="button" 
                              className="btn btn-sm btn-danger" 
                              onClick={() => removeQualification(index)}
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Add qualification form */}
                    {addingQualification ? (
                      <div className="add-qualification-form mb-3 p-3 border rounded">
                        <h5 className="mb-3">Add New Qualification</h5>
                        <div className="form-group">
                          <label htmlFor="degree">Degree/Certification</label>
                          <input
                            type="text"
                            className="form-control"
                            id="degree"
                            name="degree"
                            value={newQualification.degree}
                            onChange={handleQualificationChange}
                            required
                          />
                        </div>
                        
                        <div className="form-group">
                          <label htmlFor="institution">Institution</label>
                          <input
                            type="text"
                            className="form-control"
                            id="institution"
                            name="institution"
                            value={newQualification.institution}
                            onChange={handleQualificationChange}
                            required
                          />
                        </div>
                        
                        <div className="form-group">
                          <label htmlFor="year">Year</label>
                          <input
                            type="text"
                            className="form-control"
                            id="year"
                            name="year"
                            value={newQualification.year}
                            onChange={handleQualificationChange}
                            placeholder="e.g., 2020"
                          />
                        </div>
                        
                        <div className="d-flex mt-3">
                          <button 
                            type="button" 
                            className="btn btn-primary mr-2"
                            onClick={addQualification}
                          >
                            Add
                          </button>
                          <button 
                            type="button" 
                            className="btn btn-secondary mr-2"
                            onClick={() => setAddingQualification(false)}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button 
                        type="button" 
                        className="btn btn-outline-primary"
                        onClick={() => setAddingQualification(true)}
                      >
                        + Add Qualification
                      </button>
                    )}
                  </div>
                </>
              )}
              
              {/* Patient-specific fields */}
              {currentUser?.role === 'patient' && (
                <>
                  <div className="form-group">
                    <label htmlFor="height">Height (cm)</label>
                    <input
                      type="number"
                      className="form-control"
                      id="height"
                      name="height"
                      value={formData.height}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="weight">Weight (kg)</label>
                    <input
                      type="number"
                      className="form-control"
                      id="weight"
                      name="weight"
                      value={formData.weight}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="conditions">Medical Conditions</label>
                    <input
                      type="text"
                      className="form-control"
                      id="conditions"
                      name="conditions"
                      value={formData.conditions}
                      onChange={handleChange}
                      placeholder="e.g., Diabetes, Hypertension, etc. (comma-separated)"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="allergies">Allergies</label>
                    <input
                      type="text"
                      className="form-control"
                      id="allergies"
                      name="allergies"
                      value={formData.allergies}
                      onChange={handleChange}
                      placeholder="e.g., Penicillin, Peanuts, etc. (comma-separated)"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Emergency Contact</label>
                    <div className="card p-3">
                      <div className="form-group">
                        <label htmlFor="emergencyContact.name">Name</label>
                        <input
                          type="text"
                          className="form-control"
                          id="emergencyContact.name"
                          name="emergencyContact.name"
                          value={formData.emergencyContact.name}
                          onChange={handleChange}
                        />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="emergencyContact.relationship">Relationship</label>
                        <input
                          type="text"
                          className="form-control"
                          id="emergencyContact.relationship"
                          name="emergencyContact.relationship"
                          value={formData.emergencyContact.relationship}
                          onChange={handleChange}
                        />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="emergencyContact.phone">Phone</label>
                        <input
                          type="tel"
                          className="form-control"
                          id="emergencyContact.phone"
                          name="emergencyContact.phone"
                          value={formData.emergencyContact.phone}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
              
              <button 
                type="submit" 
                className="btn btn-primary mt-4"
                disabled={updateLoading}
              >
                {updateLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          )}
        </div>
      </div>
      
      {/* Password change form */}
      <div className="card">
        <div className="card-header">
          <h3>Change Password</h3>
        </div>
        <div className="card-body">
          {passwordError && <div className="alert alert-danger">{passwordError}</div>}
          {passwordSuccess && (
            <div className="alert alert-success">
              <div>{passwordSuccess}</div>
              <button 
                type="button" 
                className="btn btn-outline-primary btn-sm mt-2"
                onClick={logout}
              >
                Logout Now
              </button>
            </div>
          )}
          
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

export default Profile;