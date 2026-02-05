const jwt = require('jsonwebtoken');
require('dotenv').config();

// Verify JWT token middleware
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1] || req.headers['x-access-token'];

  if (!token) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. No token provided.'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token.'
    });
  }
};

// Role-based access control middleware
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }

    next();
  };
};

// Check if user is student
const isStudent = requireRole('student');

// Check if user is instructor
const isInstructor = requireRole('instructor', 'admin');

// Check if user is admin
const isAdmin = requireRole('admin');

// Check if user is student or instructor
const isStudentOrInstructor = requireRole('student', 'instructor', 'admin');

module.exports = {
  verifyToken,
  requireRole,
  isStudent,
  isInstructor,
  isAdmin,
  isStudentOrInstructor
};
