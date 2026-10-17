import React, { useState, useEffect } from 'react';
import { 
  Users, Film, CreditCard, DollarSign, Star, TrendingUp, Clock, 
  Sparkles, PlayCircle, Layers, RefreshCw 
} from 'lucide-react';
import { api } from '../api';

export default function DashboardView({ onNavigate }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getStats();
      if (res.success) {
        setStats(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading && !stats) {
    return (
      <div className="loading-box">
        <div className="spinner"></div>
        <p>Querying relational database metrics...</p>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="empty-box">
        <p style={{ color: 'var(--danger)' }}>{error}</p>
        <button onClick={fetchStats} className="btn btn-secondary btn-sm">
          <RefreshCw size={14} /> Retry Query
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* KPI Cards Row */}
      <div className="stats-grid">
        <div className="stat-card">
          <div>
            <div className="stat-label">Total Registered Users</div>
            <div className="stat-value">{stats?.total_users ?? 0}</div>
            <div className="stat-sub">Accounts in MySQL Users table</div>
          </div>
          <div className="stat-icon icon-indigo">
            <Users size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Catalog Media Assets</div>
            <div className="stat-value">{stats?.total_content ?? 0}</div>
            <div className="stat-sub">{stats?.total_movies ?? 0} Movies • {stats?.total_series ?? 0} Series</div>
          </div>
          <div className="stat-icon icon-cyan">
            <Film size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Active Subscriptions</div>
            <div className="stat-value">{stats?.active_subscriptions ?? 0}</div>
            <div className="stat-sub">Current active memberships</div>
          </div>
          <div className="stat-icon icon-emerald">
            <CreditCard size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Platform Gross Revenue</div>
            <div className="stat-value">₹{(stats?.total_revenue ?? 0).toLocaleString()}</div>
            <div className="stat-sub">Active ARR: ₹{(stats?.active_revenue ?? 0).toLocaleString()}</div>
          </div>
          <div className="stat-icon icon-amber">
            <DollarSign size={24} />
          </div>
        </div>
      </div>

      {/* Main Grid: Genre Breakdown & Popular Titles */}
      <div className="dashboard-grid">
        {/* Left Column: Popular Content & Telemetry */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="panel-card">
            <div className="panel-header">
              <div className="panel-title">
                <TrendingUp size={18} color="var(--primary)" />
                Top Performing Titles
              </div>
              <button 
                onClick={() => onNavigate('content')} 
                className="btn btn-secondary btn-sm"
              >
                View Full Catalog
              </button>
            </div>

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Title & Type</th>
                    <th>Genre</th>
                    <th>Streams</th>
                    <th>Average Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.popular_content?.map((item) => (
                    <tr key={item.content_id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{item.title}</div>
                        <span className={`badge ${item.content_type === 'Movie' ? 'badge-movie' : 'badge-series'}`}>
                          {item.content_type}
                        </span>
                      </td>
                      <td>
                        <span style={{ color: 'var(--text-muted)' }}>{item.genre_name}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <PlayCircle size={15} color="var(--accent-cyan)" />
                          <span style={{ fontWeight: 700 }}>{item.views}</span> views
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Star size={15} color="#fbbf24" fill="#fbbf24" />
                          <span style={{ fontWeight: 700 }}>{item.avg_rating > 0 ? item.avg_rating : 'N/A'}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Playback Telemetry */}
          <div className="panel-card">
            <div className="panel-header">
              <div className="panel-title">
                <Clock size={18} color="var(--accent-cyan)" />
                Recent Streaming Telemetry (WatchHistory)
              </div>
              <button 
                onClick={() => onNavigate('watch-history')} 
                className="btn btn-secondary btn-sm"
              >
                Telemetry Logs
              </button>
            </div>

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Content Streamed</th>
                    <th>Progress</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.recent_activity?.map((log) => (
                    <tr key={log.history_id}>
                      <td style={{ fontWeight: 600 }}>{log.user_name}</td>
                      <td>{log.content_title}</td>
                      <td>
                        <span className="badge" style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8' }}>
                          {log.progress_minutes} mins
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-dim)', fontSize: '0.78rem' }}>
                        {new Date(log.watched_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Genre Distribution & Quick Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="panel-card">
            <div className="panel-header">
              <div className="panel-title">
                <Layers size={18} color="var(--accent-purple)" />
                Genre Distribution
              </div>
              <button onClick={() => onNavigate('genres')} className="btn btn-secondary btn-sm">
                Manage
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {stats?.genre_distribution?.map((g) => {
                const total = stats.total_content || 1;
                const percentage = Math.round((g.count / total) * 100);
                return (
                  <div key={g.genre_name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 600 }}>{g.genre_name}</span>
                      <span style={{ color: 'var(--text-dim)' }}>{g.count} titles ({percentage}%)</span>
                    </div>
                    <div style={{ height: '7px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div 
                        style={{ 
                          width: `${percentage}%`, 
                          height: '100%', 
                          background: 'linear-gradient(90deg, var(--primary), var(--accent-purple))',
                          borderRadius: '4px'
                        }} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Academic Showcase Card */}
          <div className="panel-card" style={{ background: 'linear-gradient(145deg, #12162b, #191c36)', borderColor: 'var(--border-active)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <Sparkles size={20} color="#a78bfa" />
              <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#e0e7ff' }}>DBMS Lab Evaluation Mode</h3>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '16px' }}>
              Directly verify SQL Views, Stored Procedures, and Triggers with live database execution.
            </p>
            <button 
              onClick={() => onNavigate('reports')} 
              className="btn btn-primary btn-sm"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Open SQL Lab & Reports
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
