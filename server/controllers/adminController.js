const multer = require('multer');
const path = require('path');
const { promisePool } = require('../config/database');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Save to server/uploads using absolute path relative to this controller file
    const uploadDir = path.join(__dirname, '../uploads');
    // Ensure directory exists
    const fs = require('fs');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 100 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|mp4|mov|avi|mkv|mp3|doc|docx|ppt|pptx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

/**
 * Create new course
 */
const createCourse = async (req, res) => {
  try {
    const { title, description, price, currency, difficulty_level, duration_hours, mentor_name, mentor_image, is_free, thumbnail_url } = req.body;
    const instructor_id = req.user.user_id;

    const [result] = await promisePool.query(
      'INSERT INTO courses (title, description, instructor_id, price, currency, difficulty_level, duration_hours, mentor_name, mentor_image, is_free, thumbnail_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        title,
        description,
        instructor_id,
        is_free ? 0 : (price || 0),
        currency || 'BDT',
        difficulty_level || 'beginner',
        duration_hours || 0,
        mentor_name || 'Admin',
        mentor_image || null,
        is_free !== false,
        thumbnail_url || null
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: {
        course_id: result.insertId
      }
    });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create course',
      error: error.message
    });
  }
};

/**
 * Update course
 */
const updateCourse = async (req, res) => {
  try {
    const { course_id } = req.params;
    const { title, description, price, currency, difficulty_level, duration_hours, is_published, mentor_name, mentor_image, is_free, thumbnail_url } = req.body;

    // Verify ownership
    const [courses] = await promisePool.query(
      'SELECT instructor_id FROM courses WHERE course_id = ?',
      [course_id]
    );

    if (courses.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (courses[0].instructor_id !== req.user.user_id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await promisePool.query(
      `UPDATE courses SET 
         title = COALESCE(?, title),
         description = COALESCE(?, description),
         price = COALESCE(?, price),
         currency = COALESCE(?, currency),
         difficulty_level = COALESCE(?, difficulty_level),
         duration_hours = COALESCE(?, duration_hours),
         is_published = COALESCE(?, is_published),
         mentor_name = COALESCE(?, mentor_name),
         mentor_image = COALESCE(?, mentor_image),
         is_free = COALESCE(?, is_free),
         thumbnail_url = COALESCE(?, thumbnail_url)
       WHERE course_id = ?`,
      [title, description, is_free ? 0 : price, currency, difficulty_level, duration_hours, is_published, mentor_name, mentor_image, is_free, thumbnail_url, course_id]
    );

    res.json({
      success: true,
      message: 'Course updated successfully'
    });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update course',
      error: error.message
    });
  }
};

/**
 * Create module
 */
const createModule = async (req, res) => {
  try {
    const { course_id, title, description, order_index } = req.body;

    const [result] = await promisePool.query(
      'INSERT INTO modules (course_id, title, description, order_index) VALUES (?, ?, ?, ?)',
      [course_id, title, description, order_index]
    );

    res.status(201).json({
      success: true,
      message: 'Module created successfully',
      data: {
        module_id: result.insertId
      }
    });
  } catch (error) {
    console.error('Create module error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create module',
      error: error.message
    });
  }
};

/**
 * Update module
 */
const updateModule = async (req, res) => {
  try {
    const { module_id } = req.params;
    const { title, description } = req.body;

    await promisePool.query(
      'UPDATE modules SET title = COALESCE(?, title), description = COALESCE(?, description) WHERE module_id = ?',
      [title, description, module_id]
    );

    res.json({
      success: true,
      message: 'Module updated successfully'
    });
  } catch (error) {
    console.error('Update module error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update module',
      error: error.message
    });
  }
};

/**
 * Create lesson
 */
const createLesson = async (req, res) => {
  try {
    const { module_id, title, content_type, content_text, duration_minutes, order_index, is_free, content_url: body_content_url } = req.body;
    const content_url = req.file ? `/uploads/${req.file.filename}` : body_content_url;

    const [result] = await promisePool.query(
      'INSERT INTO lessons (module_id, title, content_type, content_url, content_text, duration_minutes, order_index, is_free) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [module_id, title, content_type, content_url, content_text, duration_minutes, order_index, is_free || false]
    );

    res.status(201).json({
      success: true,
      message: 'Lesson created successfully',
      data: {
        lesson_id: result.insertId,
        content_url
      }
    });
  } catch (error) {
    console.error('Create lesson error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create lesson',
      error: error.message
    });
  }
};



