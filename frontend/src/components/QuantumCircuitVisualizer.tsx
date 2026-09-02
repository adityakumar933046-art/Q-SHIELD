import React from 'react';

interface QuantumCircuitVisualizerProps {
  inputState: string;
  bellType: string;
  fidelity: number;
  qber: number;
  attackInjected?: boolean;
}

export const QuantumCircuitVisualizer: React.FC<QuantumCircuitVisualizerProps> = ({
  inputState,
  bellType,
  fidelity,
  qber,
  attackInjected = false
}) => {
  return (
    <div className="glass-panel p-5 space-y-4 font-mono text-xs rounded-2xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-white/10 pb-3">
        <span className="text-cyan-400 font-bold text-xs tracking-wider uppercase flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#00E5FF]" />
          <span>Qiskit 3-Qubit Teleportation Circuit Model</span>
        </span>
        <div className="flex items-center space-x-4">
          <span className="text-slate-400 text-[11px]">Input State: <strong className="text-cyan-400">{inputState}</strong></span>
          <span className="text-slate-400 text-[11px]">Bell Pair: <strong className="text-cyan-400">{bellType}</strong></span>
        </div>
      </div>

      {/* Visual Circuit Grid */}
      <div className="space-y-3 py-2 overflow-x-auto">
        {/* Qubit 0 (Alice Payload Qubit) */}
        <div className="flex items-center space-x-2 min-w-[550px]">
          <span className="w-24 font-bold text-cyan-400 text-right pr-2">q_0 (Alice):</span>
          <div className="flex-1 bg-white/[0.03] border border-white/10 rounded-xl p-2.5 flex items-center justify-between shadow-inner">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 bg-cyan-500/15 text-cyan-400 font-bold border border-cyan-400/40 rounded-lg shadow-[0_0_8px_rgba(0,229,255,0.2)]">
                Prep {inputState}
              </span>
              <span className="text-slate-600 font-bold">───</span>
              <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-400/50 flex items-center justify-center font-bold shadow-[0_0_8px_rgba(0,229,255,0.3)]">
                ●
              </span>
              <span className="text-slate-600 font-bold">───</span>
              <span className="px-2.5 py-1 bg-cyan-500/15 text-cyan-400 border border-cyan-400/40 font-bold rounded-lg">
                H
              </span>
              <span className="text-slate-600 font-bold">───</span>
              <span className="px-2.5 py-1 bg-emerald-500/15 text-emerald-400 border border-emerald-400/40 rounded-lg font-bold">
                Meas c0
              </span>
            </div>
            <span className="text-[10px] text-slate-500 uppercase font-sans tracking-wider">Payload State</span>
          </div>
        </div>

        {/* Qubit 1 (Alice Entangled Half) */}
        <div className="flex items-center space-x-2 min-w-[550px]">
          <span className="w-24 font-bold text-cyan-400 text-right pr-2">q_1 (Alice):</span>
          <div className="flex-1 bg-white/[0.03] border border-white/10 rounded-xl p-2.5 flex items-center justify-between shadow-inner">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 bg-cyan-500/15 text-cyan-400 border border-cyan-400/40 font-bold rounded-lg shadow-[0_0_8px_rgba(0,229,255,0.2)]">
                H ({bellType})
              </span>
              <span className="text-slate-600 font-bold">───</span>
              <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-400/50 flex items-center justify-center font-bold">
                ●
              </span>
              <span className="text-slate-600 font-bold">───</span>
              <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-400/50 flex items-center justify-center font-bold">
                ⊕
              </span>
              <span className="text-slate-600 font-bold">───</span>
              <span className="px-2.5 py-1 bg-emerald-500/15 text-emerald-400 border border-emerald-400/40 rounded-lg font-bold">
                Meas c1
              </span>
            </div>
            <span className="text-[10px] text-slate-500 uppercase font-sans tracking-wider">Shared Bell Half</span>
          </div>
        </div>

        {/* Qubit 2 (Bob Entangled Half & Teleport Receiver) */}
        <div className="flex items-center space-x-2 min-w-[550px]">
          <span className="w-24 font-bold text-emerald-400 text-right pr-2">q_2 (Bob):</span>
          <div className="flex-1 bg-white/[0.03] border border-white/10 rounded-xl p-2.5 flex items-center justify-between shadow-inner">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 bg-white/[0.04] text-slate-400 border border-white/10 rounded-lg">
                Wait
              </span>
              <span className="text-slate-600 font-bold">───</span>
              <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-400/50 flex items-center justify-center font-bold">
                ⊕
              </span>
              <span className="text-slate-600 font-bold">───</span>
              {attackInjected ? (
                <span className="px-2.5 py-1 bg-rose-500/20 text-rose-400 border border-rose-500/50 rounded-lg font-bold shadow-[0_0_10px_rgba(244,63,94,0.3)]">
                  ATTACKED CHANNEL
                </span>
              ) : (
                <span className="px-2.5 py-1 bg-emerald-500/15 text-emerald-400 border border-emerald-400/40 rounded-lg">
                  Pauli X<sup>c1</sup> Z<sup>c0</sup>
                </span>
              )}
              <span className="text-slate-600 font-bold">───</span>
              <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-400/50 font-bold rounded-lg shadow-[0_0_8px_rgba(16,185,129,0.25)]">
                Projective P_k
              </span>
            </div>
            <span className="text-[10px] text-slate-500 uppercase font-sans tracking-wider">Teleported Qubit</span>
          </div>
        </div>
      </div>

      {/* Metrics Result Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-white/10 text-[11px]">
        <div className="bg-white/[0.03] p-3 rounded-xl border border-white/10">
          <span className="text-slate-400 block text-[10px] uppercase font-semibold">Quantum State Fidelity</span>
          <div className={`font-bold font-mono text-base mt-0.5 ${fidelity >= 0.85 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {(fidelity * 100).toFixed(2)}%
          </div>
        </div>
        <div className="bg-white/[0.03] p-3 rounded-xl border border-white/10">
          <span className="text-slate-400 block text-[10px] uppercase font-semibold">Quantum Bit Error Rate (QBER)</span>
          <div className={`font-bold font-mono text-base mt-0.5 ${qber <= 0.11 ? 'text-cyan-400' : 'text-rose-400'}`}>
            {(qber * 100).toFixed(2)}%
          </div>
        </div>
        <div className="bg-white/[0.03] p-3 rounded-xl border border-white/10">
          <span className="text-slate-400 block text-[10px] uppercase font-semibold">QBER Security Limit</span>
          <div className="font-bold font-mono text-base text-slate-300 mt-0.5">&le; 11.00%</div>
        </div>
        <div className="bg-white/[0.03] p-3 rounded-xl border border-white/10">
          <span className="text-slate-400 block text-[10px] uppercase font-semibold">Teleportation State</span>
          <div className={`font-bold text-xs uppercase mt-1 ${fidelity >= 0.85 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {fidelity >= 0.85 ? 'RECONSTRUCTED SECURE' : 'STATE DEGRADED / ATTACK'}
          </div>
        </div>
      </div>
    </div>
  );
};
