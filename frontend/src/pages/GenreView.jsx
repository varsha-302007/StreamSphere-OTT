import React, { useState, useEffect } from 'react';
import { Layers, Plus, Edit2, Trash2, X, AlertCircle } from 'lucide-react';
import { api } from '../api';

export default function GenreView({ currentUser, showToast }) {
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [editingGenre, setEditingGenre] = useState(null);
  const [deletingGenre, setDeletingGenre] = useState(null);

  const [formData, setFormData] = useState({
    genre_name: '',
    description: ''
  });

  const loadGenres = async () => {
    try {
      setLoading(true);
      const res = await api.getGenres();
      if (res.success) setGenres(res.data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGenres();
  }, []);

  const handleOpenAdd = () => {
    setEditingGenre(null);
    setFormData({ genre_name: '', description: '' });
    setShowModal(true);
  };

  const handleOpenEdit = (g) => {
    setEditingGenre(g);
    setFormData({ genre_name: g.genre_name, description: g.description || '' });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingGenre) {
        await api.updateGenre(editingGenre.genre_id, formData);
        showToast('Genre updated successfully.', 'success');
      } else {
        await api.createGenre(formData);
        showToast('New genre created.', 'success');
      }
      setShowModal(false);
      loadGenres();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async () => {
    if (!deletingGenre) return;
    try {
      await api.deleteGenre(deletingGenre.genre_id);
      showToast('Genre deleted successfully.', 'success');
      setDeletingGenre(null);
      loadGenres();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div>
      <div className="filter-bar">
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Content Categorization System</h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
            Lookup table normalized to 3NF to prevent repetitive classification strings.
          </p>
        </div>

        {currentUser?.role === 'Admin' && (
          <button onClick={handleOpenAdd} className="btn btn-primary">
            <Plus size={16} /> Add New Genre
          </button>
        )}
      </div>

      <div className="table-container">
        {loading ? (
          <div className="loading-box">
            <div className="spinner"></div>
            <p>Loading genres from MySQL...</p>
          </div>
        ) : genres.length === 0 ? (
          <div className="empty-box">
            <Layers size={36} color="var(--text-dim)" />
            <p>No genres created yet.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Genre Name</th>
                <th>Description</th>
                <th>Assigned Catalog Items</th>
                {currentUser?.role === 'Admin' && <th style={{ textAlign: 'right' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {genres.map((g) => (
                <tr key={g.genre_id}>
                  <td style={{ fontWeight: 600, color: '#fff' }}>
                    {g.genre_name}
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem', maxWidth: '400px' }}>
                    {g.description || '—'}
                  </td>
                  <td>
                    <span className="badge" style={{ background: 'rgba(99,102,241,0.12)', color: '#818cf8' }}>
                      {g.total_content} titles
                    </span>
                  </td>
                  {currentUser?.role === 'Admin' && (
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button onClick={() => handleOpenEdit(g)} className="btn btn-secondary btn-sm" title="Edit Genre">
                          <Edit2 size={13} />
                        </button>
                        <button onClick={() => setDeletingGenre(g)} className="btn btn-danger btn-sm" title="Delete Genre">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h3>{editingGenre ? 'Edit Genre' : 'Create Genre Category'}</h3>
              <button onClick={() => setShowModal(false)} className="modal-close-btn">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Genre Name (UNIQUE)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Cyberpunk / Psychological Thriller"
                    value={formData.genre_name}
                    onChange={(e) => setFormData({ ...formData, genre_name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-textarea"
                    rows="3"
                    placeholder="Brief description of cinematic themes..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingGenre ? 'Update Genre' : 'Save Genre'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingGenre && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--danger)' }}>
                <AlertCircle size={18} /> Delete Genre: {deletingGenre.genre_name}
              </h3>
              <button onClick={() => setDeletingGenre(null)} className="modal-close-btn">
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete this genre?</p>
              {deletingGenre.total_content > 0 ? (
                <div style={{ background: 'var(--danger-bg)', padding: '12px', borderRadius: '8px', fontSize: '0.82rem', color: '#fca5a5' }}>
                  <strong>Foreign Key RESTRICT Rule:</strong> Deletion will fail if titles ({deletingGenre.total_content}) are assigned to this genre. Reassign them first.
                </div>
              ) : (
                <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>
                  This genre has 0 assigned content assets and can be safely removed.
                </p>
              )}
            </div>
            <div className="modal-footer">
              <button onClick={() => setDeletingGenre(null)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={handleDelete} className="btn btn-danger">
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
