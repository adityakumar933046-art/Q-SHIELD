import React, { useEffect, useState } from 'react';
import { BarChart3 } from 'lucide-react';
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
    return <div className="p-8 text-center text-slate-500 font-sans">Loading Statistical Physics Analytics...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-[#0F172A] flex items-center space-x-2">
          <BarChart3 className="w-5 h-5 text-[#00C2FF]" />
          <span>Statistical Physics & Telemetry Analytics</span>
        </h1>
        <p className="text-xs text-slate-500">
          Non-machine-learning statistical analysis: Chi-Square (&chi;&sup2;) hypothesis test distributions, SPRT log-likelihood, and quantum state fidelity bounds.
        </p>
      </div>

      {/* Grid Specs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-2 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Chi-Square Significance Level</span>
          <div className="text-2xl font-bold text-[#00C2FF] font-sans">&alpha; = 0.05</div>
          <p className="text-xs text-slate-500">Rejection threshold for state measurement outcome hypothesis.</p>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-2 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">SPRT Log-Likelihood Bounds</span>
          <div className="text-2xl font-bold text-[#0B1220] font-sans">p0=0.01 / p1=0.11</div>
          <p className="text-xs text-slate-500">Sequential probability ratio bounds for channel eavesdrop detection.</p>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-2 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Max Adversary Forgery Bound</span>
          <div className="text-2xl font-bold text-[#10B981] font-sans">P &le; 0.05</div>
          <p className="text-xs text-slate-500">Maximum allowed probability for unverified signature forgery.</p>
        </div>
      </div>

      {/* Timeline Chart */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-4 shadow-sm">
        <div className="flex justify-between items-center">
          <h2 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
            Statevector Density Matrix Fidelity Timeline
          </h2>
          <span className="text-xs text-[#10B981] font-sans font-bold">&ge; 85.0% Security Limit</span>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={summary?.qber_timeline || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="time" stroke="#64748B" fontSize={11} />
              <YAxis stroke="#64748B" fontSize={11} domain={[0.5, 1.0]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0B1220', borderColor: '#1F2E4D', color: '#FFFFFF' }}
                formatter={(val: number) => [`${(val * 100).toFixed(2)}%`, 'Fidelity']}
              />
              <Line type="monotone" dataKey="fidelity" stroke="#10B981" strokeWidth={2.5} dot={{ r: 3, fill: '#10B981' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
