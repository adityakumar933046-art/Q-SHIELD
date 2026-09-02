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
        <h1 className="text-xl font-extrabold text-[#0F172A] flex items-center space-x-2">
          <Cpu className="w-5 h-5 text-[#00C2FF]" />
          <span>QDS Cyber Attack Simulator Suite</span>
        </h1>
        <p className="text-xs text-slate-500">
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
              className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition duration-200 shadow-sm ${
                isSelected
                  ? 'bg-white border-[#00C2FF] ring-2 ring-[#00C2FF]/30 font-bold'
                  : 'bg-white border-[#E2E8F0] hover:border-[#00C2FF]/50'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Icon className={`w-5 h-5 ${isSelected ? 'text-[#00C2FF]' : 'text-slate-500'}`} />
                  {isSelected && <span className="w-2 h-2 rounded-full bg-[#00C2FF]" />}
                </div>
                <h3 className="text-xs font-bold text-[#0F172A]">{v.title}</h3>
                <p className="text-[10px] text-slate-500 line-clamp-3 font-normal">{v.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Simulation Controls & Launcher */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-4 shadow-sm">
        <h2 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider flex items-center space-x-2">
          <Zap className="w-4 h-4 text-[#00C2FF]" />
          <span>Configure Attack Injection Parameters</span>
        </h2>

        <form onSubmit={handleRunSimulation} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end text-xs">
          <div>
            <div className="flex justify-between text-slate-700 font-semibold mb-1">
              <span>Attack Channel Noise Intensity</span>
              <span className="text-[#F59E0B] font-mono font-bold">{(intensity * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="0.9"
              step="0.05"
              value={intensity}
              onChange={(e) => setIntensity(parseFloat(e.target.value))}
              className="w-full bg-slate-200 accent-[#00C2FF] h-1.5 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1 uppercase text-[11px]">Quantum Circuit Shots</label>
            <select
              value={shots}
              onChange={(e) => setShots(parseInt(e.target.value))}
              className="w-full bg-white border border-[#E2E8F0] rounded-lg p-2 text-slate-900 font-mono text-xs focus:outline-none focus:border-[#00C2FF]"
            >
              <option value="1024">1,024 Shots (Standard)</option>
              <option value="4096">4,096 Shots (High Precision)</option>
              <option value="8192">8,192 Shots (Deep Tomography)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isSimulating}
            className="w-full bg-[#0B1220] hover:bg-[#131E33] text-white font-bold py-2.5 rounded-lg flex items-center justify-center space-x-2 transition shadow-sm"
          >
            <Cpu className="w-4 h-4 text-[#00C2FF]" />
            <span>{isSimulating ? 'Executing Attack In Qiskit...' : `Launch ${selectedAttack} Attack`}</span>
          </button>
        </form>
      </div>

      {/* Output Results & Detection Details */}
      {simulationOutput && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
            <h2 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-[#00C2FF]" />
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
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 space-y-2 text-xs font-mono shadow-sm">
              <div className="text-[#00C2FF] font-bold font-sans uppercase">Non-ML Statistical Hypothesis Testing</div>
              <div className="space-y-1 text-slate-700">
                <div className="flex justify-between py-1 border-b border-[#E2E8F0]">
                  <span className="text-slate-500">QBER Measured:</span>
                  <span className="text-[#F59E0B] font-bold">{(simulationOutput.statistical_analysis.qber * 100).toFixed(2)}%</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#E2E8F0]">
                  <span className="text-slate-500">State Fidelity:</span>
                  <span className="text-[#10B981] font-bold">{(simulationOutput.statistical_analysis.fidelity * 100).toFixed(2)}%</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#E2E8F0]">
                  <span className="text-slate-500">Chi-Square p-value:</span>
                  <span>{simulationOutput.statistical_analysis.chi_square.p_value.toExponential(4)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#E2E8F0]">
                  <span className="text-slate-500">Adversary Forgery Prob:</span>
                  <span className="text-[#F59E0B] font-bold">{(simulationOutput.statistical_analysis.forgery_probability * 100).toFixed(4)}%</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">SPRT Decision:</span>
                  <span className="text-[#0B1220] font-bold">{simulationOutput.statistical_analysis.sprt.decision}</span>
                </div>
              </div>
            </div>

            {/* Detection & Incident Created */}
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 space-y-2 text-xs font-mono shadow-sm">
              <div className="text-[#0B1220] font-bold font-sans uppercase">Threat Evaluator Result</div>
              <div className="space-y-1.5 text-slate-700">
                <div className="flex justify-between py-1 border-b border-[#E2E8F0]">
                  <span className="text-slate-500">Threat Flagged:</span>
                  <span className="font-bold text-[#0B1220]">{simulationOutput.threat_detection.threat_detected ? 'YES (BREACH DETECTED)' : 'NO'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#E2E8F0]">
                  <span className="text-slate-500">Rules Triggered:</span>
                  <span className="text-[#F59E0B] text-[11px] font-bold">{simulationOutput.threat_detection.rules_triggered.join(', ')}</span>
                </div>
                {simulationOutput.threat_detection.incident_id && (
                  <div className="flex justify-between py-1 border-b border-[#E2E8F0]">
                    <span className="text-slate-500">Incident Generated:</span>
                    <span className="text-[#00C2FF] font-bold">{simulationOutput.threat_detection.incident_id}</span>
                  </div>
                )}
                <div className="text-[11px] text-slate-500 pt-1 font-sans italic">
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
