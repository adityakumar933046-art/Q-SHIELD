import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const normalized = (status || '').toUpperCase();

  let colorClasses = 'bg-slate-700/40 text-slate-300 border-slate-600/40';

  if (['ACTIVE', 'PASSED', 'RESOLVED', 'VERIFIED', 'ISSUED', 'SUCCESS', 'OPERATIONAL', 'LOW'].includes(normalized)) {
    colorClasses = 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30';
  } else if (['INACTIVE', 'PENDING', 'SUSPENDED', 'INVESTIGATING', 'MEDIUM'].includes(normalized)) {
    colorClasses = 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30';
  } else if (['CRITICAL', 'HIGH', 'FAILED', 'LOCKED', 'DISABLED', 'COMPROMISED', 'REJECTED'].includes(normalized)) {
    colorClasses = 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/30';
  } else if (['INFO', 'SYSTEM', 'MAINTENANCE'].includes(normalized)) {
    colorClasses = 'bg-[#00C2FF]/10 text-[#00C2FF] border-[#00C2FF]/30';
  }

  const padding = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center space-x-1 font-mono font-bold uppercase rounded border ${padding} ${colorClasses}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      <span>{normalized}</span>
    </span>
  );
};
