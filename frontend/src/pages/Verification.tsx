import React, { useState } from 'react';
import { verifySignature } from '../services/verification';
import { VerificationResult } from '../components/VerificationResult';

export const Verification: React.FC = () => {
  const [sigId, setSigId] = useState('SIG-001');
  const [message, setMessage] = useState('Canonical Message Payload');
  const [result, setResult] = useState<any>(null);

  const handleVerify = async () => {
    try {
      const res = await verifySignature(sigId, message);
      setResult(res);
    } catch (e: any) {
      setResult({ decision: 'REJECT', reasons: [e.message] });
    }
  };

  return (
    <div style={{ padding: '24px', color: '#F9FAFB' }}>
      <h2>Verification Engine Portal</h2>
      <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
        <input value={sigId} onChange={(e) => setSigId(e.target.value)} placeholder="Signature ID" style={{ padding: '8px', background: '#374151', color: '#FFF', border: '1px solid #4B5563', borderRadius: '4px' }} />
        <input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Message Content" style={{ padding: '8px', background: '#374151', color: '#FFF', border: '1px solid #4B5563', borderRadius: '4px', flexGrow: 1 }} />
        <button onClick={handleVerify} style={{ padding: '8px 16px', background: '#10B981', color: '#FFF', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Verify</button>
      </div>

      <VerificationResult result={result} />
    </div>
  );
};
