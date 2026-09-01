import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ShieldCheck, Loader2, AlertTriangle, CheckCircle2, XCircle, RefreshCw, Key, HelpCircle, Sliders, Clock, Activity } from 'lucide-react';
import { api } from '../services/api';
import { QuantumDigitalSignature, SignatureVerificationAttempt, QuantumExecutionResult, StatisticalAnalysis, ThreatEvaluation } from '../types';
import { StatusBadge } from '../components/StatusBadge';

export const VerifyQdsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const queryQdsId = searchParams.get('qds_id');

  const [signatures, setSignatures] = useState<QuantumDigitalSignature[]>([]);
  const [selectedSigId, setSelectedSigId] = useState<string>('');
  const [verifyPayload, setVerifyPayload] = useState<string>('');
  const [verifyNoise, setVerifyNoise] = useState<number>(0.05);
  const [injectAttack, setInjectAttack] = useState<string>('NONE');
  
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [loadingSignatures, setLoadingSignatures] = useState<boolean>(true);
  
  // Results
  const [verificationResult, setVerificationResult] = useState<{
    verification_attempt: SignatureVerificationAttempt;
    quantum_execution: QuantumExecutionResult;
    statistical_analysis: StatisticalAnalysis;
    threat_evaluation: ThreatEvaluation;
  } | null>(null);
  
  const [errorText, setErrorText] = useState<string>('');

  const loadSignatures = async () => {
    try {
      setLoadingSignatures(true);
      const list = await api.getSignatures();
      // Filter for ISSUED signatures (meaning they haven't been consumed yet)
      const issued = list.filter(s => s.status === 'ISSUED' && !s.is_consumed);
      setSignatures(issued);
      
      const targetSigId = queryQdsId || (issued.length > 0 ? issued[0].signature_id : '');
      if (targetSigId) {
        const selected = list.find(s => s.signature_id === targetSigId);
        if (selected) {
          setSelectedSigId(selected.signature_id);
          setVerifyPayload(selected.message_payload);
          return;
        }
      }
      setSelectedSigId('');
      setVerifyPayload('');
    } catch (err) {
      console.error("Failed to load signatures for verifier:", err);
    } finally {
      setLoadingSignatures(false);
    }
  };

  useEffect(() => {
    loadSignatures();
  }, []);

  const handleSelectSignature = (sigId: string) => {
    setSelectedSigId(sigId);
    const selected = signatures.find(s => s.signature_id === sigId);
    if (selected) {
      setVerifyPayload(selected.message_payload);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSigId) return;
    
    setIsVerifying(true);
    setErrorText('');
    setVerificationResult(null);
    
    try {
      const res = await api.verifySignature({
        signature_id: selectedSigId,
        payload_content: verifyPayload,
        simulated_noise: verifyNoise,
        inject_attack: injectAttack
      });
      setVerificationResult(res);
    } catch (err: any) {
      console.error("Verification endpoint error:", err);
      if (err.response && err.response.data) {
        const d = err.response.data;
        if (d.verification_attempt) {
          setVerificationResult({
            verification_attempt: d.verification_attempt,
            quantum_execution: d.quantum_execution || {
              execution_id: 'N/A', shots: 1024, input_state_symbol: 'N/A', bell_state_type: 'N/A',
              fidelity: 1.0, trace_distance: 0.0, measurement_counts: {}, statevector_real: [], statevector_imag: [], qber: 0.0, attack_injected: true
            },
            statistical_analysis: d.statistical_analysis || {
              record_id: 'N/A', execution_id: 'N/A', shots: 1024, qber: 0.0, fidelity: 1.0, forgery_probability: 0.0,
              chi_square: { chi2_stat: 0.0, p_value: 1.0, degrees_of_freedom: 1, hypothesis_rejected: false, alpha_threshold: 0.05 },
              sprt: { log_likelihood_ratio: 0.0, upper_bound_A: 4.6, lower_bound_B: -4.6, decision: 'ACCEPT_NULL' }
            },
            threat_evaluation: d.threat_evaluation
          });
        } else {
          setErrorText(d.error || "An unexpected error occurred during quantum signature verification.");
        }
      } else {
        setErrorText("Network error: Could not reach the quantum execution simulator.");
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleReset = () => {
    setVerificationResult(null);
    setErrorText('');
    loadSignatures();
  };

  if (loadingSignatures) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4 font-mono">
        <div className="relative">
          <Activity className="w-8 h-8 animate-spin text-emerald-400" />
          <div className="absolute inset-0 bg-emerald-400/20 rounded-full blur-lg animate-pulse" />
        </div>
        <span className="text-xs text-slate-400 tracking-widest uppercase">LOADING VERIFIER QUEUE...</span>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 select-none">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-3">
          <div className="p-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <span>Quantum Teleportation Verifier Studio</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Verify payload integrity and check entanglement statevector fidelity using linear optics Bell-state measurements.
        </p>
      </div>

      {!verificationResult ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Instructions and Pending Requests List */}
          <div className="glass-panel p-6 rounded-3xl space-y-4 md:col-span-1">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Pending Queue ({signatures.length})</span>
            </h2>
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {signatures.map((sig) => (
                <button
                  key={sig.signature_id}
                  onClick={() => handleSelectSignature(sig.signature_id)}
                  className={`w-full text-left p-3 rounded-2xl text-xs font-medium border transition ${
                    selectedSigId === sig.signature_id
                      ? 'cyber-active-pill font-bold'
                      : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.06] text-slate-300'
                  }`}
                >
                  <div className="font-bold text-white truncate">{sig.signature_id}</div>
                  <div className="text-[10px] mt-1 text-slate-400 flex items-center justify-between">
                    <span>Sender: {sig.sender_username}</span>
                    <span className="font-mono bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 px-1.5 py-0.5 rounded-lg text-[9px] font-bold">
                      {sig.quantum_state_basis}
                    </span>
                  </div>
                </button>
              ))}
              {signatures.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-xs font-medium">
                  No pending signature requests for verification.
                </div>
              )}
            </div>
          </div>

          {/* Form Area */}
          <div className="glass-panel p-6 rounded-3xl space-y-5 md:col-span-2">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <span>Simulation & Verification Parameters</span>
            </h2>

            {errorText && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-start space-x-2 text-xs text-rose-400 font-bold">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{errorText}</span>
              </div>
            )}

            <form onSubmit={handleVerify} className="space-y-4 text-xs font-semibold text-slate-300">
              {/* Select Signature */}
              <div>
                <label className="block text-slate-400 mb-1.5 text-[10px] font-bold uppercase tracking-wider">Select Signature ID</label>
                <select
                  value={selectedSigId}
                  onChange={(e) => handleSelectSignature(e.target.value)}
                  className="w-full glass-input p-2.5 font-mono text-xs focus:border-cyan-400"
                  required
                >
                  <option value="" disabled className="bg-slate-900">-- Choose Signature --</option>
                  {signatures.map(s => (
                    <option key={s.signature_id} value={s.signature_id} className="bg-slate-900">
                      {s.signature_id} (Sender: {s.sender_username})
                    </option>
                  ))}
                </select>
              </div>

              {/* Payload Field */}
              <div>
                <label className="block text-slate-400 mb-1.5 text-[10px] font-bold uppercase tracking-wider">Payload Content (Hash Verification)</label>
                <textarea
                  value={verifyPayload}
                  onChange={(e) => setVerifyPayload(e.target.value)}
                  rows={4}
                  className="w-full glass-input p-3 font-mono text-xs focus:border-cyan-400"
                  placeholder="Review or modify payload message..."
                  required
                />
              </div>

              {/* Noise slider */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Channel Noise Level (Depolarization &eta;)</label>
                  <span className="font-mono text-cyan-400 bg-cyan-500/15 border border-cyan-500/30 px-2 py-0.5 rounded-full text-[10px] font-bold">
                    {(verifyNoise * 100).toFixed(0)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.05"
                  value={verifyNoise}
                  onChange={(e) => setVerifyNoise(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              {/* Attack injection */}
              <div>
                <label className="block text-slate-400 mb-1.5 text-[10px] font-bold uppercase tracking-wider">Simulate Adversarial Attack</label>
                <select
                  value={injectAttack}
                  onChange={(e) => setInjectAttack(e.target.value)}
                  className="w-full glass-input p-2.5 text-slate-200 focus:border-cyan-400"
                >
                  <option value="NONE" className="bg-slate-900">None (Normal Transmission)</option>
                  <option value="FORGERY" className="bg-slate-900">Signature Forgery (Modify Payload/States)</option>
                  <option value="IMPERSONATION" className="bg-slate-900">Sender Impersonation (BSM Tampering)</option>
                  <option value="REPLAY" className="bg-slate-900">Replay Attack (Verify same signature twice)</option>
                  <option value="CHANNEL_MANIPULATION" className="bg-slate-900">Extreme Eavesdropping (High Channel Noise)</option>
                  <option value="UNAUTHORIZED" className="bg-slate-900">Unauthorized Org verification access</option>
                </select>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isVerifying || !selectedSigId}
                className="w-full btn-cyan-gradient py-3.5 rounded-2xl flex items-center justify-center font-bold text-xs tracking-wider"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2 text-black" />
                    <span>EXECUTING QISKIT TELEPORTATION ENGINE...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 mr-2 text-black" />
                    <span>RUN QUANTUM VERIFICATION SIMULATION</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* Results View */
        <div className="space-y-6">
          {/* Verdict Banner */}
          {verificationResult.verification_attempt.verification_result === 'PASSED' ? (
            <div className="glass-panel border-emerald-500/40 p-6 rounded-3xl flex items-center space-x-4 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-400 shrink-0">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-white">Quantum Verification Passed</h3>
                <p className="text-xs text-slate-300 font-medium mt-0.5">
                  The signature is authentic. Classical SHA-256 hash matched and quantum teleportation state fidelity exceeded the security threshold.
                </p>
              </div>
            </div>
          ) : (
            <div className="glass-panel border-rose-500/40 p-6 rounded-3xl flex items-center space-x-4 shadow-[0_0_20px_rgba(244,63,94,0.2)]">
              <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-400/50 flex items-center justify-center text-rose-400 shrink-0">
                <XCircle className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-white">Verification Failed: Signature Rejected</h3>
                <p className="text-xs text-slate-300 font-medium mt-0.5">
                  Security Breach Category: <strong className="font-mono bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded border border-rose-500/40">{verificationResult.verification_attempt.threat_category || 'QUANTUM_STATE_COMPROMISE'}</strong>. 
                  Fidelity drop or digest mismatch detected.
                </p>
              </div>
            </div>
          )}

          {/* Results Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Verification Metadata */}
            <div className="glass-panel p-6 rounded-3xl space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Attempt Metadata</h3>
              <div className="divide-y divide-white/5 text-xs font-semibold text-slate-300 space-y-3 font-mono">
                <div className="flex justify-between pt-1">
                  <span className="text-slate-400 font-sans">Attempt ID</span>
                  <span className="font-bold text-cyan-400">{verificationResult.verification_attempt.verification_id}</span>
                </div>
                <div className="flex justify-between pt-3">
                  <span className="text-slate-400 font-sans">Signature ID</span>
                  <span className="text-slate-200">{verificationResult.verification_attempt.signature_id}</span>
                </div>
                <div className="flex justify-between pt-3">
                  <span className="text-slate-400 font-sans">Verifier Node</span>
                  <span className="text-white font-sans">{verificationResult.verification_attempt.verifier_username}</span>
                </div>
                <div className="flex justify-between pt-3">
                  <span className="text-slate-400 font-sans">Hash Match</span>
                  <span className={`font-bold ${verificationResult.verification_attempt.hash_match ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {verificationResult.verification_attempt.hash_match ? 'MATCHED' : 'MISMATCH'}
                  </span>
                </div>
                <div className="flex justify-between pt-3">
                  <span className="text-slate-400 font-sans">Timestamp</span>
                  <span className="text-slate-400 text-[11px] font-sans">{new Date(verificationResult.verification_attempt.created_at).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Quantum Metrics */}
            <div className="glass-panel p-6 rounded-3xl space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Quantum Telemetry Outcomes</h3>
              <div className="divide-y divide-white/5 text-xs font-semibold text-slate-300 space-y-3 font-mono">
                <div className="flex justify-between pt-1">
                  <span className="text-slate-400 font-sans">State Overlap Fidelity</span>
                  <span className="text-emerald-400 font-bold">
                    {(verificationResult.verification_attempt.quantum_fidelity * 100).toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between pt-3">
                  <span className="text-slate-400 font-sans">Quantum Bit Error Rate (QBER)</span>
                  <span className="text-cyan-400 font-bold">
                    {(verificationResult.verification_attempt.qber * 100).toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between pt-3">
                  <span className="text-slate-400 font-sans">Forgery Likelihood</span>
                  <span className="text-white font-bold">
                    {(verificationResult.verification_attempt.forgery_probability * 100).toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between pt-3">
                  <span className="text-slate-400 font-sans">Chi-Square Test Outcome</span>
                  <span className="text-cyan-400">
                    p = {verificationResult.statistical_analysis.chi_square.p_value.toFixed(4)}
                  </span>
                </div>
                <div className="flex justify-between pt-3">
                  <span className="text-slate-400 font-sans">SPRT Sequential Decision</span>
                  <span className="font-bold text-white">
                    {verificationResult.statistical_analysis.sprt.decision}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <button
            onClick={handleReset}
            className="w-full btn-glass py-3.5 rounded-2xl flex items-center justify-center font-bold text-xs tracking-wider"
          >
            <RefreshCw className="w-4 h-4 mr-2 text-cyan-400" />
            <span>RETURN TO VERIFIER QUEUE</span>
          </button>
        </div>
      )}
    </div>
  );
};
