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
    <div className="bg-[#0B1220] border border-[#1A263D] rounded-xl p-5 space-y-4 font-sans text-xs shadow-md">
      <div className="flex justify-between items-center border-b border-[#1A263D] pb-3">
        <span className="text-[#00C2FF] font-bold text-xs tracking-wider uppercase">
          Qiskit 3-Qubit Teleportation Circuit Model
        </span>
        <div className="flex items-center space-x-4">
          <span className="text-slate-400 text-[11px]">Input State: <strong className="text-[#00C2FF]">{inputState}</strong></span>
          <span className="text-slate-400 text-[11px]">Bell Pair: <strong className="text-[#00C2FF]">{bellType}</strong></span>
        </div>
      </div>

      {/* Visual Circuit Grid */}
      <div className="space-y-3 py-2 overflow-x-auto">
        {/* Qubit 0 (Alice Payload Qubit) */}
        <div className="flex items-center space-x-2 min-w-[550px]">
          <span className="w-20 font-bold text-[#00C2FF] text-right pr-2">q_0 (Alice):</span>
          <div className="flex-1 bg-[#131E33] border border-[#1F2E4D] rounded-lg p-2 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-1 bg-[#00C2FF]/20 text-[#00C2FF] font-bold border border-[#00C2FF]/40 rounded">
                Prep {inputState}
              </span>
              <span className="text-slate-400">───</span>
              <span className="w-6 h-6 rounded-full bg-[#00C2FF]/20 text-[#00C2FF] border border-[#00C2FF]/50 flex items-center justify-center font-bold">
                ●
              </span>
              <span className="text-slate-400">───</span>
              <span className="px-2 py-1 bg-[#00C2FF]/20 text-[#00C2FF] border border-[#00C2FF]/40 font-bold rounded">
                H
              </span>
              <span className="text-slate-400">───</span>
              <span className="px-2 py-1 bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40 rounded">
                Meas c0
              </span>
            </div>
            <span className="text-[10px] text-slate-400 uppercase font-sans">Payload State</span>
          </div>
        </div>

        {/* Qubit 1 (Alice Entangled Half) */}
        <div className="flex items-center space-x-2 min-w-[550px]">
          <span className="w-20 font-bold text-[#00C2FF] text-right pr-2">q_1 (Alice):</span>
          <div className="flex-1 bg-[#131E33] border border-[#1F2E4D] rounded-lg p-2 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-1 bg-[#00C2FF]/20 text-[#00C2FF] border border-[#00C2FF]/40 rounded">
                H ({bellType})
              </span>
              <span className="text-slate-400">───</span>
              <span className="w-6 h-6 rounded-full bg-[#00C2FF]/20 text-[#00C2FF] border border-[#00C2FF]/50 flex items-center justify-center font-bold">
                ●
              </span>
              <span className="text-slate-400">───</span>
              <span className="w-6 h-6 rounded-full bg-[#00C2FF]/20 text-[#00C2FF] border border-[#00C2FF]/50 flex items-center justify-center font-bold">
                ⊕
              </span>
              <span className="text-slate-400">───</span>
              <span className="px-2 py-1 bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40 rounded">
                Meas c1
              </span>
            </div>
            <span className="text-[10px] text-slate-400 uppercase font-sans">Shared Bell Half</span>
          </div>
        </div>

        {/* Qubit 2 (Bob Entangled Half & Teleport Receiver) */}
        <div className="flex items-center space-x-2 min-w-[550px]">
          <span className="w-20 font-bold text-[#10B981] text-right pr-2">q_2 (Bob):</span>
          <div className="flex-1 bg-[#131E33] border border-[#1F2E4D] rounded-lg p-2 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-1 bg-[#0B1220] text-slate-400 border border-[#1A263D] rounded">
                Wait
              </span>
              <span className="text-slate-400">───</span>
              <span className="w-6 h-6 rounded-full bg-[#00C2FF]/20 text-[#00C2FF] border border-[#00C2FF]/50 flex items-center justify-center font-bold">
                ⊕
              </span>
              <span className="text-slate-400">───</span>
              {attackInjected ? (
                <span className="px-2 py-1 bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/50 rounded font-bold">
                  ATTACKED CHANNEL
                </span>
              ) : (
                <span className="px-2 py-1 bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40 rounded">
                  Pauli X<sup>c1</sup> Z<sup>c0</sup>
                </span>
              )}
              <span className="text-slate-400">───</span>
              <span className="px-2 py-1 bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/50 font-bold rounded">
                Projective P_k
              </span>
            </div>
            <span className="text-[10px] text-slate-400 uppercase font-sans">Teleported Qubit</span>
          </div>
        </div>
      </div>

      {/* Metrics Result Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-[#1A263D] text-[11px]">
        <div className="bg-[#131E33] p-2.5 rounded-lg border border-[#1F2E4D]">
          <span className="text-slate-400">Quantum State Fidelity:</span>
          <div className={`font-bold font-sans text-sm ${fidelity >= 0.85 ? 'text-[#10B981]' : 'text-[#F59E0B]'}`}>
            {(fidelity * 100).toFixed(2)}%
          </div>
        </div>
        <div className="bg-[#131E33] p-2.5 rounded-lg border border-[#1F2E4D]">
          <span className="text-slate-400">Quantum Bit Error Rate (QBER):</span>
          <div className={`font-bold font-sans text-sm ${qber <= 0.11 ? 'text-[#00C2FF]' : 'text-[#F59E0B]'}`}>
            {(qber * 100).toFixed(2)}%
          </div>
        </div>
        <div className="bg-[#131E33] p-2.5 rounded-lg border border-[#1F2E4D]">
          <span className="text-slate-400">QBER Security Limit:</span>
          <div className="font-bold font-sans text-sm text-slate-300">&le; 11.00%</div>
        </div>
        <div className="bg-[#131E33] p-2.5 rounded-lg border border-[#1F2E4D]">
          <span className="text-slate-400">Teleportation State:</span>
          <div className={`font-bold text-xs uppercase ${fidelity >= 0.85 ? 'text-[#10B981]' : 'text-[#F59E0B]'}`}>
            {fidelity >= 0.85 ? 'RECONSTRUCTED SECURE' : 'STATE DEGRADED / ATTACK'}
          </div>
        </div>
      </div>
    </div>
  );
};
