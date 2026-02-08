const express = require('express');
const router = express.Router();
const discussionController = require('../controllers/discussionController');
const { verifyToken, isInstructor } = require('../middleware/auth');

// Protected routes
router.get('/modules/:module_id', verifyToken, discussionController.getDiscussions);
router.get('/:discussion_id', verifyToken, discussionController.getDiscussionById); // ADDED
router.post('/', verifyToken, discussionController.createDiscussion);
router.get('/:discussion_id/replies', verifyToken, discussionController.getDiscussionReplies);
router.post('/:discussion_id/replies', verifyToken, discussionController.createReply);
router.put('/:discussion_id/resolve', verifyToken, isInstructor, discussionController.markAsResolved);

module.exports = router;
