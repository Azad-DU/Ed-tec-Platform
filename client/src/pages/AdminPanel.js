import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { adminAPI } from '../services/apiService';
import './AdminPanel.css';

const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a'];

const AdminPanel = () => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('overview'); // overview, courses, analytics

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [analyticsRes, coursesRes] = await Promise.all([
        adminAPI.getAnalytics(),
        adminAPI.getCourses(),
      ]);

      if (analyticsRes.data.success) {
        setAnalytics(analyticsRes.data.data);
      }

      if (coursesRes.data.success) {
        setCourses(coursesRes.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePublishToggle = async (courseId, currentStatus) => {
    try {
      await adminAPI.updateCourse(courseId, { is_published: !currentStatus });
      fetchDashboardData();
    } catch (error) {
      console.error('Failed to toggle publish status:', error);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await adminAPI.deleteCourse(courseId);
        fetchDashboardData();
      } catch (error) {
        console.error('Failed to delete course:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  // Mock data for demonstration if API doesn't return full analytics
  const enrollmentTrend = analytics?.enrollmentTrend || [
    { month: 'Jan', enrollments: 45 },
    { month: 'Feb', enrollments: 52 },
    { month: 'Mar', enrollments: 61 },
    { month: 'Apr', enrollments: 78 },
    { month: 'May', enrollments: 95 },
    { month: 'Jun', enrollments: 112 },
  ];

  const revenueByCourse = courses.slice(0, 5).map((course) => ({
    name: course.title.substring(0, 20),
    revenue: parseFloat(course.price) * (course.enrollment_count || 0),
  }));

  const progressDistribution = analytics?.progressDistribution || [
    { name: '0-25%', value: 15 },
    { name: '26-50%', value: 25 },
    { name: '51-75%', value: 35 },
    { name: '76-100%', value: 25 },
  ];

  const activeUsersData = analytics?.activeUsers || [
    { day: 'Mon', users: 45 },
    { day: 'Tue', users: 52 },
    { day: 'Wed', users: 48 },
    { day: 'Thu', users: 61 },
    { day: 'Fri', users: 55 },
    { day: 'Sat', users: 42 },
    { day: 'Sun', users: 38 },
  ];

  return (
    <div className="admin-panel-container">
      {/* Header */}
      <div className="admin-header">
        <h1>📊 Admin Dashboard</h1>
        <div className="admin-actions">
          <button className="btn-create-course">
            <Link to="/admin/create-course" style={{ color: 'white', textDecoration: 'none' }}>
              + Create Course
            </Link>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="admin-tabs">
        <button
          className={`tab-btn ${activeView === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveView('overview')}
        >
          Overview
        </button>
        <button
          className={`tab-btn ${activeView === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveView('analytics')}
        >
          Analytics
        </button>
        <button
          className={`tab-btn ${activeView === 'courses' ? 'active' : ''}`}
          onClick={() => setActiveView('courses')}
        >
          Manage Courses
        </button>
      </div>

      {/* Overview Tab */}
      {activeView === 'overview' && (
        <div className="overview-content">
          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#E8F5E9' }}>
                👥
              </div>
              <div className="stat-details">
                <div className="stat-value">{analytics?.totalStudents || 0}</div>
                <div className="stat-label">Total Students</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#FFF3E0' }}>
                💰
              </div>
              <div className="stat-details">
                <div className="stat-value">৳{(analytics?.totalRevenue || 0).toLocaleString()}</div>
                <div className="stat-label">Total Revenue</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#E3F2FD' }}>
                📚
              </div>
              <div className="stat-details">
                <div className="stat-value">{courses.length}</div>
                <div className="stat-label">Total Courses</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#FCE4EC' }}>
                🎯
              </div>
              <div className="stat-details">
                <div className="stat-value">{analytics?.avgCompletionRate || 0}%</div>
                <div className="stat-label">Avg Completion</div>
              </div>
            </div>
          </div>

          {/* Quick Course List */}
          <div className="quick-courses">
            <h2>Your Courses</h2>
            <div className="courses-quick-grid">
              {courses.slice(0, 6).map((course) => (
                <div
                  key={course.course_id}
                  className="course-quick-card clickable-card"
                  onClick={() => setActiveView('courses')}
                  title="Go to Manage Courses"
                >
                  <div className="course-quick-header">
                    <h3>{course.title}</h3>
                    <span className={`status-badge ${course.is_published ? 'published' : 'draft'}`}>
                      {course.is_published ? '✓ Published' : '📝 Draft'}
                    </span>
                  </div>
                  <div className="course-quick-stats">
                    <span>👥 {course.enrollment_count || 0} students</span>
                    <span>৳{parseFloat(course.price).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeView === 'analytics' && (
        <div className="analytics-content">
          <div className="charts-grid">
            {/* Enrollment Trend */}
            <div className="chart-card">
              <h3>Enrollment Trend (Last 6 Months)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={enrollmentTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="enrollments" stroke="#667eea" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Revenue by Course */}
            <div className="chart-card">
              <h3>Revenue by Course (Top 5)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueByCourse}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenue" fill="#764ba2" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Progress Distribution */}
            <div className="chart-card">
              <h3>Student Progress Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={progressDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {progressDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Active Users */}
            <div className="chart-card">
              <h3>Active Users (Last 7 Days)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={activeUsersData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="users" stroke="#4facfe" fill="#4facfe" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Courses Tab */}
      {activeView === 'courses' && (
        <div className="courses-content">
          <div className="courses-table-container">
            <table className="courses-table">
              <thead>
                <tr>
                  <th>Course Title</th>
                  <th>Students</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course.course_id}>
                    <td className="course-title-cell">
                      <div className="course-title-content">
                        <strong>{course.title}</strong>
                        <span className="course-difficulty">{course.difficulty_level}</span>
                      </div>
                    </td>
                    <td>{course.enrollment_count || 0}</td>
                    <td>৳{parseFloat(course.price).toLocaleString()}</td>
                    <td>
                      <span className={`status-badge ${course.is_published ? 'published' : 'draft'}`}>
                        {course.is_published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <button
                        className="btn-action btn-edit"
                        onClick={() => navigate(`/admin/edit-course/${course.course_id}`)}
                        title="Edit Details"
                      >
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        className="btn-action btn-content"
                        onClick={() => navigate(`/admin/course-content/${course.course_id}`)}
                        title="Manage Content"
                      >
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="2" y="6" width="20" height="14" rx="2" />
                          <path d="M2 4h20" />
                          <path d="M4 2h16" />
                          <polygon points="10,10 10,16 15,13" fill="currentColor" stroke="none" />
                        </svg>
                      </button>
                      <button
                        className="btn-action btn-toggle"
                        onClick={() => handlePublishToggle(course.course_id, course.is_published)}
                        title={course.is_published ? 'Unpublish' : 'Publish'}
                      >
                        {course.is_published ? '👁️' : '👁️‍🗨️'}
                      </button>
                      <button
                        className="btn-action btn-delete"
                        onClick={() => handleDeleteCourse(course.course_id)}
                      >
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                          <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
