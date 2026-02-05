const express = require('express');
const router = express.Router();
const xapiController = require('../controllers/xapiController');
const { verifyToken, isInstructor } = require('../middleware/auth');

// Protected routes
router.post('/track', verifyToken, xapiController.trackActivity);
router.post('/statement', verifyToken, xapiController.trackActivity); // Alias for frontend compatibility
router.get('/history', verifyToken, xapiController.getActivityHistory);
router.get('/analytics/:course_id', verifyToken, isInstructor, xapiController.getCourseAnalytics);

module.exports = router;
