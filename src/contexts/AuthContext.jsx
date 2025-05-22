import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { authAPI } from '../api';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verify token and get user data
  const verifyToken = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return false;
      }

      console.log('Verifying token...');
      const response = await authAPI.verifyToken();
      console.log('Token verification response:', response);
      
      // Set user data from response
      if (response.data && (response.data.user || response.data.data)) {
        const userData = response.data.user || response.data.data;
        setCurrentUser(userData);
        setIsAuthenticated(true);
        return true;
      } else {
        console.error('Invalid response format:', response.data);
        localStorage.removeItem('token');
        setCurrentUser(null);
        setIsAuthenticated(false);
        return false;
      }
    } catch (err) {
      console.error('Token verification failed:', err);
      localStorage.removeItem('token');
      setCurrentUser(null);
      setIsAuthenticated(false);
      return false;
    }
  }, []);

  // Check if user is logged in on initial load
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await verifyToken();
      } catch (err) {
        console.error("Auth initialization error:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [verifyToken]);

  // Login function
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Attempting login for user:', email);
      
      // Check if this is an admin login
      const isAdminLogin = email.toLowerCase().includes('admin');
      
      // Use appropriate login method
      let response;
      if (isAdminLogin) {
        console.log('Using admin login method');
        try {
          response = await authAPI.adminLogin(email, password);
        } catch (adminErr) {
          console.error('Admin login failed:', adminErr);
          
          if (adminErr.message && adminErr.message.includes('Admin account not found')) {
            return {
              success: false,
              message: 'Admin account not found in the database. Please contact system support.'
            };
          }
          
          // Fall back to regular login if admin login fails
          console.log('Falling back to regular login');
          response = await authAPI.login(email, password);
        }
      } else {
        response = await authAPI.login(email, password);
      }
      
      console.log('Login response status:', response.status);
      console.log('Login response data:', JSON.stringify(response.data));
      
      if (!response.data) {
        throw new Error('Invalid response from server');
      }
      
      const { token, user } = response.data;
      
      if (!token) {
        throw new Error('No token received from server');
      }
      
      if (!user) {
        throw new Error('No user data received from server');
      }
      
      // Store token in localStorage
      localStorage.setItem('token', token);
      console.log('Token stored in localStorage');
      
      // Update auth state
      setCurrentUser(user);
      setIsAuthenticated(true);
      
      console.log('Login successful. User role:', user.role);
      
      return { 
        success: true, 
        user,
        role: user.role 
      };
    } catch (err) {
      console.error('Login error details:', err);
      
      // Check for specific error types
      let errorMessage = 'Login failed. Please check your credentials.';
      
      if (err.response) {
        // Server responded with an error status code
        console.error('Login error response status:', err.response.status);
        console.error('Login error response data:', JSON.stringify(err.response.data));
        
        if (err.response.status === 401 || err.response.status === 400) {
          // Provide more specific error messages for incorrect credentials
          if (err.response.data && err.response.data.message && err.response.data.message.includes('password')) {
            errorMessage = 'Wrong password. Please try again.';
          } else if (err.response.data && err.response.data.message && err.response.data.message.includes('Invalid password')) {
            errorMessage = 'Wrong password. Please try again.';
          } else if (err.response.data && err.response.data.message && err.response.data.message.includes('email')) {
            errorMessage = 'Email not found. Please check your email address.';
          } else if (err.response.data && err.response.data.message && err.response.data.message.includes('user')) {
            errorMessage = 'User not found. Please check your email address.';
          } else if (err.response.data && err.response.data.message && err.response.data.message.includes('credentials')) {
            errorMessage = 'Invalid email or password. Please try again.';
          } else if (err.response.data && err.response.data.message) {
            errorMessage = err.response.data.message;
          } else if (err.response.data && err.response.data.error) {
            errorMessage = err.response.data.error;
          }
        } else if (err.response.status === 403) {
          errorMessage = 'Your account is inactive or banned. Please contact support.';
        } else if (err.response.status === 404) {
          errorMessage = 'User not found. Please check your email address.';
        } else if (err.response.data && err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data && err.response.data.error) {
          errorMessage = err.response.data.error;
        }
      } else if (err.request) {
        // Request was made but no response received
        console.error('No response received from server');
        errorMessage = 'Server not responding. Please try again later.';
      } else {
        // Something else happened while setting up the request
        console.error('Error message:', err.message);
        errorMessage = err.message || 'An unexpected error occurred.';
      }
      
      setError(errorMessage);
      return {
        success: false,
        message: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authAPI.register(userData);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      setCurrentUser(user);
      setIsAuthenticated(true);
      
      return { 
        success: true,
        user,
        token
      };
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Registration failed';
      setError(errorMessage);
      return { 
        success: false, 
        message: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.removeItem('token');
      setCurrentUser(null);
      setIsAuthenticated(false);
    }
  };

  // Update current user data
  const updateCurrentUser = (userData) => {
    console.log('Updating current user data:', userData);
    setCurrentUser(prev => ({
      ...prev,
      ...userData
    }));
  };

  // Refresh user data
  const refreshUser = async () => {
    try {
      await verifyToken();
    } catch (err) {
      console.error("Failed to refresh user:", err);
    }
  };

  const value = {
    currentUser,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    logout,
    refreshUser,
    updateCurrentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};