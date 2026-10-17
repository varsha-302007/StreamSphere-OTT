import React, { useState, useEffect } from 'react';
import { 
  BarChart3, PieChart, TrendingUp, DollarSign, Star, Eye, Zap, 
  Terminal, ShieldAlert, CheckCircle2, Play, RefreshCw 
} from 'lucide-react';
import { api } from '../api';

export default function ReportsView({ showToast }) {
  const [activeTab, setActiveTab] = useState('genre');
  const [data, setData] = useState([]);
  const [sqlQuery, setSqlQuery] = useState('');
  const [queryDescription, setQueryDescription] = useState('');
  const [loading, setLoading] = useState(false);

  // Trigger test states
  const [triggerResult, setTriggerResult] = useState(null);
  const [triggerLoading, setTriggerLoading] = useState(false);

  // Procedure test states
  const [procUserId, setProcUserId] = useState(3);
  const [procPlanId, setProcPlanId] = useState(1);
  const [procResult, setProcResult] = useState(null);
  const [procLoading, setProcLoading] = useState(false);

  const fetchReport = async (tab) => {
    try {
      setLoading(true);
      let res;
      switch (tab) {
        case 'genre':
          res = await api.getContentByGenre();
          break;
        case 'subscribers':
          res = await api.getSubscribersByPlan();
          break;
        case 'revenue':
          res = await api.getRevenueByPlan();
          break;
        case 'top-content':
          res = await api.getTopContent();
          break;
        case 'ratings':
          res = await api.getAverageRatings();
          break;
        case 'view-content':
          res = await api.getViewPerformance();
          break;
        case 'view-subscribers':
          res = await api.getActiveSubscriptionsView();
          break;
        default:
          res = await api.getContentByGenre();
      }

      if (res.success) {
        setData(res.data || []);
        setSqlQuery(res.sql || '');
        setQueryDescription(res.query_description || '');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport(activeTab);
  }, [activeTab]);

  const runTriggerTest = async () => {
    try {
      setTriggerLoading(true);
      const res = await api.demoTrigger();
      setTriggerResult(res);
      showToast('MySQL Trigger intercepted invalid dates successfully.', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setTriggerLoading(false);
    }
  };

  const runStoredProcedureTest = async () => {
    try {
      setProcLoading(true);
      const res = await api.createSubscription({
        user_id: parseInt(procUserId, 10),
        plan_id: parseInt(procPlanId, 10),
        start_date: new Date().toISOString().split('T')[0]
      });
      setProcResult(res);
      showToast(res.message, 'success');
    } catch (err) {
      setProcResult({ success: false, message: err.message });
      showToast(err.message, 'error');
    } finally {
      setProcLoading(false);
    }
  };

  return (
    <div>
      {/* Tab Switcher */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
        <button 
          onClick={() => setActiveTab('genre')} 
          className={`btn ${activeTab === 'genre' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
        >
          <PieChart size={14} /> 1. Content by Genre (GROUP BY)
        </button>
        <button 
          onClick={() => setActiveTab('subscribers')} 
          className={`btn ${activeTab === 'subscribers' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
        >
          <BarChart3 size={14} /> 2. Subscribers by Plan (COUNT)
        </button>
        <button 
          onClick={() => setActiveTab('revenue')} 
          className={`btn ${activeTab === 'revenue' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
        >
          <DollarSign size={14} /> 3. Revenue by Plan (SUM, AVG)
        </button>
        <button 
          onClick={() => setActiveTab('top-content')} 
          className={`btn ${activeTab === 'top-content' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
        >
          <TrendingUp size={14} /> 4. Most Streamed Titles (JOIN)
        </button>
        <button 
          onClick={() => setActiveTab('ratings')} 
          className={`btn ${activeTab === 'ratings' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
        >
          <Star size={14} /> 5. Ratings & Reviews (HAVING)
        </button>
        <button 
          onClick={() => setActiveTab('view-content')} 
          className={`btn ${activeTab === 'view-content' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
        >
          <Eye size={14} /> 6. SQL View: vw_content_performance
        </button>
        <button 
          onClick={() => setActiveTab('view-subscribers')} 
          className={`btn ${activeTab === 'view-subscribers' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
        >
          <Eye size={14} /> 7. SQL View: vw_active_subscriptions
        </button>
        <button 
          onClick={() => setActiveTab('demo-trigger')} 
          className={`btn ${activeTab === 'demo-trigger' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          style={{ borderColor: activeTab === 'demo-trigger' ? 'var(--primary)' : 'rgba(239,68,68,0.4)', color: activeTab === 'demo-trigger' ? '#fff' : '#fca5a5' }}
        >
          <Zap size={14} /> 8. Trigger Demonstration
        </button>
        <button 
          onClick={() => setActiveTab('demo-proc')} 
          className={`btn ${activeTab === 'demo-proc' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          style={{ borderColor: activeTab === 'demo-proc' ? 'var(--primary)' : 'rgba(16,185,129,0.4)', color: activeTab === 'demo-proc' ? '#fff' : '#6ee7b7' }}
        >
          <Terminal size={14} /> 9. Stored Procedure Runner
        </button>
      </div>

      {/* SQL Query Viva Inspection Box (for query tabs) */}
      {activeTab !== 'demo-trigger' && activeTab !== 'demo-proc' && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#c7d2fe', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Terminal size={14} color="var(--primary)" /> Executed MySQL Query (DBMS Viva Reference):
          </div>
          <div className="sql-box">{sqlQuery}</div>
          {queryDescription && (
            <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '6px', fontStyle: 'italic' }}>
              Note: {queryDescription}
            </p>
          )}
        </div>
      )}

      {/* Dynamic Data Table Rendering */}
      {activeTab !== 'demo-trigger' && activeTab !== 'demo-proc' && (
        <div className="table-container">
          {loading ? (
            <div className="loading-box">
              <div className="spinner"></div>
              <p>Executing relational aggregate query...</p>
            </div>
          ) : data.length === 0 ? (
            <div className="empty-box">
              <p>No records returned by report query.</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  {Object.keys(data[0] || {}).map((col) => (
                    <th key={col}>{col.replace(/_/g, ' ')}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, idx) => (
                  <tr key={idx}>
                    {Object.values(row).map((val, cIdx) => (
                      <td key={cIdx}>
                        {typeof val === 'number'
                          ? val.toLocaleString()
                          : val === null
                          ? 'NULL'
                          : String(val)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Trigger Live Demonstration Screen */}
      {activeTab === 'demo-trigger' && (
        <div className="panel-card" style={{ maxWidth: '800px' }}>
          <div className="panel-header">
            <div className="panel-title" style={{ color: '#f87171' }}>
              <ShieldAlert size={20} /> MySQL Trigger: trg_validate_subscription_insert
            </div>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '16px' }}>
            A trigger runs automatically inside MySQL whenever an <code>INSERT</code> or <code>UPDATE</code> event occurs on the <code>Subscriptions</code> table. 
            If someone attempts to insert a record where <code>end_date &lt; start_date</code> or <code>amount_paid &lt; 0</code>, the trigger raises a formal MySQL exception:
          </p>

          <div className="sql-box" style={{ marginBottom: '20px' }}>
{`CREATE TRIGGER trg_validate_subscription_insert
BEFORE INSERT ON Subscriptions
FOR EACH ROW
BEGIN
    IF NEW.end_date < NEW.start_date THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Subscription Error: end_date cannot be earlier than start_date.';
    END IF;
    IF NEW.amount_paid < 0.00 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Subscription Error: amount_paid cannot be negative.';
    END IF;
END;`}
          </div>

          <button 
            onClick={runTriggerTest} 
            className="btn btn-danger"
            disabled={triggerLoading}
          >
            <Zap size={16} /> 
            {triggerLoading ? 'Testing Trigger...' : 'Attempt Invalid Subscription (Trigger Test)'}
          </button>

          {triggerResult && (
            <div style={{ marginTop: '20px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#34d399', fontWeight: 700, fontSize: '0.9rem', marginBottom: '8px' }}>
                <CheckCircle2 size={16} /> Trigger Caught Invalid Insert As Expected:
              </div>
              <div style={{ fontSize: '0.82rem', color: '#fca5a5', fontFamily: 'var(--font-mono)', background: 'rgba(239,68,68,0.1)', padding: '10px', borderRadius: '6px', marginBottom: '10px' }}>
                {triggerResult.message_caught_from_mysql}
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {triggerResult.explanation} (SQLSTATE: <strong>{triggerResult.sql_state}</strong>, Error Code: <strong>{triggerResult.error_code}</strong>)
              </p>
            </div>
          )}
        </div>
      )}

      {/* Stored Procedure Live Demonstration Screen */}
      {activeTab === 'demo-proc' && (
        <div className="panel-card" style={{ maxWidth: '800px' }}>
          <div className="panel-header">
            <div className="panel-title" style={{ color: '#34d399' }}>
              <Terminal size={20} /> MySQL Stored Procedure: sp_register_subscription
            </div>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '16px' }}>
            This stored procedure encapsulates atomic business logic: it verifies user existence, looks up plan duration and price, automatically marks prior Active subscriptions for that user as Expired, computes the new end date, and inserts the new subscription inside a <strong>TRANSACTION</strong> with <code>COMMIT</code> and <code>ROLLBACK</code> handlers.
          </p>

          <div className="sql-box" style={{ marginBottom: '20px' }}>
{`CALL sp_register_subscription(
    IN p_user_id INT,
    IN p_plan_id INT,
    IN p_start_date DATE,
    OUT p_subscription_id INT,
    OUT p_message VARCHAR(255)
);`}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
            <div className="form-group">
              <label className="form-label">User ID Parameter</label>
              <input
                type="number"
                className="form-input"
                value={procUserId}
                onChange={(e) => setProcUserId(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Plan ID Parameter</label>
              <input
                type="number"
                className="form-input"
                value={procPlanId}
                onChange={(e) => setProcPlanId(e.target.value)}
              />
            </div>
          </div>

          <button 
            onClick={runStoredProcedureTest} 
            className="btn btn-primary"
            disabled={procLoading}
          >
            <Play size={16} /> 
            {procLoading ? 'Executing Procedure...' : 'Execute CALL sp_register_subscription'}
          </button>

          {procResult && (
            <div style={{ marginTop: '20px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '10px', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#34d399', fontWeight: 700, fontSize: '0.9rem', marginBottom: '8px' }}>
                <CheckCircle2 size={16} /> Stored Procedure Response:
              </div>
              <div style={{ fontSize: '0.82rem', color: '#6ee7b7', fontFamily: 'var(--font-mono)', background: 'rgba(16,185,129,0.1)', padding: '10px', borderRadius: '6px' }}>
                {procResult.message}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
