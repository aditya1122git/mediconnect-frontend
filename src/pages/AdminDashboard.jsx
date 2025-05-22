import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../api';
import { useAuth } from '../contexts/AuthContext';

const AdminDashboard = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDoctors: 0,
    totalPatients: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        // Fetch users stats
        const [usersResponse, doctorsResponse, patientsResponse] = await Promise.all([
          adminAPI.getAllUsers(),
          adminAPI.getAllDoctors(),
          adminAPI.getAllPatients()
        ]);

        setStats({
          totalUsers: usersResponse.data.count || 0,
          totalDoctors: doctorsResponse.data.count || 0,
          totalPatients: patientsResponse.data.count || 0
        });
      } catch (err) {
        console.error('Error fetching admin data:', err);
        setError('Failed to load admin dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="loading">Loading admin dashboard...</div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="page-header">
        <h1>Welcome Admin Aditya!</h1>
        <p className="subtitle">Your admin dashboard at a glance</p>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="stats-cards">
        <div className="row">
          <div className="col-md-4">
            <div className="card mb-4">
              <div className="card-body">
                <h5 className="card-title">Total Users</h5>
                <h2 className="card-stat">{stats.totalUsers}</h2>
                <Link to="/admin/users" className="btn btn-primary">Manage Users</Link>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card mb-4">
              <div className="card-body">
                <h5 className="card-title">Total Doctors</h5>
                <h2 className="card-stat">{stats.totalDoctors}</h2>
                <Link to="/admin/users?role=doctor" className="btn btn-primary">Manage Doctors</Link>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card mb-4">
              <div className="card-body">
                <h5 className="card-title">Total Patients</h5>
                <h2 className="card-stat">{stats.totalPatients}</h2>
                <Link to="/admin/users?role=patient" className="btn btn-primary">Manage Patients</Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-actions mt-5">
        <h3>Administration Tools</h3>
        <div className="row">
          <div className="col-md-6">
            <div className="card mb-4">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">User Management</h5>
              </div>
              <div className="card-body">
                <p>Manage user accounts, permissions and system access</p>
                <div className="list-group">
                  <Link to="/admin/users" className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                    All Users
                    <span className="badge badge-primary badge-pill">{stats.totalUsers}</span>
                  </Link>
                  <Link to="/admin/users?role=doctor" className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                    Doctors
                    <span className="badge badge-info badge-pill">{stats.totalDoctors}</span>
                  </Link>
                  <Link to="/admin/users?role=patient" className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                    Patients
                    <span className="badge badge-success badge-pill">{stats.totalPatients}</span>
                  </Link>
                  <Link to="/admin/users" className="list-group-item list-group-item-action">
                    User Verification Queue
                  </Link>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-md-6">
            <div className="card mb-4">
              <div className="card-header bg-info text-white">
                <h5 className="mb-0">Admin Profile</h5>
              </div>
              <div className="card-body">
                <p>Manage your admin account settings</p>
                <div className="list-group">
                  <Link to="/admin/profile" className="list-group-item list-group-item-action">
                    View & Edit Profile
                  </Link>
                  <Link to="/admin/change-password" className="list-group-item list-group-item-action">
                    Change Password
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 