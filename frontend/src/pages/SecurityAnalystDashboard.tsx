import React, { useState } from 'react';
import { 
  ShieldAlert, Activity, RefreshCw, Lock, AlertTriangle, 
  CheckCircle2, Flame, Sliders, Radio, ZapOff, ArrowRightLeft
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, 
  BarChart, Bar, CartesianGrid 
} from 'recharts';

interface Incident {
  id: string;
  timestamp: string;
  attackType: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  sourceNode: string;
  targetNode: string;
  qber: number;
  fidelity: number;
  sprtLlr: number;
  status: 'ACTIVE' | 'ISOLATED';
}

export const SecurityAnalystDashboard: React.FC = () => {
  // Real-time SPRT & Quantum telemetry stream
  const [telemetry, setTelemetry] = useState([
    { step: 'T-40', qber: 0.041, llr: -2.4, threshold: 0.11 },
    { step: 'T-30', qber: 0.048, llr: -1.9, threshold: 0.11 },
    { step: 'T-20', qber: 0.082, llr: 0.6, threshold: 0.11 },
    { step: 'T-10', qber: 0.154, llr: 3.8, threshold: 0.11 },
    { step: 'Now', qber: 0.162, llr: 4.2, threshold: 0.11 },
  ]);

  // Pauli Basis Noise Breakdown (Strict non-ML Physical Error Diagnostics)
  const [pauliErrors, setPauliErrors] = useState([
    { basis: 'Bit-Flip (X)', rate: 0.082, expected: 0.030 },
    { basis: 'Phase-Flip (Z)', rate: 0.076, expected: 0.030 },
    { basis: 'Bit-Phase (Y)', rate: 0.014, expected: 0.010 },
  ]);

  const [incidents, setIncidents] = useState<Incident[]>([
    {
      id: 'INC-Q-981',
      timestamp: 'Just now',
      attackType: 'INTERCEPT_RESEND_EAVESDROPPING',
      severity: 'CRITICAL',
      sourceNode: 'Relay-EVE-Alpha',
      targetNode: 'Receiver-Bob-Primary',
      qber: 0.162,
      fidelity: 0.761,
      sprtLlr: 4.2,
      status: 'ACTIVE',
    },
    {
      id: 'INC-Q-978',
      timestamp: '5 mins ago',
      attackType: 'QUANTUM_STATE_FORGERY',
      severity: 'HIGH',
      sourceNode: 'Signer-Buffer-Node',
      targetNode: 'Alice-Signer-Cluster',
      qber: 0.098,
      fidelity: 0.884,
      sprtLlr: 2.1,
      status: 'ACTIVE',
    },
  ]);

  const handleQuarantine = (id: string) => {
    setIncidents(prev =>
      prev.map(item => item.id === id ? { ...item, status: 'ISOLATED' } : item)
    );
  };

  const handleSimulateAttack = () => {
    const elevatedQber = +(0.14 + Math.random() * 0.08).toFixed(3);
    const elevatedLlr = +(3.5 + Math.random() * 2).toFixed(2);
    setTelemetry(prev => [
      ...prev.slice(1),
      { step: 'Now', qber: elevatedQber, llr: elevatedLlr, threshold: 0.11 }
    ]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 space-y-6">
      {/* Workspace Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-5 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/10 border border-red-500/30 rounded-lg">
              <ShieldAlert className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-wide text-white">
                Security Analyst SOC Console
              </h1>
              <p className="text-xs text-slate-400 font-mono">
                Statistical Physics Engine: Wald SPRT ($H_0$ vs $H_1$) & Pauli Decomposition
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleSimulateAttack}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono px-3 py-2 rounded-lg border border-slate-700 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Re-Sample Channel
          </button>
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-mono rounded-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            SPRT Engine: Active
          </span>
        </div>
      </div>

      {/* Primary Threat Diagnostic KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Observed QBER ($E_b$)</span>
            <Flame className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-bold text-red-400 font-mono">
            {(telemetry[telemetry.length - 1].qber * 100).toFixed(1)}%
          </div>
          <p className="text-[11px] text-red-500/80 font-mono">Threshold: 11.0% (Shor-Preskill Bound)</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>SPRT Likelihood Ratio ($\Lambda$)</span>
            <Activity className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 font-mono">
            {telemetry[telemetry.length - 1].llr > 0 ? `+${telemetry[telemetry.length - 1].llr}` : telemetry[telemetry.length - 1].llr}
          </div>
          <p className="text-[11px] text-amber-500/80 font-mono">Threshold $A = +2.94$ ($H_1$ Triggered)</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Quantum State Fidelity $F$</span>
            <Radio className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-400 font-mono">0.761</div>
          <p className="text-[11px] text-slate-400 font-mono">Ideal Pure Channel: $\ge 0.980$</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Active Incidents</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-400 font-mono">
            {incidents.filter(i => i.status === 'ACTIVE').length} Urgent
          </div>
          <p className="text-[11px] text-slate-400 font-mono">Requires Operator Quarantine</p>
        </div>
      </div>

      {/* Forensic Charts: SPRT & Pauli Error Decomposition */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-red-400" /> Real-Time QBER Tracking vs Shor-Preskill Limit
              </h2>
              <p className="text-xs text-slate-400 font-mono">Continuous noise accumulation above 11% proves eavesdropping</p>
            </div>
            <span className="text-[11px] font-mono bg-red-500/20 text-red-300 px-2 py-0.5 rounded">
              Violation Detected
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={telemetry}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="step" stroke="#64748b" tick={{ fontSize: 12 }} />
                <YAxis stroke="#64748b" domain={[0, 0.25]} tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                <ReferenceLine y={0.11} stroke="#ef4444" strokeDasharray="4 4" label={{ value: '11% Quantum Limit', fill: '#ef4444', fontSize: 10 }} />
                <Line type="monotone" dataKey="qber" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" /> Pauli Noise Decomposition
            </h2>
            <p className="text-xs text-slate-400 font-mono">Basis error distribution vs thermal expected baseline</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pauliErrors}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="basis" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                <Bar dataKey="rate" fill="#38bdf8" name="Observed Error" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expected" fill="#334155" name="Normal Noise" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Incident Forensics and Channel Isolation Control Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/60">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-rose-400" />
            <h2 className="text-sm font-semibold text-white">Active Quantum Threat Incidents & Mitigation</h2>
          </div>
          <span className="text-xs font-mono text-slate-400">Zero-Trust Fiber Channel Defense</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3.5">Incident ID</th>
                <th className="p-3.5">Threat Classifier</th>
                <th className="p-3.5">Severity</th>
                <th className="p-3.5">Channel Route</th>
                <th className="p-3.5">Fidelity $F$</th>
                <th className="p-3.5">SPRT Decision</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Containment Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {incidents.map((inc) => (
                <tr key={inc.id} className="hover:bg-slate-800/30 transition">
                  <td className="p-3.5 font-bold text-cyan-400">{inc.id}</td>
                  <td className="p-3.5 text-slate-200">{inc.attackType}</td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 font-semibold border border-red-500/30">
                      {inc.severity}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-400">{inc.sourceNode} → {inc.targetNode}</td>
                  <td className="p-3.5 text-amber-300 font-semibold">{inc.fidelity}</td>
                  <td className="p-3.5 text-rose-400 font-bold">ACCEPT_H1_ATTACK</td>
                  <td className="p-3.5">
                    {inc.status === 'ISOLATED' ? (
                      <span className="inline-flex items-center gap-1 text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Channel Isolated
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-rose-400 font-semibold">
                        <AlertTriangle className="w-3.5 h-3.5" /> Intercepting
                      </span>
                    )}
                  </td>
                  <td className="p-3.5 text-right">
                    {inc.status === 'ACTIVE' ? (
                      <button
                        onClick={() => handleQuarantine(inc.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-xs transition active:scale-95"
                      >
                        <ZapOff className="w-3 h-3" /> Quarantine Channel
                      </button>
                    ) : (
                      <span className="text-slate-500 font-mono">Mitigated</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};