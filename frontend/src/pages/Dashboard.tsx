import React from 'react';
import { SecurityMetrics } from '../components/SecurityMetrics';
import { ThreatCard } from '../components/ThreatCard';

export const Dashboard: React.FC = () => {
  return (
    <div style={{ padding: '24px', color: '#F9FAFB' }}>
      <h2>Q-SHIELD Executive Security Dashboard</h2>
      <p style={{ color: '#9CA3AF' }}>Quantum Digital Signature Security Platform Overview</p>

      <div style={{ marginTop: '24px' }}>
        <SecurityMetrics />
      </div>

      <div style={{ marginTop: '32px' }}>
        <h3>Active System Security Status</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginTop: '12px' }}>
          <ThreatCard threat={{ severity: 'LOW', score: 0.0, recommendation: 'System operating normally under baseline parameters.' }} />
          <ThreatCard threat={{ severity: 'MEDIUM', score: 0.15, threat_type: 'REPLAY_ATTEMPT_RECORDED', recommendation: 'Replay protection active. Nonce blocked.' }} />
        </div>
      </div>
    </div>
  );
};
