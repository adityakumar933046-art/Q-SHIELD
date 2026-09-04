import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const normalized = (status || '').toUpperCase();

  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
  let dotColor = 'bg-slate-500';

  if (['ACTIVE', 'PASSED', 'RESOLVED', 'VERIFIED', 'ISSUED', 'SUCCESS', 'OPERATIONAL', 'LOW', 'MITIGATED'].includes(normalized)) {
    colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/50';
    dotColor = 'bg-emerald-500';
  } else if (['INACTIVE', 'PENDING', 'SUSPENDED', 'INVESTIGATING', 'MEDIUM', 'IN_REVIEW'].includes(normalized)) {
    colorClasses = 'bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/50';
    dotColor = 'bg-amber-500';
  } else if (['CRITICAL', 'HIGH', 'FAILED', 'LOCKED', 'DISABLED', 'COMPROMISED', 'REJECTED'].includes(normalized)) {
    colorClasses = 'bg-rose-50 text-rose-700 border-rose-200/60 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/50';
    dotColor = 'bg-rose-500';
  } else if (['INFO', 'SYSTEM', 'MAINTENANCE'].includes(normalized)) {
    colorClasses = 'bg-sky-50 text-sky-700 border-sky-200/60 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800/50';
    dotColor = 'bg-sky-500';
  }

  const padding = size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span className={`inline-flex items-center space-x-1.5 font-bold uppercase rounded-full border ${padding} ${colorClasses} tracking-wide transition-colors`}>
      <span className={`w-2 h-2 rounded-full ${dotColor}`} />
      <span>{normalized}</span>
    </span>
  );
};
