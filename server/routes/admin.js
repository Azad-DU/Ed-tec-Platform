const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, isInstructor } = require('../middleware/auth');

// All routes require instructor or admin role
router.get('/analytics', verifyToken, isInstructor, adminController.getAnalytics);
router.get('/courses', verifyToken, isInstructor, adminController.getCourses);
router.post('/courses', verifyToken, isInstructor, adminController.createCourse);
router.put('/courses/:course_id', verifyToken, isInstructor, adminController.updateCourse);
router.delete('/courses/:course_id', verifyToken, isInstructor, adminController.deleteCourse);
router.post('/modules', verifyToken, isInstructor, adminController.createModule);
router.put('/modules/:module_id', verifyToken, isInstructor, adminController.updateModule);
router.post('/lessons', verifyToken, isInstructor, adminController.upload.single('file'), adminController.createLesson);
router.put('/lessons/:lesson_id', verifyToken, isInstructor, adminController.upload.single('file'), adminController.updateLesson);
router.get('/courses/:course_id/students', verifyToken, isInstructor, adminController.getEnrolledStudents);
router.post('/quizzes', verifyToken, isInstructor, adminController.createQuiz);
router.post('/quizzes/questions', verifyToken, isInstructor, adminController.addQuizQuestion);
router.post('/upload', verifyToken, isInstructor, adminController.upload.single('file'), adminController.uploadFile);

module.exports = router;
