const express = require('express');
const router = express.Router();
const assessmentController = require('../controllers/assessmentController');
const { verifyToken } = require('../middleware/auth');

// Protected routes
router.get('/quizzes/:quiz_id', verifyToken, assessmentController.getQuiz);
router.post('/quizzes/:quiz_id/submit', verifyToken, assessmentController.submitQuiz);
router.get('/quizzes/:quiz_id/attempts', verifyToken, assessmentController.getQuizAttempts);

module.exports = router;
