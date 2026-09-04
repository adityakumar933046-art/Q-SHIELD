import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ShieldCheck, Loader2, AlertTriangle, CheckCircle2, XCircle, RefreshCw, Key, HelpCircle, Sliders, Clock } from 'lucide-react';
import { api } from '../services/api';
import { QuantumDigitalSignature, SignatureVerificationAttempt, QuantumExecutionResult, StatisticalAnalysis, ThreatEvaluation } from '../types';

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
          // It's a security threat block (e.g. Replay or Unauthorized) which returns 409/403
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
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 select-none">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center space-x-2">
          <ShieldCheck className="w-6 h-6 text-[#15803D]" />
          <span>Quantum Teleportation Verifier Studio</span>
        </h1>
        <p className="text-xs text-slate-400 font-medium">
          Verify payload integrity and check entanglement statevector fidelity using linear optics Bell-state measurements.
        </p>
      </div>

      {!verificationResult ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Instructions and Pending Requests List */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 md:col-span-1">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>Pending Signatures ({signatures.length})</span>
            </h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {signatures.map((sig) => (
                <button
                  key={sig.signature_id}
                  onClick={() => handleSelectSignature(sig.signature_id)}
                  className={`w-full text-left p-3 rounded-lg text-xs font-semibold border transition ${
                    selectedSigId === sig.signature_id
                      ? 'border-green-600 bg-green-50/50 text-slate-800'
                      : 'border-slate-100 hover:border-slate-200 text-slate-500'
                  }`}
                >
                  <div className="font-bold text-slate-700">{sig.signature_id}</div>
                  <div className="text-[10px] mt-0.5 text-slate-400 flex items-center justify-between">
                    <span>Sender: {sig.sender_username}</span>
                    <span className="font-sans bg-slate-100 px-1 py-0.5 rounded text-[8px]">{sig.quantum_state_basis}</span>
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
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 md:col-span-2">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
              <Sliders className="w-4 h-4 text-green-600" />
              <span>Simulation & Verification Parameters</span>
            </h2>

            {errorText && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2 text-xs text-red-650 font-bold">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{errorText}</span>
              </div>
            )}

            <form onSubmit={handleVerify} className="space-y-4 text-xs font-semibold text-slate-700">
              {/* Select Signature */}
              <div>
                <label className="block text-slate-500 mb-1.5">Select Signature ID</label>
                <select
                  value={selectedSigId}
                  onChange={(e) => handleSelectSignature(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-sans focus:outline-none focus:ring-1 focus:ring-green-600"
                  required
                >
                  <option value="" disabled>-- Choose Signature --</option>
                  {signatures.map(s => (
                    <option key={s.signature_id} value={s.signature_id}>{s.signature_id} (Sender: {s.sender_username})</option>
                  ))}
                </select>
              </div>

              {/* Payload Field */}
              <div>
                <label className="block text-slate-500 mb-1.5">Payload Content (Will verify classical hash match)</label>
                <textarea
                  value={verifyPayload}
                  onChange={(e) => setVerifyPayload(e.target.value)}
                  rows={4}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-sans text-xs focus:outline-none focus:ring-1 focus:ring-green-600"
                  placeholder="Review or modify payload message..."
                  required
                />
              </div>

              {/* Noise slider */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-slate-500">Channel Noise Level (Depolarization factor &eta;)</label>
                  <span className="font-sans text-green-700 bg-green-50 px-2 py-0.5 rounded text-[10px]">{(verifyNoise * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.05"
                  value={verifyNoise}
                  onChange={(e) => setVerifyNoise(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-green-600"
                />
              </div>

              {/* Attack injection */}
              <div>
                <label className="block text-slate-500 mb-1.5">Simulate Adversarial Attack</label>
                <select
                  value={injectAttack}
                  onChange={(e) => setInjectAttack(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-650 focus:outline-none focus:ring-1 focus:ring-green-600"
                >
                  <option value="NONE">None (Normal Transmission)</option>
                  <option value="FORGERY">Signature Forgery (Modify Payload/States)</option>
                  <option value="IMPERSONATION">Sender Impersonation (BSM Tampering)</option>
                  <option value="REPLAY">Replay Attack (Verify same signature second time)</option>
                  <option value="CHANNEL_MANIPULATION">Extreme Eavesdropping (High Channel Noise)</option>
                  <option value="UNAUTHORIZED">Unauthorized Org verification access</option>
                </select>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isVerifying || !selectedSigId}
                className="w-full flex items-center justify-center py-3 bg-[#15803D] hover:bg-[#166534] text-white font-bold rounded-lg transition duration-200 disabled:opacity-50 text-xs tracking-wider"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    <span>EXECUTING QISKIT TELEPORTATION ENGINE...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 mr-2" />
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
            <div className="bg-green-50 border border-green-200 rounded-xl p-5 flex items-center space-x-4">
              <CheckCircle2 className="w-12 h-12 text-[#15803D] shrink-0" />
              <div>
                <h3 className="text-lg font-bold text-green-800">Verification Passed</h3>
                <p className="text-xs text-green-700 font-semibold mt-0.5">
                  The signature is authentic. Classical SHA-256 hash matched and quantum teleportation state fidelity exceeded the security threshold.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-xl p-5 flex items-center space-x-4">
              <XCircle className="w-12 h-12 text-[#DC2626] shrink-0" />
              <div>
                <h3 className="text-lg font-bold text-red-800">Verification Failed: Signature Rejected</h3>
                <p className="text-xs text-red-700 font-semibold mt-0.5">
                  Security Breach Category: <strong className="font-sans bg-red-100 px-1 py-0.5 rounded text-red-800">{verificationResult.verification_attempt.threat_category || 'QUANTUM_STATE_COMPROMISE'}</strong>. 
                  Fidelity drops or digest mismatch detected. Quantum state collapsed or eavesdropped.
                </p>
              </div>
            </div>
          )}

          {/* Results Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Verification Metadata */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Attempt Metadata</h3>
              <div className="divide-y divide-slate-100 text-xs font-semibold text-slate-700 space-y-3">
                <div className="flex justify-between pt-1">
                  <span className="text-slate-400">Attempt ID</span>
                  <span className="font-sans font-bold text-slate-800">{verificationResult.verification_attempt.verification_id}</span>
                </div>
                <div className="flex justify-between pt-3">
                  <span className="text-slate-400">Signature ID</span>
                  <span className="font-sans text-slate-800">{verificationResult.verification_attempt.signature_id}</span>
                </div>
                <div className="flex justify-between pt-3">
                  <span className="text-slate-400">Verifier Node</span>
                  <span className="text-slate-800">{verificationResult.verification_attempt.verifier_username}</span>
                </div>
                <div className="flex justify-between pt-3">
                  <span className="text-slate-400">Hash Match</span>
                  <span className={`font-bold ${verificationResult.verification_attempt.hash_match ? 'text-green-600' : 'text-red-650 text-red-600'}`}>
                    {verificationResult.verification_attempt.hash_match ? 'MATCHED' : 'MISMATCH'}
                  </span>
                </div>
                <div className="flex justify-between pt-3">
                  <span className="text-slate-400">Attempt Timestamp</span>
                  <span className="text-slate-500">{new Date(verificationResult.verification_attempt.created_at).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Quantum Metrics */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Quantum Telemetry Outcomes</h3>
              <div className="divide-y divide-slate-100 text-xs font-semibold text-slate-700 space-y-3">
                <div className="flex justify-between pt-1">
                  <span className="text-slate-400">State Overlap Fidelity</span>
                  <span className="font-sans text-slate-800">
                    {(verificationResult.verification_attempt.quantum_fidelity * 100).toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between pt-3">
                  <span className="text-slate-400">Quantum Bit Error Rate (QBER)</span>
                  <span className="font-sans text-slate-800">
                    {(verificationResult.verification_attempt.qber * 100).toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between pt-3">
                  <span className="text-slate-400">Forgery Likelihood</span>
                  <span className="font-sans text-slate-800">
                    {(verificationResult.verification_attempt.forgery_probability * 100).toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between pt-3">
                  <span className="text-slate-400">Chi-Square Test (Outcome Probability)</span>
                  <span className="font-sans text-slate-800">
                    p = {verificationResult.statistical_analysis.chi_square.p_value.toFixed(4)}
                  </span>
                </div>
                <div className="flex justify-between pt-3">
                  <span className="text-slate-400">SPRT Sequential Decision</span>
                  <span className="font-sans text-slate-850 font-bold text-slate-850/90 text-slate-850/80 text-slate-800">
                    {verificationResult.statistical_analysis.sprt.decision}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <button
            onClick={handleReset}
            className="w-full flex items-center justify-center py-3 bg-[#15803D] hover:bg-[#166534] text-white font-bold rounded-lg transition duration-150 text-xs tracking-wider"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            <span>RETURN TO LIST</span>
          </button>
        </div>
      )}
    </div>
  );
};
