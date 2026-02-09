import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../services/apiService';
import './CreateCourse.css';

const CreateCourse = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    is_free: true,
    price: '',
    difficulty_level: 'beginner',
    thumbnail_url: '',
    duration_hours: '',
    mentor_name: '',
    mentor_image: ''
  });
  const [uploading, setUploading] = useState({
    thumbnail: false,
    mentor: false
  });

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    if (type === 'radio') {
      setFormData(prev => ({ ...prev, [name]: value === 'true' }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    // Set uploading state
    setUploading(prev => ({ ...prev, [field === 'thumbnail_url' ? 'thumbnail' : 'mentor']: true }));

    const data = new FormData();
    data.append('file', file);

    try {
      const response = await adminAPI.uploadFile(data);
      if (response.data.success) {
        setFormData(prev => ({ ...prev, [field]: response.data.data.url }));
      }
    } catch (err) {
      console.error('File upload failed:', err);
      // Optional: set error state
    } finally {
      setUploading(prev => ({ ...prev, [field === 'thumbnail_url' ? 'thumbnail' : 'mentor']: false }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const courseData = {
        ...formData,
        price: formData.is_free ? 0 : (parseFloat(formData.price) || 0),
        duration_hours: parseInt(formData.duration_hours) || 0,
        mentor_name: formData.mentor_name || 'Admin',
        mentor_image: formData.mentor_image || ''
      };

      const response = await adminAPI.createCourse(courseData);

      if (response.data.success) {
        navigate('/admin');
      } else {
        setError(response.data.message || 'Failed to create course');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create course. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-course-container">
      <div className="create-course-card">
        <h1> Create New Course</h1>
        <p className="subtitle">Fill in the details to create a new course</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="course-form">
          <div className="form-group">
            <label htmlFor="title">Course Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Complete Web Development Bootcamp"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe what students will learn..."
              rows="4"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="mentor_name">Mentor Name</label>
              <input
                type="text"
                id="mentor_name"
                name="mentor_name"
                value={formData.mentor_name}
                onChange={handleChange}
                placeholder="Leave empty for 'Admin'"
              />
            </div>

            <div className="form-group">
              <label htmlFor="mentor_image">Mentor Image</label>
              <div className="file-input-group">
                <input
                  type="file"
                  id="mentor_image"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'mentor_image')}
                />
                {uploading.mentor && <span className="upload-loader">Uploading...</span>}
              </div>
              {formData.mentor_image && (
                <div className="image-preview">
                  <img src={formData.mentor_image} alt="Mentor" />
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label>Pricing</label>
            <div className="pricing-toggle">
              <label className={`radio-option ${formData.is_free ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="is_free"
                  value="true"
                  checked={formData.is_free === true}
                  onChange={handleChange}
                />
                <span className="radio-label">🆓 Free</span>
              </label>
              <label className={`radio-option ${!formData.is_free ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="is_free"
                  value="false"
                  checked={formData.is_free === false}
                  onChange={handleChange}
                />
                <span className="radio-label">💳 Paid</span>
              </label>
            </div>
          </div>

          {!formData.is_free && (
            <div className="form-group price-field">
              <label htmlFor="price">Price (BDT) *</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="e.g., 2999"
                min="1"
                required
              />
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="duration_hours">Duration (Hours)</label>
              <input
                type="number"
                id="duration_hours"
                name="duration_hours"
                value={formData.duration_hours}
                onChange={handleChange}
                placeholder="e.g., 40"
                min="0"
              />
            </div>

            <div className="form-group">
              <label htmlFor="difficulty_level">Difficulty Level</label>
              <select
                id="difficulty_level"
                name="difficulty_level"
                value={formData.difficulty_level}
                onChange={handleChange}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="thumbnail_url">Course Thumbnail</label>
            <div className="file-input-group">
              <input
                type="file"
                id="thumbnail_url"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, 'thumbnail_url')}
              />
              {uploading.thumbnail && <span className="upload-loader">Uploading...</span>}
            </div>
            {formData.thumbnail_url && (
              <div className="image-preview thumbnail-preview">
                <img src={formData.thumbnail_url} alt="Course Thumbnail" />
              </div>
            )}
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={() => navigate('/admin')}>
              Cancel
            </button>
            <button type="submit" className="btn-create" disabled={loading}>
              {loading ? 'Creating...' : '+ Create Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCourse;
