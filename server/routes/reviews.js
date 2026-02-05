const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { verifyToken } = require('../middleware/auth');

// Public route - Get recent reviews (for landing page)
router.get('/all', reviewController.getAllReviews);

// Public route - Get reviews for a course
router.get('/courses/:courseId', reviewController.getCourseReviews);

// Protected routes
router.get('/courses/:courseId/mine', verifyToken, reviewController.getUserReview);
router.post('/courses/:courseId', verifyToken, reviewController.createReview);
router.put('/:reviewId', verifyToken, reviewController.updateReview);
router.delete('/:reviewId', verifyToken, reviewController.deleteReview);

module.exports = router;
