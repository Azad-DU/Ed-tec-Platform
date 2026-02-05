import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminAPI } from '../services/apiService';
import './CourseContentManager.css';

const CourseContentManager = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Module form state
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [editingModuleId, setEditingModuleId] = useState(null);
  const [editingLessonId, setEditingLessonId] = useState(null);
  const [moduleForm, setModuleForm] = useState({
    title: '',
    description: '',
    order_index: 1
  });

  // Lesson form state
  const [showLessonForm, setShowLessonForm] = useState(null); // module_id or null
  const [lessonForm, setLessonForm] = useState({
    title: '',
    content_type: 'video',
    content_url: '', // YouTube URL or file URL
    content_text: '',
    duration_minutes: '',
    order_index: 1,
    is_free: false
  });

  useEffect(() => {
    fetchCourseData();
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      const response = await adminAPI.getCourses();
      if (response.data.success) {
        const courseData = response.data.data.find(c => c.course_id === parseInt(courseId));
        if (courseData) {
          setCourse(courseData);
          // Fetch modules for this course
          fetchModules();
        }
      }
    } catch (err) {
      setError('Failed to load course data');
    } finally {
      setLoading(false);
    }
  };

  const fetchModules = async () => {
    try {
      const response = await adminAPI.getCourseContent(courseId);
      if (response.data.success) {
        setModules(response.data.data.modules || []);
      }
    } catch (err) {
      // If no modules exist yet, start with empty array
      setModules([]);
    }
  };

  const handleAddModule = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      let response;
      if (editingModuleId) {
        response = await adminAPI.updateModule(editingModuleId, {
          course_id: parseInt(courseId),
          ...moduleForm
        });
      } else {
        response = await adminAPI.createModule({
          course_id: parseInt(courseId),
          ...moduleForm,
          order_index: modules.length + 1
        });
      }

      if (response.data.success) {
        setSuccess(editingModuleId ? 'Module updated successfully!' : 'Module created successfully!');
        resetModuleForm();
        fetchModules();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save module');
    } finally {
      setSaving(false);
    }
  };

  const resetModuleForm = () => {
    setShowModuleForm(false);
    setEditingModuleId(null);
    setModuleForm({ title: '', description: '', order_index: 1 });
  };

  const handleEditModule = (module) => {
    setEditingModuleId(module.module_id);
    setModuleForm({
      title: module.title,
      description: module.description || '',
      order_index: module.order_index
    });
    setShowModuleForm(true);
  };

  const handleAddLesson = async (e, moduleId) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      let response;
      if (editingLessonId) {
        response = await adminAPI.updateLesson(editingLessonId, {
          module_id: moduleId,
          ...lessonForm,
          duration_minutes: parseInt(lessonForm.duration_minutes) || 0
        });
      } else {
        response = await adminAPI.createLesson({
          module_id: moduleId,
          ...lessonForm,
          duration_minutes: parseInt(lessonForm.duration_minutes) || 0
        });
      }

      if (response.data.success) {
        setSuccess(editingLessonId ? 'Lesson updated successfully!' : 'Lesson created successfully!');
        resetLessonForm();
        fetchModules();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save lesson');
    } finally {
      setSaving(false);
    }
  };

  const resetLessonForm = () => {
    setShowLessonForm(null);
    setEditingLessonId(null);
    setLessonForm({
      title: '',
      content_type: 'video',
      content_url: '',
      content_text: '',
      duration_minutes: '',
      order_index: 1,
      is_free: false
    });
  };

  const handleEditLesson = (lesson, moduleId) => {
    setEditingLessonId(lesson.lesson_id);
    setLessonForm({
      title: lesson.title,
      content_type: lesson.content_type,
      content_url: lesson.content_url || '',
      content_text: lesson.content_text || '',
      duration_minutes: lesson.duration_minutes || '',
      order_index: lesson.order_index,
      is_free: Boolean(lesson.is_free)
    });
    setShowLessonForm(moduleId);
  };

  // Helper to detect YouTube URL
  const isYouTubeUrl = (url) => {
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  if (loading) {
    return (
      <div className="content-manager-container">
        <div className="loading">Loading course data...</div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="content-manager-container">
        <div className="error-box">Course not found</div>
      </div>
    );
  }

  return (
    <div className="content-manager-container">
      <div className="content-header">
        <button className="btn-back" onClick={() => navigate('/admin')}>
          ← Back to Admin
        </button>
        <h1>📚 {course.title}</h1>
        <p className="subtitle">Manage Course Content</p>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="content-layout">
        {/* Modules List */}
        <div className="modules-section">
          <div className="section-header">
            <h2>Modules</h2>
            <button
              className="btn-add-module"
              onClick={() => setShowModuleForm(true)}
            >
              + Add Module
            </button>
          </div>

          {/* Add/Edit Module Form */}
          {showModuleForm && (
            <form className="add-form module-form" onSubmit={handleAddModule}>
              <h3>{editingModuleId ? 'Edit Module' : 'New Module'}</h3>
              <div className="form-group">
                <label>Module Title *</label>
                <input
                  type="text"
                  value={moduleForm.title}
                  onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                  placeholder="e.g., Introduction to Web Development"
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={moduleForm.description}
                  onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                  placeholder="Brief description of this module"
                  rows="2"
                />
              </div>
              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={resetModuleForm}>
                  Cancel
                </button>
                <button type="submit" className="btn-save" disabled={saving}>
                  {saving ? 'Saving...' : (editingModuleId ? 'Update Module' : 'Create Module')}
                </button>
              </div>
            </form>
          )}

          {/* Modules List */}
          {modules.length === 0 ? (
            <div className="empty-state">
              <p>No modules yet. Add your first module to start building course content!</p>
            </div>
          ) : (
            <div className="modules-list">
              {modules.map((module, idx) => (
                <div key={module.module_id} className="module-card">
                  <div className="module-header">
                    <div className="flex items-center gap-3">
                      <span className="module-number">Module {idx + 1}</span>
                      <h3>{module.title}</h3>
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="text-indigo-600 hover:text-indigo-800 text-sm font-medium px-3 py-1 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
                        onClick={() => handleEditModule(module)}
                      >
                        ✎ Edit
                      </button>
                    </div>
                    {/* Description rendered below in original code, assumed preserved */}
                  </div>
                  {module.description && <p className="module-desc">{module.description}</p>}

                  {/* Lessons in Module */}
                  <div className="lessons-list">
                    {module.lessons?.map((lesson, lessonIdx) => (
                      <div key={lesson.lesson_id} className="lesson-item">
                        <div className="flex-1">
                          <span className="lesson-icon">
                            {lesson.content_type === 'video' && '🎥'}
                            {lesson.content_type === 'reading' && '📖'}
                            {lesson.content_type === 'document' && '📄'}
                          </span>
                          <span className="lesson-title">{lesson.title}</span>
                          {lesson.duration_minutes > 0 && (
                            <span className="lesson-duration">{lesson.duration_minutes} min</span>
                          )}
                          {lesson.is_free && <span className="free-badge">Free</span>}
                          {lesson.content_url && isYouTubeUrl(lesson.content_url) && (
                            <span className="youtube-badge">YouTube</span>
                          )}
                        </div>
                        <button
                          className="text-gray-500 hover:text-indigo-600 ml-3"
                          onClick={() => handleEditLesson(lesson, module.module_id)}
                          title="Edit Lesson"
                        >
                          ✎
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add Lesson Button */}
                  <button
                    className="btn-add-lesson"
                    onClick={() => setShowLessonForm(module.module_id)}
                  >
                    + Add Lesson
                  </button>

                  {/* Add/Edit Lesson Form */}
                  {showLessonForm === module.module_id && (
                    <form className="add-form lesson-form" onSubmit={(e) => handleAddLesson(e, module.module_id)}>
                      <h4>{editingLessonId ? 'Edit Lesson' : 'New Lesson'}</h4>

                      <div className="form-group">
                        <label>Lesson Title *</label>
                        <input
                          type="text"
                          value={lessonForm.title}
                          onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                          placeholder="e.g., Getting Started with HTML"
                          required
                        />
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Content Type</label>
                          <select
                            value={lessonForm.content_type}
                            onChange={(e) => setLessonForm({ ...lessonForm, content_type: e.target.value })}
                          >
                            <option value="video">🎥 Video</option>
                            <option value="reading">📖 Reading</option>
                            <option value="document">📄 Document</option>
                          </select>
                        </div>

                        <div className="form-group">
                          <label>Duration (minutes)</label>
                          <input
                            type="number"
                            value={lessonForm.duration_minutes}
                            onChange={(e) => setLessonForm({ ...lessonForm, duration_minutes: e.target.value })}
                            placeholder="10"
                            min="0"
                          />
                        </div>
                      </div>

                      {lessonForm.content_type === 'video' && (
                        <div className="form-group">
                          <label>YouTube Video URL *</label>
                          <input
                            type="url"
                            value={lessonForm.content_url}
                            onChange={(e) => setLessonForm({ ...lessonForm, content_url: e.target.value })}
                            placeholder="https://www.youtube.com/watch?v=..."
                            required
                          />
                          <small className="helper-text">
                            Paste a YouTube video URL. Supported formats: youtube.com/watch?v=..., youtu.be/...
                          </small>
                        </div>
                      )}

                      {(lessonForm.content_type === 'reading' || lessonForm.content_type === 'document') && (
                        <div className="form-group">
                          <label>Content</label>
                          <textarea
                            value={lessonForm.content_text}
                            onChange={(e) => setLessonForm({ ...lessonForm, content_text: e.target.value })}
                            placeholder="Enter lesson content here..."
                            rows="5"
                          />
                        </div>
                      )}

                      <div className="form-group checkbox-group">
                        <label>
                          <input
                            type="checkbox"
                            checked={lessonForm.is_free}
                            onChange={(e) => setLessonForm({ ...lessonForm, is_free: e.target.checked })}
                          />
                          <span>Make this lesson free (preview)</span>
                        </label>
                      </div>

                      <div className="form-actions">
                        <button type="button" className="btn-cancel" onClick={resetLessonForm}>
                          Cancel
                        </button>
                        <button type="submit" className="btn-save" disabled={saving}>
                          {saving ? 'Saving...' : (editingLessonId ? 'Update Lesson' : 'Add Lesson')}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseContentManager;
