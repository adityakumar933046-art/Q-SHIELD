import React, { useEffect, useState } from 'react';
import { Sliders, ShieldCheck, Lock, AlertTriangle } from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import { api } from '../services/api';
import { ThresholdRule } from '../types';

export const SecurityRulesPage: React.FC = () => {
  const [rules, setRules] = useState<ThresholdRule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getThresholdRules().then((d) => {
      setRules(d);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-sans">Loading Security Threshold Configuration...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#0B1220] border border-[#1A263D] rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between shadow-md text-white">
        <div className="space-y-1">
          <div className="flex items-center space-x-3">
            <Sliders className="w-6 h-6 text-[#00C2FF]" />
            <h1 className="text-xl font-bold tracking-wide">Security Rules & Statistical Threshold Configuration</h1>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl font-medium">
            Administrative governance of QBER upper bounds, statevector fidelity limits, and non-ML statistical hypothesis thresholds.
          </p>
        </div>

        <div className="mt-4 md:mt-0 flex items-center space-x-2 bg-[#131E33] px-3.5 py-1.5 rounded-lg border border-[#1F2E4D] text-xs font-sans text-[#00C2FF] font-bold">
          <Lock className="w-4 h-4" />
          <span>Admin Authority Mode</span>
        </div>
      </div>

      {/* Physics Threshold Spec Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 space-y-1 shadow-sm font-sans">
          <span className="text-[11px] text-slate-500 font-semibold font-sans uppercase">QBER Maximum Limit</span>
          <div className="text-xl font-bold text-[#F59E0B]">&le; 11.00%</div>
          <p className="text-[10px] text-slate-500 font-sans">Shor-Preskill QKD / QDS security limit.</p>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 space-y-1 shadow-sm font-sans">
          <span className="text-[11px] text-slate-500 font-semibold font-sans uppercase">Statevector Fidelity</span>
          <div className="text-xl font-bold text-[#10B981]">&ge; 85.00%</div>
          <p className="text-[10px] text-slate-500 font-sans">Teleportation state reconstruction bound.</p>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 space-y-1 shadow-sm font-sans">
          <span className="text-[11px] text-slate-500 font-semibold font-sans uppercase">Chi-Square Significance</span>
          <div className="text-xl font-bold text-[#00C2FF]">&alpha; = 0.05</div>
          <p className="text-[10px] text-slate-500 font-sans">Null hypothesis rejection threshold.</p>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 space-y-1 shadow-sm font-sans">
          <span className="text-[11px] text-slate-500 font-semibold font-sans uppercase">SPRT Decision Bounds</span>
          <div className="text-xl font-bold text-[#0B1220]">p0=0.01 / p1=0.11</div>
          <p className="text-[10px] text-slate-500 font-sans">Log-likelihood ratio decision limits.</p>
        </div>
      </div>

      {/* Rules Grid */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-4 shadow-sm">
        <h2 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-[#00C2FF]" />
          <span>Active Statistical Evaluator Rules</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rules.map((rule) => (
            <div key={rule.id} className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[10px] font-sans text-[#00C2FF] uppercase font-bold">{rule.metric_type} EVALUATOR</span>
                  <h3 className="text-sm font-bold text-[#0F172A]">{rule.rule_name}</h3>
                </div>
                <StatusBadge status={rule.severity} />
              </div>

              <p className="text-xs text-slate-600 font-sans">{rule.description}</p>

              <div className="bg-white p-3 rounded-lg border border-[#E2E8F0] font-sans text-xs flex justify-between items-center">
                <span className="text-slate-500">Evaluator Expression:</span>
                <span className="text-[#0B1220] font-bold">
                  {rule.metric_type} {rule.operator} {rule.threshold_value}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
