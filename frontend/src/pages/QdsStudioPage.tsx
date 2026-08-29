import React, { useState, useEffect } from 'react';
import { Key, ShieldCheck } from 'lucide-react';
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-[#0F172A] flex items-center space-x-2">
          <Key className="w-5 h-5 text-[#00C2FF]" />
          <span>QDS Studio & Quantum Teleportation Verifier</span>
        </h1>
        <p className="text-xs text-slate-500">
          Generate Quantum Digital Signatures using Pauli Eigenstate sequences & verify teleportation fidelity in Qiskit.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Step 1: Issue Quantum Digital Signature */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center space-x-3 border-b border-[#E2E8F0] pb-3">
            <span className="w-6 h-6 rounded-full bg-[#0B1220] text-white font-extrabold text-xs flex items-center justify-center">
              1
            </span>
            <h2 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
              Issue Quantum Digital Signature (Sender Alice)
            </h2>
          </div>

          <form onSubmit={handleCreateSignature} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1 uppercase text-[11px]">Payload Message / Document Content</label>
              <textarea
                value={payload}
                onChange={(e) => setPayload(e.target.value)}
                rows={3}
                className="w-full bg-white border border-[#E2E8F0] rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-[#00C2FF] focus:ring-1 focus:ring-[#00C2FF] font-mono text-xs"
                placeholder="Enter payload string..."
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1 uppercase text-[11px]">Pauli State Basis</label>
                <select
                  value={quantumStateBasis}
                  onChange={(e) => setQuantumStateBasis(e.target.value)}
                  className="w-full bg-white border border-[#E2E8F0] rounded-lg p-2 text-slate-900 focus:outline-none focus:border-[#00C2FF] font-mono"
                >
                  <option value="|+>">|+&gt; (X basis +1)</option>
                  <option value="|->">|-&gt; (X basis -1)</option>
                  <option value="|0>">|0&gt; (Z basis +1)</option>
                  <option value="|1>">|1&gt; (Z basis -1)</option>
                  <option value="|+i>">|+i&gt; (Y basis +1)</option>
                  <option value="|-i>">|-i&gt; (Y basis -1)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1 uppercase text-[11px]">Entangled Bell State</label>
                <select
                  value={bellPairType}
                  onChange={(e) => setBellPairType(e.target.value)}
                  className="w-full bg-white border border-[#E2E8F0] rounded-lg p-2 text-slate-900 focus:outline-none focus:border-[#00C2FF] font-mono"
                >
                  <option value="PHI_PLUS">|&Phi;+&gt; (|00&gt;+|11&gt;)/&radic;2</option>
                  <option value="PHI_MINUS">|&Phi;-&gt; (|00&gt;-|11&gt;)/&radic;2</option>
                  <option value="PSI_PLUS">|&Psi;+&gt; (|01&gt;+|10&gt;)/&radic;2</option>
                  <option value="PSI_MINUS">|&Psi;-&gt; (|01&gt;-|10&gt;)/&radic;2</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSigning}
              className="w-full bg-[#0B1220] hover:bg-[#131E33] text-white font-bold py-2.5 rounded-lg flex items-center justify-center space-x-2 transition shadow-sm"
            >
              <Key className="w-4 h-4 text-[#00C2FF]" />
              <span>{isSigning ? 'Executing Qiskit Teleportation Key Prep...' : 'Sign Payload & Distribute QDS'}</span>
            </button>
          </form>

          {lastSignature && (
            <div className="bg-[#0B1220] text-white rounded-lg p-4 text-xs space-y-2 font-mono">
              <div className="flex justify-between items-center font-bold">
                <span className="text-[#00C2FF]">Signature Issued Successfully!</span>
                <StatusBadge status={lastSignature.status} />
              </div>
              <div className="text-slate-200">ID: {lastSignature.signature_id}</div>
              <div className="text-slate-400 text-[11px] truncate">SHA256 Hash: {lastSignature.message_digest}</div>
              <div className="text-slate-400 text-[11px]">Execution ID: {lastSignature.quantum_execution_id}</div>
            </div>
          )}
        </div>

        {/* Step 2: Verify Teleportation Signature */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center space-x-3 border-b border-[#E2E8F0] pb-3">
            <span className="w-6 h-6 rounded-full bg-[#00C2FF] text-[#0B1220] font-extrabold text-xs flex items-center justify-center">
              2
            </span>
            <h2 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
              Verify Teleportation Signature (Receiver Bob)
            </h2>
          </div>

          <form onSubmit={handleVerifySignature} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1 uppercase text-[11px]">Select Signature to Verify</label>
              <select
                value={selectedSigId}
                onChange={(e) => {
                  setSelectedSigId(e.target.value);
                  const found = signatures.find(s => s.signature_id === e.target.value);
                  if (found) setVerifyPayload(found.payload_summary);
                }}
                className="w-full bg-white border border-[#E2E8F0] rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-[#00C2FF] font-mono text-xs"
              >
                {signatures.map((s) => (
                  <option key={s.signature_id} value={s.signature_id}>
                    {s.signature_id} ({s.status}) - Hash: {s.message_digest.slice(0, 8)}...
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1 uppercase text-[11px]">Provided Payload Content</label>
              <textarea
                value={verifyPayload}
                onChange={(e) => setVerifyPayload(e.target.value)}
                rows={2}
                className="w-full bg-white border border-[#E2E8F0] rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-[#00C2FF] font-mono text-xs"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-700 font-semibold mb-1">
                <span>Simulate Channel Noise Level</span>
                <span className="text-[#00C2FF] font-mono font-bold">{(verifyNoise * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.5"
                step="0.05"
                value={verifyNoise}
                onChange={(e) => setVerifyNoise(parseFloat(e.target.value))}
                className="w-full bg-slate-200 accent-[#00C2FF] h-1.5 rounded-lg cursor-pointer"
              />
            </div>

            <button
              type="submit"
              disabled={isVerifying || !selectedSigId}
              className="w-full bg-[#00C2FF] hover:bg-[#00A8DE] text-[#0B1220] font-bold py-2.5 rounded-lg flex items-center justify-center space-x-2 transition shadow-sm"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isVerifying ? 'Running Projective Measurement Check...' : 'Verify Signature & QBER Bounds'}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Circuit & Verification Results Visualization */}
      {(lastExecution || verificationResult) && (
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
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
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-3 font-mono text-xs shadow-sm">
              <div className="flex justify-between items-center border-b border-[#E2E8F0] pb-2">
                <span className="text-[#0F172A] font-bold font-sans">Verification Result:</span>
                <StatusBadge status={verificationResult.verification_attempt.verification_result} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                <div className="bg-[#F8FAFC] p-3 rounded-lg border border-[#E2E8F0]">
                  <span className="text-slate-500">Digest Hash Check:</span>
                  <div className={`font-bold mt-1 ${verificationResult.verification_attempt.hash_match ? 'text-[#10B981]' : 'text-[#0B1220]'}`}>
                    {verificationResult.verification_attempt.hash_match ? 'MATCHED SHA-256' : 'HASH MISMATCH BREACH'}
                  </div>
                </div>

                <div className="bg-[#F8FAFC] p-3 rounded-lg border border-[#E2E8F0]">
                  <span className="text-slate-500">Chi-Square p-value:</span>
                  <div className="font-bold text-slate-800 mt-1">
                    {verificationResult.statistical_analysis.chi_square.p_value.toExponential(4)}
                  </div>
                </div>

                <div className="bg-[#F8FAFC] p-3 rounded-lg border border-[#E2E8F0]">
                  <span className="text-slate-500">Adversary Forgery Prob:</span>
                  <div className={`font-bold mt-1 ${verificationResult.statistical_analysis.forgery_probability <= 0.05 ? 'text-[#10B981]' : 'text-[#F59E0B]'}`}>
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
