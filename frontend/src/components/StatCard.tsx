import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  color?: string; // Kept for interface compatibility
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon
}) => {
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm flex items-center justify-between">
      <div className="space-y-1">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{title}</span>
        <div className="text-2xl font-extrabold text-[#0F172A] font-mono">{value}</div>
        {subtitle && <p className="text-[11px] text-slate-500">{subtitle}</p>}
      </div>
      <div className="p-3 rounded-lg bg-[#00C2FF]/10 border border-[#00C2FF]/30 text-[#00C2FF] flex items-center justify-center">
        <Icon className="w-5 h-5" />
      </div>
    </div>
  );
};
