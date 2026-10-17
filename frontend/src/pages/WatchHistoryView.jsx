import React, { useState, useEffect } from 'react';
import { Clock, Plus, Play, Trash2, X, Search } from 'lucide-react';
import { api } from '../api';

export default function WatchHistoryView({ currentUser, showToast }) {
  const [history, setHistory] = useState([]);
  const [users, setUsers] = useState([]);
  const [contentList, setContentList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter
  const [userFilter, setUserFilter] = useState('');

  // Add Modal
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    user_id: '',
    content_id: '',
    progress_minutes: 45
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const params = userFilter ? `?user_id=${userFilter}` : '';
      const [histRes, userRes, contRes] = await Promise.all([
        api.getWatchHistory(params),
        api.getUsers(),
        api.getContent()
      ]);

      if (histRes.success) setHistory(histRes.data);
      if (userRes.success) {
        setUsers(userRes.data);
        if (userRes.data.length > 0 && !formData.user_id) {
          setFormData((prev) => ({ ...prev, user_id: userRes.data[0].user_id }));
        }
      }
      if (contRes.success) {
        setContentList(contRes.data);
        if (contRes.data.length > 0 && !formData.content_id) {
          setFormData((prev) => ({ ...prev, content_id: contRes.data[0].content_id }));
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
  }, [userFilter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createWatchHistory({
        user_id: parseInt(formData.user_id, 10),
        content_id: parseInt(formData.content_id, 10),
        progress_minutes: parseInt(formData.progress_minutes, 10)
      });
      showToast('Viewing telemetry recorded in WatchHistory.', 'success');
      setShowModal(false);
      loadData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteWatchHistory(id);
      showToast('Watch history entry deleted.', 'success');
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
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
          >
            <option value="">All Users Telemetry</option>
            {users.map((u) => (
              <option key={u.user_id} value={u.user_id}>
                {u.name} ({u.email})
              </option>
            ))}
          </select>
        </div>

        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          <Plus size={16} /> Log Playback Telemetry
        </button>
      </div>

      <div className="table-container">
        {loading ? (
          <div className="loading-box">
            <div className="spinner"></div>
            <p>Loading telemetry logs from MySQL...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="empty-box">
            <Clock size={36} color="var(--text-dim)" />
            <p>No watch telemetry recorded yet.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Subscriber (user_id FK)</th>
                <th>Content Asset (content_id FK)</th>
                <th>Format & Genre</th>
                <th>Playback Duration</th>
                <th>Playback Timestamp</th>
                {currentUser?.role === 'Admin' && <th style={{ textAlign: 'right' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {history.map((h) => (
                <tr key={h.history_id}>
                  <td>
                    <div style={{ fontWeight: 600, color: '#fff' }}>{h.user_name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>{h.user_email}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{h.content_title}</div>
                  </td>
                  <td>
                    <span className={`badge ${h.content_type === 'Movie' ? 'badge-movie' : 'badge-series'}`}>
                      {h.content_type}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginLeft: '8px' }}>
                      {h.genre_name}
                    </span>
                  </td>
                  <td>
                    <span className="badge" style={{ background: 'rgba(6,182,212,0.12)', color: '#22d3ee' }}>
                      <Play size={10} style={{ display: 'inline', marginRight: 4 }} />
                      {h.progress_minutes} minutes
                    </span>
                  </td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>
                    {new Date(h.watched_at).toLocaleString()}
                  </td>
                  {currentUser?.role === 'Admin' && (
                    <td style={{ textAlign: 'right' }}>
                      <button onClick={() => handleDelete(h.history_id)} className="btn btn-danger btn-sm" title="Delete Log">
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

      {/* Log Playback Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h3>Record Playback Telemetry Event</h3>
              <button onClick={() => setShowModal(false)} className="modal-close-btn">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">User Account (user_id FK)</label>
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
                  <label className="form-label">Streamed Content (content_id FK)</label>
                  <select
                    className="form-select"
                    value={formData.content_id}
                    onChange={(e) => setFormData({ ...formData, content_id: e.target.value })}
                    required
                  >
                    {contentList.map((c) => (
                      <option key={c.content_id} value={c.content_id}>
                        {c.title} ({c.content_type} — {c.genre_name})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Progress Streamed in Minutes (CHECK &gt;= 0)</label>
                  <input
                    type="number"
                    min="0"
                    className="form-input"
                    value={formData.progress_minutes}
                    onChange={(e) => setFormData({ ...formData, progress_minutes: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Insert Telemetry Row
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
