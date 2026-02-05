import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import CourseCatalog from './pages/CourseCatalog';
import CourseView from './pages/CourseView';
import AdminPanel from './pages/AdminPanel';
import CreateCourse from './pages/CreateCourse';
import EditCourse from './pages/EditCourse';
import CourseContentManager from './pages/CourseContentManager';
import LandingPage from './pages/LandingPage';
import { PaymentSuccess, PaymentFail } from './pages/PlaceholderPages';
import Navbar from './components/Navbar';
import './App.css';


// Protected Route wrapper
const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && user?.role !== requiredRole && user?.role !== 'admin') {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="App">
            <Navbar />
            <main className="main-content">
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/courses" element={<CourseCatalog />} />

                {/* Protected routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <StudentDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/course/:courseId"
                  element={
                    <ProtectedRoute>
                      <CourseView />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requiredRole="instructor">
                      <AdminPanel />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/create-course"
                  element={
                    <ProtectedRoute requiredRole="instructor">
                      <CreateCourse />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/edit-course/:courseId"
                  element={
                    <ProtectedRoute requiredRole="instructor">
                      <EditCourse />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/course-content/:courseId"
                  element={
                    <ProtectedRoute requiredRole="instructor">
                      <CourseContentManager />
                    </ProtectedRoute>
                  }
                />

                {/* Payment callback routes */}
                <Route path="/payment/success" element={<PaymentSuccess />} />
                <Route path="/payment/fail" element={<PaymentFail />} />
                <Route path="/payment/cancel" element={<PaymentFail />} />
              </Routes>
            </main>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
