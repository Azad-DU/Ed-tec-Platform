import React, { useState, useEffect } from 'react';
import { reviewAPI } from '../services/apiService';
import { useAuth } from '../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import './CourseReviews.css';

const CourseReviews = ({ courseId }) => {
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(null);
  const [totalReviews, setTotalReviews] = useState(0);
  const [userReview, setUserReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ rating: 5, review_text: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    fetchReviews();
    if (isAuthenticated) {
      fetchUserReview();
    }
  }, [courseId, isAuthenticated]);

  const fetchReviews = async () => {
    try {
      const response = await reviewAPI.getCourseReviews(courseId);
      if (response.data.success) {
        setReviews(response.data.data.reviews);
        setAvgRating(response.data.data.avg_rating);
        setTotalReviews(response.data.data.total_reviews);
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserReview = async () => {
    try {
      const response = await reviewAPI.getUserReview(courseId);
      if (response.data.success && response.data.data) {
        setUserReview(response.data.data);
        setFormData({
          rating: response.data.data.rating,
          review_text: response.data.data.review_text || ''
        });
      }
    } catch (error) {
      console.error('Failed to fetch user review:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (editMode && userReview) {
        await reviewAPI.updateReview(userReview.review_id, formData);
      } else {
        await reviewAPI.createReview(courseId, formData);
      }

      setShowForm(false);
      setEditMode(false);
      fetchReviews();
      fetchUserReview();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your review?')) return;

    try {
      await reviewAPI.deleteReview(userReview.review_id);
      setUserReview(null);
      setFormData({ rating: 5, review_text: '' });
      fetchReviews();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete review');
    }
  };

  const handleEditClick = () => {
    setEditMode(true);
    setShowForm(true);
  };

  const renderStars = (rating, interactive = false, size = 'medium') => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={`star ${size} ${i <= rating ? 'filled' : 'empty'} ${interactive ? 'interactive' : ''}`}
          onClick={interactive ? () => setFormData({ ...formData, rating: i }) : undefined}
        >
          ★
        </span>
      );
    }
    return <div className="stars-container">{stars}</div>;
  };

  if (loading) {
    return (
      <div className="reviews-loading">
        <div className="spinner"></div>
        <p>Loading reviews...</p>
      </div>
    );
  }

  return (
    <div className="course-reviews-container">
      {/* Header with Average Rating */}
      <div className="reviews-header">
        <div className="reviews-title">
          <h2>⭐ Course Reviews</h2>
          <span className="reviews-count">{totalReviews} review{totalReviews !== 1 ? 's' : ''}</span>
        </div>

        {avgRating && (
          <div className="average-rating">
            <span className="avg-number">{avgRating}</span>
            {renderStars(Math.round(avgRating), false, 'large')}
          </div>
        )}
      </div>

      {/* User Review Section */}
      {isAuthenticated && (
        <div className="user-review-section">
          {userReview && !showForm ? (
            <div className="your-review">
              <h3>Your Review</h3>
              <div className="review-card your-review-card">
                <div className="review-header">
                  {renderStars(userReview.rating)}
                  <span className="review-date">
                    {formatDistanceToNow(new Date(userReview.created_at), { addSuffix: true })}
                  </span>
                </div>
                {userReview.review_text && (
                  <p className="review-text">{userReview.review_text}</p>
                )}
                <div className="review-actions">
                  <button className="btn-edit" onClick={handleEditClick}>
                    ✏️ Edit
                  </button>
                  <button className="btn-delete" onClick={handleDelete}>
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </div>
          ) : !showForm ? (
            <button className="btn-write-review" onClick={() => setShowForm(true)}>
              ✍️ Write a Review
            </button>
          ) : null}

          {/* Review Form */}
          {showForm && (
            <div className="review-form-container">
              <h3>{editMode ? 'Edit Your Review' : 'Write a Review'}</h3>
              <form onSubmit={handleSubmit}>
                {error && <div className="error-message">{error}</div>}

                <div className="form-group">
                  <label>Your Rating</label>
                  {renderStars(formData.rating, true, 'large')}
                </div>

                <div className="form-group">
                  <label>Your Review (Optional)</label>
                  <textarea
                    value={formData.review_text}
                    onChange={(e) => setFormData({ ...formData, review_text: e.target.value })}
                    placeholder="Share your experience with this course..."
                    rows={4}
                  />
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => { setShowForm(false); setEditMode(false); }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-submit" disabled={submitting}>
                    {submitting ? 'Submitting...' : (editMode ? 'Update Review' : 'Submit Review')}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* All Reviews List */}
      <div className="reviews-list">
        <h3>All Reviews</h3>
        {reviews.length === 0 ? (
          <div className="no-reviews">
            <span className="no-reviews-icon">📝</span>
            <p>No reviews yet. Be the first to review this course!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.review_id} className="review-card">
              <div className="review-header">
                <div className="reviewer-info">
                  <span className="reviewer-name">👤 {review.full_name}</span>
                  {review.role === 'instructor' && (
                    <span className="instructor-badge">Instructor</span>
                  )}
                </div>
                <span className="review-date">
                  {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                </span>
              </div>

              <div className="review-rating">
                {renderStars(review.rating)}
              </div>

              {review.review_text && (
                <p className="review-text">{review.review_text}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CourseReviews;
