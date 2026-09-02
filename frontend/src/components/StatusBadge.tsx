import React from 'react';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  let badgeStyle = 'bg-white/[0.05] text-slate-300 border-white/10';
  let iconPrefix = '';

  const uStatus = status ? status.toUpperCase() : '';

  if (['VERIFIED', 'PASSED', 'HONEST_CHANNEL', 'SECURE', 'RESOLVED', 'MITIGATED', 'SUCCESS', 'ACTIVE', 'BULLISH'].includes(uStatus)) {
    // Emerald / Green Glowing Pill
    badgeStyle = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)] font-semibold';
    iconPrefix = '✓ ';
  } else if (['ISSUED', 'QUANTUM', 'PROCESSING', 'OPEN', 'LOW'].includes(uStatus)) {
    // Cyan Glowing Pill
    badgeStyle = 'bg-cyan-500/10 text-cyan-400 border-cyan-500/40 shadow-[0_0_10px_rgba(0,229,255,0.2)] font-semibold';
  } else if (['QUANTUM_ANOMALY', 'WARNING', 'INVESTIGATING', 'MEDIUM', 'ATTENTION', 'PENDING'].includes(uStatus)) {
    // Amber Glowing Pill
    badgeStyle = 'bg-amber-500/10 text-amber-400 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)] font-semibold';
    iconPrefix = '⚠ ';
  } else if (['COMPROMISED', 'CRITICAL', 'HIGH', 'REJECTED_QUANTUM_THREAT', 'THREAT_DETECTED', 'ATTACK_DETECTED', 'SIGNATURE_FORGERY', 'SENDER_IMPERSONATION', 'QUANTUM_CHANNEL_MANIPULATION', 'UNAUTHORIZED_VERIFICATION', 'REJECTED', 'FAILED'].includes(uStatus)) {
    // Rose / Crimson Threat Glowing Pill
    badgeStyle = 'bg-rose-500/15 text-rose-400 border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.3)] font-bold';
    iconPrefix = '! ';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] uppercase border font-mono tracking-wider transition ${badgeStyle}`}>
      {iconPrefix}{status ? status.replace(/_/g, ' ') : ''}
    </span>
  );
};
