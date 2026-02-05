const { promisePool } = require('../config/database');

/**
 * Get discussions for a module
 */
const getDiscussions = async (req, res) => {
  try {
    const { module_id } = req.params;
    const { is_qa } = req.query;

    let query = `
      SELECT d.discussion_id, d.title, d.content, d.is_qa, d.is_resolved, d.created_at,
             u.full_name as author_name, u.role as author_role,
             COUNT(dr.reply_id) as reply_count
      FROM discussions d
      JOIN users u ON d.user_id = u.user_id
      LEFT JOIN discussion_replies dr ON d.discussion_id = dr.discussion_id
      WHERE d.module_id = ?
    `;

    const params = [module_id];

    if (is_qa !== undefined) {
      query += ' AND d.is_qa = ?';
      params.push(is_qa === 'true' ? 1 : 0);
    }

    query += ' GROUP BY d.discussion_id ORDER BY d.created_at DESC';

    const [discussions] = await promisePool.query(query, params);

    res.json({
      success: true,
      data: discussions
    });
  } catch (error) {
    console.error('Get discussions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve discussions',
      error: error.message
    });
  }
};

/**
 * Create new discussion
 */
const createDiscussion = async (req, res) => {
  try {
    const { module_id, title, content, is_qa } = req.body;
    const user_id = req.user.user_id;

    const [result] = await promisePool.query(
      'INSERT INTO discussions (module_id, user_id, title, content, is_qa) VALUES (?, ?, ?, ?, ?)',
      [module_id, user_id, title, content, is_qa || false]
    );

    res.status(201).json({
      success: true,
      message: 'Discussion created successfully',
      data: {
        discussion_id: result.insertId
      }
    });
  } catch (error) {
    console.error('Create discussion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create discussion',
      error: error.message
    });
  }
};

/**
 * Get discussion replies
 */
const getDiscussionReplies = async (req, res) => {
  try {
    const { discussion_id } = req.params;

    const [replies] = await promisePool.query(
      `SELECT dr.reply_id, dr.content, dr.is_instructor_reply, dr.created_at,
              u.full_name as author_name, u.role as author_role
       FROM discussion_replies dr
       JOIN users u ON dr.user_id = u.user_id
       WHERE dr.discussion_id = ?
       ORDER BY dr.created_at ASC`,
      [discussion_id]
    );

    res.json({
      success: true,
      data: replies
    });
  } catch (error) {
    console.error('Get discussion replies error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve replies',
      error: error.message
    });
  }
};

/**
 * Create discussion reply
 */
const createReply = async (req, res) => {
  try {
    const { discussion_id } = req.params;
    const { content } = req.body;
    const user_id = req.user.user_id;

    // Check if user is instructor or admin
    const is_instructor_reply = ['instructor', 'admin'].includes(req.user.role);

    const [result] = await promisePool.query(
      'INSERT INTO discussion_replies (discussion_id, user_id, content, is_instructor_reply) VALUES (?, ?, ?, ?)',
      [discussion_id, user_id, content, is_instructor_reply]
    );

    res.status(201).json({
      success: true,
      message: 'Reply added successfully',
      data: {
        reply_id: result.insertId
      }
    });
  } catch (error) {
    console.error('Create reply error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create reply',
      error: error.message
    });
  }
};

/**
 * Mark discussion as resolved (Q&A only, instructors/admins only)
 */
const markAsResolved = async (req, res) => {
  try {
    const { discussion_id } = req.params;

    // Only instructors and admins can mark as resolved
    if (!['instructor', 'admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Only instructors can mark discussions as resolved'
      });
    }

    await promisePool.query(
      'UPDATE discussions SET is_resolved = TRUE WHERE discussion_id = ?',
      [discussion_id]
    );

    res.json({
      success: true,
      message: 'Discussion marked as resolved'
    });
  } catch (error) {
    console.error('Mark as resolved error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark discussion as resolved',
      error: error.message
    });
  }
};

module.exports = {
  getDiscussions,
  createDiscussion,
  getDiscussionReplies,
  createReply,
  markAsResolved
};
