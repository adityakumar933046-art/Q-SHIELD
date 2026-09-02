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
    <div className="glass-card p-5 relative overflow-hidden flex items-center justify-between group">
      {/* Subtle top-right ambient glow */}
      <div className="absolute -top-12 -right-12 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl group-hover:bg-cyan-500/20 transition duration-500 pointer-events-none" />
      
      <div className="space-y-1.5 relative z-10">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
          {title}
        </span>
        <div className="text-2xl font-bold text-white font-mono tracking-tight">
          {value}
        </div>
        {subtitle && (
          <p className="text-[11px] text-slate-400 flex items-center space-x-1.5 font-medium">
            <span>{subtitle}</span>
          </p>
        )}
      </div>

      <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 text-cyan-400 flex items-center justify-center shadow-[0_0_12px_rgba(0,229,255,0.15)] group-hover:border-cyan-400/50 group-hover:shadow-[0_0_18px_rgba(0,229,255,0.3)] transition duration-300 relative z-10 shrink-0">
        <Icon className="w-5 h-5" />
      </div>
    </div>
  );
};
