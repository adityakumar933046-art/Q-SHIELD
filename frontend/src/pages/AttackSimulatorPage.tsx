import React, { useState } from 'react';
import { Cpu, AlertTriangle, ShieldAlert, Zap, Radio, RefreshCw, Lock, Terminal } from 'lucide-react';
import { QuantumCircuitVisualizer } from '../components/QuantumCircuitVisualizer';
import { StatusBadge } from '../components/StatusBadge';
import { api } from '../services/api';

export const AttackSimulatorPage: React.FC = () => {
  const [selectedAttack, setSelectedAttack] = useState<string>('CHANNEL_MANIPULATION');
  const [intensity, setIntensity] = useState<number>(0.5);
  const [shots, setShots] = useState<number>(1024);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationOutput, setSimulationOutput] = useState<any>(null);

  const attackVectors = [
    {
      id: 'FORGERY',
      title: 'Signature Forgery Attack',
      icon: Lock,
      description: 'Adversary (Eve) attempts to construct valid QDS signatures without knowledge of secret Pauli eigenstate keys.'
    },
    {
      id: 'IMPERSONATION',
      title: 'Sender Impersonation Attack',
      icon: ShieldAlert,
      description: 'Attacker injects tampered classical Bell State Measurement (BSM) correction bits during Alice to Bob transmission.'
    },
    {
      id: 'REPLAY',
      title: 'Replay Attack',
      icon: RefreshCw,
      description: 'Replaying stale, previously captured quantum projective measurement bits to pass signature verification.'
    },
    {
      id: 'CHANNEL_MANIPULATION',
      title: 'Quantum Channel Noise / Eavesdrop',
      icon: Radio,
      description: 'Injecting bit-flip (X), phase-flip (Z), or depolarizing channel disturbance on quantum fiber links.'
    },
    {
      id: 'UNAUTHORIZED_VERIFICATION',
      title: 'Unauthorized Verification Attempt',
      icon: AlertTriangle,
      description: 'Unauthorized external entity or node attempting signature verification without valid RBAC clearance.'
    }
  ];

  const handleRunSimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSimulating(true);
    try {
      const res = await api.simulateAttack({
        attack_vector: selectedAttack,
        intensity: intensity,
        shots: shots
      });
      setSimulationOutput(res);
    } catch (err) {
      console.error("Attack simulation error:", err);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-white flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Cpu className="w-4 h-4" />
          </div>
          <span>QDS Cyber Attack Simulator Suite</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Simulate malicious attack vectors against Quantum Digital Signatures to evaluate statistical threshold detection efficacy.
        </p>
      </div>

      {/* Vector Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {attackVectors.map((v) => {
          const Icon = v.icon;
          const isSelected = selectedAttack === v.id;
          return (
            <button
              key={v.id}
              onClick={() => setSelectedAttack(v.id)}
              className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition duration-200 shadow-sm relative overflow-hidden ${
                isSelected
                  ? 'bg-cyan-500/10 border-cyan-400 shadow-[0_0_20px_rgba(0,229,255,0.25)]'
                  : 'glass-card border-white/10 hover:border-cyan-500/30'
              }`}
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-xl border ${isSelected ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300' : 'bg-white/[0.04] border-white/10 text-slate-400'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  {isSelected && <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#00E5FF] animate-pulse" />}
                </div>
                <h3 className={`text-xs font-bold ${isSelected ? 'text-cyan-300' : 'text-white'}`}>{v.title}</h3>
                <p className="text-[10px] text-slate-400 line-clamp-3 font-normal leading-relaxed">{v.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Simulation Controls & Launcher */}
      <div className="glass-card p-6 space-y-4">
        <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
          <Zap className="w-4 h-4 text-cyan-400" />
          <span>Configure Attack Injection Parameters</span>
        </h2>

        <form onSubmit={handleRunSimulation} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end text-xs">
          <div>
            <div className="flex justify-between text-slate-300 font-semibold mb-2">
              <span>Attack Channel Noise Intensity</span>
              <span className="text-amber-400 font-mono font-bold">{(intensity * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="0.9"
              step="0.05"
              value={intensity}
              onChange={(e) => setIntensity(parseFloat(e.target.value))}
              className="w-full bg-slate-800 accent-cyan-400 h-2 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-2 uppercase text-[11px]">Quantum Circuit Shots</label>
            <select
              value={shots}
              onChange={(e) => setShots(parseInt(e.target.value))}
              className="w-full glass-input p-2.5 text-white font-mono text-xs focus:outline-none bg-[#0B1220]"
            >
              <option value="1024" className="bg-slate-900 text-white">1,024 Shots (Standard)</option>
              <option value="4096" className="bg-slate-900 text-white">4,096 Shots (High Precision)</option>
              <option value="8192" className="bg-slate-900 text-white">8,192 Shots (Deep Tomography)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isSimulating}
            className="w-full btn-cyan-gradient py-2.5 rounded-xl flex items-center justify-center space-x-2 transition cursor-pointer"
          >
            <Cpu className="w-4 h-4 text-black" />
            <span className="font-bold">{isSimulating ? 'Executing In Qiskit...' : `Launch ${selectedAttack} Attack`}</span>
          </button>
        </form>
      </div>

      {/* Output Results & Detection Details */}
      {simulationOutput && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>Attack Simulation Telemetry Output</span>
            </h2>
            <StatusBadge status={simulationOutput.threat_detection.threat_category || 'SECURE'} />
          </div>

          <QuantumCircuitVisualizer
            inputState={simulationOutput.quantum_execution.input_state_symbol}
            bellType={simulationOutput.quantum_execution.bell_state_type}
            fidelity={simulationOutput.quantum_execution.fidelity}
            qber={simulationOutput.quantum_execution.qber}
            attackInjected={true}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Statistical Physics Analysis */}
            <div className="glass-card p-5 space-y-3 text-xs font-mono">
              <div className="text-cyan-400 font-bold font-sans uppercase tracking-wider">Non-ML Statistical Hypothesis Testing</div>
              <div className="space-y-1 text-slate-300">
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-slate-400">QBER Measured:</span>
                  <span className="text-amber-400 font-bold">{(simulationOutput.statistical_analysis.qber * 100).toFixed(2)}%</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-slate-400">State Fidelity:</span>
                  <span className="text-emerald-400 font-bold">{(simulationOutput.statistical_analysis.fidelity * 100).toFixed(2)}%</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-slate-400">Chi-Square p-value:</span>
                  <span className="text-white">{simulationOutput.statistical_analysis.chi_square.p_value.toExponential(4)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-slate-400">Adversary Forgery Prob:</span>
                  <span className="text-rose-400 font-bold">{(simulationOutput.statistical_analysis.forgery_probability * 100).toFixed(4)}%</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-400">SPRT Decision:</span>
                  <span className="text-cyan-400 font-bold">{simulationOutput.statistical_analysis.sprt.decision}</span>
                </div>
              </div>
            </div>

            {/* Detection & Incident Created */}
            <div className="glass-card p-5 space-y-3 text-xs font-mono">
              <div className="text-white font-bold font-sans uppercase tracking-wider">Threat Evaluator Result</div>
              <div className="space-y-1.5 text-slate-300">
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-slate-400">Threat Flagged:</span>
                  <span className="font-bold text-rose-400">{simulationOutput.threat_detection.threat_detected ? 'YES (BREACH DETECTED)' : 'NO'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-slate-400">Rules Triggered:</span>
                  <span className="text-amber-400 text-[11px] font-bold">{simulationOutput.threat_detection.rules_triggered.join(', ')}</span>
                </div>
                {simulationOutput.threat_detection.incident_id && (
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span className="text-slate-400">Incident Generated:</span>
                    <span className="text-cyan-400 font-bold">{simulationOutput.threat_detection.incident_id}</span>
                  </div>
                )}
                <div className="text-[11px] text-slate-400 pt-1 font-sans italic">
                  {simulationOutput.threat_detection.explanation}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
