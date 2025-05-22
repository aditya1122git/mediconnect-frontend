import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

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

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    passwordConfirm: '',
    role: 'patient',
    specialization: '',
    dateOfBirth: '',
    gender: '',
    height: '',
    weight: '',
    emergencyContact: {
      name: '',
      relationship: '',
      phone: ''
    }
  });

  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('emergencyContact.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        emergencyContact: {
          ...prev.emergencyContact,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    // Basic validations
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email is invalid';
    if (!formData.password) errors.password = 'Password is required';
    if (formData.password.length < 8) errors.password = 'Password must be at least 8 characters';
    if (formData.password !== formData.passwordConfirm) errors.passwordConfirm = 'Passwords do not match';
    if (!formData.dateOfBirth) errors.dateOfBirth = 'Date of birth is required';
    if (!formData.gender) errors.gender = 'Gender is required';
    
    // Role-specific validations
    if (formData.role === 'doctor' && !formData.specialization) {
      errors.specialization = 'Specialization is required';
    }
    
    if (formData.role === 'patient') {
      if (!formData.height) errors.height = 'Height is required';
      if (isNaN(parseFloat(formData.height))) errors.height = 'Height must be a number';
      if (!formData.weight) errors.weight = 'Weight is required';
      if (isNaN(parseFloat(formData.weight))) errors.weight = 'Weight must be a number';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      setError('Please fix the errors in the form');
      return;
    }
    
    setLoading(true);
    
    try {
      console.log('Starting registration with role:', formData.role);
      const userData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        passwordConfirm: formData.passwordConfirm,
        role: formData.role,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender
      };
      
      if (formData.role === 'doctor') {
        userData.specialization = formData.specialization;
      }
      
      if (formData.role === 'patient') {
        userData.height = parseFloat(formData.height);
        userData.weight = parseFloat(formData.weight);
        
        if (formData.emergencyContact.name || 
            formData.emergencyContact.relationship || 
            formData.emergencyContact.phone) {
          userData.emergencyContact = formData.emergencyContact;
        }
      }
      
      console.log('Submitting registration data:', { ...userData, password: '********' });
      const result = await register(userData);
      
      if (result.success) {
        console.log('Registration successful, redirecting to dashboard');
        navigate('/');
      } else {
        console.error('Registration failed:', result.message);
        setError(result.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Failed to create an account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container-wide animate-fade-in">
        <div className="auth-logo">
          <svg xmlns="http://www.w3.org/2000/svg" width="42" height="42" fill="white" viewBox="0 0 640 512">
            <path d="M96 128a128 128 0 1 1 256 0A128 128 0 1 1 96 128zM0 482.3C0 383.8 79.8 304 178.3 304l91.4 0C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7L29.7 512C13.3 512 0 498.7 0 482.3zM504 312l0-64-64 0c-13.3 0-24-10.7-24-24s10.7-24 24-24l64 0 0-64c0-13.3 10.7-24 24-24s24 10.7 24 24l0 64 64 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-64 0 0 64c0 13.3-10.7 24-24 24s-24-10.7-24-24z"/>
          </svg>
        </div>
        <h1>Create Account</h1>
        <p className="auth-subtitle">Begin your healthcare journey with <span className="highlight">MediConnect</span></p>
        
        {error && <div className="alert alert-danger">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
          </svg>
          {error}
        </div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="register-tabs">
            <button 
              type="button" 
              className={`register-tab ${formData.role === 'patient' ? 'active' : ''}`}
              onClick={() => setFormData({...formData, role: 'patient'})}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/>
              </svg>
              Patient
            </button>
            <button 
              type="button" 
              className={`register-tab ${formData.role === 'doctor' ? 'active' : ''}`}
              onClick={() => setFormData({...formData, role: 'doctor'})}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/>
              </svg>
              Doctor
            </button>
          </div>
          
          {/* Basic Information Section */}
          <div className="register-section">
            <h3>Basic Information</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label>Full Name</label>
                <div className="input-with-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/>
                  </svg>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`auth-input ${formErrors.name ? 'error' : ''}`}
                    placeholder="John Doe"
                  />
                </div>
                {formErrors.name && <span className="error-text">{formErrors.name}</span>}
              </div>
              
              <div className="form-group">
                <label>Email Address</label>
                <div className="input-with-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2zm13 2.383-4.708 2.825L15 11.105V5.383zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741zM1 11.105l4.708-2.897L1 5.383v5.722z"/>
                  </svg>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`auth-input ${formErrors.email ? 'error' : ''}`}
                    placeholder="your@email.com"
                  />
                </div>
                {formErrors.email && <span className="error-text">{formErrors.email}</span>}
              </div>
              
              <div className="form-group">
                <label>Phone Number</label>
                <div className="input-with-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M3.654 1.328a.678.678 0 0 0-1.015-.063L1.605 2.3c-.483.484-.661 1.169-.45 1.77a17.568 17.568 0 0 0 4.168 6.608 17.569 17.569 0 0 0 6.608 4.168c.601.211 1.286.033 1.77-.45l1.034-1.034a.678.678 0 0 0-.063-1.015l-2.307-1.794a.678.678 0 0 0-.58-.122l-2.19.547a1.745 1.745 0 0 1-1.657-.459L5.482 8.062a1.745 1.745 0 0 1-.46-1.657l.548-2.19a.678.678 0 0 0-.122-.58L3.654 1.328zM1.884.511a1.745 1.745 0 0 1 2.612.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.678.678 0 0 0 .178.643l2.457 2.457a.678.678 0 0 0 .644.178l2.189-.547a1.745 1.745 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.634 18.634 0 0 1-7.01-4.42 18.634 18.634 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877L1.885.511z"/>
                  </svg>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`auth-input ${formErrors.phone ? 'error' : ''}`}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                {formErrors.phone && <span className="error-text">{formErrors.phone}</span>}
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Date of Birth</label>
                <div className="input-with-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
                  </svg>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className={`auth-input ${formErrors.dateOfBirth ? 'error' : ''}`}
                  />
                </div>
                {formErrors.dateOfBirth && <span className="error-text">{formErrors.dateOfBirth}</span>}
              </div>
              
              <div className="form-group">
                <label>Gender</label>
                <div className="input-with-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M11.5 6.027a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0zm-1.5 1.5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1zm2 0a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1zm-2.5 5.5a.5.5 0 1 0-1 0 .5.5 0 0 0 1 0zm-1.5-3a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z"/>
                    <path fill-rule="evenodd" d="M6 11.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5zm-2-4a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm-2-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z"/>
                  </svg>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className={`auth-input ${formErrors.gender ? 'error' : ''}`}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                </div>
                {formErrors.gender && <span className="error-text">{formErrors.gender}</span>}
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Password</label>
                <div className="input-with-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
                  </svg>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`auth-input ${formErrors.password ? 'error' : ''}`}
                    minLength="8"
                    placeholder="At least 8 characters"
                  />
                </div>
                {formErrors.password && <span className="error-text">{formErrors.password}</span>}
              </div>
              
              <div className="form-group">
                <label>Confirm Password</label>
                <div className="input-with-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
                  </svg>
                  <input
                    type="password"
                    name="passwordConfirm"
                    value={formData.passwordConfirm}
                    onChange={handleChange}
                    className={`auth-input ${formErrors.passwordConfirm ? 'error' : ''}`}
                    placeholder="Confirm your password"
                  />
                </div>
                {formErrors.passwordConfirm && <span className="error-text">{formErrors.passwordConfirm}</span>}
              </div>
            </div>
          </div>
          
          {/* Role specific fields */}
          {formData.role === 'doctor' && (
            <div className="register-section">
              <h3>Doctor Information</h3>
              
              <div className="form-group">
                <label>Specialization</label>
                <div className="input-with-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8.5 5.5a.5.5 0 0 0-1 0v3.362l-1.429 2.38a.5.5 0 1 0 .858.515l1.5-2.5A.5.5 0 0 0 8.5 9V5.5z"/>
                    <path d="M6.5 0a.5.5 0 0 0 0 1H7v1.07a7.001 7.001 0 0 0-3.273 12.474l-.602.602a.5.5 0 0 0 .707.708l.746-.746A6.97 6.97 0 0 0 8 16a6.97 6.97 0 0 0 3.422-.892l.746.746a.5.5 0 0 0 .707-.708l-.601-.602A7.001 7.001 0 0 0 9 2.07V1h.5a.5.5 0 0 0 0-1h-3zm1.038 3.018a6.093 6.093 0 0 1 .924 0 6 6 0 1 1-.924 0zM0 8.5A.5.5 0 0 1 .5 8H2a.5.5 0 0 1 0 1H.5a.5.5 0 0 1-.5-.5zM14 8.5a.5.5 0 0 0-.5-.5H12a.5.5 0 0 0 0 1h1.5a.5.5 0 0 0 .5-.5z"/>
                  </svg>
                  <select
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    className={`auth-input ${formErrors.specialization ? 'error' : ''}`}
                  >
                    <option value="">Select Specialization</option>
                    {specializations.map((spec) => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                    <option value="Other">Other</option>
                  </select>
                </div>
                {formErrors.specialization && <span className="error-text">{formErrors.specialization}</span>}
              </div>
            </div>
          )}
          
          {formData.role === 'patient' && (
            <div className="register-section">
              <h3>Patient Information</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Height (cm)</label>
                  <div className="input-with-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
                      <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>
                    </svg>
                    <input
                      type="number"
                      name="height"
                      value={formData.height}
                      onChange={handleChange}
                      className={`auth-input ${formErrors.height ? 'error' : ''}`}
                      placeholder="170"
                    />
                  </div>
                  {formErrors.height && <span className="error-text">{formErrors.height}</span>}
                </div>
                
                <div className="form-group">
                  <label>Weight (kg)</label>
                  <div className="input-with-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.25-11.25v1.5a1.25 1.25 0 1 1-2.5 0v-1.5a1.25 1.25 0 0 1 2.5 0zm0 6v1.5a1.25 1.25 0 1 1-2.5 0v-1.5a1.25 1.25 0 0 1 2.5 0z"/>
                    </svg>
                    <input
                      type="number"
                      name="weight"
                      value={formData.weight}
                      onChange={handleChange}
                      className={`auth-input ${formErrors.weight ? 'error' : ''}`}
                      placeholder="70"
                    />
                  </div>
                  {formErrors.weight && <span className="error-text">{formErrors.weight}</span>}
                </div>
              </div>
              
              <h4>Emergency Contact (Optional)</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Contact Name</label>
                  <div className="input-with-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/>
                    </svg>
                    <input
                      type="text"
                      name="emergencyContact.name"
                      value={formData.emergencyContact.name}
                      onChange={handleChange}
                      className="auth-input"
                      placeholder="Emergency contact name"
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Relationship</label>
                  <div className="input-with-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2zm4.5 0a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1h-3zM8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm5 2.755C12.146 12.825 10.623 12 8 12s-4.146.826-5 1.755V14a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-.245z"/>
                    </svg>
                    <input
                      type="text"
                      name="emergencyContact.relationship"
                      value={formData.emergencyContact.relationship}
                      onChange={handleChange}
                      className="auth-input"
                      placeholder="e.g. Parent, Spouse"
                    />
                  </div>
                </div>
              </div>
              
              <div className="form-group">
                <label>Contact Phone</label>
                <div className="input-with-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M3.654 1.328a.678.678 0 0 0-1.015-.063L1.605 2.3c-.483.484-.661 1.169-.45 1.77a17.568 17.568 0 0 0 4.168 6.608 17.569 17.569 0 0 0 6.608 4.168c.601.211 1.286.033 1.77-.45l1.034-1.034a.678.678 0 0 0-.063-1.015l-2.307-1.794a.678.678 0 0 0-.58-.122l-2.19.547a1.745 1.745 0 0 1-1.657-.459L5.482 8.062a1.745 1.745 0 0 1-.46-1.657l.548-2.19a.678.678 0 0 0-.122-.58L3.654 1.328zM1.884.511a1.745 1.745 0 0 1 2.612.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.678.678 0 0 0 .178.643l2.457 2.457a.678.678 0 0 0 .644.178l2.189-.547a1.745 1.745 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.634 18.634 0 0 1-7.01-4.42 18.634 18.634 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877L1.885.511z"/>
                  </svg>
                  <input
                    type="tel"
                    name="emergencyContact.phone"
                    value={formData.emergencyContact.phone}
                    onChange={handleChange}
                    className="auth-input"
                    placeholder="Emergency contact phone"
                  />
                </div>
              </div>
            </div>
          )}
          
          <div className="auth-actions">
            <button 
              type="submit" 
              className="btn btn-primary btn-block auth-button" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
                      <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
                    </svg>
                  </span>
                  Creating Account...
                </>
              ) : 'Create Account'}
            </button>
          </div>
        </form>
        
        <p className="auth-redirect">
          Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;