import React, { useState } from 'react';
import { simulateAttack } from '../services/attacks';

export const AttackPanel: React.FC = () => {
  const [attackType, setAttackType] = useState('FORGERY');
  const [signatureId, setSignatureId] = useState('SIG-001');
  const [message, setMessage] = useState('Test Message Payload');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleRun = async () => {
    setLoading(true);
    try {
      const res = await simulateAttack(attackType, {
        target: 'local_qshield',
        signature_id: signatureId,
        message: message,
      });
      setResult(res);
    } catch (e: any) {
      setResult({ error: e.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: '#1F2937', padding: '20px', borderRadius: '8px', color: '#F9FAFB' }}>
      <h3>Controlled Attack Simulation Panel</h3>
      <p style={{ fontSize: '14px', color: '#9CA3AF' }}>Simulates defensive responses against Q-SHIELD test signatures.</p>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '16px' }}>
        <select value={attackType} onChange={(e) => setAttackType(e.target.value)} style={inputStyle}>
          <option value="FORGERY">FORGERY</option>
          <option value="IMPERSONATION">IMPERSONATION</option>
          <option value="REPLAY">REPLAY</option>
          <option value="CHANNEL_MANIPULATION">CHANNEL_MANIPULATION</option>
          <option value="UNAUTHORIZED_VERIFICATION">UNAUTHORIZED_VERIFICATION</option>
        </select>

        <input value={signatureId} onChange={(e) => setSignatureId(e.target.value)} placeholder="Target Signature ID" style={inputStyle} />
        <input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Message Payload" style={inputStyle} />

        <button onClick={handleRun} disabled={loading} style={buttonStyle}>
          {loading ? 'Executing...' : 'Run Simulation'}
        </button>
      </div>

      {result && (
        <div style={{ marginTop: '16px', background: '#111827', padding: '12px', borderRadius: '6px' }}>
          <h4>Simulation Result</h4>
          {result.error ? (
            <p style={{ color: '#EF4444' }}>{result.error}</p>
          ) : (
            <div>
              <p><strong>Attack Blocked:</strong> {result.blocked ? '✅ YES (Defense Succeeded)' : '❌ NO (Security Control Bypassed)'}</p>
              <p><strong>Detected:</strong> {result.detected ? 'YES' : 'NO'}</p>
              <p><strong>Severity:</strong> {result.severity}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const inputStyle: React.CSSProperties = {
  padding: '8px 12px',
  borderRadius: '4px',
  border: '1px solid #4B5563',
  background: '#374151',
  color: '#F9FAFB',
};

const buttonStyle: React.CSSProperties = {
  background: '#3B82F6',
  color: '#FFF',
  padding: '8px 16px',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontWeight: 'bold',
};
