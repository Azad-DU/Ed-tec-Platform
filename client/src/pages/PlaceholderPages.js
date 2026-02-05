// Placeholder pages - to be implemented

import React from 'react';
import './CourseCatalog.css';

export const CourseCatalog = () => (
  <div className="page-container">
    <h1>Course Catalog</h1>
    <p>Browse all available courses. (To be implemented)</p>
  </div>
);

export const CourseView = () => (
  <div className="page-container">
    <h1>Course Content</h1>
    <p>Video player, lessons, quizzes. (To be implemented)</p>
  </div>
);

export const AdminPanel = () => (
  <div className="page-container">
    <h1>Admin Panel</h1>
    <p>Course management, analytics. (To be implemented)</p>
  </div>
);

export const PaymentSuccess = () => (
  <div className="page-container success">
    <div className="status-icon">✅</div>
    <h1>Payment Successful!</h1>
    <p>Your enrollment has been activated.</p>
    <a href="/dashboard" className="btn-primary">Go to Dashboard</a>
  </div>
);

export const PaymentFail = () => (
  <div className="page-container error">
    <div className="status-icon">❌</div>
    <h1>Payment Failed</h1>
    <p>Please try again or contact support.</p>
    <a href="/courses" className="btn-primary">Back to Courses</a>
  </div>
);
