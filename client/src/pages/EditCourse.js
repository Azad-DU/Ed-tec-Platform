import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminAPI } from '../services/apiService';
import './CreateCourse.css';

const EditCourse = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
    mentor_image: '',
    is_published: false
  });
  const [uploading, setUploading] = useState({
    thumbnail: false,
    mentor: false
  });

  useEffect(() => {
    fetchCourseData();
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      const response = await adminAPI.getCourses();
      if (response.data.success) {
        const course = response.data.data.find(c => c.course_id === parseInt(courseId));
        if (course) {
          setFormData({
            title: course.title || '',
            description: course.description || '',
            is_free: course.is_free || parseFloat(course.price) === 0,
            price: course.price || '',
            difficulty_level: course.difficulty_level || 'beginner',
            thumbnail_url: course.thumbnail_url || '',
            duration_hours: course.duration_hours || '',
            mentor_name: course.mentor_name || '',
            mentor_image: course.mentor_image || '',
            is_published: course.is_published || false
          });
        }
      }
    } catch (err) {
      setError('Failed to load course data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'radio') {
      setFormData(prev => ({ ...prev, [name]: value === 'true' }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

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
    } finally {
      setUploading(prev => ({ ...prev, [field === 'thumbnail_url' ? 'thumbnail' : 'mentor']: false }));
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const courseData = {
        ...formData,
        price: formData.is_free ? 0 : (parseFloat(formData.price) || 0),
        duration_hours: parseInt(formData.duration_hours) || 0,
        mentor_name: formData.mentor_name || 'Admin',
        mentor_image: formData.mentor_image || null
      };

      const response = await adminAPI.updateCourse(courseId, courseData);

      if (response.data.success) {
        navigate('/admin');
      } else {
        setError(response.data.message || 'Failed to update course');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update course. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="create-course-container">
        <div className="create-course-card">
          <p>Loading course data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="create-course-container">
      <div className="create-course-card">
        <h1> Edit Course</h1>
        <p className="subtitle">Update course details</p>

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
              rows="4"
              required
            />
          </div>

          {/* Mentor Information */}
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

          {/* Pricing Options */}
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

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="is_published"
                checked={formData.is_published}
                onChange={handleChange}
              />
              <span>Published (visible to students)</span>
            </label>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={() => navigate('/admin')}>
              Cancel
            </button>
            <button type="submit" className="btn-create" disabled={saving}>
              {saving ? 'Saving...' : '💾 Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCourse;
