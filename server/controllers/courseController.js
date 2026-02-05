const { promisePool } = require('../config/database');

/**
 * Get all published courses
 */
const getAllCourses = async (req, res) => {
  try {
    const [courses] = await promisePool.query(
      `SELECT c.course_id, c.title, c.description, c.price, c.currency, c.thumbnail_url,
              c.difficulty_level, c.duration_hours, c.created_at,
              c.mentor_name, c.mentor_image, c.is_free,
              u.full_name as instructor_name,
              COUNT(DISTINCT e.enrollment_id) as total_enrollments
       FROM courses c
       LEFT JOIN users u ON c.instructor_id = u.user_id
       LEFT JOIN enrollments e ON c.course_id = e.course_id AND e.enrollment_status = 'active'
       WHERE c.is_published = TRUE
       GROUP BY c.course_id
       ORDER BY c.created_at DESC`
    );

    // Log the raw result to debug
    console.log('[DEBUG] getAllCourses first result:', courses[0]);

    res.json({
      success: true,
      data: courses
    });
  } catch (error) {
    console.error('Get all courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve courses',
      error: error.message
    });
  }
};

/**
 * Get course by ID with modules and lessons
 */
const getCourseById = async (req, res) => {
  try {
    const { course_id } = req.params;

    // Get course details
    const [courses] = await promisePool.query(
      `SELECT c.*, u.full_name as instructor_name, u.email as instructor_email
       FROM courses c
       LEFT JOIN users u ON c.instructor_id = u.user_id
       WHERE c.course_id = ?`,
      [course_id]
    );

    if (courses.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    const course = courses[0];

    // Get modules with lessons
    const [modules] = await promisePool.query(
      `SELECT m.module_id, m.title, m.description, m.order_index
       FROM modules m
       WHERE m.course_id = ?
       ORDER BY m.order_index ASC`,
      [course_id]
    );

    // Get lessons for each module
    for (let module of modules) {
      const [lessons] = await promisePool.query(
        `SELECT lesson_id, title, content_type, duration_minutes, order_index, is_free, content_url, content_text
         FROM lessons
         WHERE module_id = ?
         ORDER BY order_index ASC`,
        [module.module_id]
      );
      module.lessons = lessons;
    }

    course.modules = modules;

    res.json({
      success: true,
      data: course
    });
  } catch (error) {
    console.error('Get course by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve course',
      error: error.message
    });
  }
};

/**
 * Get student's enrolled courses
 */
const getEnrolledCourses = async (req, res) => {
  try {
    const student_id = req.user.user_id;

    const [enrollments] = await promisePool.query(
      `SELECT e.enrollment_id, e.enrollment_status, e.progress_percentage, 
              e.enrollment_date, e.last_accessed,
              c.course_id, c.title, c.description, c.thumbnail_url, c.duration_hours,
              u.full_name as instructor_name
       FROM enrollments e
       JOIN courses c ON e.course_id = c.course_id
       LEFT JOIN users u ON c.instructor_id = u.user_id
       WHERE e.student_id = ? AND e.enrollment_status IN ('active', 'completed')
       ORDER BY e.last_accessed DESC`,
      [student_id]
    );

    res.json({
      success: true,
      data: enrollments
    });
  } catch (error) {
    console.error('Get enrolled courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve enrolled courses',
      error: error.message
    });
  }
};

/**
 * Get lesson content (requires enrollment or free lesson)
 */
