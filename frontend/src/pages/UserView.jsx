import React, { useState, useEffect } from 'react';
import { Users, Search, Plus, Edit2, Trash2, Shield, User as UserIcon, X, AlertTriangle } from 'lucide-react';
import { api } from '../api';

export default function UserView({ currentUser, showToast }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'User'
  });

  const loadUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (roleFilter) params.append('role', roleFilter);

      const res = await api.getUsers(`?${params.toString()}`);
      if (res.success) setUsers(res.data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [search, roleFilter]);

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormData({ name: '', email: '', password: '', role: 'User' });
    setShowAddModal(true);
  };

  const handleOpenEdit = (u) => {
    setEditingUser(u);
    setFormData({ name: u.name, email: u.email, password: '', role: u.role });
    setShowAddModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await api.updateUser(editingUser.user_id, formData);
        showToast('User updated successfully.', 'success');
      } else {
        await api.createUser(formData);
        showToast('New user account created.', 'success');
      }
      setShowAddModal(false);
      loadUsers();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async () => {
    if (!deletingUser) return;
    try {
      await api.deleteUser(deletingUser.user_id);
      showToast('User profile and cascading data purged.', 'success');
      setDeletingUser(null);
      loadUsers();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div>
      <div className="filter-bar">
        <div className="filter-group">
          <div className="search-input-wrapper">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              className="input-text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="select-input"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">All Roles</option>
            <option value="Admin">Administrators</option>
            <option value="User">Regular Streamers</option>
          </select>
        </div>

        {currentUser?.role === 'Admin' && (
          <button onClick={handleOpenAdd} className="btn btn-primary">
            <Plus size={16} /> Add User Profile
          </button>
        )}
      </div>

      <div className="table-container">
        {loading ? (
          <div className="loading-box">
            <div className="spinner"></div>
            <p>Querying users from MySQL...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="empty-box">
            <Users size={36} color="var(--text-dim)" />
            <p>No user records found.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>User Details</th>
                <th>Access Role</th>
                <th>Active Membership</th>
                <th>Watch Telemetry</th>
                <th>Reviews</th>
                <th>Joined Date</th>
                {currentUser?.role === 'Admin' && <th style={{ textAlign: 'right' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.user_id}>
                  <td>
                    <div style={{ fontWeight: 600, color: '#fff' }}>{u.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>{u.email}</div>
                  </td>
                  <td>
                    <span className={`user-role-pill ${u.role === 'Admin' ? 'user-role-admin' : 'user-role-user'}`}>
                      {u.role === 'Admin' ? <Shield size={10} style={{ display: 'inline', marginRight: 4 }} /> : null}
                      {u.role}
                    </span>
                  </td>
                  <td>
                    {u.has_active_subscription > 0 ? (
                      <span className="badge badge-active">Active Subscriber</span>
                    ) : (
                      <span className="badge badge-expired">No Active Plan</span>
                    )}
                  </td>
                  <td>{u.total_watched} sessions</td>
                  <td>{u.total_reviews} reviews</td>
                  <td style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  {currentUser?.role === 'Admin' && (
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button onClick={() => handleOpenEdit(u)} className="btn btn-secondary btn-sm" title="Edit User">
                          <Edit2 size={13} />
                        </button>
                        {currentUser?.user_id !== u.user_id && (
                          <button onClick={() => setDeletingUser(u)} className="btn btn-danger btn-sm" title="Delete User">
                            <Trash2 size={13} />
                          </button>
                        )}
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
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h3>{editingUser ? 'Edit User Profile' : 'Create New User Account'}</h3>
              <button onClick={() => setShowAddModal(false)} className="modal-close-btn">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address (Unique Constraint)</label>
                  <input
                    type="email"
                    className="form-input"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    {editingUser ? 'Change Password (leave blank to retain current)' : 'Password (Bcrypt Hashed)'}
                  </label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder={editingUser ? '••••••••' : 'Enter strong password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required={!editingUser}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Authorization Role</label>
                  <select
                    className="form-select"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value="User">User (Standard Access)</option>
                    <option value="Admin">Admin (Full Administrative Privileges)</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingUser ? 'Update Profile' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deletingUser && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--danger)' }}>
                <AlertTriangle size={18} /> Confirm User Account Purge
              </h3>
              <button onClick={() => setDeletingUser(null)} className="modal-close-btn">
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete user <strong>{deletingUser.name}</strong> ({deletingUser.email})?</p>
              <div style={{ background: 'var(--danger-bg)', padding: '12px', borderRadius: '8px', fontSize: '0.82rem', color: '#fca5a5' }}>
                <strong>Foreign Key CASCADE Rule:</strong> This operation will purge their subscriptions, viewing history, and submitted ratings.
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setDeletingUser(null)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={handleDelete} className="btn btn-danger">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
