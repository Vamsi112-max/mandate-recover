import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Activity, Zap } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="animate-fade-in" style={{ padding: '4rem 10%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '4rem', background: 'linear-gradient(to right, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', color: 'transparent' }}>
          Mandate Recover
        </h1>
        <p className="text-muted" style={{ fontSize: '1.25rem', maxWidth: '800px', margin: '0 auto 2rem auto' }}>
          Razorpay already recovers abandoned checkouts. It doesn't yet handle a different, currently unresolved failure: recurring UPI/card mandates above ₹15,000 that RBI requires additional authorization for. 
          Mandate Recover is an agentic pipeline that detects these AFA-triggered mandate failures via the Mandate/Token APIs, diagnoses the true cause, and executes the correct fix.
        </p>
      </div>

      <div className="stat-grid" style={{ width: '100%', maxWidth: '1000px', marginBottom: '4rem' }}>
        <div className="stat-card">
          <div className="text-muted">Recovery Rate (Test Batch)</div>
          <div className="stat-value">43.64%</div>
        </div>
        <div className="stat-card">
          <div className="text-muted">Total Recovered Amount</div>
          <div className="stat-value">₹ 4,32,000</div>
        </div>
        <div className="stat-card">
          <div className="text-muted">Compliance Violations</div>
          <div className="stat-value" style={{ color: 'var(--success)' }}>0</div>
        </div>
      </div>

      <div className="glass-panel" style={{ width: '100%', maxWidth: '1000px', marginBottom: '4rem', textAlign: 'left' }}>
        <h2>The Gap</h2>
        <table>
          <thead>
            <tr>
              <th>Feature</th>
              <th>Global dunning tools</th>
              <th>Razorpay Failed Payments Recovery</th>
              <th>Mandate Recover</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Handles card/checkout abandonment</td>
              <td>Yes</td>
              <td>Yes</td>
              <td className="text-muted">Not the focus</td>
            </tr>
            <tr>
              <td>Handles AFA-triggered mandate failures</td>
              <td className="text-muted">No</td>
              <td className="text-muted">No</td>
              <td style={{ color: 'var(--success)', fontWeight: '600' }}>Yes</td>
            </tr>
            <tr>
              <td>Enforces NPCI retry compliance windows</td>
              <td className="text-muted">No</td>
              <td>Partial</td>
              <td style={{ color: 'var(--success)', fontWeight: '600' }}>Yes</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <button className="btn-primary" onClick={() => navigate('/dashboard')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          View Live Dashboard <ArrowRight size={18} />
        </button>
        <button className="btn-secondary" onClick={() => window.open('https://github.com/razorpay/mandate-recover', '_blank')}>
          View on GitHub
        </button>
      </div>
    </div>
  );
}
