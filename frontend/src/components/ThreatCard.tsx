import React from 'react';
import { ThreatAssessment } from '../types/threat';

interface Props {
  threat?: Partial<ThreatAssessment>;
}

export const ThreatCard: React.FC<Props> = ({ threat }) => {
  const severity = threat?.severity || 'LOW';
  const colorMap: Record<string, string> = {
    LOW: '#10B981',
    MEDIUM: '#F59E0B',
    HIGH: '#EF4444',
    CRITICAL: '#7C3AED',
  };

  return (
    <div style={{ background: '#1F2937', padding: '16px', borderRadius: '8px', borderLeft: `6px solid ${colorMap[severity]}`, color: '#F9FAFB' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4>{threat?.threat_type || 'STANDARD_SECURITY_EVALUATION'}</h4>
        <span style={{ background: colorMap[severity], padding: '4px 10px', borderRadius: '12px', fontWeight: 'bold', fontSize: '12px' }}>
          {severity}
        </span>
      </div>
      <p style={{ marginTop: '8px', color: '#D1D5DB' }}>Threat Score: {threat?.score ?? 0.0}</p>
      <p style={{ fontSize: '14px', color: '#9CA3AF' }}>{threat?.recommendation || 'No critical security actions required.'}</p>
    </div>
  );
};
