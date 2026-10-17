import React, { useState, useEffect } from 'react';
import { CreditCard, Plus, Edit2, Trash2, X, Check, AlertCircle } from 'lucide-react';
import { api } from '../api';

export default function PlanView({ currentUser, showToast }) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [deletingPlan, setDeletingPlan] = useState(null);

  const [formData, setFormData] = useState({
    plan_name: '',
    price: 499.00,
    duration_days: 30,
    description: ''
  });

  const loadPlans = async () => {
    try {
      setLoading(true);
      const res = await api.getPlans();
      if (res.success) setPlans(res.data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const handleOpenAdd = () => {
    setEditingPlan(null);
    setFormData({ plan_name: '', price: 499.00, duration_days: 30, description: '' });
    setShowModal(true);
  };

  const handleOpenEdit = (p) => {
    setEditingPlan(p);
    setFormData({
      plan_name: p.plan_name,
      price: p.price,
      duration_days: p.duration_days,
      description: p.description || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPlan) {
        await api.updatePlan(editingPlan.plan_id, formData);
        showToast('Subscription plan updated.', 'success');
      } else {
        await api.createPlan(formData);
        showToast('New subscription plan created.', 'success');
      }
      setShowModal(false);
      loadPlans();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async () => {
    if (!deletingPlan) return;
    try {
      await api.deletePlan(deletingPlan.plan_id);
      showToast('Plan deleted successfully.', 'success');
      setDeletingPlan(null);
      loadPlans();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div>
      <div className="filter-bar">
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Subscription Tier Definitions</h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
            Configures monetary billing amounts, duration terms, and streaming quality entitlements.
          </p>
        </div>

        {currentUser?.role === 'Admin' && (
          <button onClick={handleOpenAdd} className="btn btn-primary">
            <Plus size={16} /> Create Plan Tier
          </button>
        )}
      </div>

      <div className="table-container">
        {loading ? (
          <div className="loading-box">
            <div className="spinner"></div>
            <p>Loading plans from MySQL...</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Plan Name</th>
                <th>Price (INR)</th>
                <th>Validity (Days)</th>
                <th>Features / Description</th>
                <th>Active Subscribers</th>
                <th>Total Sold</th>
                {currentUser?.role === 'Admin' && <th style={{ textAlign: 'right' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {plans.map((p) => (
                <tr key={p.plan_id}>
                  <td style={{ fontWeight: 600, color: '#fff' }}>
                    {p.plan_name}
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: '#34d399', fontSize: '0.95rem' }}>
                      ₹{parseFloat(p.price).toFixed(2)}
                    </span>
                  </td>
                  <td>
                    <span className="badge" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      {p.duration_days} days
                    </span>
                  </td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)', maxWidth: '300px' }}>
                    {p.description || '—'}
                  </td>
                  <td>
                    <span className="badge badge-active">
                      {p.active_subscribers} active
                    </span>
                  </td>
                  <td>{p.total_subscribers} transactions</td>
                  {currentUser?.role === 'Admin' && (
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button onClick={() => handleOpenEdit(p)} className="btn btn-secondary btn-sm" title="Edit Plan">
                          <Edit2 size={13} />
                        </button>
                        <button onClick={() => setDeletingPlan(p)} className="btn btn-danger btn-sm" title="Delete Plan">
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
              <h3>{editingPlan ? 'Edit Plan Tier' : 'Create Subscription Plan'}</h3>
              <button onClick={() => setShowModal(false)} className="modal-close-btn">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Plan Name (UNIQUE)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.plan_name}
                    onChange={(e) => setFormData({ ...formData, plan_name: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Price (CHECK &gt;= 0.00)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="form-input"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Duration in Days (CHECK &gt; 0)</label>
                    <input
                      type="number"
                      min="1"
                      className="form-input"
                      value={formData.duration_days}
                      onChange={(e) => setFormData({ ...formData, duration_days: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Perks & Features Description</label>
                  <textarea
                    className="form-textarea"
                    rows="3"
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
                  {editingPlan ? 'Update Plan' : 'Save Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deletingPlan && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--danger)' }}>
                <AlertCircle size={18} /> Delete Plan Tier
              </h3>
              <button onClick={() => setDeletingPlan(null)} className="modal-close-btn">
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete <strong>{deletingPlan.plan_name}</strong>?</p>
              <div style={{ background: 'var(--danger-bg)', padding: '12px', borderRadius: '8px', fontSize: '0.82rem', color: '#fca5a5' }}>
                <strong>Foreign Key RESTRICT Rule:</strong> Deleting a plan referenced by active or historical subscriptions will be rejected by the MySQL constraint engine.
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setDeletingPlan(null)} className="btn btn-secondary">
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
