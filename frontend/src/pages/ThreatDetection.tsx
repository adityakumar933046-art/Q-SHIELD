import React from 'react';
import { ThreatCard } from '../components/ThreatCard';

export const ThreatDetection: React.FC = () => {
  return (
    <div style={{ padding: '24px', color: '#F9FAFB' }}>
      <h2>Threat Engine & Forgery Detection</h2>
      <div style={{ display: 'grid', gap: '16px', marginTop: '16px' }}>
        <ThreatCard threat={{ severity: 'LOW', score: 0.0, threat_type: 'NORMAL_OPERATIONS' }} />
        <ThreatCard threat={{ severity: 'HIGH', score: 0.85, threat_type: 'TAMPERED_DIGEST_DETECTED', recommendation: 'Message modification blocked.' }} />
      </div>
    </div>
  );
};
