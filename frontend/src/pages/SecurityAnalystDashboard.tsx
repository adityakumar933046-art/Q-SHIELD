import React, { useState } from 'react';
import { ShieldAlert, Activity, RefreshCw, Lock } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { QuantumTelemetry, SecurityIncident } from '../types/analyst';

export const SecurityAnalystDashboard: React.FC = () => {
  const [telemetry] = useState<QuantumTelemetry[]>([
    { timestamp: '00:01', qber: 0.042, fidelity: 0.985, threshold: 0.11, sprtLlr: -2.14 },
    { timestamp: '00:02', qber: 0.051, fidelity: 0.972, threshold: 0.11, sprtLlr: -1.88 },
    { timestamp: '00:03', qber: 0.089, fidelity: 0.912, threshold: 0.11, sprtLlr: 0.45 },
    { timestamp: '00:04', qber: 0.158, fidelity: 0.784, threshold: 0.11, sprtLlr: 3.42 },
    { timestamp: '00:05', qber: 0.141, fidelity: 0.810, threshold: 0.11, sprtLlr: 2.89 },
  ]);

  const [incidents, setIncidents] = useState<SecurityIncident[]>([
    {
      id: 'INC-Q-904',
      timestamp: 'Just now',
      attackType: 'INTERCEPT_RESEND',
      severity: 'CRITICAL',
      sourceNode: 'Eve-Intermediary-Node',
      targetNode: 'Bob-Verification-Station',
      qber: 0.158,
      fidelity: 0.784,
      chiSquarePValue: 0.0008,
      sprtDecision: 'ACCEPT_H1_ATTACK',
      status: 'ACTIVE',
    },
    {
      id: 'INC-Q-903',
      timestamp: '4 mins ago',
      attackType: 'FORGERY_ATTACK',
      severity: 'HIGH',
      sourceNode: 'Forged-Identity-Relay',
      targetNode: 'Alice-Signer-Cluster',
      qber: 0.092,
      fidelity: 0.891,
      chiSquarePValue: 0.034,
      sprtDecision: 'CONTINUE_SAMPLING',
      status: 'UNDER_REVIEW',
    },
  ]);

  const handleMitigate = (id: string) => {
    setIncidents((prev) =>
      prev.map((inc) => (inc.id === id ? { ...inc, status: 'MITIGATED' } : inc))
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <ShieldAlert className="text-red-500 w-7 h-7" /> Security Analyst Telemetry Portal
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Engine: Pauli Distributions & Wald's Sequential Probability Ratio Test (Strictly Non-ML)
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="text-xs text-slate-400 font-mono">Current QBER</div>
          <div className="text-3xl font-extrabold text-red-400 mt-1">15.8%</div>
          <div className="text-xs text-red-500/80 mt-1">Threshold: 11.0% (Shor-Preskill)</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="text-xs text-slate-400 font-mono">Density Fidelity F(ρ,σ)</div>
          <div className="text-3xl font-extrabold text-amber-400 mt-1">0.784</div>
          <div className="text-xs text-amber-500/80 mt-1">Target: &gt; 0.950</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="text-xs text-slate-400 font-mono">Hypothesis Testing (χ²)</div>
          <div className="text-3xl font-extrabold text-emerald-400 mt-1">p = 0.0008</div>
          <div className="text-xs text-slate-400 mt-1">Null rejected (Tampering)</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="text-xs text-slate-400 font-mono">SPRT Decision Bound</div>
          <div className="text-3xl font-extrabold text-red-500 mt-1">ACCEPT_H1</div>
          <div className="text-xs text-slate-400 mt-1">Active Attack Confirmed</div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" /> Real-Time QBER vs. Quantum Noise Threshold
          </span>
          <span className="text-xs font-mono text-slate-400">Live Window (5m)</span>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={telemetry}>
              <XAxis dataKey="timestamp" stroke="#64748b" />
              <YAxis stroke="#64748b" domain={[0, 0.25]} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
              <ReferenceLine y={0.11} label="Max Noise Bound (11%)" stroke="#ef4444" strokeDasharray="4 4" />
              <Line type="monotone" dataKey="qber" stroke="#f43f5e" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Threat Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center">
          <span className="text-sm font-semibold flex items-center gap-2">
            <Lock className="w-4 h-4 text-rose-400" /> Detected Incidents & Anomaly Forensics
          </span>
          <span className="text-xs bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full font-mono">
            {incidents.filter((i) => i.status !== 'MITIGATED').length} Active
          </span>
        </div>
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-950 text-slate-400 text-xs font-mono border-b border-slate-800">
            <tr>
              <th className="p-3">Incident ID</th>
              <th className="p-3">Attack Type</th>
              <th className="p-3">Severity</th>
              <th className="p-3">Source → Target</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 font-mono text-xs">
            {incidents.map((inc) => (
              <tr key={inc.id} className="hover:bg-slate-800/40">
                <td className="p-3 text-cyan-400 font-semibold">{inc.id}</td>
                <td className="p-3">{inc.attackType}</td>
                <td className="p-3">
                  <span className="bg-red-500/20 text-red-400 px-2 py-0.5 rounded font-bold">
                    {inc.severity}
                  </span>
                </td>
                <td className="p-3 text-slate-400">{inc.sourceNode} → {inc.targetNode}</td>
                <td className="p-3">
                  <span className={inc.status === 'MITIGATED' ? 'text-emerald-400' : 'text-amber-400'}>
                    {inc.status}
                  </span>
                </td>
                <td className="p-3 text-right">
                  {inc.status !== 'MITIGATED' && (
                    <button
                      onClick={() => handleMitigate(inc.id)}
                      className="bg-red-600/80 hover:bg-red-500 text-white px-3 py-1 rounded text-xs transition"
                    >
                      Quarantine Channel
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};