/**
 * Update lesson
 */
const updateLesson = async (req, res) => {
  try {
    const { lesson_id } = req.params;
    const { title, content_type, content_text, duration_minutes, is_free, content_url: body_content_url } = req.body;
    const content_url = req.file ? `/uploads/${req.file.filename}` : body_content_url;

    // Build query dynamically based on provided fields
    let query = 'UPDATE lessons SET ';
    const params = [];

    if (title) { query += 'title = ?, '; params.push(title); }
    if (content_type) { query += 'content_type = ?, '; params.push(content_type); }
    if (content_text !== undefined) { query += 'content_text = ?, '; params.push(content_text); }
    if (duration_minutes) { query += 'duration_minutes = ?, '; params.push(duration_minutes); }
    if (is_free !== undefined) { query += 'is_free = ?, '; params.push(is_free); }
    if (content_url) { query += 'content_url = ?, '; params.push(content_url); }

    // Remove trailing comma and space
    query = query.slice(0, -2);
    query += ' WHERE lesson_id = ?';
    params.push(lesson_id);

    await promisePool.query(query, params);

    res.json({
      success: true,
      message: 'Lesson updated successfully',
      data: { content_url }
    });
  } catch (error) {
    console.error('Update lesson error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update lesson',
      error: error.message
    });
  }
};

/**
 * Get enrolled students for a course
 */
const getEnrolledStudents = async (req, res) => {
  try {
    const { course_id } = req.params;

    const [students] = await promisePool.query(
      `SELECT u.user_id, u.full_name, u.email, 
              e.enrollment_id, e.enrollment_status, e.progress_percentage, e.enrollment_date, e.last_accessed
       FROM enrollments e
       JOIN users u ON e.student_id = u.user_id
       WHERE e.course_id = ?
       ORDER BY e.enrollment_date DESC`,
      [course_id]
    );

    res.json({
      success: true,
      data: students
    });
  } catch (error) {
    console.error('Get enrolled students error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve enrolled students',
      error: error.message
    });
  }
};

/**
 * Create quiz
 */
const createQuiz = async (req, res) => {
  try {
    const { module_id, title, description, passing_score, time_limit_minutes, max_attempts } = req.body;

    const [result] = await promisePool.query(
      'INSERT INTO quizzes (module_id, title, description, passing_score, time_limit_minutes, max_attempts) VALUES (?, ?, ?, ?, ?, ?)',
      [module_id, title, description, passing_score || 70, time_limit_minutes || 30, max_attempts || 3]
    );

    res.status(201).json({
      success: true,
      message: 'Quiz created successfully',
      data: {
        quiz_id: result.insertId
      }
    });
  } catch (error) {
    console.error('Create quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create quiz',
      error: error.message
    });
  }
};

/**
 * Add quiz question
 */
const addQuizQuestion = async (req, res) => {
  try {
    const { quiz_id, question_text, question_type, options, correct_answer, explanation, points, order_index } = req.body;

    const [result] = await promisePool.query(
      'INSERT INTO quiz_questions (quiz_id, question_text, question_type, options, correct_answer, explanation, points, order_index) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [quiz_id, question_text, question_type, JSON.stringify(options), correct_answer, explanation, points || 1, order_index]
    );

    res.status(201).json({
      success: true,
      message: 'Question added successfully',
      data: {
        question_id: result.insertId
      }
    });
  } catch (error) {
    console.error('Add quiz question error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add question',
      error: error.message
    });
  }
};

/**
 * Get all courses (for admin) or instructor's courses (for instructor)
 */
const getCourses = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const user_role = req.user.role;

    let query = `SELECT c.*, u.full_name as instructor_name,
              (SELECT COUNT(*) FROM enrollments WHERE course_id = c.course_id) as enrollment_count
       FROM courses c
       LEFT JOIN users u ON c.instructor_id = u.user_id`;

    let params = [];

    // Admin sees all courses, instructors only see their own
    if (user_role !== 'admin') {
      query += ` WHERE c.instructor_id = ?`;
      params.push(user_id);
    }

    query += ` ORDER BY c.created_at DESC`;

    const [courses] = await promisePool.query(query, params);

    res.json({
      success: true,
      data: courses
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve courses',
      error: error.message
    });
  }
};

