const { promisePool } = require('../config/database');

/**
 * Get quiz by ID
 */
const getQuiz = async (req, res) => {
  try {
    const { quiz_id } = req.params;
    const student_id = req.user.user_id;

    // Get quiz details
    const [quizzes] = await promisePool.query(
      `SELECT q.*, m.course_id
       FROM quizzes q
       JOIN modules m ON q.module_id = m.module_id
       WHERE q.quiz_id = ?`,
      [quiz_id]
    );

    if (quizzes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    const quiz = quizzes[0];

    // Check enrollment
    const [enrollments] = await promisePool.query(
      'SELECT enrollment_id FROM enrollments WHERE student_id = ? AND course_id = ? AND enrollment_status = ?',
      [student_id, quiz.course_id, 'active']
    );

    if (enrollments.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Enrollment required to access this quiz'
      });
    }

    // Get questions (without correct answers)
    const [questions] = await promisePool.query(
      `SELECT question_id, question_text, question_type, options, points, order_index
       FROM quiz_questions
       WHERE quiz_id = ?
       ORDER BY order_index ASC`,
      [quiz_id]
    );

    // Parse options JSON
    const parsedQuestions = questions.map(q => ({
      ...q,
      options: JSON.parse(q.options)
    }));

    // Get attempt count
    const [attempts] = await promisePool.query(
      'SELECT COUNT(*) as attempt_count FROM quiz_attempts WHERE quiz_id = ? AND student_id = ?',
      [quiz_id, student_id]
    );

    quiz.questions = parsedQuestions;
    quiz.attempts_count = attempts[0].attempt_count;

    res.json({
      success: true,
      data: quiz
    });
  } catch (error) {
    console.error('Get quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve quiz',
      error: error.message
    });
  }
};

/**
 * Submit quiz attempt
 */
const submitQuiz = async (req, res) => {
  try {
    const { quiz_id } = req.params;
    const { answers, time_taken_seconds } = req.body;
    const student_id = req.user.user_id;

    // Get quiz details
    const [quizzes] = await promisePool.query(
      'SELECT quiz_id, passing_score, max_attempts FROM quizzes WHERE quiz_id = ?',
      [quiz_id]
    );

    if (quizzes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    const quiz = quizzes[0];

    // Check attempt limit
    const [previousAttempts] = await promisePool.query(
      'SELECT COUNT(*) as attempt_count FROM quiz_attempts WHERE quiz_id = ? AND student_id = ?',
      [quiz_id, student_id]
    );

    const attempt_number = previousAttempts[0].attempt_count + 1;

    if (attempt_number > quiz.max_attempts) {
      return res.status(400).json({
        success: false,
        message: `Maximum attempts (${quiz.max_attempts}) reached`
      });
    }

    // Get questions with correct answers
    const [questions] = await promisePool.query(
      'SELECT question_id, correct_answer, points, explanation FROM quiz_questions WHERE quiz_id = ?',
      [quiz_id]
    );

    // Grade the quiz
    let totalScore = 0;
    let maxScore = 0;
    const feedback = [];

    questions.forEach(question => {
      maxScore += question.points;
      const studentAnswer = answers[question.question_id];
      const isCorrect = studentAnswer === question.correct_answer;

      if (isCorrect) {
        totalScore += question.points;
      }

      feedback.push({
        question_id: question.question_id,
        student_answer: studentAnswer,
        correct_answer: question.correct_answer,
        is_correct: isCorrect,
        explanation: question.explanation,
        points_earned: isCorrect ? question.points : 0
      });
    });

    const scorePercentage = (totalScore / maxScore) * 100;
    const passed = scorePercentage >= quiz.passing_score;

    // Insert attempt
    await promisePool.query(
      `INSERT INTO quiz_attempts (quiz_id, student_id, score, max_score, passed, answers, time_taken_seconds, attempt_number, completed_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [quiz_id, student_id, scorePercentage, 100, passed, JSON.stringify(answers), time_taken_seconds, attempt_number]
    );

    res.json({
      success: true,
      message: passed ? 'Quiz passed! Congratulations!' : 'Quiz completed. Keep trying!',
      data: {
        score: scorePercentage.toFixed(2),
        passing_score: quiz.passing_score,
        passed,
        feedback,
        attempt_number,
        remaining_attempts: quiz.max_attempts - attempt_number
      }
    });
  } catch (error) {
    console.error('Submit quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit quiz',
      error: error.message
    });
  }
};

/**
 * Get quiz attempts history
 */
const getQuizAttempts = async (req, res) => {
  try {
    const { quiz_id } = req.params;
    const student_id = req.user.user_id;

    const [attempts] = await promisePool.query(
      `SELECT attempt_id, score, max_score, passed, time_taken_seconds, attempt_number, completed_at
       FROM quiz_attempts
       WHERE quiz_id = ? AND student_id = ?
       ORDER BY attempt_number DESC`,
      [quiz_id, student_id]
    );

    res.json({
      success: true,
      data: attempts
    });
  } catch (error) {
    console.error('Get quiz attempts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve quiz attempts',
      error: error.message
    });
  }
};

module.exports = {
  getQuiz,
  submitQuiz,
  getQuizAttempts
};
