import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon: LucideIcon;
  iconColor?: string;
  description?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  iconColor = 'text-[#00C2FF]',
  description,
}) => {
  return (
    <div className="bg-[#0B1220]/90 border border-[#1F2E4D] rounded-xl p-5 shadow-lg backdrop-blur-md relative overflow-hidden group hover:border-[#00C2FF]/40 transition duration-200 font-sans">
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-white/5 to-transparent rounded-bl-full pointer-events-none" />
      
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {title}
        </span>
        <div className={`p-2.5 rounded-lg bg-[#131E33] border border-[#1F2E4D] ${iconColor}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="flex items-baseline justify-between">
        <h3 className="text-2xl font-bold text-white tracking-tight">{value}</h3>
        {change && (
          <span
            className={`text-xs font-medium px-2.5 py-0.5 rounded-md ${
              changeType === 'increase'
                ? 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30'
                : changeType === 'decrease'
                ? 'bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/30'
                : 'bg-slate-700/40 text-slate-300'
            }`}
          >
            {change}
          </span>
        )}
      </div>

      {description && (
        <p className="text-xs text-slate-400 mt-2 font-normal leading-relaxed">{description}</p>
      )}
    </div>
  );
};
