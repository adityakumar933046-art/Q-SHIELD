import React from 'react';

export const Signatures: React.FC = () => {
  return (
    <div style={{ padding: '24px', color: '#F9FAFB' }}>
      <h2>Quantum Digital Signatures</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '16px', background: '#1F2937' }}>
        <thead>
          <tr style={{ background: '#374151', textAlign: 'left' }}>
            <th style={{ padding: '12px' }}>Signature ID</th>
            <th style={{ padding: '12px' }}>Signer ID</th>
            <th style={{ padding: '12px' }}>SHA-256 Digest</th>
            <th style={{ padding: '12px' }}>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ padding: '12px' }}>SIG-001-ALPHA</td>
            <td style={{ padding: '12px' }}>user_alice</td>
            <td style={{ padding: '12px' }}>e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</td>
            <td style={{ padding: '12px', color: '#10B981' }}>ACTIVE</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
