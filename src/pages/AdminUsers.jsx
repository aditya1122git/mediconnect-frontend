import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { adminAPI } from '../api';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleteSuccess, setDeleteSuccess] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [adminPassword, setAdminPassword] = useState('');
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [bulkDeleteType, setBulkDeleteType] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteUserModal, setShowDeleteUserModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordEntered, setPasswordEntered] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showBulkConfirmModal, setShowBulkConfirmModal] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  // Extract role from URL query params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const roleParam = params.get('role');
    if (roleParam && ['doctor', 'patient'].includes(roleParam)) {
      setSelectedRole(roleParam);
    } else {
      setSelectedRole('all');
    }
  }, [location.search]);

  // Memoize fetchUsers to avoid eslint warnings
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      let response;
      if (selectedRole === 'doctor') {
        response = await adminAPI.getAllDoctors();
      } else if (selectedRole === 'patient') {
        response = await adminAPI.getAllPatients();
      } else {
        response = await adminAPI.getAllUsers();
      }
      
      if (response.data && response.data.success) {
        setUsers(response.data.data || []);
      } else {
        setError('Failed to fetch users');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      // Check for admin not found error
      if (err.response?.data?.error?.includes('Admin user not found') || 
          err.response?.data?.message?.includes('Admin user not found')) {
        setError('Your admin session has expired. Please sign in again.');
        setTimeout(() => {
          localStorage.removeItem('token');
          window.location.href = '/login?session=expired';
        }, 1500);
        return;
      }
      setError('Failed to fetch users. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [selectedRole]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRoleChange = (e) => {
    const role = e.target.value;
    if (role === 'all') {
      navigate('/admin/users');
    } else {
      navigate(`/admin/users?role=${role}`);
    }
  };

  const openDeleteUserModal = (userId) => {
    const user = users.find(u => u._id === userId);
    if (user) {
      setUserToDelete(user);
      setShowDeleteUserModal(true);
      setAdminPassword('');
      setDeleteError('');
    }
  };

  const handleDeleteUser = async () => {    
    try {
      setIsDeleting(true);
      setDeleteError('');
      setDeleteSuccess('');
      
      console.log('Attempting to delete user without authentication');
      
      // Try the first method
      try {
        console.log('Attempting primary delete method with bypass-auth header');
        const response = await adminAPI.deleteUser(userToDelete._id);
        console.log('Delete user response:', response.data);
        
        if (response.data && response.data.success) {
          setDeleteSuccess(`User ${userToDelete.name} deleted successfully`);
          // Remove user from list
          setUsers(users.filter(user => user._id !== userToDelete._id));
          setShowConfirmModal(false);
          return; // Exit early on success
        }
      } catch (firstError) {
        console.log('First delete method failed, trying alternative method...');
        console.log('Error details:', firstError);
        
        // Try the alternative method if the first one failed
        try {
          console.log('Attempting alternative force-delete method');
          const altResponse = await adminAPI.deleteUserAlternative(userToDelete._id);
          console.log('Alternative delete response:', altResponse.data);
          
          if (altResponse.data && altResponse.data.success) {
            setDeleteSuccess(`User ${userToDelete.name} deleted successfully`);
            // Remove user from list
            setUsers(users.filter(user => user._id !== userToDelete._id));
            setShowConfirmModal(false);
            return; // Exit early on success
          } else {
            throw firstError; // Reuse the first error if the second method fails but doesn't throw
          }
        } catch (secondError) {
          // If both methods fail, use the most informative error
          console.log('Both delete methods failed');
          console.log('Alternative method error:', secondError);
          
          // Choose the more informative error
          throw secondError.response?.data?.error 
              ? secondError 
              : firstError;
        }
      }
      
      // If we get here, both methods failed but didn't throw errors
      setDeleteError('Failed to delete user');
    } catch (err) {
      console.error('Error deleting user:', err);
      let errorMessage = 'User deletion failed. Please try again.';
      
      if (err.response) {
        const status = err.response.status;
        console.log('Delete user error response status:', status);
        console.log('Error response data:', JSON.stringify(err.response.data));
        
        if (err.response.data && err.response.data.error) {
          errorMessage = err.response.data.error;
          
          // Handle common errors with user-friendly messages
          if (errorMessage.toLowerCase().includes('password is required')) {
            errorMessage = 'Server error: The system is still requiring password authentication. Please contact the administrator.';
          } else if (errorMessage.toLowerCase().includes('auth') || 
              errorMessage.toLowerCase().includes('password')) {
            errorMessage = 'Authentication error. Please reload the page and try again.';
          } else if (status === 404) {
            errorMessage = 'User could not be found. They may have been already deleted.';
          }
        }
      }
      
      setDeleteError(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePasswordChange = (e) => {
    const password = e.target.value;
    setAdminPassword(password);
    setPasswordEntered(password.length > 0);
  };

  const closeDeleteModal = () => {
    setShowDeleteUserModal(false);
    setShowConfirmModal(false);
    setShowBulkDeleteModal(false);
    setShowBulkConfirmModal(false);
    setDeleteError('');
  };

  const handleDeleteClick = () => {
    setShowDeleteUserModal(false);
    setShowConfirmModal(true);
  };

  const openBulkDeleteModal = (type) => {
    setBulkDeleteType(type);
    setShowBulkDeleteModal(true);
    setAdminPassword('');
  };

  const handleBulkDeleteClick = () => {
    setShowBulkDeleteModal(false);
    setShowBulkConfirmModal(true);
  };

  const handleBulkDelete = async () => {
    try {
      setIsDeleting(true);
      setDeleteError('');
      setDeleteSuccess('');
      
      console.log('Attempting bulk delete without authentication');
      
      let response;
      if (bulkDeleteType === 'doctors') {
        response = await adminAPI.deleteAllDoctors();
      } else if (bulkDeleteType === 'patients') {
        response = await adminAPI.deleteAllPatients();
      } else {
        setDeleteError('Invalid operation');
        return;
      }
      
      if (response.data && response.data.success) {
        setDeleteSuccess(response.data.message || 'Bulk deletion completed successfully');
        setShowBulkConfirmModal(false);
        fetchUsers(); // Refresh the list
      } else {
        setDeleteError('Failed to complete operation');
      }
    } catch (err) {
      console.error('Error in bulk operation:', err);
      let errorMessage = err.response?.data?.error || 'Operation failed. Please try again.';
      
      // Log detailed error info
      if (err.response) {
        const status = err.response.status;
        console.log('Bulk delete error response status:', status);
        console.log('Error response data:', JSON.stringify(err.response.data));
        
        // Handle common errors with user-friendly messages
        if (errorMessage.toLowerCase().includes('password is required')) {
          errorMessage = 'Server error: The system is still requiring password authentication. Please contact the administrator.';
        } else if (errorMessage.toLowerCase().includes('auth') || 
            errorMessage.toLowerCase().includes('password')) {
          errorMessage = 'Authentication error. Please reload the page and try again.';
        }
      }
      
      setDeleteError(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handlePasswordKeyPress = (e, callback) => {
    // If Enter key is pressed and password is entered, trigger the callback
    if (e.key === 'Enter' && adminPassword.trim()) {
      e.preventDefault();
      callback();
    }
  };

  // Password input eye icon
  const EyeIcon = ({ show }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" 
      className="bi bi-eye" viewBox="0 0 16 16">
      {show ? (
        <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
      ) : (
        <>
          <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z"/>
          <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829l.822.822zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829z"/>
          <path d="M3.35 5.47c-.18.16-.353.322-.518.487A13.134 13.134 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7.029 7.029 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12-.708.708z"/>
        </>
      )}
    </svg>
  );

  if (loading) {
    return <div className="loading">Loading users...</div>;
  }

  return (
    <div className="admin-users">
      <div className="page-header d-flex justify-content-between align-items-center">
        <div>
          <h1>User Management</h1>
          <p className="text-muted">Manage all users in the system</p>
        </div>
        <div>
          <Link to="/admin/dashboard" className="btn btn-secondary">
            Back to Dashboard
          </Link>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {deleteError && <div className="alert alert-danger">{deleteError}</div>}
      {deleteSuccess && <div className="alert alert-success">{deleteSuccess}</div>}

      <div className="filters mb-4">
        <div className="row">
          <div className="col-md-6">
            <div className="form-group">
              <label htmlFor="roleFilter">Filter by Role:</label>
              <select
                id="roleFilter"
                className="form-control"
                value={selectedRole}
                onChange={handleRoleChange}
              >
                <option value="all">All Users</option>
                <option value="doctor">Doctors Only</option>
                <option value="patient">Patients Only</option>
              </select>
            </div>
          </div>
          <div className="col-md-6">
            <div className="bulk-actions mt-4">
              {selectedRole === 'doctor' && (
                <button 
                  className="btn btn-danger" 
                  onClick={() => openBulkDeleteModal('doctors')}
                  disabled={isDeleting}
                >
                  Delete All Doctors
                </button>
              )}
              {selectedRole === 'patient' && (
                <button 
                  className="btn btn-danger" 
                  onClick={() => openBulkDeleteModal('patients')}
                  disabled={isDeleting}
                >
                  Delete All Patients
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {users.length === 0 ? (
        <div className="no-users">
          <p>No users found.</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`badge badge-${user.role === 'doctor' ? 'primary' : 'success'}`}>
                      {user.role && user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="btn-group">
                      <Link 
                        to={`/admin/users/${user._id}`} 
                        className="btn btn-sm btn-info"
                      >
                        View
                      </Link>
                      <button 
                        className="btn btn-sm btn-danger" 
                        onClick={() => openDeleteUserModal(user._id)}
                        disabled={isDeleting}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete User Modal */}
      {showDeleteUserModal && userToDelete && (
        <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '400px' }}>
            <div className="modal-content" style={{ borderRadius: '8px' }}>
              <div className="p-0">
                <div className="bg-danger text-white p-2 position-relative" style={{ borderRadius: '8px 8px 0 0' }}>
                  <div className="d-flex align-items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="mr-2" viewBox="0 0 16 16">
                      <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                      <path d="M5.255 5.786a.237.237 0 0 0 0 .334c.78.618 2.519 1.764 3.585 1.764s2.798-1.146 3.585-1.764a.237.237 0 0 0 0-.334c-.78-.618-2.519-1.764-3.585-1.764s-2.798 1.146-3.585 1.764z"/>
                    </svg>
                    <h5 className="modal-title m-0 font-weight-bold">Delete User</h5>
                  </div>
                  <button 
                    type="button" 
                    className="close position-absolute text-white" 
                    style={{ top: '8px', right: '12px' }}
                    onClick={closeDeleteModal} 
                    disabled={isDeleting}
                  >
                    <span aria-hidden="true">&times;</span>
                  </button>
                </div>

                <div className="p-3">
                  {/* User Info */}
                  <div className="bg-light border rounded p-2 mb-3 text-center">
                    <div className="d-flex align-items-center justify-content-center">
                      <div 
                        className="rounded-circle text-white d-flex align-items-center justify-content-center mr-2"
                        style={{ 
                          width: '40px', 
                          height: '40px', 
                          fontSize: '18px',
                          backgroundColor: '#007bff' 
                        }}
                      >
                        {userToDelete.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div className="text-left">
                        <h6 className="mb-0 font-weight-bold">{userToDelete.name}</h6>
                        <p className="mb-0 small text-muted">{userToDelete.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Warning */}
                  <div className="alert alert-warning py-1 px-2 mb-3" style={{ backgroundColor: '#fff3cd', border: '1px solid #ffeeba' }}>
                    <p className="mb-0 text-center small" style={{ color: '#ff8800' }}>
                      <strong>Warning:</strong> This will permanently delete this user and all their data.
                    </p>
                  </div>

                  {/* Error Message */}
                  {deleteError && (
                    <div className="alert alert-danger py-1 px-2 mb-3 text-center small">
                      {deleteError}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="d-flex justify-content-between">
                    <button 
                      type="button"
                      className="btn btn-success px-3"
                      style={{ borderRadius: '25px', width: '45%' }}
                      onClick={closeDeleteModal}
                      disabled={isDeleting}
                    >
                      CANCEL
                    </button>
                    <button 
                      type="button"
                      className="btn btn-danger px-3"
                      style={{ 
                        borderRadius: '25px', 
                        width: '45%', 
                        backgroundColor: '#e74c3c'
                      }}
                      onClick={handleDeleteClick}
                      disabled={isDeleting}
                    >
                      DELETE USER
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Final Confirmation Modal */}
      {showConfirmModal && userToDelete && (
        <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-sm modal-dialog-centered">
            <div className="modal-content" style={{ borderRadius: '8px' }}>
              <div className="p-0">
                <div className="bg-danger text-white p-2 position-relative" style={{ borderRadius: '8px 8px 0 0' }}>
                  <div className="d-flex align-items-center justify-content-center">
                    <h5 className="modal-title m-0 font-weight-bold">Confirm Deletion</h5>
                  </div>
                </div>

                <div className="p-3 text-center">
                  <p>Are you sure you want to delete this user?</p>
                  
                  {deleteError && (
                    <div className="alert alert-danger py-1 px-2 mb-3 text-center small">
                      {deleteError}
                    </div>
                  )}

                  <button 
                    type="button"
                    className="btn btn-danger px-5 py-2 text-center d-flex justify-content-center align-items-center"
                    style={{ 
                      borderRadius: '25px',
                      backgroundColor: '#e74c3c',
                      width: '80%',
                      margin: '0 auto'
                    }}
                    onClick={handleDeleteUser}
                    disabled={isDeleting}
                  >
                    {isDeleting ? "DELETING..." : "CONFIRM"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Modal */}
      {showBulkDeleteModal && (
        <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '400px' }}>
            <div className="modal-content" style={{ borderRadius: '8px' }}>
              <div className="p-0">
                <div className="bg-danger text-white p-2 position-relative" style={{ borderRadius: '8px 8px 0 0' }}>
                  <div className="d-flex align-items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="mr-2" viewBox="0 0 16 16">
                      <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                      <path d="M5.255 5.786a.237.237 0 0 0 0 .334c.78.618 2.519 1.764 3.585 1.764s2.798-1.146 3.585-1.764a.237.237 0 0 0 0-.334c-.78-.618-2.519-1.764-3.585-1.764s-2.798 1.146-3.585 1.764z"/>
                    </svg>
                    <h5 className="modal-title m-0 font-weight-bold">Delete All {bulkDeleteType}</h5>
                  </div>
                  <button 
                    type="button" 
                    className="close position-absolute text-white" 
                    style={{ top: '8px', right: '12px' }}
                    onClick={() => setShowBulkDeleteModal(false)} 
                    disabled={isDeleting}
                  >
                    <span aria-hidden="true">&times;</span>
                  </button>
                </div>

                <div className="p-3">
                  {/* Warning */}
                  <div className="alert alert-warning py-1 px-2 mb-3" style={{ backgroundColor: '#fff3cd', border: '1px solid #ffeeba' }}>
                    <p className="mb-0 text-center small" style={{ color: '#ff8800' }}>
                      <strong>Warning:</strong> This will permanently delete all {bulkDeleteType}.
                    </p>
                  </div>

                  {/* Error Message */}
                  {deleteError && (
                    <div className="alert alert-danger py-1 px-2 mb-3 text-center small">
                      {deleteError}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="d-flex justify-content-between">
                    <button 
                      type="button"
                      className="btn btn-success px-3"
                      style={{ borderRadius: '25px', width: '45%' }}
                      onClick={() => setShowBulkDeleteModal(false)}
                      disabled={isDeleting}
                    >
                      CANCEL
                    </button>
                    <button 
                      type="button"
                      className="btn btn-danger px-3"
                      style={{ 
                        borderRadius: '25px', 
                        width: '45%', 
                        backgroundColor: '#e74c3c'
                      }}
                      onClick={handleBulkDeleteClick}
                      disabled={isDeleting}
                    >
                      DELETE ALL
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Confirm Modal */}
      {showBulkConfirmModal && (
        <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-sm modal-dialog-centered">
            <div className="modal-content" style={{ borderRadius: '8px' }}>
              <div className="p-0">
                <div className="bg-danger text-white p-2 position-relative" style={{ borderRadius: '8px 8px 0 0' }}>
                  <div className="d-flex align-items-center justify-content-center">
                    <h5 className="modal-title m-0 font-weight-bold">Confirm Deletion</h5>
                  </div>
                </div>

                <div className="p-3 text-center">
                  <p>Are you sure you want to delete all {bulkDeleteType}?</p>
                  
                  {deleteError && (
                    <div className="alert alert-danger py-1 px-2 mb-3 text-center small">
                      {deleteError}
                    </div>
                  )}

                  <button 
                    type="button"
                    className="btn btn-danger px-5 py-2 text-center d-flex justify-content-center align-items-center"
                    style={{ 
                      borderRadius: '25px',
                      backgroundColor: '#e74c3c',
                      width: '80%',
                      margin: '0 auto'
                    }}
                    onClick={handleBulkDelete}
                    disabled={isDeleting}
                  >
                    {isDeleting ? "PROCESSING..." : "CONFIRM"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers; 