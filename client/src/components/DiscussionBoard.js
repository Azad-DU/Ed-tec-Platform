import React, { useState, useEffect } from 'react';
import { discussionAPI } from '../services/apiService';
import { useAuth } from '../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import './DiscussionBoard.css';

const DiscussionBoard = ({ moduleId }) => {
  const [discussions, setDiscussions] = useState([]);
  const [selectedDiscussion, setSelectedDiscussion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all'); // all, qa, discussion
  const [sortBy, setSortBy] = useState('recent'); // recent, replies, resolved
  const [showNewThread, setShowNewThread] = useState(false);
  const [newThread, setNewThread] = useState({ title: '', content: '', is_qa: false });
  const [replyContent, setReplyContent] = useState('');
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
    if (!newThread.title.trim() || !newThread.content.trim()) {
      alert('Please provide both title and content');
      return;
    }

    try {
      const response = await discussionAPI.createDiscussion({
        module_id: moduleId,
        title: newThread.title,
        content: newThread.content,
        is_qa: newThread.is_qa,
      });

      if (response.data.success) {
        setNewThread({ title: '', content: '', is_qa: false });
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
      }
    } catch (error) {
      console.error('Failed to load discussion:', error);
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
        // Thread List View
        <div className="thread-list-view">
          <div className="discussion-header">
            <h2>💬 Discussion Board</h2>
            <button className="btn-new-thread" onClick={() => setShowNewThread(true)}>
              + New Thread
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

          {/* New Thread Modal */}
          {showNewThread && (
            <div className="modal-overlay" onClick={() => setShowNewThread(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h3>Create New Thread</h3>
                  <button className="modal-close" onClick={() => setShowNewThread(false)}>
                    ✕
                  </button>
                </div>

                <div className="modal-body">
                  <div className="form-group">
                    <label>Title</label>
                    <input
                      type="text"
                      value={newThread.title}
                      onChange={(e) => setNewThread({ ...newThread, title: e.target.value })}
                      placeholder="Enter thread title..."
                      className="thread-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>Content</label>
                    <textarea
                      value={newThread.content}
                      onChange={(e) => setNewThread({ ...newThread, content: e.target.value })}
                      placeholder="Write your question or discussion topic..."
                      className="thread-input"
                      rows={6}
                      style={{ resize: 'vertical' }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={newThread.is_qa}
                        onChange={(e) => setNewThread({ ...newThread, is_qa: e.target.checked })}
                      />
                      <span>This is a Q&A question</span>
                    </label>
                  </div>
                </div>

                <div className="modal-footer">
                  <button className="btn-cancel" onClick={() => setShowNewThread(false)}>
                    Cancel
                  </button>
                  <button className="btn-submit" onClick={handleCreateThread}>
                    Create Thread
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

              {selectedDiscussion.is_qa &&
                !selectedDiscussion.is_resolved &&
                (user?.user_id === selectedDiscussion.user_id || user?.role === 'instructor') && (
                  <button className="btn-resolve" onClick={handleMarkResolved}>
                    Mark as Resolved
                  </button>
                )}
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

              {/* Reply Form */}
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscussionBoard;