const getLessonContent = async (req, res) => {
  try {
    const { lesson_id } = req.params;
    const student_id = req.user.user_id;

    // Get lesson details
    const [lessons] = await promisePool.query(
      `SELECT l.*, m.course_id
       FROM lessons l
       JOIN modules m ON l.module_id = m.module_id
       WHERE l.lesson_id = ?`,
      [lesson_id]
    );

    if (lessons.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }

    const lesson = lessons[0];
    const course_id = lesson.course_id;

    // Check if lesson is free or user is enrolled
    if (!lesson.is_free) {
      // Allow access if user is the course instructor or an admin
      const [course] = await promisePool.query(
        'SELECT instructor_id FROM courses WHERE course_id = ?',
        [course_id]
      );

      const isInstructor = course[0] && course[0].instructor_id === student_id;
      const isAdmin = req.user.role === 'admin';

      if (!isInstructor && !isAdmin) {
        const [enrollments] = await promisePool.query(
          'SELECT enrollment_id FROM enrollments WHERE student_id = ? AND course_id = ? AND enrollment_status = ?',
          [student_id, course_id, 'active']
        );

        if (enrollments.length === 0) {
          return res.status(403).json({
            success: false,
            message: 'Enrollment required to access this lesson'
          });
        }
      }
    }

    res.json({
      success: true,
      data: lesson
    });
  } catch (error) {
    console.error('Get lesson content error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve lesson content',
      error: error.message
    });
  }
};

/**
 * Update learning progress
 */
const updateProgress = async (req, res) => {
  try {
    const { lesson_id, progress_percentage, last_position_seconds, time_spent_seconds } = req.body;
    const student_id = req.user.user_id;

    // Get enrollment ID
    const [lessons] = await promisePool.query(
      `SELECT m.course_id FROM lessons l
       JOIN modules m ON l.module_id = m.module_id
       WHERE l.lesson_id = ?`,
      [lesson_id]
    );

    if (lessons.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }

    const course_id = lessons[0].course_id;

    const [enrollments] = await promisePool.query(
      'SELECT enrollment_id FROM enrollments WHERE student_id = ? AND course_id = ?',
      [student_id, course_id]
    );

    if (enrollments.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Not enrolled in this course'
      });
    }

    const enrollment_id = enrollments[0].enrollment_id;
    const is_completed = progress_percentage >= 100;

    // Upsert progress
    await promisePool.query(
      `INSERT INTO learning_progress (student_id, lesson_id, enrollment_id, progress_percentage, last_position_seconds, time_spent_seconds, is_completed, completed_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ${is_completed ? 'CURRENT_TIMESTAMP' : 'NULL'})
       ON DUPLICATE KEY UPDATE 
         progress_percentage = VALUES(progress_percentage),
         last_position_seconds = VALUES(last_position_seconds),
         time_spent_seconds = time_spent_seconds + VALUES(time_spent_seconds),
         is_completed = VALUES(is_completed),
         completed_at = ${is_completed ? 'CURRENT_TIMESTAMP' : 'completed_at'}`,
      [student_id, lesson_id, enrollment_id, progress_percentage, last_position_seconds || 0, time_spent_seconds || 0, is_completed]
    );

    // Update last accessed time for enrollment
    await promisePool.query(
      'UPDATE enrollments SET last_accessed = CURRENT_TIMESTAMP WHERE enrollment_id = ?',
      [enrollment_id]
    );

    // Calculate overall course progress
    const [progressData] = await promisePool.query(
      `SELECT 
         COUNT(*) as total_lessons,
         SUM(CASE WHEN lp.is_completed = TRUE THEN 1 ELSE 0 END) as completed_lessons
       FROM lessons l
       JOIN modules m ON l.module_id = m.module_id
       LEFT JOIN learning_progress lp ON l.lesson_id = lp.lesson_id AND lp.student_id = ?
       WHERE m.course_id = ?`,
      [student_id, course_id]
    );

    const overall_progress = (progressData[0].completed_lessons / progressData[0].total_lessons) * 100;

    await promisePool.query(
      'UPDATE enrollments SET progress_percentage = ? WHERE enrollment_id = ?',
      [overall_progress, enrollment_id]
    );

    res.json({
      success: true,
      message: 'Progress updated successfully',
      data: {
        lesson_progress: progress_percentage,
        overall_progress: overall_progress.toFixed(2)
      }
    });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update progress',
      error: error.message
    });
  }
};

module.exports = {
  getAllCourses,
  getCourseById,
  getEnrolledCourses,
  getLessonContent,
  updateProgress
};
