import axios from 'axios';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Course APIs
export const courseAPI = {
  getAllCourses: () => apiClient.get('/courses'),
  getCourseById: (courseId) => apiClient.get(`/courses/${courseId}`),
  getEnrolledCourses: () => apiClient.get('/my-courses'),
  enrollInCourse: (courseId) => apiClient.post(`/courses/${courseId}/enroll`),
};

// Lesson APIs
export const lessonAPI = {
  getLessonContent: (lessonId) => apiClient.get(`/lessons/${lessonId}`),
  updateProgress: (data) => apiClient.post('/progress', data),
};

// Quiz APIs
export const quizAPI = {
  getQuizById: (quizId) => apiClient.get(`/quizzes/${quizId}`),
  submitQuiz: (quizId, answers) => apiClient.post(`/quizzes/${quizId}/submit`, { answers }),
  getQuizAttempts: (quizId) => apiClient.get(`/quizzes/${quizId}/attempts`),
};

// Discussion APIs
export const discussionAPI = {
  getDiscussions: (moduleId) => apiClient.get(`/discussions/modules/${moduleId}`),
  getDiscussionById: (discussionId) => apiClient.get(`/discussions/${discussionId}`),
  createDiscussion: (data) => apiClient.post('/discussions', data),
  createReply: (discussionId, content) => apiClient.post(`/discussions/${discussionId}/replies`, { content }),
  markAsResolved: (discussionId) => apiClient.put(`/discussions/${discussionId}/resolve`),
};

// Admin APIs
export const adminAPI = {
  getAnalytics: () => apiClient.get('/admin/analytics'),
  getCourses: () => apiClient.get('/admin/courses'),
  createCourse: (data) => apiClient.post('/admin/courses', data),
  updateCourse: (courseId, data) => apiClient.put(`/admin/courses/${courseId}`, data),
  deleteCourse: (courseId) => apiClient.delete(`/admin/courses/${courseId}`),
  uploadFile: (formData) => {
    return apiClient.post('/admin/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  createLesson: (data) => apiClient.post('/admin/lessons', data),
  updateLesson: (lessonId, data) => apiClient.put(`/admin/lessons/${lessonId}`, data),
  createModule: (data) => apiClient.post('/admin/modules', data),
  updateModule: (moduleId, data) => apiClient.put(`/admin/modules/${moduleId}`, data),
  getCourseContent: (courseId) => apiClient.get(`/courses/${courseId}`),
  createQuiz: (data) => apiClient.post('/admin/quizzes', data),
};

// Review APIs
export const reviewAPI = {
  getCourseReviews: (courseId) => apiClient.get(`/reviews/courses/${courseId}`),
  getAllReviews: () => apiClient.get('/reviews/all'),
  getUserReview: (courseId) => apiClient.get(`/reviews/courses/${courseId}/mine`),
  createReview: (courseId, data) => apiClient.post(`/reviews/courses/${courseId}`, data),
  updateReview: (reviewId, data) => apiClient.put(`/reviews/${reviewId}`, data),
  deleteReview: (reviewId) => apiClient.delete(`/reviews/${reviewId}`),
};

export default apiClient;
