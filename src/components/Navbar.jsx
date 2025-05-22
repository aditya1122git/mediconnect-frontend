// src/components/Navbar.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css'; // Import the new CSS file

// Icons for navigation
const Icons = {
  dashboard: (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
      <path d="M8 4a.5.5 0 0 1 .5.5V6a.5.5 0 0 1-1 0V4.5A.5.5 0 0 1 8 4zM3.732 5.732a.5.5 0 0 1 .707 0l.915.914a.5.5 0 1 1-.708.708l-.914-.915a.5.5 0 0 1 0-.707zM2 10a.5.5 0 0 1 .5-.5h1.586a.5.5 0 0 1 0 1H2.5A.5.5 0 0 1 2 10zm9.5 0a.5.5 0 0 1 .5-.5h1.5a.5.5 0 0 1 0 1H12a.5.5 0 0 1-.5-.5zm.754-4.246a.389.389 0 0 0-.527-.02L7.547 9.31a.91.91 0 1 0 1.302 1.258l3.434-4.297a.389.389 0 0 0-.029-.518z"/>
      <path fillRule="evenodd" d="M0 10a8 8 0 1 1 15.547 2.661c-.442 1.253-1.845 1.602-2.932 1.25C11.309 13.488 9.475 13 8 13c-1.474 0-3.31.488-4.615.911-1.087.352-2.49.003-2.932-1.25A7.988 7.988 0 0 1 0 10zm8-7a7 7 0 0 0-6.603 9.329c.203.575.923.876 1.68.63C4.397 12.533 6.358 12 8 12s3.604.532 4.923.96c.757.245 1.477-.056 1.68-.631A7 7 0 0 0 8 3z"/>
    </svg>
  ),
  record: (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
      <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/>
    </svg>
  ),
  history: (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
      <path d="M8.515 1.019A7 7 0 0 0 8 1V0a8 8 0 0 1 .589.022l-.074.997zm2.004.45a7.003 7.003 0 0 0-.985-.299l.219-.976c.383.086.76.2 1.126.342l-.36.933zm1.37.71a7.01 7.01 0 0 0-.439-.27l.493-.87a8.025 8.025 0 0 1 .979.654l-.615.789a6.996 6.996 0 0 0-.418-.302zm1.834 1.79a6.99 6.99 0 0 0-.653-.796l.724-.69c.27.285.52.59.747.91l-.818.576zm.744 1.352a7.08 7.08 0 0 0-.214-.468l.893-.45a7.976 7.976 0 0 1 .45 1.088l-.95.313a7.023 7.023 0 0 0-.179-.483zm.53 2.507a6.991 6.991 0 0 0-.1-1.025l.985-.17c.067.386.106.778.116 1.17l-1 .025zm-.131 1.538c.033-.17.06-.339.081-.51l.993.123a7.957 7.957 0 0 1-.23 1.155l-.964-.267c.046-.165.086-.332.12-.501zm-.952 2.379c.184-.29.346-.594.486-.908l.914.405c-.16.36-.345.706-.555 1.038l-.845-.535zm-.964 1.205c.122-.122.239-.248.35-.378l.758.653a8.073 8.073 0 0 1-.401.432l-.707-.707z"/>
      <path d="M8 1a7 7 0 1 0 4.95 11.95l.707.707A8.001 8.001 0 1 1 8 0v1z"/>
      <path d="M7.5 3a.5.5 0 0 1 .5.5v5.21l3.248 1.856a.5.5 0 0 1-.496.868l-3.5-2A.5.5 0 0 1 7 9V3.5a.5.5 0 0 1 .5-.5z"/>
    </svg>
  ),
  doctors: (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
      <path d="M7 2.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-7a.5.5 0 0 1-.5-.5v-1zM2 1a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2H2zm0 8a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2H2zm.854-3.646a.5.5 0 0 1-.708 0l-1-1a.5.5 0 1 1 .708-.708l.646.647 1.646-1.647a.5.5 0 1 1 .708.708l-2 2zm7.146 7a.5.5 0 0 1 .708 0l.646.647 1.646-1.647a.5.5 0 1 1 .708.708l-2 2a.5.5 0 0 1-.708 0l-1-1a.5.5 0 0 1 0-.708zM7 10.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-7a.5.5 0 0 1-.5-.5v-1z"/>
    </svg>
  ),
  patients: (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
      <path d="M15 14s1 0 1-1-1-4-5-4-5 3-5 4 1 1 1 1h8zm-7.978-1A.261.261 0 0 1 7 12.996c.001-.264.167-1.03.76-1.72C8.312 10.629 9.282 10 11 10c1.717 0 2.687.63 3.24 1.276.593.69.758 1.457.76 1.72l-.008.002a.274.274 0 0 1-.014.002H7.022zM11 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm3-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM6.936 9.28a5.88 5.88 0 0 0-1.23-.247A7.35 7.35 0 0 0 5 9c-4 0-5 3-5 4 0 .667.333 1 1 1h4.216A2.238 2.238 0 0 1 5 13c0-1.01.377-2.042 1.09-2.904.243-.294.526-.569.846-.816zM4.92 10A5.493 5.493 0 0 0 4 13H1c0-.26.164-1.03.76-1.724.545-.636 1.492-1.256 3.16-1.275zM1.5 5.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0zm3-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/>
    </svg>
  ),
  appointments: (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
      <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
      <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>
    </svg>
  ),
  profile: (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
      <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
    </svg>
  ),
  logout: (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
      <path fillRule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z"/>
      <path fillRule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"/>
    </svg>
  ),
  admin: (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
      <path d="M9.828 4a3 3 0 0 1-2.12-.879l-.83-.828A1 1 0 0 0 6.173 2H2.5a1 1 0 0 0-1 .981L1.546 4h-1L.5 3a2 2 0 0 1 2-2h3.672a2 2 0 0 1 1.414.586l.828.828A2 2 0 0 0 9.828 3v1z"/>
      <path fillRule="evenodd" d="M13.81 4H2.19a1 1 0 0 0-.996 1.09l.637 7a1 1 0 0 0 .995.91h10.348a1 1 0 0 0 .995-.91l.637-7A1 1 0 0 0 13.81 4zM2.19 3A2 2 0 0 0 .198 5.181l.637 7A2 2 0 0 0 2.826 14h10.348a2 2 0 0 0 1.991-1.819l.637-7A2 2 0 0 0 13.81 3H2.19z"/>
    </svg>
  ),
  medicalLogo: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 512 512">
      <path d="M228.3 469.1L47.6 300.4c-4.2-3.9-8.2-8.1-11.9-12.4l87 0c22.6 0 43-13.6 51.7-34.5l10.5-25.2 49.3 109.5c3.8 8.5 12.1 14 21.4 14.1s17.8-5 22-13.3L320 253.7l1.7 3.4c9.5 19 28.9 31 50.1 31l104.5 0c-3.7 4.3-7.7 8.5-11.9 12.4L283.7 469.1c-7.5 7-17.4 10.9-27.7 10.9s-20.2-3.9-27.7-10.9zM503.7 240l-132 0c-3 0-5.8-1.7-7.2-4.4l-23.2-46.3c-4.1-8.1-12.4-13.3-21.5-13.3s-17.4 5.1-21.5 13.3l-41.4 82.8L205.9 158.2c-3.9-8.7-12.7-14.3-22.2-14.1s-18.1 5.9-21.8 14.8l-31.8 76.3c-1.2 3-4.2 4.9-7.4 4.9L16 240c-2.6 0-5 .4-7.3 1.1C3 225.2 0 208.2 0 190.9l0-5.8c0-69.9 50.5-129.5 119.4-141C165 36.5 211.4 51.4 244 84l12 12 12-12c32.6-32.6 79-47.5 124.6-39.9C461.5 55.6 512 115.2 512 185.1l0 5.8c0 16.9-2.8 33.5-8.3 49.1z"/>
    </svg>
  )
};

