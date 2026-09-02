import React, { useState, useEffect } from 'react';
import { Key, ShieldCheck, Zap } from 'lucide-react';
import { QuantumCircuitVisualizer } from '../components/QuantumCircuitVisualizer';
import { StatusBadge } from '../components/StatusBadge';
import { api } from '../services/api';
import { QuantumDigitalSignature, QuantumExecutionResult } from '../types';

export const QdsStudioPage: React.FC = () => {
  const [signatures, setSignatures] = useState<QuantumDigitalSignature[]>([]);
  const [payload, setPayload] = useState('CLASSIFIED_DEFENSE_DIRECTIVE_2026_QDS_KEY');
  const [quantumStateBasis, setQuantumStateBasis] = useState('|+>');
  const [bellPairType, setBellPairType] = useState('PHI_PLUS');
  const [isSigning, setIsSigning] = useState(false);

  const [lastSignature, setLastSignature] = useState<QuantumDigitalSignature | null>(null);
  const [lastExecution, setLastExecution] = useState<QuantumExecutionResult | null>(null);

  // Verification state
  const [selectedSigId, setSelectedSigId] = useState('');
  const [verifyPayload, setVerifyPayload] = useState('');
  const [verifyNoise, setVerifyNoise] = useState(0.0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);

  const loadSignatures = async () => {
    try {
      const sigs = await api.getSignatures();
      setSignatures(sigs);
      if (sigs.length > 0 && !selectedSigId) {
        setSelectedSigId(sigs[0].signature_id);
        setVerifyPayload(sigs[0].payload_summary);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadSignatures();
  }, []);

  const handleCreateSignature = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSigning(true);
    try {
      const res = await api.createSignature({
        payload_content: payload,
        quantum_state_basis: quantumStateBasis,
        bell_pair_type: bellPairType
      });
      setLastSignature(res.signature);
      setLastExecution(res.quantum_teleportation_key);
      await loadSignatures();
    } catch (err) {
      console.error("Signature creation failed:", err);
    } finally {
      setIsSigning(false);
    }
  };

  const handleVerifySignature = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSigId) return;
    setIsVerifying(true);
    try {
      const res = await api.verifySignature({
        signature_id: selectedSigId,
        payload_content: verifyPayload,
        simulated_noise: verifyNoise
      });
      setVerificationResult(res);
      await loadSignatures();
    } catch (err) {
      console.error("Verification failed:", err);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center space-x-3">
          <div className="p-2 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Key className="w-6 h-6" />
          </div>
          <span>QDS Studio & Quantum Teleportation Verifier</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Generate Quantum Digital Signatures using Pauli Eigenstate sequences & verify teleportation fidelity in Qiskit.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Step 1: Issue Quantum Digital Signature */}
        <div className="glass-panel p-6 space-y-4 rounded-3xl">
          <div className="flex items-center space-x-3 border-b border-white/10 pb-3">
            <span className="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-400/50 text-cyan-400 font-extrabold text-xs flex items-center justify-center shadow-[0_0_8px_rgba(0,229,255,0.3)]">
              1
            </span>
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">
              Issue Quantum Digital Signature (Sender)
            </h2>
          </div>

          <form onSubmit={handleCreateSignature} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 font-semibold mb-1 uppercase text-[10px] tracking-wider">Payload Message / Document Content</label>
              <textarea
                value={payload}
                onChange={(e) => setPayload(e.target.value)}
                rows={3}
                className="w-full glass-input p-3 text-white focus:border-cyan-400 font-mono text-xs"
                placeholder="Enter payload string..."
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 font-semibold mb-1 uppercase text-[10px] tracking-wider">Pauli State Basis</label>
                <select
                  value={quantumStateBasis}
                  onChange={(e) => setQuantumStateBasis(e.target.value)}
                  className="w-full glass-input p-2.5 text-white focus:border-cyan-400 font-mono text-xs"
                >
                  <option value="|+>" className="bg-slate-900">|+&gt; (X basis +1)</option>
                  <option value="|->" className="bg-slate-900">|-&gt; (X basis -1)</option>
                  <option value="|0>" className="bg-slate-900">|0&gt; (Z basis +1)</option>
                  <option value="|1>" className="bg-slate-900">|1&gt; (Z basis -1)</option>
                  <option value="|+i>" className="bg-slate-900">|+i&gt; (Y basis +1)</option>
                  <option value="|-i>" className="bg-slate-900">|-i&gt; (Y basis -1)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1 uppercase text-[10px] tracking-wider">Entangled Bell State</label>
                <select
                  value={bellPairType}
                  onChange={(e) => setBellPairType(e.target.value)}
                  className="w-full glass-input p-2.5 text-white focus:border-cyan-400 font-mono text-xs"
                >
                  <option value="PHI_PLUS" className="bg-slate-900">|&Phi;+&gt; (|00&gt;+|11&gt;)/&radic;2</option>
                  <option value="PHI_MINUS" className="bg-slate-900">|&Phi;-&gt; (|00&gt;-|11&gt;)/&radic;2</option>
                  <option value="PSI_PLUS" className="bg-slate-900">|&Psi;+&gt; (|01&gt;+|10&gt;)/&radic;2</option>
                  <option value="PSI_MINUS" className="bg-slate-900">|&Psi;-&gt; (|01&gt;-|10&gt;)/&radic;2</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSigning}
              className="w-full btn-cyan-gradient py-3 rounded-2xl flex items-center justify-center space-x-2 font-bold text-xs"
            >
              <Key className="w-4 h-4 text-black" />
              <span>{isSigning ? 'Executing Qiskit Teleportation Key Prep...' : 'Sign Payload & Distribute QDS'}</span>
            </button>
          </form>

          {lastSignature && (
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-xs space-y-2 font-mono text-white">
              <div className="flex justify-between items-center font-bold">
                <span className="text-cyan-400">Signature Issued Successfully!</span>
                <StatusBadge status={lastSignature.status} />
              </div>
              <div className="text-slate-200">ID: {lastSignature.signature_id}</div>
              <div className="text-slate-400 text-[11px] truncate">SHA256 Hash: {lastSignature.message_digest}</div>
              <div className="text-slate-400 text-[11px]">Execution ID: {lastSignature.quantum_execution_id}</div>
            </div>
          )}
        </div>

        {/* Step 2: Verify Teleportation Signature */}
        <div className="glass-panel p-6 space-y-4 rounded-3xl">
          <div className="flex items-center space-x-3 border-b border-white/10 pb-3">
            <span className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-emerald-400 font-extrabold text-xs flex items-center justify-center shadow-[0_0_8px_rgba(16,185,129,0.3)]">
              2
            </span>
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">
              Verify Teleportation Signature (Receiver)
            </h2>
          </div>

          <form onSubmit={handleVerifySignature} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 font-semibold mb-1 uppercase text-[10px] tracking-wider">Select Signature to Verify</label>
              <select
                value={selectedSigId}
                onChange={(e) => {
                  setSelectedSigId(e.target.value);
                  const found = signatures.find(s => s.signature_id === e.target.value);
                  if (found) setVerifyPayload(found.payload_summary);
                }}
                className="w-full glass-input p-2.5 text-white focus:border-cyan-400 font-mono text-xs"
              >
                {signatures.map((s) => (
                  <option key={s.signature_id} value={s.signature_id} className="bg-slate-900">
                    {s.signature_id} ({s.status}) - Hash: {s.message_digest.slice(0, 8)}...
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1 uppercase text-[10px] tracking-wider">Provided Payload Content</label>
              <textarea
                value={verifyPayload}
                onChange={(e) => setVerifyPayload(e.target.value)}
                rows={2}
                className="w-full glass-input p-2.5 text-white focus:border-cyan-400 font-mono text-xs"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-400 font-semibold mb-1 text-[10px] uppercase tracking-wider">
                <span>Simulate Channel Noise Level</span>
                <span className="text-cyan-400 font-mono font-bold">{(verifyNoise * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.5"
                step="0.05"
                value={verifyNoise}
                onChange={(e) => setVerifyNoise(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            <button
              type="submit"
              disabled={isVerifying || !selectedSigId}
              className="w-full btn-glass py-3 rounded-2xl flex items-center justify-center space-x-2 font-bold text-xs"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{isVerifying ? 'Running Projective Measurement Check...' : 'Verify Signature & QBER Bounds'}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Circuit & Verification Results Visualization */}
      {(lastExecution || verificationResult) && (
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider">
            Quantum Teleportation & Statistical Verification Output
          </h2>

          <QuantumCircuitVisualizer
            inputState={verificationResult?.quantum_execution.input_state_symbol || lastExecution?.input_state_symbol || '|+>'}
            bellType={verificationResult?.quantum_execution.bell_state_type || lastExecution?.bell_state_type || 'PHI_PLUS'}
            fidelity={verificationResult?.quantum_execution.fidelity ?? lastExecution?.fidelity ?? 1.0}
            qber={verificationResult?.quantum_execution.qber ?? lastExecution?.qber ?? 0.0}
            attackInjected={verificationResult?.threat_evaluation.threat_detected || false}
          />

          {verificationResult && (
            <div className="glass-panel p-6 rounded-3xl space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                <span className="text-white font-bold font-sans">Verification Result:</span>
                <StatusBadge status={verificationResult.verification_attempt.verification_result} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                <div className="bg-white/[0.03] p-3 rounded-xl border border-white/10">
                  <span className="text-slate-400 block text-[10px] uppercase">Digest Hash Check:</span>
                  <div className={`font-bold mt-1 ${verificationResult.verification_attempt.hash_match ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {verificationResult.verification_attempt.hash_match ? 'MATCHED SHA-256' : 'HASH MISMATCH BREACH'}
                  </div>
                </div>

                <div className="bg-white/[0.03] p-3 rounded-xl border border-white/10">
                  <span className="text-slate-400 block text-[10px] uppercase">Chi-Square p-value:</span>
                  <div className="font-bold text-cyan-400 mt-1">
                    {verificationResult.statistical_analysis.chi_square.p_value.toExponential(4)}
                  </div>
                </div>

                <div className="bg-white/[0.03] p-3 rounded-xl border border-white/10">
                  <span className="text-slate-400 block text-[10px] uppercase">Adversary Forgery Prob:</span>
                  <div className={`font-bold mt-1 ${verificationResult.statistical_analysis.forgery_probability <= 0.05 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {(verificationResult.statistical_analysis.forgery_probability * 100).toFixed(4)}%
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
