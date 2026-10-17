import React, { useState } from 'react';
import { Tv, ShieldCheck, UserCheck, Key, Mail, User, ArrowRight } from 'lucide-react';
import { api } from '../api';

export default function LoginView({ onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('User');

  const fillAdmin = () => {
    setIsRegister(false);
    setEmail('admin@streamsphere.com');
    setPassword('admin123');
    setError('');
  };

  const fillUser = () => {
    setIsRegister(false);
    setEmail('priya.patel@example.com');
    setPassword('user123');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        const res = await api.register({ name, email, password, role });
        localStorage.setItem('streamsphere_token', res.token);
        localStorage.setItem('streamsphere_user', JSON.stringify(res.user));
        onLoginSuccess(res.user);
      } else {
        const res = await api.login({ email, password });
        localStorage.setItem('streamsphere_token', res.token);
        localStorage.setItem('streamsphere_user', JSON.stringify(res.user));
        onLoginSuccess(res.user);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="brand-icon">
            <Tv size={22} />
          </div>
          <div className="brand-text">
            <h1>StreamSphere</h1>
            <span>OTT Management Platform</span>
          </div>
        </div>

        <div className="auth-tabs">
          <div 
            className={`auth-tab ${!isRegister ? 'active' : ''}`}
            onClick={() => { setIsRegister(false); setError(''); }}
          >
            Sign In
          </div>
          <div 
            className={`auth-tab ${isRegister ? 'active' : ''}`}
            onClick={() => { setIsRegister(true); setError(''); }}
          >
            Register Account
          </div>
        </div>

        {error && (
          <div style={{
            background: 'var(--danger-bg)',
            border: '1px solid rgba(239,68,68,0.3)',
            color: '#f87171',
            padding: '10px 14px',
            borderRadius: '8px',
            fontSize: '0.82rem',
            marginBottom: '16px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {isRegister && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Varsha Srinivasan"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {isRegister && (
            <div className="form-group">
              <label className="form-label">System Role</label>
              <select 
                className="form-select"
                value={role} 
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="User">Regular User (Streamer)</option>
                <option value="Admin">Administrator (Full Control)</option>
              </select>
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : isRegister ? 'Create Account' : 'Sign In to Console'}
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="demo-credentials-box">
          <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            DBMS Viva Demo Quick Logins
          </div>
          <div className="demo-btn-row">
            <button 
              type="button" 
              className="btn btn-secondary btn-sm" 
              style={{ flex: 1, fontSize: '0.72rem' }}
              onClick={fillAdmin}
            >
              <ShieldCheck size={14} color="#a78bfa" /> Admin Demo
            </button>
            <button 
              type="button" 
              className="btn btn-secondary btn-sm" 
              style={{ flex: 1, fontSize: '0.72rem' }}
              onClick={fillUser}
            >
              <UserCheck size={14} color="#34d399" /> User Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
