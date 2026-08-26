import React from 'react';

interface Props {
  result?: {
    decision?: string;
    signature_id?: string;
    message_match?: boolean;
    error_rate?: number;
    threshold?: number;
    reasons?: string[];
  };
}

export const VerificationResult: React.FC<Props> = ({ result }) => {
  if (!result) return null;

  const isAccepted = result.decision === 'ACCEPT' || result.decision === 'ACCEPTED';
  const badgeColor = isAccepted ? '#10B981' : '#EF4444';

  return (
    <div style={{ background: '#1F2937', color: '#F9FAFB', padding: '20px', borderRadius: '8px', marginTop: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3>Verification Result</h3>
        <span style={{ background: badgeColor, padding: '6px 16px', borderRadius: '20px', fontWeight: 'bold' }}>
          {result.decision || 'UNKNOWN'}
        </span>
      </div>

      <div style={{ marginTop: '12px' }}>
        <p><strong>Signature ID:</strong> {result.signature_id || 'N/A'}</p>
        <p><strong>Message Match:</strong> {result.message_match ? '✅ MATCHED' : '❌ MISMATCHED'}</p>
        {result.error_rate !== undefined && (
          <p><strong>Observed Error Rate:</strong> {(result.error_rate * 100).toFixed(2)}% (Threshold: {((result.threshold || 0.89) * 100).toFixed(1)}%)</p>
        )}
      </div>

      {result.reasons && result.reasons.length > 0 && (
        <div style={{ marginTop: '12px', background: '#374151', padding: '12px', borderRadius: '6px' }}>
          <strong>Decision Reasons:</strong>
          <ul>
            {result.reasons.map((reason, idx) => (
              <li key={idx}>{reason}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
