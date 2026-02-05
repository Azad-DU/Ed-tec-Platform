const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { verifyToken, isStudent } = require('../middleware/auth');

// Public routes
router.get('/courses', courseController.getAllCourses);
router.get('/courses/:course_id', courseController.getCourseById);

// Protected routes (require authentication)
router.get('/my-courses', verifyToken, isStudent, courseController.getEnrolledCourses);
router.get('/lessons/:lesson_id', verifyToken, courseController.getLessonContent);
router.post('/progress', verifyToken, courseController.updateProgress);

module.exports = router;
