import React, { useState, useEffect } from 'react';
import { Star, Plus, Trash2, X, MessageSquare, Filter } from 'lucide-react';
import { api } from '../api';

export default function RatingView({ currentUser, showToast }) {
  const [ratings, setRatings] = useState([]);
  const [contentList, setContentList] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contentFilter, setContentFilter] = useState('');

  // Add / Edit Modal
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    user_id: '',
    content_id: '',
    rating: 5.0,
    review: ''
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const params = contentFilter ? `?content_id=${contentFilter}` : '';
      const [ratRes, contRes, userRes] = await Promise.all([
        api.getRatings(params),
        api.getContent(),
        api.getUsers()
      ]);

      if (ratRes.success) setRatings(ratRes.data);
      if (contRes.success) {
        setContentList(contRes.data);
        if (contRes.data.length > 0 && !formData.content_id) {
          setFormData((prev) => ({ ...prev, content_id: contRes.data[0].content_id }));
        }
      }
      if (userRes.success) {
        setUsers(userRes.data);
        if (userRes.data.length > 0 && !formData.user_id) {
          setFormData((prev) => ({ ...prev, user_id: userRes.data[0].user_id }));
        }
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [contentFilter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createRating({
        user_id: parseInt(formData.user_id, 10),
        content_id: parseInt(formData.content_id, 10),
        rating: parseFloat(formData.rating),
        review: formData.review
      });
      showToast('Rating and review recorded (handled via UNIQUE constraint upsert).', 'success');
      setShowModal(false);
      loadData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteRating(id);
      showToast('Review removed.', 'success');
      loadData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div>
      <div className="filter-bar">
        <div className="filter-group">
          <select
            className="select-input"
            value={contentFilter}
            onChange={(e) => setContentFilter(e.target.value)}
          >
            <option value="">All Content Titles</option>
            {contentList.map((c) => (
              <option key={c.content_id} value={c.content_id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>

        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          <Plus size={16} /> Submit / Update Rating
        </button>
      </div>

      <div className="table-container">
        {loading ? (
          <div className="loading-box">
            <div className="spinner"></div>
            <p>Loading reviews from MySQL...</p>
          </div>
        ) : ratings.length === 0 ? (
          <div className="empty-box">
            <Star size={36} color="var(--text-dim)" />
            <p>No ratings match filter.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Content Asset</th>
                <th>Reviewer</th>
                <th>Score (1.0 - 5.0)</th>
                <th>Qualitative Review</th>
                <th>Submitted</th>
                {currentUser?.role === 'Admin' && <th style={{ textAlign: 'right' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {ratings.map((r) => (
                <tr key={r.rating_id}>
                  <td>
                    <div style={{ fontWeight: 600, color: '#fff' }}>{r.content_title}</div>
                    <span className={`badge ${r.content_type === 'Movie' ? 'badge-movie' : 'badge-series'}`}>
                      {r.content_type}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginLeft: '6px' }}>{r.genre_name}</span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{r.user_name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>{r.user_email}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Star size={15} color="#fbbf24" fill="#fbbf24" />
                      <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#fbbf24' }}>
                        {parseFloat(r.rating).toFixed(1)}
                      </span>
                    </div>
                  </td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)', maxWidth: '380px' }}>
                    {r.review || 'No written critique.'}
                  </td>
                  <td style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                    {new Date(r.created_at).toLocaleDateString()}
                  </td>
                  {currentUser?.role === 'Admin' && (
                    <td style={{ textAlign: 'right' }}>
                      <button onClick={() => handleDelete(r.rating_id)} className="btn btn-danger btn-sm" title="Delete Review">
                        <Trash2 size={13} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add / Upsert Rating Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h3>Submit or Update Rating</h3>
              <button onClick={() => setShowModal(false)} className="modal-close-btn">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: '8px', padding: '12px', fontSize: '0.82rem', color: '#c7d2fe' }}>
                  <strong>Composite Key & Trigger Notice:</strong> The table enforces `UNIQUE(user_id, content_id)`. If the user has already reviewed this item, their rating will be updated smoothly via `ON DUPLICATE KEY UPDATE`.
                </div>

                <div className="form-group">
                  <label className="form-label">Reviewer (user_id FK)</label>
                  <select
                    className="form-select"
                    value={formData.user_id}
                    onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                    required
                  >
                    {users.map((u) => (
                      <option key={u.user_id} value={u.user_id}>
                        {u.name} ({u.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Content Asset (content_id FK)</label>
                  <select
                    className="form-select"
                    value={formData.content_id}
                    onChange={(e) => setFormData({ ...formData, content_id: e.target.value })}
                    required
                  >
                    {contentList.map((c) => (
                      <option key={c.content_id} value={c.content_id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Rating Score (CHECK &gt;= 1.0 AND &lt;= 5.0): {formData.rating} ★</label>
                  <input
                    type="range"
                    min="1.0"
                    max="5.0"
                    step="0.1"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                    style={{ width: '100%', accentColor: 'var(--primary)' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    <span>1.0 (Poor)</span>
                    <span>3.0 (Average)</span>
                    <span>5.0 (Masterpiece)</span>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Review Comments</label>
                  <textarea
                    className="form-textarea"
                    rows="3"
                    placeholder="Write detailed critique or audience impressions..."
                    value={formData.review}
                    onChange={(e) => setFormData({ ...formData, review: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Rating
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
