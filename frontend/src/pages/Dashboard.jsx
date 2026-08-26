import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Activity, ShieldCheck, List, Layout, Play, AlertTriangle } from 'lucide-react';

const API_BASE = 'http://localhost:3001/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchData(activeTab);
  }, [activeTab]);

  const fetchData = async (tab) => {
    try {
      if (tab === 'overview') {
        const res = await axios.get(`${API_BASE}/dashboard/overview`);
        setData(res.data);
      } else if (tab === 'live_batch') {
        const res = await axios.get(`${API_BASE}/dashboard/batch-results`);
        setData(res.data);
      }
      // Add other endpoints as needed
    } catch (e) {
      console.error(e);
    }
  };

  const handleRunBatch = async () => {
    setData({ running: true });
    try {
      await axios.post(`${API_BASE}/pipeline/run`);
      fetchData('overview');
    } catch (e) {
      alert('Error running batch');
    }
  };

  return (
    <div className="app-container">
      <aside className="sidebar">
        <h2 style={{ fontSize: '1.25rem', marginBottom: '2rem', background: 'linear-gradient(to right, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', color: 'transparent' }}>
          Mandate Recover
        </h2>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button className={`btn-secondary ${activeTab === 'overview' ? 'btn-primary' : ''}`} onClick={() => setActiveTab('overview')} style={{ textAlign: 'left', border: 'none' }}>1. Overview</button>
          <button className={`btn-secondary ${activeTab === 'live_batch' ? 'btn-primary' : ''}`} onClick={() => setActiveTab('live_batch')} style={{ textAlign: 'left', border: 'none' }}>3. Live Batch Results</button>
          <button className={`btn-secondary ${activeTab === 'audit' ? 'btn-primary' : ''}`} onClick={() => setActiveTab('audit')} style={{ textAlign: 'left', border: 'none' }}>5. Audit Trail</button>
          <button className={`btn-secondary ${activeTab === 'rules' ? 'btn-primary' : ''}`} onClick={() => setActiveTab('rules')} style={{ textAlign: 'left', border: 'none' }}>9. Rules</button>
          {/* Mocking other tabs for brevity */}
        </nav>

        <div style={{ marginTop: 'auto' }}>
          <button className="btn-secondary" style={{ width: '100%', border: 'none' }} onClick={() => {
            localStorage.clear();
            navigate('/');
          }}>Logout</button>
        </div>
      </aside>

      <main className="main-content">
        <div className="animate-fade-in">
          {activeTab === 'overview' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>Overview</h1>
                <button className="btn-primary" onClick={handleRunBatch} disabled={data?.running}>
                  {data?.running ? 'Running Pipeline...' : 'Run Full Pipeline Now'}
                </button>
              </div>

              {data && data.results && (
                <div className="stat-grid">
                  <div className="stat-card">
                    <div className="text-muted">Recovery Rate</div>
                    <div className="stat-value">{data.results.recovery_rate}%</div>
                  </div>
                  <div className="stat-card">
                    <div className="text-muted">Total Recovered</div>
                    <div className="stat-value">₹{data.results.total_recovered_amount}</div>
                  </div>
                  <div className="stat-card">
                    <div className="text-muted">Naive Baseline</div>
                    <div className="stat-value">{data.results.naive_baseline_recovery_rate}%</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'live_batch' && (
            <div>
              <h1>Live Batch Results</h1>
              <div className="glass-panel">
                <table>
                  <thead>
                    <tr>
                      <th>Transaction ID</th>
                      <th>Amount</th>
                      <th>Diagnosed Cause</th>
                      <th>Action Taken</th>
                      <th>Outcome</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.map(txn => (
                      <tr key={txn.id}>
                        <td><span style={{ fontFamily: 'monospace' }}>{txn.id.substring(0,8)}...</span></td>
                        <td>₹{txn.amount}</td>
                        <td>
                          <span className={`badge ${txn.diagnosed_cause === 'afa_gap' ? 'badge-danger' : 'badge-warning'}`}>
                            {txn.diagnosed_cause}
                          </span>
                        </td>
                        <td>{txn.chosen_action}</td>
                        <td>
                          <span className={`badge ${txn.outcome === 'success' ? 'badge-success' : 'badge-info'}`}>
                            {txn.outcome}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'audit' && (
            <div>
              <h1>Audit Trail</h1>
              <div className="glass-panel">
                <p>To be implemented connected to /api/dashboard/audit</p>
              </div>
            </div>
          )}
          
          {activeTab === 'rules' && (
            <div>
              <h1>Decision & Stopping Rules</h1>
              <div className="glass-panel">
                <p>To be implemented connected to /api/dashboard/rules</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
