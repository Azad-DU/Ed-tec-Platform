import apiClient from './apiService';

// xAPI verbs according to xAPI specification
const VERBS = {
  INITIALIZED: 'initialized',
  PLAYED: 'played',
  PAUSED: 'paused',
  PROGRESSED: 'progressed',
  COMPLETED: 'completed',
  ATTEMPTED: 'attempted',
  PASSED: 'passed',
  FAILED: 'failed',
  ANSWERED: 'answered',
  VIEWED: 'viewed',
};

// xAPI object types
const OBJECT_TYPES = {
  VIDEO: 'video',
  QUIZ: 'quiz',
  LESSON: 'lesson',
  MODULE: 'module',
  DISCUSSION: 'discussion',
};

/**
 * Build xAPI statement structure
 * @param {string} verb - The action being performed
 * @param {string} objectType - Type of learning object
 * @param {number} objectId - ID of the learning object
 * @param {object} result - Result data (optional)
 * @param {object} context - Additional context (optional)
 */
const buildStatement = (verb, objectType, objectId, result = null, context = null) => {
  const statement = {
    verb,
    object_type: objectType,
    object_id: objectId,
    timestamp: new Date().toISOString(),
  };

  if (result) {
    statement.result = result;
  }

  if (context) {
    statement.context = context;
  }

  return statement;
};

/**
 * Send xAPI statement to the backend
 */
const sendStatement = async (statement) => {
  try {
    await apiClient.post('/xapi/statement', statement);
  } catch (error) {
    console.error('Failed to send xAPI statement:', error);
  }
};

/**
 * Video tracking functions
 */
export const trackVideo = {
  initialized: (lessonId, videoUrl) => {
    const statement = buildStatement(
      VERBS.INITIALIZED,
      OBJECT_TYPES.VIDEO,
      lessonId,
      null,
      { video_url: videoUrl }
    );
    sendStatement(statement);
  },

  played: (lessonId, currentTime, duration) => {
    const statement = buildStatement(
      VERBS.PLAYED,
      OBJECT_TYPES.VIDEO,
      lessonId,
      {
        current_time: currentTime,
        duration: duration,
        progress: duration > 0 ? (currentTime / duration) * 100 : 0,
      }
    );
    sendStatement(statement);
  },

  paused: (lessonId, currentTime, duration) => {
    const statement = buildStatement(
      VERBS.PAUSED,
      OBJECT_TYPES.VIDEO,
      lessonId,
      {
        current_time: currentTime,
        duration: duration,
        progress: duration > 0 ? (currentTime / duration) * 100 : 0,
      }
    );
    sendStatement(statement);
  },

  progressed: (lessonId, currentTime, duration) => {
    const statement = buildStatement(
      VERBS.PROGRESSED,
      OBJECT_TYPES.VIDEO,
      lessonId,
      {
        current_time: currentTime,
        duration: duration,
        progress: duration > 0 ? (currentTime / duration) * 100 : 0,
      }
    );
    sendStatement(statement);
  },

  completed: (lessonId, duration) => {
    const statement = buildStatement(
      VERBS.COMPLETED,
      OBJECT_TYPES.VIDEO,
      lessonId,
      {
        duration: duration,
        progress: 100,
      }
    );
    sendStatement(statement);
  },
};

/**
 * Quiz tracking functions
 */
export const trackQuiz = {
  attempted: (quizId, attemptNumber) => {
    const statement = buildStatement(
      VERBS.ATTEMPTED,
      OBJECT_TYPES.QUIZ,
      quizId,
      { attempt_number: attemptNumber }
    );
    sendStatement(statement);
  },

  answered: (quizId, questionId, isCorrect) => {
    const statement = buildStatement(
      VERBS.ANSWERED,
      OBJECT_TYPES.QUIZ,
      quizId,
      { question_id: questionId, correct: isCorrect }
    );
    sendStatement(statement);
  },

  completed: (quizId, score, maxScore, passed) => {
    const statement = buildStatement(
      passed ? VERBS.PASSED : VERBS.FAILED,
      OBJECT_TYPES.QUIZ,
      quizId,
      {
        score: score,
        max_score: maxScore,
        percentage: maxScore > 0 ? (score / maxScore) * 100 : 0,
        passed: passed,
      }
    );
    sendStatement(statement);
  },
};

/**
 * Lesson tracking functions
 */
export const trackLesson = {
  viewed: (lessonId, contentType) => {
    const statement = buildStatement(
      VERBS.VIEWED,
      OBJECT_TYPES.LESSON,
      lessonId,
      null,
      { content_type: contentType }
    );
    sendStatement(statement);
  },

  completed: (lessonId) => {
    const statement = buildStatement(
      VERBS.COMPLETED,
      OBJECT_TYPES.LESSON,
      lessonId
    );
    sendStatement(statement);
  },
};

export { VERBS, OBJECT_TYPES };
