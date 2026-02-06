const { promisePool } = require('../config/database');

/**
 * Get all reviews for a course with average rating
 */
const getCourseReviews = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Get all reviews with user info
    const [reviews] = await promisePool.query(
      `SELECT r.review_id, r.rating, r.review_text, r.created_at, r.updated_at,
              u.user_id, u.full_name, u.role
       FROM reviews r
       JOIN users u ON r.user_id = u.user_id
       WHERE r.course_id = ?
       ORDER BY r.created_at DESC`,
      [courseId]
    );

    // Get average rating
    const [avgResult] = await promisePool.query(
      `SELECT AVG(rating) as avg_rating, COUNT(*) as total_reviews
       FROM reviews WHERE course_id = ?`,
      [courseId]
    );

    res.json({
      success: true,
      data: {
        reviews,
        avg_rating: avgResult[0].avg_rating ? parseFloat(avgResult[0].avg_rating).toFixed(1) : null,
        total_reviews: avgResult[0].total_reviews
      }
    });
  } catch (error) {
    console.error('Get course reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve reviews',
      error: error.message
    });
  }
};

/**
 * Create a new review for a course
 */
const createReview = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { rating, review_text } = req.body;
    const user_id = req.user.user_id;

    console.log(`[DEBUG] Creating review - User: ${user_id}, Course: ${courseId}, Rating: ${rating}`);

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Check if user is enrolled in the course (skip for admin)
    if (req.user.role !== 'admin') {
      const [enrollment] = await promisePool.query(
        "SELECT * FROM enrollments WHERE user_id = ? AND course_id = ? AND enrollment_status IN ('active', 'completed')",
        [user_id, courseId]
      );

      console.log(`[DEBUG] Enrollment check result:`, enrollment);

      if (enrollment.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'You must be enrolled in this course to leave a review'
        });
      }
    }

    // Check if user already has a review for this course
    const [existingReview] = await promisePool.query(
      'SELECT * FROM reviews WHERE user_id = ? AND course_id = ?',
      [user_id, courseId]
    );

    if (existingReview.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this course. Please edit your existing review.'
      });
    }

    // Create the review
    const [result] = await promisePool.query(
      'INSERT INTO reviews (course_id, user_id, rating, review_text) VALUES (?, ?, ?, ?)',
      [courseId, user_id, rating, review_text || null]
    );

    console.log(`[DEBUG] Review created successfully. ID: ${result.insertId}`);

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: {
        review_id: result.insertId
      }
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      message: `Failed to create review: ${error.message}`,
      error: error.message
    });
  }
};

/**
 * Update an existing review
 */
const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, review_text } = req.body;
    const user_id = req.user.user_id;

    // Check if review exists and belongs to user
    const [review] = await promisePool.query(
      'SELECT * FROM reviews WHERE review_id = ?',
      [reviewId]
    );

    if (review.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Only owner or admin can update
    if (review[0].user_id !== user_id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own reviews'
      });
    }

    // Validate rating
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    await promisePool.query(
      'UPDATE reviews SET rating = ?, review_text = ?, updated_at = CURRENT_TIMESTAMP WHERE review_id = ?',
      [rating || review[0].rating, review_text !== undefined ? review_text : review[0].review_text, reviewId]
    );

    res.json({
      success: true,
      message: 'Review updated successfully'
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update review',
      error: error.message
    });
  }
};

/**
 * Delete a review
 */
const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const user_id = req.user.user_id;

    // Check if review exists
    const [review] = await promisePool.query(
      'SELECT * FROM reviews WHERE review_id = ?',
      [reviewId]
    );

    if (review.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Only owner or admin can delete
    if (review[0].user_id !== user_id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own reviews'
      });
    }

    await promisePool.query('DELETE FROM reviews WHERE review_id = ?', [reviewId]);

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete review',
      error: error.message
    });
  }
};

/**
 * Get user's review for a specific course
 */
const getUserReview = async (req, res) => {
  try {
    const { courseId } = req.params;
    const user_id = req.user.user_id;

    const [review] = await promisePool.query(
      'SELECT * FROM reviews WHERE user_id = ? AND course_id = ?',
      [user_id, courseId]
    );

    res.json({
      success: true,
      data: review[0] || null
    });
  } catch (error) {
    console.error('Get user review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user review',
      error: error.message
    });
  }
};

/**
 * Get recent reviews from all courses
 */
const getAllReviews = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    // Get recent high-rated reviews (4 or 5 stars)
    const [reviews] = await promisePool.query(
      `SELECT r.review_id, r.rating, r.review_text, r.created_at,
              u.full_name, u.role, u.avatar_url as profile_picture_url,
              c.title as course_title, c.course_id
       FROM reviews r
       JOIN users u ON r.user_id = u.user_id
       JOIN courses c ON r.course_id = c.course_id
       WHERE r.rating >= 4
       ORDER BY r.created_at DESC
       LIMIT ?`,
      [limit]
    );

    res.json({
      success: true,
      data: reviews
    });
  } catch (error) {
    console.error('Get all reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve reviews',
      error: error.message
    });
  }
};

module.exports = {
  getCourseReviews,
  createReview,
  updateReview,
  deleteReview,
  getUserReview,
  getAllReviews
};
