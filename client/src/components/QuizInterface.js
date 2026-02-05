import React, { useState, useEffect, useRef } from 'react';
import { quizAPI } from '../services/apiService';
import { trackQuiz } from '../services/xapiService';
import './QuizInterface.css';

const QuizInterface = ({ quizId, onComplete }) => {
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [quizState, setQuizState] = useState('start'); // start, taking, submitted
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef(null);

  useEffect(() => {
    fetchQuizData();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [quizId]);

  useEffect(() => {
    if (quizState === 'taking' && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleSubmitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [quizState, timeRemaining]);

  const fetchQuizData = async () => {
    try {
      const response = await quizAPI.getQuizById(quizId);
      if (response.data.success) {
        const quizData = response.data.data;
        setQuiz(quizData);
        setQuestions(quizData.questions || []);
        setTimeRemaining(quizData.time_limit_minutes * 60);
      }
    } catch (error) {
      console.error('Failed to fetch quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = () => {
    setQuizState('taking');
    trackQuiz.attempted(quizId, 1);
  };

  const handleAnswerSelect = (questionId, answer) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleSubmitQuiz = async () => {
    if (timerRef.current) clearInterval(timerRef.current);

    try {
      const response = await quizAPI.submitQuiz(quizId, answers);
      if (response.data.success) {
        const resultData = response.data.data;
        setResult(resultData);
        setQuizState('submitted');

        // Track quiz completion
        trackQuiz.completed(
          quizId,
          resultData.score,
          resultData.max_score,
          resultData.passed
        );
      }
    } catch (error) {
      console.error('Failed to submit quiz:', error);
      alert('Failed to submit quiz. Please try again.');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const goToQuestion = (index) => {
    setCurrentQuestionIndex(index);
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  if (loading) {
    return (
      <div className="quiz-loading">
        <div className="spinner"></div>
        <p>Loading quiz...</p>
      </div>
    );
  }

  if (!quiz) {
    return <div className="quiz-error">Quiz not found</div>;
  }

  // Start Screen
  if (quizState === 'start') {
    return (
      <div className="quiz-start-screen">
        <div className="quiz-info-card">
          <h2>📝 {quiz.title}</h2>
          {quiz.description && <p className="quiz-description">{quiz.description}</p>}

          <div className="quiz-details">
            <div className="detail-item">
              <span className="detail-icon">❓</span>
              <span className="detail-label">Questions:</span>
              <span className="detail-value">{questions.length}</span>
            </div>
            <div className="detail-item">
              <span className="detail-icon">⏱️</span>
              <span className="detail-label">Time Limit:</span>
              <span className="detail-value">{quiz.time_limit_minutes} minutes</span>
            </div>
            <div className="detail-item">
              <span className="detail-icon">🎯</span>
              <span className="detail-label">Passing Score:</span>
              <span className="detail-value">{quiz.passing_score}%</span>
            </div>
            <div className="detail-item">
              <span className="detail-icon">🔄</span>
              <span className="detail-label">Max Attempts:</span>
              <span className="detail-value">{quiz.max_attempts}</span>
            </div>
          </div>

          <button className="btn-start-quiz" onClick={handleStartQuiz}>
            Start Quiz
          </button>
        </div>
      </div>
    );
  }

  // Taking Quiz
  if (quizState === 'taking') {
    const currentQuestion = questions[currentQuestionIndex];
    const currentAnswer = answers[currentQuestion.question_id];

    return (
      <div className="quiz-taking-screen">
        {/* Timer */}
        <div className={`quiz-timer ${timeRemaining < 60 ? 'warning' : ''}`}>
          <span className="timer-icon">⏱️</span>
          <span className="timer-value">{formatTime(timeRemaining)}</span>
        </div>

        {/* Progress Indicators */}
        <div className="question-indicators">
          {questions.map((q, index) => (
            <button
              key={q.question_id}
              className={`indicator-dot ${index === currentQuestionIndex ? 'active' : ''} ${answers[q.question_id] !== undefined ? 'answered' : ''
                }`}
              onClick={() => goToQuestion(index)}
            >
              {index + 1}
            </button>
          ))}
        </div>

        {/* Question */}
        <div className="question-card">
          <div className="question-header">
            <span className="question-number">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <span className="question-points">{currentQuestion.points} points</span>
          </div>

          <h3 className="question-text">{currentQuestion.question_text}</h3>

          {/* Answer Options */}
          <div className="answer-options">
            {currentQuestion.question_type === 'multiple_choice' && (
              <div className="options-list">
                {currentQuestion.options?.map((option, index) => (
                  <label
                    key={index}
                    className={`option-card ${currentAnswer === option ? 'selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name={`question-${currentQuestion.question_id}`}
                      value={option}
                      checked={currentAnswer === option}
                      onChange={() => handleAnswerSelect(currentQuestion.question_id, option)}
                    />
                    <span className="option-label">{option}</span>
                  </label>
                ))}
              </div>
            )}

            {currentQuestion.question_type === 'true_false' && (
              <div className="true-false-options">
                <label className={`tf-option ${currentAnswer === 'True' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name={`question-${currentQuestion.question_id}`}
                    value="True"
                    checked={currentAnswer === 'True'}
                    onChange={() => handleAnswerSelect(currentQuestion.question_id, 'True')}
                  />
                  <span className="tf-label">✓ True</span>
                </label>
                <label className={`tf-option ${currentAnswer === 'False' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name={`question-${currentQuestion.question_id}`}
                    value="False"
                    checked={currentAnswer === 'False'}
                    onChange={() => handleAnswerSelect(currentQuestion.question_id, 'False')}
                  />
                  <span className="tf-label">✗ False</span>
                </label>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="question-navigation">
            <button
              className="btn-nav btn-previous"
              onClick={goToPreviousQuestion}
              disabled={currentQuestionIndex === 0}
            >
              ← Previous
            </button>

            {currentQuestionIndex === questions.length - 1 ? (
              <button className="btn-submit-quiz" onClick={handleSubmitQuiz}>
                Submit Quiz
              </button>
            ) : (
              <button className="btn-nav btn-next" onClick={goToNextQuestion}>
                Next →
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Results Screen
  if (quizState === 'submitted' && result) {
    const percentage = result.max_score > 0 ? (result.score / result.max_score) * 100 : 0;

    return (
      <div className="quiz-results-screen">
        <div className="results-card">
          <div className={`results-icon ${result.passed ? 'passed' : 'failed'}`}>
            {result.passed ? '🎉' : '📚'}
          </div>

          <h2 className="results-title">
            {result.passed ? 'Congratulations!' : 'Keep Learning!'}
          </h2>

          <div className="score-display">
            <div className="score-circle">
              <svg viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#f0f0f0" strokeWidth="10" />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke={result.passed ? '#4CAF50' : '#FF9800'}
                  strokeWidth="10"
                  strokeDasharray={`${(percentage / 100) * 283} 283`}
                  transform="rotate(-90 50 50)"
                />
              </svg>
              <div className="score-text">
                <div className="score-percentage">{Math.round(percentage)}%</div>
                <div className="score-fraction">
                  {result.score}/{result.max_score}
                </div>
              </div>
            </div>
          </div>

          <div className="results-details">
            <p className="result-message">
              {result.passed
                ? `You passed! You scored ${result.score} out of ${result.max_score} points.`
                : `You need ${quiz.passing_score}% to pass. You scored ${Math.round(percentage)}%.`}
            </p>
          </div>

          <div className="results-actions">
            {!result.passed && result.attempt_number < quiz.max_attempts && (
              <button className="btn-retake" onClick={() => window.location.reload()}>
                🔄 Retake Quiz
              </button>
            )}
            <button className="btn-continue" onClick={onComplete}>
              Continue Learning
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default QuizInterface;
