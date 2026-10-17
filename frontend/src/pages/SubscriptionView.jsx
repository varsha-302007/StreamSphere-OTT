import React, { useState, useEffect } from 'react';
import { CreditCard, Plus, Filter, Calendar, CheckCircle2, Clock, X, AlertTriangle } from 'lucide-react';
import { api } from '../api';

export default function SubscriptionView({ currentUser, showToast }) {
  const [subscriptions, setSubscriptions] = useState([]);
  const [users, setUsers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  // Register Modal (Stored Procedure Runner)
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

  const loadData = async () => {
    try {
      setLoading(true);
      const params = statusFilter ? `?status=${statusFilter}` : '';
      const [subRes, userRes, planRes] = await Promise.all([
        api.getSubscriptions(params),
        api.getUsers(),
        api.getPlans()
      ]);

      if (subRes.success) setSubscriptions(subRes.data);
      if (userRes.success) setUsers(userRes.data);
      if (planRes.success) setPlans(planRes.data);

      if (userRes.data?.length > 0 && !selectedUser) setSelectedUser(userRes.data[0].user_id);
      if (planRes.data?.length > 0 && !selectedPlan) setSelectedPlan(planRes.data[0].plan_id);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const handleRegisterSubscription = async (e) => {
    e.preventDefault();
    try {
      // Calls Stored Procedure: sp_register_subscription
      const res = await api.createSubscription({
        user_id: parseInt(selectedUser, 10),
        plan_id: parseInt(selectedPlan, 10),
        start_date: startDate
      });
      showToast(res.message || 'Stored procedure activated subscription!', 'success');
      setShowRegisterModal(false);
      loadData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleCancelSubscription = async (id) => {
    try {
      await api.updateSubscription(id, { status: 'Cancelled' });
      showToast('Subscription status updated to Cancelled.', 'success');
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
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Subscription States</option>
            <option value="Active">Active Entitlements</option>
            <option value="Expired">Expired Subscriptions</option>
            <option value="Cancelled">Cancelled Subscriptions</option>
          </select>
        </div>

        <button onClick={() => setShowRegisterModal(true)} className="btn btn-primary">
          <Plus size={16} /> Register Subscription (Stored Procedure)
        </button>
      </div>

      <div className="table-container">
        {loading ? (
          <div className="loading-box">
            <div className="spinner"></div>
            <p>Querying subscriptions from MySQL...</p>
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="empty-box">
            <CreditCard size={36} color="var(--text-dim)" />
            <p>No subscription records found matching filter.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Subscriber</th>
                <th>Plan Tier</th>
                <th>Term Window</th>
                <th>Days Remaining</th>
                <th>Amount Paid</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((s) => (
                <tr key={s.subscription_id}>
                  <td>
                    <div style={{ fontWeight: 600, color: '#fff' }}>{s.user_name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>{s.user_email}</div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, color: '#c7d2fe' }}>{s.plan_name}</span>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{s.duration_days} days term</div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.82rem' }}>
                      {new Date(s.start_date).toLocaleDateString()} &rarr; {new Date(s.end_date).toLocaleDateString()}
                    </div>
                  </td>
                  <td>
                    {s.status === 'Active' ? (
                      <span className="badge" style={{ background: s.days_remaining > 5 ? 'var(--success-bg)' : 'var(--warning-bg)', color: s.days_remaining > 5 ? '#34d399' : '#fbbf24' }}>
                        <Clock size={11} style={{ display: 'inline', marginRight: 3 }} />
                        {s.days_remaining} days left
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>0 days</span>
                    )}
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: '#fff' }}>
                      ₹{parseFloat(s.amount_paid).toFixed(2)}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${s.status === 'Active' ? 'badge-active' : s.status === 'Expired' ? 'badge-expired' : 'badge-cancelled'}`}>
                      {s.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {s.status === 'Active' && (
                      <button 
                        onClick={() => handleCancelSubscription(s.subscription_id)} 
                        className="btn btn-secondary btn-sm"
                        title="Cancel Subscription"
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Register Subscription via Stored Procedure Modal */}
      {showRegisterModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h3>Execute Stored Procedure: sp_register_subscription</h3>
              <button onClick={() => setShowRegisterModal(false)} className="modal-close-btn">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleRegisterSubscription}>
              <div className="modal-body">
                <div style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: '8px', padding: '12px', fontSize: '0.82rem', color: '#c7d2fe' }}>
                  <strong>Stored Procedure Logic:</strong> Validates user and plan IDs, computes end date using `DATE_ADD`, marks prior active subscriptions as 'Expired' atomically within a database transaction, and commits new subscription record.
                </div>

                <div className="form-group">
                  <label className="form-label">Select Subscriber (user_id FK)</label>
                  <select
                    className="form-select"
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
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
                  <label className="form-label">Select Plan Tier (plan_id FK)</label>
                  <select
                    className="form-select"
                    value={selectedPlan}
                    onChange={(e) => setSelectedPlan(e.target.value)}
                    required
                  >
                    {plans.map((p) => (
                      <option key={p.plan_id} value={p.plan_id}>
                        {p.plan_name} — ₹{p.price} ({p.duration_days} days)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Subscription Start Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowRegisterModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Execute Stored Procedure
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
