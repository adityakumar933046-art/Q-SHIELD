import React from 'react';
import { SecurityMetricsData } from '../types/metrics';

interface Props {
  metrics?: Partial<SecurityMetricsData>;
}

export const SecurityMetrics: React.FC<Props> = ({ metrics }) => {
  const defaultMetrics: SecurityMetricsData = {
    total_signatures: metrics?.total_signatures ?? 124,
    total_verifications: metrics?.total_verifications ?? 98,
    accepted_verifications: metrics?.accepted_verifications ?? 95,
    rejected_verifications: metrics?.rejected_verifications ?? 3,
    error_rate: metrics?.error_rate ?? 0.02,
    threats_detected: metrics?.threats_detected ?? 5,
    attacks_blocked: metrics?.attacks_blocked ?? 5,
    attack_success_rate: metrics?.attack_success_rate ?? 0.0,
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
      <div style={cardStyle}>
        <h4>Total Signatures</h4>
        <p style={valueStyle}>{defaultMetrics.total_signatures}</p>
      </div>
      <div style={cardStyle}>
        <h4>Total Verifications</h4>
        <p style={valueStyle}>{defaultMetrics.total_verifications}</p>
      </div>
      <div style={cardStyle}>
        <h4>Accepted Verifications</h4>
        <p style={{ ...valueStyle, color: '#10B981' }}>{defaultMetrics.accepted_verifications}</p>
      </div>
      <div style={cardStyle}>
        <h4>Rejected Verifications</h4>
        <p style={{ ...valueStyle, color: '#EF4444' }}>{defaultMetrics.rejected_verifications}</p>
      </div>
      <div style={cardStyle}>
        <h4>Error Rate</h4>
        <p style={{ ...valueStyle, color: '#F59E0B' }}>{(defaultMetrics.error_rate * 100).toFixed(1)}%</p>
      </div>
      <div style={cardStyle}>
        <h4>Attacks Blocked</h4>
        <p style={{ ...valueStyle, color: '#3B82F6' }}>{defaultMetrics.attacks_blocked}</p>
      </div>
    </div>
  );
};

const cardStyle: React.CSSProperties = {
  background: '#1F2937',
  padding: '16px',
  borderRadius: '8px',
  color: '#F9FAFB',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
};

const valueStyle: React.CSSProperties = {
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '8px 0 0 0',
};
