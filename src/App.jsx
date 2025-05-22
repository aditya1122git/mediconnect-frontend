import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import LoadingSpinner from './components/LoadingSpinner';
import './styles/forms.css';

// Create an error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Component Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-container">
          <h2>Something went wrong.</h2>
          <button 
            className="btn btn-primary" 
            onClick={() => this.setState({ hasError: false })}
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Lazy-loaded pages with default exports - use individual error boundaries
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Profile = lazy(() => import('./pages/Profile'));
const RecordHealth = lazy(() => import('./pages/RecordHealth'));
const ViewHistory = lazy(() => import('./pages/ViewHistory'));
const NotFound = lazy(() => import('./pages/NotFound'));
const HomePage = lazy(() => import('./pages/HomePage'));

// Doctor pages
const DoctorPatients = lazy(() => import('./pages/DoctorPatients'));
const PatientRecords = lazy(() => import('./pages/PatientRecords'));
const AddPatientRecord = lazy(() => import('./pages/AddPatientRecord'));

// New pages
const AboutUs = lazy(() => import('./pages/AboutUs'));
const ContactUs = lazy(() => import('./pages/ContactUs'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));

// New appointment and doctor pages
const DoctorsList = lazy(() => import('./pages/DoctorsList'));
const DoctorProfile = lazy(() => import('./pages/DoctorProfile'));
const BookAppointment = lazy(() => import('./pages/BookAppointment'));
const MyAppointments = lazy(() => import('./pages/MyAppointments'));

// Admin specific components
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminUsers = lazy(() => import('./pages/AdminUsers'));
const AdminUserDetails = lazy(() => import('./pages/AdminUserDetails'));
const AdminProfile = lazy(() => import('./pages/AdminProfile'));

// Enhanced ProtectedRoute component with redirect back to original page after login
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner fullPage />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// DoctorRoute component for doctor-only pages
const DoctorRoute = ({ children }) => {
  const { isAuthenticated, loading, currentUser } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner fullPage />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (currentUser?.role !== 'doctor') {
    return <Navigate to="/" replace />;
  }

  return children;
};

// PatientRoute component for patient-only pages
const PatientRoute = ({ children }) => {
  const { isAuthenticated, loading, currentUser } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner fullPage />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (currentUser?.role !== 'patient') {
    return <Navigate to="/" replace />;
  }

  return children;
};

// PublicRoute component for already authenticated users
const PublicRoute = ({ children, redirectAuthenticated = true }) => {
  const { isAuthenticated, loading, currentUser } = useAuth();

  if (loading) {
    return <LoadingSpinner fullPage />;
  }

  if (isAuthenticated && redirectAuthenticated) {
    // Redirect admins to admin dashboard, others to regular dashboard
    const dashboardPath = currentUser?.role === 'admin' ? '/admin/dashboard' : '/dashboard';
    return <Navigate to={dashboardPath} replace />;
  }

  return children;
};

// AdminRoute component for admin-only pages
const AdminRoute = ({ children }) => {
  const { isAuthenticated, loading, currentUser } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner fullPage />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (currentUser?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Helper for lazy loading with error boundaries
const LazyComponent = ({ component: Component }) => (
  <ErrorBoundary>
    <Suspense fallback={<LoadingSpinner fullPage />}>
      <Component />
    </Suspense>
  </ErrorBoundary>
);

const AppContent = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="app">
      <Navbar />
      <main className={isAuthenticated ? "container" : ""}>
        <Routes>
          {/* Public Home Page */}
          <Route 
            path="/" 
            element={
              <PublicRoute redirectAuthenticated={true}>
                <LazyComponent component={HomePage} />
              </PublicRoute>
            } 
          />
          
          {/* Public information pages */}
          <Route 
            path="/about" 
            element={<LazyComponent component={AboutUs} />} 
          />
          <Route 
            path="/contact" 
            element={<LazyComponent component={ContactUs} />} 
          />
          <Route 
            path="/privacy" 
            element={<LazyComponent component={PrivacyPolicy} />} 
          />
          <Route 
            path="/terms" 
            element={<LazyComponent component={TermsOfService} />} 
          />
          
          {/* Public Routes */}
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <LazyComponent component={Login} />
              </PublicRoute>
            } 
          />
          <Route 
            path="/register" 
            element={
              <PublicRoute>
                <LazyComponent component={Register} />
              </PublicRoute>
            } 
          />
          
          {/* Common Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <LazyComponent component={Dashboard} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <LazyComponent component={Profile} />
              </ProtectedRoute>
            } 
          />
          
          {/* Patient-only Routes */}
          <Route 
            path="/record" 
            element={
              <PatientRoute>
                <LazyComponent component={RecordHealth} />
              </PatientRoute>
            } 
          />
          <Route 
            path="/history" 
            element={
              <PatientRoute>
                <LazyComponent component={ViewHistory} />
              </PatientRoute>
            } 
          />
          
          {/* Doctor-only Routes */}
          <Route 
            path="/patients" 
            element={
              <DoctorRoute>
                <LazyComponent component={DoctorPatients} />
              </DoctorRoute>
            } 
          />
          <Route 
            path="/patients/:patientId" 
            element={
              <DoctorRoute>
                <LazyComponent component={PatientRecords} />
              </DoctorRoute>
            } 
          />
          <Route 
            path="/patients/:patientId/records" 
            element={
              <DoctorRoute>
                <LazyComponent component={PatientRecords} />
              </DoctorRoute>
            } 
          />
          <Route 
            path="/patients/:patientId/add-record" 
            element={
              <DoctorRoute>
                <LazyComponent component={AddPatientRecord} />
              </DoctorRoute>
            } 
          />
          
          {/* Doctor list and appointment routes */}
          <Route 
            path="/doctors" 
            element={
              <ProtectedRoute>
                <LazyComponent component={DoctorsList} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/doctors/:id" 
            element={
              <ProtectedRoute>
                <LazyComponent component={DoctorProfile} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/book-appointment/:id" 
            element={
              <PatientRoute>
                <LazyComponent component={BookAppointment} />
              </PatientRoute>
            } 
          />
          <Route 
            path="/appointments" 
            element={
              <ProtectedRoute>
                <LazyComponent component={MyAppointments} />
              </ProtectedRoute>
            } 
          />
          
          {/* Admin-only Routes */}
          <Route 
            path="/admin/dashboard" 
            element={
              <AdminRoute>
                <LazyComponent component={AdminDashboard} />
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/users" 
            element={
              <AdminRoute>
                <LazyComponent component={AdminUsers} />
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/users/:id" 
            element={
              <AdminRoute>
                <LazyComponent component={AdminUserDetails} />
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/profile" 
            element={
              <AdminRoute>
                <LazyComponent component={AdminProfile} />
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/change-password" 
            element={
              <AdminRoute>
                <LazyComponent component={AdminProfile} />
              </AdminRoute>
            } 
          />
          
          <Route path="*" element={<LazyComponent component={NotFound} />} />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <ErrorBoundary>
          <AppContent />
        </ErrorBoundary>
      </AuthProvider>
    </Router>
  );
}

export default App;