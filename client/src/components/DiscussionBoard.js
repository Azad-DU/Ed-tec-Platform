import React, { useState, useEffect } from 'react';
import { discussionAPI } from '../services/apiService';
import { useAuth } from '../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import './DiscussionBoard.css';

const DiscussionBoard = ({ moduleId }) => {
  const [discussions, setDiscussions] = useState([]);
  const [selectedDiscussion, setSelectedDiscussion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [showNewThread, setShowNewThread] = useState(false);
  const [newThread, setNewThread] = useState({ content: '', is_qa: true });
  const [replyContent, setReplyContent] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editContent, setEditContent] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchDiscussions();
  }, [moduleId]);

  const fetchDiscussions = async () => {
    try {
      const response = await discussionAPI.getDiscussions(moduleId);
      if (response.data.success) {
        setDiscussions(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch discussions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateThread = async () => {
    if (!newThread.content.trim()) {
      alert('Please write your question or discussion');
      return;
    }

    // Auto-generate title from first 60 characters of content
    const autoTitle = newThread.content.trim().substring(0, 60) + (newThread.content.length > 60 ? '...' : '');

    try {
      const response = await discussionAPI.createDiscussion({
        module_id: moduleId,
        title: autoTitle,
        content: newThread.content,
        is_qa: newThread.is_qa,
      });

      if (response.data.success) {
        setNewThread({ content: '', is_qa: true });
        setShowNewThread(false);
        fetchDiscussions();
      }
    } catch (error) {
      console.error('Failed to create discussion:', error);
      alert('Failed to create discussion. Please try again.');
    }
  };

  const handleReply = async () => {
    if (!replyContent.trim()) {
      alert('Please write a reply');
      return;
    }

    try {
      const response = await discussionAPI.createReply(selectedDiscussion.discussion_id, replyContent);
      if (response.data.success) {
        setReplyContent('');
        loadDiscussionDetail(selectedDiscussion.discussion_id);
      }
    } catch (error) {
      console.error('Failed to post reply:', error);
      alert('Failed to post reply. Please try again.');
    }
  };

  const handleMarkResolved = async () => {
    try {
      await discussionAPI.markAsResolved(selectedDiscussion.discussion_id);
      loadDiscussionDetail(selectedDiscussion.discussion_id);
      fetchDiscussions();
    } catch (error) {
      console.error('Failed to mark as resolved:', error);
    }
  };

  const loadDiscussionDetail = async (discussionId) => {
    try {
      const response = await discussionAPI.getDiscussionById(discussionId);
      if (response.data.success) {
        setSelectedDiscussion(response.data.data);
        setEditMode(false);
      }
    } catch (error) {
      console.error('Failed to load discussion:', error);
    }
  };

  // Check if user can edit/delete this discussion
  const canEditDelete = (discussion) => {
    if (!user) return false;
    const isOwner = user.user_id === discussion.user_id;
    const isPrivileged = ['admin', 'instructor'].includes(user.role);
    return isOwner || isPrivileged;
  };

  const handleEditClick = () => {
    setEditContent(selectedDiscussion.content);
    setEditMode(true);
  };

  const handleUpdateDiscussion = async () => {
    if (!editContent.trim()) {
      alert('Content cannot be empty');
      return;
    }

    const autoTitle = editContent.trim().substring(0, 60) + (editContent.length > 60 ? '...' : '');

    try {
      const response = await discussionAPI.updateDiscussion(selectedDiscussion.discussion_id, {
        title: autoTitle,
        content: editContent
      });
      if (response.data.success) {
        setEditMode(false);
        loadDiscussionDetail(selectedDiscussion.discussion_id);
        fetchDiscussions();
      }
    } catch (error) {
      console.error('Failed to update discussion:', error);
      alert(error.response?.data?.message || 'Failed to update discussion');
    }
  };

  const handleDeleteDiscussion = async () => {
    if (!window.confirm('Are you sure you want to delete this discussion? This will also delete all replies.')) return;

    try {
      const response = await discussionAPI.deleteDiscussion(selectedDiscussion.discussion_id);
      if (response.data.success) {
        setSelectedDiscussion(null);
        fetchDiscussions();
      }
    } catch (error) {
      console.error('Failed to delete discussion:', error);
      alert(error.response?.data?.message || 'Failed to delete discussion');
    }
  };

  const getFilteredAndSortedDiscussions = () => {
    let filtered = [...discussions];

    // Filter
    if (filterType === 'qa') {
      filtered = filtered.filter((d) => d.is_qa);
    } else if (filterType === 'discussion') {
      filtered = filtered.filter((d) => !d.is_qa);
    }

    // Sort
    if (sortBy === 'replies') {
      filtered.sort((a, b) => (b.reply_count || 0) - (a.reply_count || 0));
    } else if (sortBy === 'resolved') {
      filtered.sort((a, b) => (a.is_resolved ? 1 : 0) - (b.is_resolved ? 1 : 0));
    } else {
      filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    return filtered;
  };

  if (loading) {
    return (
      <div className="discussion-loading">
        <div className="spinner"></div>
        <p>Loading discussions...</p>
      </div>
    );
  }

  return (
    <div className="discussion-board-container">
      {!selectedDiscussion ? (
        <div className="thread-list-view">
          {/* Compact Header */}
          <div className="discussion-header">
            <h2>💬 Board</h2>
            <button className="btn-new-thread" onClick={() => setShowNewThread(true)}>
              + Ask Question
            </button>
          </div>

          {/* Filters */}
          <div className="discussion-filters">
            <div className="filter-group">
              <label>Filter:</label>
              <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                <option value="all">All</option>
                <option value="qa">Q&A Only</option>
                <option value="discussion">Discussions Only</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Sort by:</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="recent">Most Recent</option>
                <option value="replies">Most Replies</option>
                <option value="resolved">Unresolved First</option>
              </select>
            </div>
          </div>

          {/* Thread List */}
          <div className="threads-list">
            {getFilteredAndSortedDiscussions().map((discussion) => (
              <div
                key={discussion.discussion_id}
                className="thread-card"
                onClick={() => loadDiscussionDetail(discussion.discussion_id)}
              >
                <div className="thread-header">
                  <h3 className="thread-title">{discussion.title}</h3>
                  <div className="thread-badges">
                    {discussion.is_qa && <span className="badge-qa">Q&A</span>}
                    {discussion.is_resolved && <span className="badge-resolved">✓ Resolved</span>}
                  </div>
                </div>

                <div className="thread-meta">
                  <span className="thread-author">👤 {discussion.author_name}</span>
                  <span className="thread-time">
                    {formatDistanceToNow(new Date(discussion.created_at), { addSuffix: true })}
                  </span>
                  <span className="thread-replies">💬 {discussion.reply_count || 0} replies</span>
                </div>
              </div>
            ))}

            {getFilteredAndSortedDiscussions().length === 0 && (
              <div className="empty-discussions">
                <p>No discussions yet. Start a conversation!</p>
              </div>
            )}
          </div>

          {/* New Thread Modal - Simplified */}
          {showNewThread && (
            <div className="modal-overlay" onClick={() => setShowNewThread(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h3>Ask a Question</h3>
                  <button className="modal-close" onClick={() => setShowNewThread(false)}>
                    ✕
                  </button>
                </div>

                <div className="modal-body">
                  <div className="form-group">
                    <textarea
                      value={newThread.content}
                      onChange={(e) => setNewThread({ ...newThread, content: e.target.value })}
                      placeholder="Type your question here..."
                      className="thread-input thread-textarea"
                      rows={5}
                      autoFocus
                    />
                  </div>

                  <div className="thread-type-toggle">
                    <button
                      type="button"
                      className={`type-btn ${newThread.is_qa ? 'active' : ''}`}
                      onClick={() => setNewThread({ ...newThread, is_qa: true })}
                    >
                      ❓ Question
                    </button>
                    <button
                      type="button"
                      className={`type-btn ${!newThread.is_qa ? 'active' : ''}`}
                      onClick={() => setNewThread({ ...newThread, is_qa: false })}
                    >
                      💬 Discussion
                    </button>
                  </div>
                </div>

                <div className="modal-footer">
                  <button className="btn-cancel" onClick={() => setShowNewThread(false)}>
                    Cancel
                  </button>
                  <button className="btn-submit" onClick={handleCreateThread}>
                    Post
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        // Thread Detail View
        <div className="thread-detail-view">
          <button className="btn-back" onClick={() => setSelectedDiscussion(null)}>
            ← Back to Discussions
          </button>

          <div className="thread-detail-card">
            <div className="thread-detail-header">
              <div className="thread-detail-title-section">
                <h2>{selectedDiscussion.title}</h2>
                <div className="thread-badges">
                  {selectedDiscussion.is_qa && <span className="badge-qa">Q&A</span>}
                  {selectedDiscussion.is_resolved && <span className="badge-resolved">✓ Resolved</span>}
                </div>
              </div>

              {/* Header Actions - Edit/Delete/Resolve */}
              <div className="thread-header-actions">
                {canEditDelete(selectedDiscussion) && (
                  <>
                    <button className="btn-icon-edit" onClick={handleEditClick} title="Edit">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button className="btn-icon-delete" onClick={handleDeleteDiscussion} title="Delete">
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                      </svg>
                    </button>
                  </>
                )}
                {selectedDiscussion.is_qa &&
                  !selectedDiscussion.is_resolved &&
                  (user?.user_id === selectedDiscussion.user_id || user?.role === 'instructor') && (
                    <button className="btn-resolve" onClick={handleMarkResolved}>
                      Mark as Resolved
                    </button>
                  )}
              </div>
            </div>



            <div className="original-post">
              <div className="post-author-info">
                <span className="author-name">👤 {selectedDiscussion.author_name}</span>
                {selectedDiscussion.author_role === 'instructor' && (
                  <span className="instructor-badge">Instructor</span>
                )}
                <span className="post-time">
                  {formatDistanceToNow(new Date(selectedDiscussion.created_at), { addSuffix: true })}
                </span>
              </div>

              <div className="post-content">
                {selectedDiscussion.content.split('\n').map((paragraph, idx) => (
                  <p key={idx} className="mb-2">{paragraph}</p>
                ))}
              </div>
            </div>

            {/* Edit Modal */}
            {editMode && (
              <div className="modal-overlay" onClick={() => setEditMode(false)}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-header">
                    <h3>Edit Thread</h3>
                    <button className="modal-close" onClick={() => setEditMode(false)}>
                      ✕
                    </button>
                  </div>

                  <div className="modal-body">
                    <div className="form-group">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        placeholder="Edit your question..."
                        className="thread-input thread-textarea"
                        rows={5}
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="modal-footer">
                    <button className="btn-cancel" onClick={() => setEditMode(false)}>
                      Cancel
                    </button>
                    <button className="btn-submit" onClick={handleUpdateDiscussion}>
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Replies */}
            <div className="replies-section">
              <h3>Replies ({selectedDiscussion.replies?.length || 0})</h3>

              {selectedDiscussion.replies?.map((reply) => (
                <div key={reply.reply_id} className="reply-card">
                  <div className="reply-author-info">
                    <span className="author-name">👤 {reply.author_name}</span>
                    {reply.is_instructor_reply && <span className="instructor-badge">Instructor</span>}
                    <span className="reply-time">
                      {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
                    </span>
                  </div>

                  <div className="reply-content">
                    {reply.content.split('\n').map((paragraph, idx) => (
                      <p key={idx} className="mb-2">{paragraph}</p>
                    ))}
                  </div>
                </div>
              ))}

              {/* Reply Form - Only for Instructors/Admins */}
              {['instructor', 'admin'].includes(user?.role) ? (
                <div className="reply-form">
                  <h4>Write a Reply</h4>
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Write your reply..."
                    className="thread-input"
                    rows={4}
                    style={{ resize: 'vertical' }}
                  />
                  <button className="btn-post-reply" onClick={handleReply}>
                    Post Reply
                  </button>
                </div>
              ) : (
                <div className="reply-restricted-message">
                  <p><em>Only instructors can reply to this discussion.</em></p>
                </div>
              )}
            </div>
          </div>
        </div >
      )}
    </div >
  );
};

export default DiscussionBoard;
