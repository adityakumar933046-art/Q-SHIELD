import React, { useEffect, useState } from 'react';
import { BarChart3, Activity } from 'lucide-react';
import { api } from '../services/api';
import { AnalyticsSummary } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const AnalyticsPage: React.FC = () => {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAnalyticsSummary().then((d) => {
      setSummary(d);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4 font-mono">
        <div className="relative">
          <Activity className="w-8 h-8 animate-spin text-cyan-400" />
          <div className="absolute inset-0 bg-cyan-400/20 rounded-full blur-lg animate-pulse" />
        </div>
        <span className="text-xs text-slate-400 tracking-widest uppercase">LOADING STATISTICAL PHYSICS ANALYTICS...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center space-x-3">
          <div className="p-2 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <BarChart3 className="w-6 h-6" />
          </div>
          <span>Statistical Physics & Telemetry Analytics</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Non-machine-learning statistical analysis: Chi-Square (&chi;&sup2;) hypothesis test distributions, SPRT log-likelihood, and quantum state fidelity bounds.
        </p>
      </div>

      {/* Grid Specs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 space-y-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Chi-Square Significance Level</span>
          <div className="text-2xl font-extrabold text-cyan-400 font-mono">&alpha; = 0.05</div>
          <p className="text-xs text-slate-400">Rejection threshold for state measurement outcome hypothesis.</p>
        </div>

        <div className="glass-card p-6 space-y-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">SPRT Log-Likelihood Bounds</span>
          <div className="text-2xl font-extrabold text-white font-mono">p0=0.01 / p1=0.11</div>
          <p className="text-xs text-slate-400">Sequential probability ratio bounds for channel eavesdrop detection.</p>
        </div>

        <div className="glass-card p-6 space-y-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Max Adversary Forgery Bound</span>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono">P &le; 0.05</div>
          <p className="text-xs text-slate-400">Maximum allowed probability for unverified signature forgery.</p>
        </div>
      </div>

      {/* Timeline Chart */}
      <div className="glass-panel p-6 space-y-4 rounded-3xl">
        <div className="flex justify-between items-center">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34D399]" />
            <span>Statevector Density Matrix Fidelity Timeline</span>
          </h2>
          <span className="text-xs text-emerald-400 font-mono font-bold bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full">
            &ge; 85.0% Security Limit
          </span>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={summary?.qber_timeline || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="time" stroke="#64748B" fontSize={11} />
              <YAxis stroke="#64748B" fontSize={11} domain={[0.5, 1.0]} />
              <Tooltip
                contentStyle={{ 
                  backgroundColor: 'rgba(11, 18, 32, 0.95)', 
                  borderColor: 'rgba(16, 185, 129, 0.3)', 
                  borderRadius: '1rem',
                  color: '#FFFFFF' 
                }}
                formatter={(val: number) => [`${(val * 100).toFixed(2)}%`, 'Fidelity']}
              />
              <Line type="monotone" dataKey="fidelity" stroke="#10B981" strokeWidth={2.5} dot={{ r: 4, stroke: '#10B981', fill: '#070B14' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
