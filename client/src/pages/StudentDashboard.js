import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './StudentDashboard.css';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEnrolledCourses();
  }, []);

  const fetchEnrolledCourses = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/my-courses`);
      if (response.data.success) {
        setEnrolledCourses(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch enrolled courses:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading-container"><div className="spinner"></div></div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome back, {user?.full_name}!</h1>
        <p className="subtitle">Continue your learning journey</p>
      </div>

      {enrolledCourses.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📚</div>
          <h2>No enrolled courses yet</h2>
          <p>Browse our course catalog to start learning</p>
          <Link to="/courses" className="btn-primary">Browse Courses</Link>
        </div>
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📖</div>
              <div className="stat-content">
                <div className="stat-value">{enrolledCourses.length}</div>
                <div className="stat-label">Enrolled Courses</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <div className="stat-value">
                  {enrolledCourses.filter(c => c.enrollment_status === 'completed').length}
                </div>
                <div className="stat-label">Completed</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🎯</div>
              <div className="stat-content">
                <div className="stat-value">
                  {Math.round(enrolledCourses.reduce((sum, c) => sum + parseFloat(c.progress_percentage), 0) / enrolledCourses.length)}%
                </div>
                <div className="stat-label">Avg Progress</div>
              </div>
            </div>
          </div>

          <section className="courses-section">
            <h2>Your Courses</h2>
            <div className="courses-grid">
              {enrolledCourses.map((course) => (
                <div key={course.enrollment_id} className="course-card">
                  {course.thumbnail_url && (
                    <div className="course-image">
                      <img src={course.thumbnail_url} alt={course.title} />
                    </div>
                  )}
                  <div className="course-content">
                    <h3>{course.title}</h3>
                    <p className="course-instructor">by {course.instructor_name}</p>

                    <div className="progress-section">
                      <div className="progress-header">
                        <span>Progress</span>
                        <span className="progress-percentage">{parseFloat(course.progress_percentage).toFixed(0)}%</span>
                      </div>
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: `${course.progress_percentage}%` }}
                        ></div>
                      </div>
                    </div>

                    <Link
                      to={`/course/${course.course_id}`}
                      className="btn-continue"
                    >
                      {course.progress_percentage > 0 ? 'Resume Course' : 'Start Course'}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default StudentDashboard;
