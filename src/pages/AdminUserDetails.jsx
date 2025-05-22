import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { adminAPI } from '../api';

const AdminUserDetails = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError('');
        
        const response = await adminAPI.getUserById(id);
        
        if (response.data && response.data.success) {
          setUserData(response.data.data);
        } else {
          setError('Failed to fetch user details');
        }
      } catch (err) {
        console.error('Error fetching user details:', err);
        setError('Failed to fetch user details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [id]);

  const handleDeleteUser = async () => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }
    
    // Prompt for admin password
    const password = window.prompt('Please enter your admin password to confirm deletion:');
    if (!password) return;
    
    try {
      setIsDeleting(true);
      setError('');
      
      const response = await adminAPI.deleteUser(id, password);
      
      if (response.data && response.data.success) {
        alert('User deleted successfully');
        navigate('/admin/users');
      } else {
        setError('Failed to delete user');
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      setError(err.response?.data?.error || 'Failed to delete user. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading user details...</div>;
  }

  if (error) {
    return (
      <div className="user-details-error">
        <div className="alert alert-danger">{error}</div>
        <Link to="/admin/users" className="btn btn-primary">Back to Users</Link>
      </div>
    );
  }

  if (!userData || !userData.user) {
    return (
      <div className="user-not-found">
        <div className="alert alert-warning">User not found</div>
        <Link to="/admin/users" className="btn btn-primary">Back to Users</Link>
      </div>
    );
  }

  const { user, profile } = userData;

  return (
    <div className="admin-user-details">
      <div className="page-header d-flex justify-content-between align-items-center">
        <div>
          <h1>User Details</h1>
          <p className="text-muted">Viewing detailed information for {user.name}</p>
        </div>
        <div>
          <Link to="/admin/users" className="btn btn-secondary mr-2">
            Back to Users
          </Link>
          <button 
            className="btn btn-danger" 
            onClick={handleDeleteUser}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete User'}
          </button>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6">
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="card-title mb-0">Basic Information</h5>
            </div>
            <div className="card-body">
              <table className="table table-bordered">
                <tbody>
                  <tr>
                    <th>Name</th>
                    <td>{user.name}</td>
                  </tr>
                  <tr>
                    <th>Email</th>
                    <td>{user.email}</td>
                  </tr>
                  <tr>
                    <th>Role</th>
                    <td>
                      <span className={`badge badge-${user.role === 'doctor' ? 'primary' : (user.role === 'admin' ? 'danger' : 'success')}`}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <th>Phone</th>
                    <td>{user.phone || 'N/A'}</td>
                  </tr>
                  <tr>
                    <th>Gender</th>
                    <td>{user.gender || 'N/A'}</td>
                  </tr>
                  <tr>
                    <th>Date of Birth</th>
                    <td>{user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'N/A'}</td>
                  </tr>
                  <tr>
                    <th>Registered On</th>
                    <td>{new Date(user.createdAt).toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          {user.role === 'doctor' && (
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="card-title mb-0">Doctor Information</h5>
              </div>
              <div className="card-body">
                <table className="table table-bordered">
                  <tbody>
                    <tr>
                      <th>Specialization</th>
                      <td>{user.specialization || 'N/A'}</td>
                    </tr>
                    <tr>
                      <th>Experience</th>
                      <td>{profile?.experience ? `${profile.experience} years` : 'N/A'}</td>
                    </tr>
                    <tr>
                      <th>About</th>
                      <td>{profile?.about || 'N/A'}</td>
                    </tr>
                  </tbody>
                </table>
                
                {profile?.qualifications && profile.qualifications.length > 0 && (
                  <div className="mt-3">
                    <h6>Qualifications</h6>
                    <ul className="list-group">
                      {profile.qualifications.map((qual, index) => (
                        <li key={index} className="list-group-item">
                          <strong>{qual.degree}</strong> - {qual.institution} ({qual.year})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {user.role === 'patient' && (
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="card-title mb-0">Patient Information</h5>
              </div>
              <div className="card-body">
                <table className="table table-bordered">
                  <tbody>
                    <tr>
                      <th>Height</th>
                      <td>{user.height ? `${user.height} cm` : 'N/A'}</td>
                    </tr>
                    <tr>
                      <th>Weight</th>
                      <td>{user.weight ? `${user.weight} kg` : 'N/A'}</td>
                    </tr>
                  </tbody>
                </table>
                
                {user.emergencyContact && (
                  <div className="mt-3">
                    <h6>Emergency Contact</h6>
                    <table className="table table-bordered">
                      <tbody>
                        <tr>
                          <th>Name</th>
                          <td>{user.emergencyContact.name || 'N/A'}</td>
                        </tr>
                        <tr>
                          <th>Relationship</th>
                          <td>{user.emergencyContact.relationship || 'N/A'}</td>
                        </tr>
                        <tr>
                          <th>Phone</th>
                          <td>{user.emergencyContact.phone || 'N/A'}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

                {profile?.conditions && profile.conditions.length > 0 && (
                  <div className="mt-3">
                    <h6>Medical Conditions</h6>
                    <ul className="list-group">
                      {profile.conditions.map((condition, index) => (
                        <li key={index} className="list-group-item">{condition}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {profile?.allergies && profile.allergies.length > 0 && (
                  <div className="mt-3">
                    <h6>Allergies</h6>
                    <ul className="list-group">
                      {profile.allergies.map((allergy, index) => (
                        <li key={index} className="list-group-item">{allergy}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUserDetails; 