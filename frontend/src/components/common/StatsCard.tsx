import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  description?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  iconColor,
  iconBg,
  description,
}) => {
  const resolvedColor = iconColor || 'text-[#6366F1] dark:text-indigo-400';
  const resolvedBg = iconBg || 'bg-indigo-50 dark:bg-indigo-950/60';

  let tagColorClasses = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200';
  if (changeType === 'increase' || change?.toLowerCase().includes('signer') || change?.toLowerCase().includes('mitigated')) {
    tagColorClasses = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800/40';
  } else if (changeType === 'decrease' || change?.toLowerCase().includes('monitor') || change?.toLowerCase().includes('critical')) {
    tagColorClasses = 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-100 dark:border-rose-800/40';
  } else if (change?.toLowerCase().includes('review') || change?.toLowerCase().includes('high')) {
    tagColorClasses = 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-100 dark:border-amber-800/40';
  } else if (change?.toLowerCase().includes('issued') || change?.toLowerCase().includes('active')) {
    tagColorClasses = 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800/40';
  }

  return (
    <div className="bg-white dark:bg-[#111A2E] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between font-sans group">
      <div>
        <div className="flex items-start justify-between mb-3 gap-2">
          <span className="text-[11px] sm:text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider leading-snug">
            {title}
          </span>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${resolvedBg} ${resolvedColor} transition-transform duration-200 group-hover:scale-105 shadow-sm`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>

        <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          {value}
        </div>
      </div>

      {change && (
        <div className="mt-3.5 pt-1">
          <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full ${tagColorClasses}`}>
            • {change.replace(/^•\s*/, '')}
          </span>
        </div>
      )}

      {description && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{description}</p>
      )}
    </div>
  );
};
