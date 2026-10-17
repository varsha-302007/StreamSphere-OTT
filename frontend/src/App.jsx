import React, { useState, useEffect } from 'react';
import { 
  Tv, LayoutDashboard, Film, Users, Layers, CreditCard, 
  Clock, Star, BarChart3, LogOut, CheckCircle2, AlertCircle, RefreshCw 
} from 'lucide-react';

import LoginView from './pages/LoginView';
import DashboardView from './pages/DashboardView';
import ContentView from './pages/ContentView';
import UserView from './pages/UserView';
import GenreView from './pages/GenreView';
import PlanView from './pages/PlanView';
import SubscriptionView from './pages/SubscriptionView';
import WatchHistoryView from './pages/WatchHistoryView';
import RatingView from './pages/RatingView';
import ReportsView from './pages/ReportsView';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [toasts, setToasts] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const savedUser = localStorage.getItem('streamsphere_user');
    const token = localStorage.getItem('streamsphere_token');
    if (savedUser && token) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('streamsphere_user');
        localStorage.removeItem('streamsphere_token');
      }
    }
  }, []);

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const handleLogout = () => {
    localStorage.removeItem('streamsphere_token');
    localStorage.removeItem('streamsphere_user');
    setCurrentUser(null);
    setCurrentPage('dashboard');
    showToast('Signed out successfully.', 'info');
  };

  if (!currentUser) {
    return (
      <>
        <LoginView onLoginSuccess={(u) => { setCurrentUser(u); showToast(`Welcome back, ${u.name}!`); }} />
        <div className="toast-container">
          {toasts.map((t) => (
            <div key={t.id} className={`toast toast-${t.type}`}>
              {t.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span>{t.message}</span>
            </div>
          ))}
        </div>
      </>
    );
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard & Metrics', icon: LayoutDashboard },
    { id: 'content', label: 'Content Management', icon: Film },
    { id: 'users', label: 'User Accounts', icon: Users },
    { id: 'genres', label: 'Genre Categories', icon: Layers },
    { id: 'plans', label: 'Subscription Plans', icon: CreditCard },
    { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard },
    { id: 'watch-history', label: 'Watch History', icon: Clock },
    { id: 'ratings', label: 'Ratings & Reviews', icon: Star },
    { id: 'reports', label: 'Reports & SQL Lab', icon: BarChart3 }
  ];

  const getPageTitle = () => {
    switch (currentPage) {
      case 'dashboard': return 'Operational Dashboard & Analytics';
      case 'content': return 'Streaming Catalog & Asset Inventory';
      case 'users': return 'Customer & Administrator Profiles';
      case 'genres': return 'Genre Taxonomies';
      case 'plans': return 'Commercial Subscription Tiers';
      case 'subscriptions': return 'Member Subscriptions & Lifecycle';
      case 'watch-history': return 'Streaming Playback Telemetry';
      case 'ratings': return 'Audience Ratings & Reviews';
      case 'reports': return 'SQL Analytics & DBMS Viva Showcase';
      default: return 'StreamSphere Platform';
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="brand-icon">
            <Tv size={20} />
          </div>
          <div className="brand-text">
            <h1>StreamSphere</h1>
            <span>DBMS Laboratory Mini-Project</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-title">Operations</div>
          {navItems.slice(0, 3).map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
                onClick={() => setCurrentPage(item.id)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </div>
            );
          })}

          <div className="nav-section-title">Catalog & Subscriptions</div>
          {navItems.slice(3, 8).map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
                onClick={() => setCurrentPage(item.id)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </div>
            );
          })}

          <div className="nav-section-title">Evaluation & Reports</div>
          {navItems.slice(8).map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
                onClick={() => setCurrentPage(item.id)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </div>
            );
          })}
        </nav>

        {/* Sidebar Footer User Card */}
        <div className="sidebar-footer">
          <div className="user-badge">
            <div className="user-avatar">
              {currentUser.name ? currentUser.name[0].toUpperCase() : 'U'}
            </div>
            <div className="user-info">
              <div className="user-name">{currentUser.name}</div>
              <span className={`user-role-pill ${currentUser.role === 'Admin' ? 'user-role-admin' : 'user-role-user'}`}>
                {currentUser.role}
              </span>
            </div>
            <button onClick={handleLogout} className="logout-btn" title="Sign Out">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        {/* Top Header */}
        <header className="topbar">
          <div className="topbar-title">
            <h2>{getPageTitle()}</h2>
          </div>

          <div className="topbar-actions">
            <div className="db-pill">
              <div className="db-pulse"></div>
              <span>MySQL 8.0: streamsphere_db</span>
            </div>

            <button 
              onClick={() => setRefreshKey((k) => k + 1)} 
              className="btn btn-secondary btn-sm"
              title="Refresh relational queries"
            >
              <RefreshCw size={14} /> Refresh
            </button>
          </div>
        </header>

        {/* Page Body */}
        <div className="page-body" key={refreshKey}>
          {currentPage === 'dashboard' && (
            <DashboardView onNavigate={(p) => setCurrentPage(p)} />
          )}
          {currentPage === 'content' && (
            <ContentView user={currentUser} showToast={showToast} />
          )}
          {currentPage === 'users' && (
            <UserView currentUser={currentUser} showToast={showToast} />
          )}
          {currentPage === 'genres' && (
            <GenreView currentUser={currentUser} showToast={showToast} />
          )}
          {currentPage === 'plans' && (
            <PlanView currentUser={currentUser} showToast={showToast} />
          )}
          {currentPage === 'subscriptions' && (
            <SubscriptionView currentUser={currentUser} showToast={showToast} />
          )}
          {currentPage === 'watch-history' && (
            <WatchHistoryView currentUser={currentUser} showToast={showToast} />
          )}
          {currentPage === 'ratings' && (
            <RatingView currentUser={currentUser} showToast={showToast} />
          )}
          {currentPage === 'reports' && (
            <ReportsView showToast={showToast} />
          )}
        </div>
      </main>

      {/* Toast Notification Container */}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            {t.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