/**
 * Delete course
 */
const deleteCourse = async (req, res) => {
  try {
    const { course_id } = req.params;

    // Verify ownership or admin
    const [courses] = await promisePool.query(
      'SELECT instructor_id FROM courses WHERE course_id = ?',
      [course_id]
    );

    if (courses.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (courses[0].instructor_id !== req.user.user_id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await promisePool.query('DELETE FROM courses WHERE course_id = ?', [course_id]);

    res.json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete course',
      error: error.message
    });
  }
};

/**
 * Get analytics (filtered by instructor for non-admin users)
 */
const getAnalytics = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const user_role = req.user.role;

    let totalStudents, totalRevenue, avgCompletionRate;

    if (user_role === 'admin') {
      // Admin sees all stats
      [[{ totalStudents }]] = await promisePool.query(
        "SELECT COUNT(*) as totalStudents FROM users WHERE role = 'student'"
      );

      [[{ totalRevenue }]] = await promisePool.query(
        "SELECT COALESCE(SUM(amount), 0) as totalRevenue FROM transactions WHERE payment_status = 'completed'"
      );

      [[{ avgCompletionRate }]] = await promisePool.query(
        "SELECT COALESCE(AVG(progress_percentage), 0) as avgCompletionRate FROM enrollments"
      );
    } else {
      // Instructor sees only their course stats
      [[{ totalStudents }]] = await promisePool.query(
        `SELECT COUNT(DISTINCT e.student_id) as totalStudents 
         FROM enrollments e 
         JOIN courses c ON e.course_id = c.course_id 
         WHERE c.instructor_id = ?`,
        [user_id]
      );

      [[{ totalRevenue }]] = await promisePool.query(
        `SELECT COALESCE(SUM(t.amount), 0) as totalRevenue 
         FROM transactions t 
         JOIN courses c ON t.course_id = c.course_id 
         WHERE t.payment_status = 'completed' AND c.instructor_id = ?`,
        [user_id]
      );

      [[{ avgCompletionRate }]] = await promisePool.query(
        `SELECT COALESCE(AVG(e.progress_percentage), 0) as avgCompletionRate 
         FROM enrollments e 
         JOIN courses c ON e.course_id = c.course_id 
         WHERE c.instructor_id = ?`,
        [user_id]
      );
    }

    res.json({
      success: true,
      data: {
        totalStudents,
        totalRevenue,
        avgCompletionRate: Math.round(avgCompletionRate)
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve analytics',
      error: error.message
    });
  }
};

const sharp = require('sharp');
const fs = require('fs').promises;

// ... existing code ...

/**
 * Upload general file
 */
const uploadFile = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded'
    });
  }

  console.log('[DEBUG] File uploaded:', req.file);

  try {
    // Process image if it is an image type
    if (req.file.mimetype.startsWith('image/')) {
      const filePath = req.file.path;
      // Use original path for optimization to avoid complexity for now, or just skip if simple
      // For now, let's just log
    }
  } catch (error) {
    console.error('Image optimization failed:', error);
    // Continue even if optimization fails, serving original file
  }

  // Construct public URL using request headers or env var
  let baseUrl = process.env.API_URL;

  if (!baseUrl) {
    // Fallback if API_URL not set
    let protocol = req.protocol;
    const host = req.get('host');

    // Force HTTPS on Render/Production if not localhost
    if (!host.includes('localhost') && !host.includes('127.0.0.1')) {
      protocol = 'https';
    }
    baseUrl = `${protocol}://${host}`;
  }

  // Ensure no trailing slash in baseUrl
  baseUrl = baseUrl.replace(/\/$/, '');

  const fileUrl = `${baseUrl}/uploads/${req.file.filename}`;

  console.log('[DEBUG] Generated file URL:', fileUrl);

  res.json({
    success: true,
    message: 'File uploaded successfully',
    data: {
      url: fileUrl
    }
  });
};

module.exports = {
  upload,
  uploadFile,
  createCourse,
  updateCourse,
  createModule,
  updateModule,
  createLesson,
  updateLesson,
  getEnrolledStudents,
  createQuiz,
  addQuizQuestion,
  getCourses,
  deleteCourse,
  getAnalytics
};
