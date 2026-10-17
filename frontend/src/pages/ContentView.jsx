import React, { useState, useEffect } from 'react';
import { 
  Film, Search, Plus, Edit2, Trash2, Eye, Star, Filter, 
  X, Check, AlertTriangle, Play 
} from 'lucide-react';
import { api } from '../api';

export default function ContentView({ user, showToast }) {
  const [contentList, setContentList] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [genreId, setGenreId] = useState('');
  const [contentType, setContentType] = useState('');
  const [sortBy, setSortBy] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    content_type: 'Movie',
    genre_id: '',
    release_year: 2024,
    duration_minutes: 120,
    description: '',
    availability_status: 'Available'
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (genreId) params.append('genre_id', genreId);
      if (contentType) params.append('content_type', contentType);
      if (sortBy) params.append('sort_by', sortBy);

      const [contentRes, genreRes] = await Promise.all([
        api.getContent(`?${params.toString()}`),
        api.getGenres()
      ]);

      if (contentRes.success) setContentList(contentRes.data);
      if (genreRes.success) setGenres(genreRes.data);
    } catch (err) {
      showToast(err.message || 'Error fetching content catalog', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, genreId, contentType, sortBy]);

  const handleOpenAdd = () => {
    setFormData({
      title: '',
      content_type: 'Movie',
      genre_id: genres[0]?.genre_id || '',
      release_year: new Date().getFullYear(),
      duration_minutes: 120,
      description: '',
      availability_status: 'Available'
    });
    setEditingItem(null);
    setShowAddModal(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      content_type: item.content_type,
      genre_id: item.genre_id,
      release_year: item.release_year,
      duration_minutes: item.duration_minutes || '',
      description: item.description || '',
      availability_status: item.availability_status
    });
    setShowAddModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        genre_id: parseInt(formData.genre_id, 10),
        release_year: parseInt(formData.release_year, 10),
        duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes, 10) : null
      };

      if (editingItem) {
        await api.updateContent(editingItem.content_id, payload);
        showToast('Title updated successfully in MySQL database.', 'success');
      } else {
        await api.createContent(payload);
        showToast('New title added to catalog.', 'success');
      }
      setShowAddModal(false);
      loadData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async () => {
    if (!deletingItem) return;
    try {
      await api.deleteContent(deletingItem.content_id);
      showToast('Content and associated records purged.', 'success');
      setDeletingItem(null);
      loadData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleViewDetails = async (id) => {
    try {
      const res = await api.getContentById(id);
      if (res.success) {
        setViewingItem(res.data);
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div>
      {/* Filter and Search Bar */}
      <div className="filter-bar">
        <div className="filter-group">
          <div className="search-input-wrapper">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              className="input-text"
              placeholder="Search by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="select-input"
            value={genreId}
            onChange={(e) => setGenreId(e.target.value)}
          >
            <option value="">All Genres</option>
            {genres.map((g) => (
              <option key={g.genre_id} value={g.genre_id}>
                {g.genre_name}
              </option>
            ))}
          </select>

          <select
            className="select-input"
            value={contentType}
            onChange={(e) => setContentType(e.target.value)}
          >
            <option value="">All Formats</option>
            <option value="Movie">Movies</option>
            <option value="Series">Web Series</option>
          </select>

          <select
            className="select-input"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="">Sort: Newest</option>
            <option value="rating">Sort: Highest Rated</option>
            <option value="views">Sort: Most Streamed</option>
            <option value="year">Sort: Release Year</option>
          </select>
        </div>

        {user?.role === 'Admin' && (
          <button onClick={handleOpenAdd} className="btn btn-primary">
            <Plus size={16} /> Add Content Title
          </button>
        )}
      </div>

      {/* Content Table */}
      <div className="table-container">
        {loading ? (
          <div className="loading-box">
            <div className="spinner"></div>
            <p>Fetching content catalog from MySQL...</p>
          </div>
        ) : contentList.length === 0 ? (
          <div className="empty-box">
            <Film size={36} color="var(--text-dim)" />
            <p>No content matches your filters.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Genre</th>
                <th>Year</th>
                <th>Duration</th>
                <th>Rating</th>
                <th>Streams</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {contentList.map((item) => (
                <tr key={item.content_id}>
                  <td>
                    <div style={{ fontWeight: 600, color: '#fff' }}>{item.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', maxWidth: '280px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.description}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${item.content_type === 'Movie' ? 'badge-movie' : 'badge-series'}`}>
                      {item.content_type}
                    </span>
                  </td>
                  <td>{item.genre_name}</td>
                  <td>{item.release_year}</td>
                  <td>{item.duration_minutes ? `${item.duration_minutes}m` : 'Multi-Ep'}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Star size={14} color="#fbbf24" fill="#fbbf24" />
                      <span style={{ fontWeight: 700 }}>{item.avg_rating > 0 ? item.avg_rating : '—'}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>({item.total_ratings})</span>
                    </div>
                  </td>
                  <td>{item.total_views} views</td>
                  <td>
                    <span className={`badge ${item.availability_status === 'Available' ? 'badge-available' : 'badge-coming'}`}>
                      {item.availability_status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <button 
                        onClick={() => handleViewDetails(item.content_id)} 
                        className="btn btn-secondary btn-sm"
                        title="View details & reviews"
                      >
                        <Eye size={13} />
                      </button>
                      {user?.role === 'Admin' && (
                        <>
                          <button 
                            onClick={() => handleOpenEdit(item)} 
                            className="btn btn-secondary btn-sm"
                            title="Edit content"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button 
                            onClick={() => setDeletingItem(item)} 
                            className="btn btn-danger btn-sm"
                            title="Delete content"
                          >
                            <Trash2 size={13} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add / Edit Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h3>{editingItem ? 'Edit Content Details' : 'Add New Content Asset'}</h3>
              <button onClick={() => setShowAddModal(false)} className="modal-close-btn">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Asset Title</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Format Type</label>
                    <select
                      className="form-select"
                      value={formData.content_type}
                      onChange={(e) => setFormData({ ...formData, content_type: e.target.value })}
                    >
                      <option value="Movie">Movie</option>
                      <option value="Series">Series</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Genre Category</label>
                    <select
                      className="form-select"
                      value={formData.genre_id}
                      onChange={(e) => setFormData({ ...formData, genre_id: e.target.value })}
                      required
                    >
                      {genres.map((g) => (
                        <option key={g.genre_id} value={g.genre_id}>
                          {g.genre_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Release Year (1900-2100)</label>
                    <input
                      type="number"
                      className="form-input"
                      min="1900"
                      max="2100"
                      value={formData.release_year}
                      onChange={(e) => setFormData({ ...formData, release_year: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Duration (Minutes)</label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="Optional for series"
                      value={formData.duration_minutes}
                      onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Availability Status</label>
                  <select
                    className="form-select"
                    value={formData.availability_status}
                    onChange={(e) => setFormData({ ...formData, availability_status: e.target.value })}
                  >
                    <option value="Available">Available</option>
                    <option value="Coming Soon">Coming Soon</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Plot Synopsis</label>
                  <textarea
                    className="form-textarea"
                    rows="3"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingItem ? 'Save Changes' : 'Insert to MySQL'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingItem && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--danger)' }}>
                <AlertTriangle size={18} /> Confirm Cascading Deletion
              </h3>
              <button onClick={() => setDeletingItem(null)} className="modal-close-btn">
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to permanently delete <strong>{deletingItem.title}</strong>?</p>
              <div style={{ background: 'var(--danger-bg)', padding: '12px', borderRadius: '8px', fontSize: '0.82rem', color: '#fca5a5' }}>
                <strong>Relational Integrity Notice:</strong> All associated viewing history telemetry and reviews in the `WatchHistory` and `Ratings` tables will also be purged via `ON DELETE CASCADE`.
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setDeletingItem(null)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={handleDelete} className="btn btn-danger">
                Execute Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details View Modal */}
      {viewingItem && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3>{viewingItem.title}</h3>
              <button onClick={() => setViewingItem(null)} className="modal-close-btn">
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span className={`badge ${viewingItem.content_type === 'Movie' ? 'badge-movie' : 'badge-series'}`}>
                  {viewingItem.content_type}
                </span>
                <span className="badge" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  {viewingItem.genre_name}
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {viewingItem.release_year} • {viewingItem.duration_minutes ? `${viewingItem.duration_minutes}m` : 'Multi-Episode'}
                </span>
              </div>

              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                {viewingItem.description || 'No synopsis provided.'}
              </p>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                <h4 style={{ fontSize: '0.9rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Star size={16} color="#fbbf24" fill="#fbbf24" />
                  User Reviews & Ratings ({viewingItem.reviews?.length || 0})
                </h4>

                {viewingItem.reviews?.length === 0 ? (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>No reviews submitted for this title yet.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {viewingItem.reviews?.map((r) => (
                      <div key={r.rating_id} style={{ background: 'rgba(255,255,255,0.03)', padding: '10px 14px', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                          <span style={{ fontWeight: 600 }}>{r.user_name}</span>
                          <span style={{ color: '#fbbf24', fontWeight: 700 }}>★ {r.rating} / 5</span>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{r.review}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setViewingItem(null)} className="btn btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
