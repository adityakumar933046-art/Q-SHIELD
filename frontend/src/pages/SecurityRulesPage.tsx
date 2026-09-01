import React, { useEffect, useState } from 'react';
import { Sliders, ShieldCheck, Lock, Activity } from 'lucide-react';
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
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4 font-mono">
        <div className="relative">
          <Activity className="w-8 h-8 animate-spin text-cyan-400" />
          <div className="absolute inset-0 bg-cyan-400/20 rounded-full blur-lg animate-pulse" />
        </div>
        <span className="text-xs text-slate-400 tracking-widest uppercase">LOADING SECURITY THRESHOLD CONFIGURATION...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="glass-panel p-6 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between shadow-md gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Sliders className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">Security Rules & Statistical Threshold Configuration</h1>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl font-medium">
            Administrative governance of QBER upper bounds, statevector fidelity limits, and non-ML statistical hypothesis thresholds.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-white/[0.04] px-4 py-2 rounded-2xl border border-white/10 text-xs font-mono text-cyan-400 font-bold">
          <Lock className="w-4 h-4" />
          <span>Admin Authority Mode</span>
        </div>
      </div>

      {/* Physics Threshold Spec Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 space-y-1.5 font-mono">
          <span className="text-[11px] text-slate-400 font-semibold font-sans uppercase tracking-wider block">QBER Maximum Limit</span>
          <div className="text-2xl font-extrabold text-amber-400">&le; 11.00%</div>
          <p className="text-[10px] text-slate-400 font-sans">Shor-Preskill QKD / QDS security limit.</p>
        </div>

        <div className="glass-card p-5 space-y-1.5 font-mono">
          <span className="text-[11px] text-slate-400 font-semibold font-sans uppercase tracking-wider block">Statevector Fidelity</span>
          <div className="text-2xl font-extrabold text-emerald-400">&ge; 85.00%</div>
          <p className="text-[10px] text-slate-400 font-sans">Teleportation state reconstruction bound.</p>
        </div>

        <div className="glass-card p-5 space-y-1.5 font-mono">
          <span className="text-[11px] text-slate-400 font-semibold font-sans uppercase tracking-wider block">Chi-Square Significance</span>
          <div className="text-2xl font-extrabold text-cyan-400">&alpha; = 0.05</div>
          <p className="text-[10px] text-slate-400 font-sans">Null hypothesis rejection threshold.</p>
        </div>

        <div className="glass-card p-5 space-y-1.5 font-mono">
          <span className="text-[11px] text-slate-400 font-semibold font-sans uppercase tracking-wider block">SPRT Decision Bounds</span>
          <div className="text-2xl font-extrabold text-white">p0=0.01 / p1=0.11</div>
          <p className="text-[10px] text-slate-400 font-sans">Log-likelihood ratio decision limits.</p>
        </div>
      </div>

      {/* Rules Grid */}
      <div className="glass-panel p-6 space-y-4 rounded-3xl">
        <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <span>Active Statistical Evaluator Rules</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rules.map((rule) => (
            <div key={rule.id} className="glass-card p-5 space-y-3">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold tracking-wider">{rule.metric_type} EVALUATOR</span>
                  <h3 className="text-sm font-bold text-white">{rule.rule_name}</h3>
                </div>
                <StatusBadge status={rule.severity} />
              </div>

              <p className="text-xs text-slate-400 font-sans leading-relaxed">{rule.description}</p>

              <div className="bg-white/[0.03] p-3 rounded-2xl border border-white/5 font-mono text-xs flex justify-between items-center">
                <span className="text-slate-400">Evaluator Expression:</span>
                <span className="text-cyan-400 font-bold">
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
