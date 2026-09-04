import React from 'react';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  let badgeStyle = 'bg-slate-100 text-slate-700 border-slate-300';
  let iconPrefix = '';

  const uStatus = status.toUpperCase();

  if (['VERIFIED', 'PASSED', 'HONEST_CHANNEL', 'SECURE', 'RESOLVED', 'MITIGATED', 'SUCCESS'].includes(uStatus)) {
    // SECURE / VERIFIED → Emerald
    badgeStyle = 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30 font-bold';
    iconPrefix = '✓ ';
  } else if (['ISSUED', 'QUANTUM', 'ACTIVE', 'PROCESSING', 'OPEN', 'LOW'].includes(uStatus)) {
    // QUANTUM / ACTIVE → Cyan
    badgeStyle = 'bg-[#00C2FF]/10 text-[#00C2FF] border-[#00C2FF]/30 font-bold';
  } else if (['QUANTUM_ANOMALY', 'WARNING', 'INVESTIGATING', 'MEDIUM', 'ATTENTION'].includes(uStatus)) {
    // ANOMALY / WARNING → Amber
    badgeStyle = 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30 font-bold';
    iconPrefix = '⚠ ';
  } else if (['COMPROMISED', 'CRITICAL', 'HIGH', 'REJECTED_QUANTUM_THREAT', 'THREAT_DETECTED', 'ATTACK_DETECTED', 'SIGNATURE_FORGERY', 'SENDER_IMPERSONATION', 'QUANTUM_CHANNEL_MANIPULATION', 'UNAUTHORIZED_VERIFICATION', 'REJECTED'].includes(uStatus)) {
    // THREAT / REJECTED → Deep Navy with White Text
    badgeStyle = 'bg-[#0B1220] text-white border-[#0B1220] font-bold shadow-sm';
    iconPrefix = '! ';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[10px] uppercase border font-sans tracking-wider ${badgeStyle}`}>
      {iconPrefix}{status.replace(/_/g, ' ')}
    </span>
  );
};
