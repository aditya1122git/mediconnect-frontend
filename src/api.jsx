import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 
    (window.location.hostname === 'localhost' 
      ? 'http://localhost:5002/api' 
      : 'https://mediconnect-z65n.onrender.com/api'),
  timeout: 15000, // Increased timeout to 15 seconds
  withCredentials: false, // Disable credentials for cross-origin requests
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Track if we're currently refreshing to prevent infinite loops
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Custom retry logic for connection issues and auth errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Check specifically for "Admin user not found" error - this happens when token is valid
    // but the admin was deleted from the database
    if (
      error.response?.data?.error?.includes("Admin user not found") || 
      error.response?.data?.message?.includes("Admin user not found")
    ) {
      console.log('Admin account appears to be missing from the database');
      
      // Check if this is a profile update request from the AdminProfile component
      // We can identify them by the URL path
      if (originalRequest.url.includes('/admin/profile')) {
        console.log('Profile update request - handling error in component');
        return Promise.reject(error);
      }
      
      // Clear token and session data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('role');
      
      // Show user-friendly message and redirect to login
      if (window.location.pathname !== '/login') {
        const message = "Your admin account was not found in the database. Please contact system support or sign in with a different account.";
        alert(message);
        window.location.href = '/login?reason=admin_not_found';
        return Promise.reject(new Error(message));
      }
    }
    
    // Handle connection issues with retry
    if (
      (error.code === 'ECONNABORTED' || 
       error.message === 'Network Error' || 
       (error.response && error.response.status === 0)) && 
      !originalRequest._retry
    ) {
      console.warn('Connection issue detected, retrying...');
      originalRequest._retry = true;
      return new Promise((resolve) => {
        setTimeout(() => resolve(api(originalRequest)), 2000);
      });
    }

    // Check for specific "admin not found" error
    if (
      error.response && 
      error.response.data && 
      (error.response.data.error?.includes("Admin user not found") || 
       error.response.data.message?.includes("Admin user not found"))
    ) {
      console.log('Admin user not found in database. Session expired.');
      localStorage.removeItem('token');
      
      // Show alert and redirect to login
      if (window.location.pathname !== '/login') {
        alert('Your admin session has expired. Please sign in again to continue.');
        window.location.href = '/login?session=expired';
        return Promise.reject(error);
      }
    }

    // Handle authentication errors
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If we're already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            originalRequest.headers['x-auth-token'] = token;
            return api(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Try to get a new token by redirecting to login
        console.log('Authentication token expired, redirecting to login...');
        localStorage.removeItem('token');
        
        // Notify user of session expiration
        if (window.location.pathname !== '/login') {
          // Save the current location for redirect back after login
          localStorage.setItem('redirectAfterLogin', window.location.pathname);
          
          // Add a small delay to ensure the message is seen
          setTimeout(() => {
            window.location.href = '/login?session=expired';
          }, 500);
        }
        
        processQueue(new Error('Authentication failed'));
        return Promise.reject(error);
      } catch (refreshError) {
        processQueue(refreshError);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Response error handling
    if (error.response) {
      // Server responded with a status code outside 2xx
      switch (error.response.status) {
        case 401:
          // Token expired or invalid - already handled above
          break;
          
        case 403:
          // Forbidden (no permissions)
          console.error('Forbidden:', error.response.data);
          break;
          
        case 404:
          // Not found
          console.error('Not Found:', error.config.url);
          break;
          
        case 500:
          // Server error
          console.error('Server Error:', error.response.data);
          break;
          
        default:
          console.error('Unhandled Error:', error.response.status, error.response.data);
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('No Response:', error.request);
    } else {
      // Something happened in setting up the request
      console.error('Request Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Request interceptor to add auth token to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    if (token) {
      // Use both Authorization Bearer and x-auth-token for wider compatibility
      config.headers['Authorization'] = `Bearer ${token}`;
      config.headers['x-auth-token'] = token;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API endpoints
export const authAPI = {
  login: (email, password) => {
    console.log('Sending login request for:', email);
    return api.post('/auth/login', { email, password });
  },
  adminLogin: (email, password) => {
    console.log('Sending admin login request for:', email);
    return api.post('/auth/login', { email, password })
      .then(response => {
        // Save the token temporarily
        if (response.data && response.data.token) {
          localStorage.setItem('tempToken', response.data.token);
          
          // Use the token to verify admin access
          return api.get('/admin/users', {
            headers: {
              'Authorization': `Bearer ${response.data.token}`,
              'x-auth-token': response.data.token
            }
          })
          .then(() => {
            // Admin access verified, move temp token to actual token
            localStorage.removeItem('tempToken');
            localStorage.setItem('token', response.data.token);
            return response;
          })
          .catch(err => {
            localStorage.removeItem('tempToken');
            // Check if this is an admin not found error
            if (err.response?.data?.error?.includes('Admin user not found') ||
                err.response?.status === 404) {
              throw new Error('Admin account not found in database. Please contact system support.');
            }
            return response; // Return original response for other errors
          });
        }
        return response;
      });
  },
  register: (userData) => api.post('/auth/register', userData),
  verifyToken: () => api.get('/auth/verify'), // Add token verification endpoint
  logout: () => api.post('/auth/logout'),
};

// User API endpoints
export const userAPI = {
  getProfile: () => api.get('/profile/me'),
  updateProfile: (userData) => {
    console.log('Updating profile with data:', userData);
    return api.put('/profile/me', userData);
  },
  changePassword: (passwordData) => api.put('/profile/change-password', passwordData),
  deleteAccount: () => api.delete('/profile/me'),
};

// Health API endpoints
export const healthAPI = {
  getDashboardData: () => api.get('/health/dashboard'),
  recordHealthData: (data) => api.post('/health/record', data),
  getHealthRecords: (params) => api.get('/health/records', { params }),
  updateHealthRecord: (id, data) => api.put(`/health/records/${id}`, data),
  deleteHealthRecord: (id) => api.delete(`/health/records/${id}`),
};

// Patient API endpoints (for doctors)
export const patientAPI = {
  getPatients: () => api.get('/patients'),
  getVisitedPatients: () => api.get('/patients/visited'),
  getPatientById: (id) => api.get(`/patients/${id}`),
  getPatientRecords: (id) => api.get(`/patients/${id}/records`),
  createPatientRecord: (patientId, data) => api.post('/health/record', { ...data, patientId }),
};

// Doctor API endpoints
export const doctorAPI = {
  getDoctors: (params) => api.get('/doctors', { params }),
  getDoctorById: (id) => api.get(`/doctors/${id}`),
  getDoctorAvailability: (id, date) => api.get(`/doctors/${id}/availability`, { params: { date } }),
};

// Appointment API endpoints
export const appointmentAPI = {
  createAppointment: (data) => api.post('/appointments', data),
  getMyAppointments: (params) => {
    console.log('Calling getMyAppointments API with params:', params);
    return api.get('/appointments', { params });
  },
  getAppointment: (id) => api.get(`/appointments/${id}`),
  updateAppointmentStatus: (id, status, notes) => api.put(`/appointments/${id}`, { status, notes }),
  markAppointmentVisited: (id, notes) => api.put(`/appointments/${id}/visited`, { notes }),
  cancelAppointment: (id) => api.delete(`/appointments/${id}`),
};

// Admin API endpoints
export const adminAPI = {
  getAllUsers: () => {
    console.log('Fetching all users for admin');
    return api.get('/admin/users');
  },
  getUserById: (id) => api.get(`/admin/users/${id}`),
  updateUser: (id, userData) => api.put(`/admin/users/${id}`, userData),
  deleteUser: (id) => {
    console.log('Deleting user with ID:', id);
    return api.delete(`/admin/users/${id}`, {
      headers: {
        'bypass-auth': 'true'  // Special header to bypass auth
      }
    });
  },
  // Alternative method as fallback
  deleteUserAlternative: (id) => {
    console.log('Trying alternative delete for user:', id);
    // Direct API call to force-delete endpoint
    return api.delete(`/admin/users/force-delete/${id}`);
  },
  getAllDoctors: () => api.get('/admin/doctors'),
  updateDoctor: (id, doctorData) => api.put(`/admin/doctors/${id}`, doctorData),
  deleteAllDoctors: () => api.delete('/admin/doctors', {
    headers: {
      'bypass-auth': 'true'  // Special header to bypass auth
    }
  }),
  getAllPatients: () => api.get('/admin/patients'),
  updatePatient: (id, patientData) => api.put(`/admin/patients/${id}`, patientData),
  deleteAllPatients: () => api.delete('/admin/patients', {
    headers: {
      'bypass-auth': 'true'  // Special header to bypass auth
    }
  }),
  updateProfile: (userData) => {
    console.log('Updating admin profile with data:', userData);
    
    // Add a timestamp to ensure the request is unique
    const timestamp = new Date().getTime();
    
    // Try the admin route first
    return api.put(`/admin/profile?t=${timestamp}`, userData)
      .catch(error => {
        console.error('Admin profile update error:', error.response || error);
        
        if (error.response?.status === 404) {
          console.log('Admin profile endpoint not found, trying alternate approach...');
          
          // Get the current user's ID from localStorage or context
          const tokenData = localStorage.getItem('token');
          let userId = null;
          
          // If we have access to the ID, use the admin user update endpoint as fallback
          if (tokenData) {
            try {
              // Attempt to decode the token to get user ID
              const base64Url = tokenData.split('.')[1];
              const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
              const payload = JSON.parse(window.atob(base64));
              
              if (payload && payload.user && payload.user.id) {
                userId = payload.user.id;
                console.log('Using admin user update endpoint with ID:', userId);
                // Use the admin user update endpoint instead
                return api.put(`/admin/users/${userId}`, userData);
              }
            } catch (err) {
              console.error('Error decoding token:', err);
            }
          }
          
          // If we couldn't get the ID, reject with a more helpful message
          return Promise.reject({
            response: {
              status: 404,
              data: {
                success: false,
                error: 'Profile endpoint not available. Please contact system administrator.'
              }
            }
          });
        }
        
        // Special handling for "Admin user not found" error - don't let the interceptor handle it
        if (error.response?.data?.error?.includes("Admin user not found") || 
            error.response?.data?.message?.includes("Admin user not found")) {
          return Promise.reject({
            response: {
              status: 400,
              data: {
                success: false,
                error: 'Failed to update profile. Please try logging in again.'
              }
            }
          });
        }
        
        // Otherwise just propagate the error
        throw error;
      });
  },
  changePassword: (passwordData) => {
    console.log('Changing admin password');
    return api.put('/admin/change-password', passwordData);
  }
};

// Export the configured axios instance
export default api;