import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    // Simulate login for hackathon demo
    if (username === 'judge@razorpay-buildathon.com' && password === 'Demo@2026') {
      localStorage.setItem('auth', 'true');
      navigate('/dashboard');
    } else {
      alert('Invalid credentials');
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Login to System</h2>
        
        <div style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
          <div className="text-muted" style={{ fontSize: '0.875rem' }}>Demo Credentials</div>
          <div style={{ fontFamily: 'monospace' }}>judge@razorpay-buildathon.com</div>
          <div style={{ fontFamily: 'monospace' }}>Demo@2026</div>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Username</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Email" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
          </div>
          <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>Login</button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <span className="text-muted">or</span>
        </div>

        <button className="btn-secondary" style={{ width: '100%', marginTop: '1.5rem' }} onClick={() => {
          localStorage.setItem('auth', 'true');
          navigate('/dashboard');
        }}>
          Continue as Judge — Skip Login
        </button>
      </div>
    </div>
  );
}