const Navbar = () => {
  const { isAuthenticated, logout, currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false);
  
  // Check if we're on a public page that should show info links
  const isPublicPage = !isAuthenticated && 
    (location.pathname === '/' || 
     location.pathname === '/about' || 
     location.pathname === '/contact' || 
     location.pathname === '/privacy' || 
     location.pathname === '/terms');

  // Close mobile menu when location changes
  useEffect(() => {
    setMobileMenuOpen(false);
    setAdminDropdownOpen(false);
  }, [location]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path ? 'navbar-item active' : 'navbar-item';
  };

  // Toggle admin dropdown
  const toggleAdminDropdown = (e) => {
    e.preventDefault();
    setAdminDropdownOpen(!adminDropdownOpen);
  };

  // Admin-specific links that should only be shown to admin users
  const AdminLinks = ({ isAuthenticated, currentUser }) => {
    if (!isAuthenticated || currentUser?.role !== 'admin') {
      return null;
    }

    return (
      <li className="nav-item dropdown">
        <a 
          className="nav-link dropdown-toggle" 
          href="#" 
          id="adminDropdown" 
          role="button" 
          onClick={toggleAdminDropdown}
          aria-haspopup="true" 
          aria-expanded={adminDropdownOpen ? "true" : "false"}
        >
          <span className="icon mr-1">{Icons.admin}</span>
          <span>Admin</span>
        </a>
        <div 
          className={`dropdown-menu admin-dropdown ${adminDropdownOpen ? 'show' : ''}`} 
          aria-labelledby="adminDropdown"
        >
          <Link className="dropdown-item" to="/admin/dashboard" onClick={() => setAdminDropdownOpen(false)}>
            <span className="icon mr-1">{Icons.dashboard}</span>
            <span>Dashboard</span>
          </Link>
          <div className="dropdown-divider"></div>
          <h6 className="dropdown-header">User Management</h6>
          <Link className="dropdown-item" to="/admin/users" onClick={() => setAdminDropdownOpen(false)}>
            <span className="icon mr-1">{Icons.patients}</span>
            <span>All Users</span>
          </Link>
          <Link className="dropdown-item" to="/admin/users?role=doctor" onClick={() => setAdminDropdownOpen(false)}>
            <span className="icon mr-1">{Icons.doctors}</span>
            <span>Doctors</span>
          </Link>
          <Link className="dropdown-item" to="/admin/users?role=patient" onClick={() => setAdminDropdownOpen(false)}>
            <span className="icon mr-1">{Icons.record}</span>
            <span>Patients</span>
          </Link>
          <div className="dropdown-divider"></div>
          <h6 className="dropdown-header">System</h6>
          <Link className="dropdown-item" to="/admin/profile" onClick={() => setAdminDropdownOpen(false)}>
            <span className="icon mr-1">{Icons.profile}</span>
            <span>Admin Profile</span>
          </Link>
        </div>
      </li>
    );
  };

  // Group patient nav items for better organization 
  const PatientNavItems = () => {
    if (!isAuthenticated || currentUser?.role !== 'patient') {
      return null;
    }
    
    return (
      <>
        <li className="nav-item">
          <Link to="/record" className="nav-link">
            <span className="icon mr-1">{Icons.record}</span>
            <span>Record</span>
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/history" className="nav-link">
            <span className="icon mr-1">{Icons.history}</span>
            <span>History</span>
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/doctors" className="nav-link">
            <span className="icon mr-1">{Icons.doctors}</span>
            <span>Doctors</span>
          </Link>
        </li>
      </>
    );
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary custom-navbar">
      <div className="container d-flex align-items-center">
        <Link className="navbar-brand my-0 py-0" to="/">
          {Icons.medicalLogo}
          <span className="brand-text">MediConnect</span>
        </Link>
        
        <button 
          className="navbar-toggler my-0 py-0" 
          type="button" 
          data-toggle="collapse" 
          data-target="#navbarNav"
          aria-controls="navbarNav" 
          aria-expanded={mobileMenuOpen ? "true" : "false"} 
          aria-label="Toggle navigation"
          onClick={() => setMobileMenuOpen(prevState => !prevState)}
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className={`collapse navbar-collapse ${mobileMenuOpen ? 'show' : ''}`} id="navbarNav">
          <ul className="navbar-nav ml-auto d-flex align-items-center my-0 py-0">
            {isPublicPage && (
              <li className="nav-item info-links my-0 py-0">
                <Link to="/about" className="nav-link info-link my-0 py-0">About Us</Link>
                <Link to="/contact" className="nav-link info-link my-0 py-0">Contact Us</Link>
                <Link to="/privacy" className="nav-link info-link my-0 py-0">Privacy Policy</Link>
                <Link to="/terms" className="nav-link info-link my-0 py-0">Terms of Service</Link>
              </li>
            )}
            
            {!isAuthenticated ? (
              <>
                <li className="nav-item">
                  <Link to="/login" className="nav-link">
                    <span className="icon mr-1">{Icons.profile}</span>
                    <span>Login</span>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/register" className="nav-link">
                    <span className="icon mr-1">{Icons.record}</span>
                    <span>Register</span>
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link to={currentUser?.role === 'admin' ? "/admin/dashboard" : "/dashboard"} className="nav-link">
                    <span className="icon mr-1">{Icons.dashboard}</span>
                    <span>Dashboard</span>
                  </Link>
                </li>
                
                <AdminLinks isAuthenticated={isAuthenticated} currentUser={currentUser} />
                
                {currentUser?.role === 'doctor' ? (
                  <>
                    <li className="nav-item">
                      <Link to="/patients" className="nav-link">
                        <span className="icon mr-1">{Icons.patients}</span>
                        <span>Patients</span>
                      </Link>
                    </li>
                  </>
                ) : (
                  <PatientNavItems />
                )}
                
                {currentUser?.role !== 'admin' && (
                <li className="nav-item">
                  <Link to="/appointments" className="nav-link">
                    <span className="icon mr-1">{Icons.appointments}</span>
                    <span>Appointments</span>
                  </Link>
                </li>
                )}
                <li className="nav-item">
                  <Link to={currentUser?.role === 'admin' ? "/admin/profile" : "/profile"} className="nav-link">
                    <span className="icon mr-1">{Icons.profile}</span>
                    <span>Profile</span>
                  </Link>
                </li>
                <li className="nav-item">
                  <button onClick={handleLogout} className="btn btn-link nav-link">
                    <span className="icon mr-1">{Icons.logout}</span>
                    <span>Logout</span>
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;