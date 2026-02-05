const { promisePool } = require('../config/database');

/**
 * Track xAPI statement (learning activity)
 */
const trackActivity = async (req, res) => {
  try {
    const { verb, object_type, object_id, result, context } = req.body;
    const student_id = req.user.user_id;

    // Insert xAPI statement
    await promisePool.query(
      'INSERT INTO xapi_statements (student_id, verb, object_type, object_id, result, context) VALUES (?, ?, ?, ?, ?, ?)',
      [student_id, verb, object_type, object_id, JSON.stringify(result || {}), JSON.stringify(context || {})]
    );

    res.json({
      success: true,
      message: 'Activity tracked successfully'
    });
  } catch (error) {
    console.error('Track activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track activity',
      error: error.message
    });
  }
};

/**
 * Get student activity history
 */
const getActivityHistory = async (req, res) => {
  try {
    const student_id = req.user.user_id;
    const { limit = 50, offset = 0 } = req.query;

    const [activities] = await promisePool.query(
      `SELECT statement_id, verb, object_type, object_id, result, context, timestamp
       FROM xapi_statements
       WHERE student_id = ?
       ORDER BY timestamp DESC
       LIMIT ? OFFSET ?`,
      [student_id, parseInt(limit), parseInt(offset)]
    );

    // Parse JSON fields
    const parsedActivities = activities.map(activity => ({
      ...activity,
      result: JSON.parse(activity.result),
      context: JSON.parse(activity.context)
    }));

    res.json({
      success: true,
      data: parsedActivities
    });
  } catch (error) {
    console.error('Get activity history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve activity history',
      error: error.message
    });
  }
};

/**
 * Get analytics for a specific course (for instructors/admins)
 */
const getCourseAnalytics = async (req, res) => {
  try {
    const { course_id } = req.params;

    // Verify instructor owns the course or is admin
    if (req.user.role !== 'admin') {
      const [courses] = await promisePool.query(
        'SELECT instructor_id FROM courses WHERE course_id = ?',
        [course_id]
      );

      if (courses.length === 0 || courses[0].instructor_id !== req.user.user_id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }

    // Get enrollment statistics
    const [enrollmentStats] = await promisePool.query(
      `SELECT 
         COUNT(*) as total_enrollments,
         SUM(CASE WHEN enrollment_status = 'active' THEN 1 ELSE 0 END) as active_enrollments,
         SUM(CASE WHEN enrollment_status = 'completed' THEN 1 ELSE 0 END) as completed_enrollments,
         AVG(progress_percentage) as average_progress
       FROM enrollments
       WHERE course_id = ?`,
      [course_id]
    );

    // Get engagement rate (students who accessed course in last 7 days)
    const [engagementData] = await promisePool.query(
      `SELECT COUNT(*) as active_last_7_days
       FROM enrollments
       WHERE course_id = ? 
         AND enrollment_status = 'active'
         AND last_accessed >= DATE_SUB(NOW(), INTERVAL 7 DAY)`,
      [course_id]
    );

    // Get completion rate by module
    const [moduleCompletion] = await promisePool.query(
      `SELECT 
         m.module_id,
         m.title,
         COUNT(DISTINCT l.lesson_id) as total_lessons,
         COUNT(DISTINCT CASE WHEN lp.is_completed = TRUE THEN lp.lesson_id END) as completed_lessons
       FROM modules m
       LEFT JOIN lessons l ON m.module_id = l.module_id
       LEFT JOIN learning_progress lp ON l.lesson_id = lp.lesson_id
       WHERE m.course_id = ?
       GROUP BY m.module_id, m.title
       ORDER BY m.order_index`,
      [course_id]
    );

    res.json({
      success: true,
      data: {
        enrollments: enrollmentStats[0],
        engagement: engagementData[0],
        modules: moduleCompletion
      }
    });
  } catch (error) {
    console.error('Get course analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve analytics',
      error: error.message
    });
  }
};

module.exports = {
  trackActivity,
  getActivityHistory,
  getCourseAnalytics
};
