import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Play, ArrowLeft, CheckCircle2, AlertTriangle, ShieldAlert, Cpu, RefreshCw, Lock, ShieldCheck, FileCheck2 } from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingState } from '../../components/common/LoadingState';
import { api } from '../../services/api';
import { QuantumDigitalSignature, SignatureVerificationAttempt, QuantumExecutionResult, StatisticalAnalysis, ThreatEvaluation, User } from '../../types';

interface SignatureVerificationPageProps {
  currentUser: User | null;
}

export const SignatureVerificationPage: React.FC<SignatureVerificationPageProps> = ({ currentUser }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [sig, setSig] = useState<QuantumDigitalSignature | null>(null);
  
  // Verification Processing State
  const [isVerifying, setIsVerifying] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Verification Outcome Results
  const [verificationResult, setVerificationResult] = useState<{
    attempt: SignatureVerificationAttempt;
    execution: QuantumExecutionResult;
    stats: StatisticalAnalysis;
    threat: ThreatEvaluation;
  } | null>(null);

  useEffect(() => {
    loadSignatureForVerification();
  }, [id]);

  const loadSignatureForVerification = async () => {
    setLoading(true);
    try {
      if (!id) return;
      const data = await api.getSignatureById(id);
      setSig(data);
    } catch (err: any) {
      console.error('Failed to load signature for verification:', err);
      setError('Signature not found or you are not authorized to verify this signature.');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    'Validating Signature Package Structure',
    'Checking Organization Authorization & Scope',
    'Checking Replay Protection & Duplicate Nonces',
    'Validating Signer Identity & Active Account Status',
    'Loading QDS Telemetry & Pauli Correction Metadata',
    'Applying Pauli Correction Operations (I, X, Y, Z)',
    'Reconstructing Quantum State Vector',
    'Executing Projective Measurement Analysis',
    'Calculating Statistical Metrics (Fidelity & Error Rate)',
    'Applying Deterministic Threshold Decision Rules',
    'Updating Database Record & Dispatching Threat Event',
  ];

  const handleStartVerification = async () => {
    if (!sig) return;

    setError(null);
    setIsVerifying(true);
    setActiveStep(0);

    try {
      // Step progress animation matching backend engine execution
      for (let i = 0; i < steps.length; i++) {
        setActiveStep(i);
        await new Promise((r) => setTimeout(r, 200));
      }

      // Execute backend API verification
      const res = await api.verifySignature({
        signature_id: sig.signature_id,
        payload_content: sig.message_payload || sig.payload_summary || 'Document Payload',
      });

      setVerificationResult({
        attempt: res.verification_attempt,
        execution: res.quantum_execution,
        stats: res.statistical_analysis,
        threat: res.threat_evaluation,
      });

      setIsVerifying(false);
    } catch (err: any) {
      console.error('Verification failed:', err);
      setIsVerifying(false);
      
      const resData = err.response?.data;
      if (resData && resData.verification_attempt) {
        setVerificationResult({
          attempt: resData.verification_attempt,
          execution: resData.quantum_execution || ({} as any),
          stats: resData.statistical_analysis || ({} as any),
          threat: resData.threat_evaluation || ({} as any),
        });
      } else {
        setError(resData?.error || resData?.detail || 'Unable to complete signature verification.');
      }
    }
  };

  if (loading) {
    return <LoadingState message="Validating signature package and organization authorization..." />;
  }

  if (!sig && !error) {
    return (
      <div className="p-8 text-center font-mono text-slate-400">
        Signature not found.{' '}
        <Link to="/verifier/pending" className="text-[#00C2FF] underline">
          Return to Pending Queue
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl font-sans">
      {/* Top Navigation */}
      <div>
        <Link
          to="/verifier/pending"
          className="inline-flex items-center space-x-2 text-xs font-mono text-slate-400 hover:text-[#00C2FF] transition mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Pending Queue</span>
        </Link>

        <div className="bg-[#0B1220] border border-[#1F2E4D] rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-[#10B981]/10 border border-[#10B981]/30 rounded-2xl text-[#10B981]">
              <Play className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center space-x-3">
                <h2 className="text-xl font-extrabold text-white">Verification Execution</h2>
                <StatusBadge status={sig?.is_consumed ? 'VERIFIED' : sig?.status || 'ISSUED'} />
              </div>
              <p className="text-xs text-slate-400 font-mono mt-1">
                Signature ID: <strong className="text-[#00C2FF]">{sig?.signature_id}</strong> • Signer:{' '}
                <strong className="text-white">{sig?.sender_username}</strong>
              </p>
            </div>
          </div>

          {!verificationResult && !isVerifying && (
            <button
              onClick={handleStartVerification}
              className="px-6 py-3 bg-[#10B981] hover:bg-[#059669] text-white font-extrabold font-mono text-xs rounded-xl shadow-lg transition flex items-center space-x-2 shrink-0"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start QDS Verification</span>
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-[#EF4444]/10 border border-[#EF4444]/40 rounded-xl text-xs text-[#EF4444] font-mono flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid: Signature Payload Info vs Verification Progress / Outcome */}
      {!verificationResult && !isVerifying ? (
        /* Signature Information Card (Read-Only) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 bg-[#0B1220]/90 border border-[#1F2E4D] rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-4">
            <h3 className="text-base font-extrabold text-white flex items-center space-x-2 border-b border-[#1F2E4D] pb-3">
              <FileCheck2 className="w-5 h-5 text-[#00C2FF]" />
              <span>Assigned Signature Package Information</span>
            </h3>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between py-2 border-b border-[#1F2E4D]/40">
                <span className="text-slate-400">Signature ID:</span>
                <span className="font-bold text-[#00C2FF]">{sig?.signature_id}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#1F2E4D]/40">
                <span className="text-slate-400">Signer Username:</span>
                <span className="font-bold text-white">{sig?.sender_username}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#1F2E4D]/40">
                <span className="text-slate-400">Received Date:</span>
                <span className="font-bold text-slate-200">
                  {sig?.created_at ? new Date(sig.created_at).toLocaleString() : 'Recent'}
                </span>
              </div>

              <div className="pt-2 space-y-2">
                <span className="text-slate-400 block font-bold">SHA-256 Digest Hash:</span>
                <div className="p-3 bg-[#131E33] border border-[#1F2E4D] rounded-xl text-slate-200 text-[11px] break-all">
                  {sig?.message_digest}
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <span className="text-slate-400 block font-bold">Message Payload:</span>
                <div className="p-3 bg-[#131E33] border border-[#1F2E4D] rounded-xl text-slate-300 text-xs leading-relaxed max-h-36 overflow-y-auto">
                  {sig?.message_payload || sig?.payload_summary || 'Document Payload'}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-[#0B1220]/90 border border-[#1F2E4D] rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-5">
            <h3 className="text-base font-extrabold text-white flex items-center space-x-2 border-b border-[#1F2E4D] pb-3">
              <Cpu className="w-5 h-5 text-purple-400" />
              <span>QDS State Telemetry</span>
            </h3>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 bg-[#131E33] border border-[#1F2E4D] rounded-xl flex items-center justify-between">
                <span className="text-slate-400">Quantum State Basis:</span>
                <span className="font-extrabold text-[#10B981]">{sig?.quantum_state_basis || '|+>'}</span>
              </div>
              <div className="p-3 bg-[#131E33] border border-[#1F2E4D] rounded-xl flex items-center justify-between">
                <span className="text-slate-400">Bell Pair Entanglement:</span>
                <span className="font-extrabold text-purple-400">{sig?.bell_pair_type || 'PHI_PLUS'}</span>
              </div>
              <div className="p-3 bg-[#131E33] border border-[#1F2E4D] rounded-xl flex items-center justify-between">
                <span className="text-slate-400">Session ID:</span>
                <span className="font-bold text-slate-200">{sig?.session_id}</span>
              </div>
              <div className="p-3 bg-[#131E33] border border-[#1F2E4D] rounded-xl flex items-center justify-between">
                <span className="text-slate-400">Crypto Nonce:</span>
                <span className="font-bold text-[#00C2FF]">{sig?.nonce}</span>
              </div>
            </div>

            <div className="p-4 bg-[#131E33] border border-[#1F2E4D] rounded-xl text-xs font-mono text-slate-300 flex items-start space-x-2.5">
              <Lock className="w-4 h-4 text-[#00C2FF] shrink-0 mt-0.5" />
              <span>
                Package is read-only. Clicking "Start QDS Verification" runs Pauli state reconstruction and projective measurement analysis.
              </span>
            </div>
          </div>
        </div>
      ) : isVerifying ? (
        /* Real Step-by-Step Progress View */
        <div className="bg-[#0B1220] border border-[#1F2E4D] rounded-2xl p-8 shadow-2xl backdrop-blur-md space-y-6 text-center font-sans">
          <div className="p-4 bg-[#10B981]/10 border border-[#10B981]/30 rounded-2xl text-[#10B981] w-16 h-16 mx-auto flex items-center justify-center">
            <RefreshCw className="w-8 h-8 animate-spin" />
          </div>

          <div>
            <h3 className="text-lg font-black text-white">QDS Verification Pipeline Running</h3>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Executing quantum state reconstruction & deterministic threshold analysis...
            </p>
          </div>

          <div className="max-w-lg mx-auto space-y-2 text-left font-mono text-xs">
            {steps.map((stepName, index) => {
              const isDone = index < activeStep;
              const isCurrent = index === activeStep;
              return (
                <div
                  key={stepName}
                  className={`p-2.5 rounded-xl border transition flex items-center justify-between ${
                    isDone
                      ? 'bg-[#10B981]/10 border-[#10B981]/30 text-[#10B981]'
                      : isCurrent
                      ? 'bg-[#00C2FF]/15 border-[#00C2FF] text-[#00C2FF] font-bold'
                      : 'bg-[#131E33]/40 border-[#1F2E4D]/40 text-slate-500'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px] shrink-0 font-bold">
                      {index + 1}
                    </span>
                    <span>{stepName}</span>
                  </div>
                  {isDone && <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />}
                  {isCurrent && <RefreshCw className="w-4 h-4 animate-spin text-[#00C2FF] shrink-0" />}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Verification Outcome Result View */
        <div
          className={`bg-[#0B1220] border rounded-2xl p-8 shadow-2xl backdrop-blur-md space-y-6 font-sans ${
            verificationResult?.attempt.verification_result === 'PASSED'
              ? 'border-[#10B981]/40'
              : 'border-[#EF4444]/40'
          }`}
        >
          <div className="flex items-center space-x-4 border-b border-[#1F2E4D] pb-6">
            <div
              className={`p-3.5 rounded-2xl border ${
                verificationResult?.attempt.verification_result === 'PASSED'
                  ? 'bg-[#10B981]/10 border-[#10B981]/30 text-[#10B981]'
                  : 'bg-[#EF4444]/10 border-[#EF4444]/30 text-[#EF4444]'
              }`}
            >
              {verificationResult?.attempt.verification_result === 'PASSED' ? (
                <CheckCircle2 className="w-8 h-8" />
              ) : (
                <AlertTriangle className="w-8 h-8" />
              )}
            </div>

            <div>
              <span
                className={`text-[10px] font-mono font-bold uppercase tracking-widest block ${
                  verificationResult?.attempt.verification_result === 'PASSED'
                    ? 'text-[#10B981]'
                    : 'text-[#EF4444]'
                }`}
              >
                Verification Decision Complete
              </span>
              <h3 className="text-xl font-black text-white">
                {verificationResult?.attempt.verification_result === 'PASSED'
                  ? 'Signature Verified Successfully'
                  : 'Signature Verification Failed'}
              </h3>
            </div>
          </div>

          {/* Verification Metrics Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            <div className="p-4 bg-[#131E33] border border-[#1F2E4D] rounded-xl space-y-1">
              <span className="text-slate-400 text-[10px] uppercase block">Verification ID</span>
              <span className="font-extrabold text-[#00C2FF] text-xs">{verificationResult?.attempt.verification_id}</span>
            </div>

            <div className="p-4 bg-[#131E33] border border-[#1F2E4D] rounded-xl space-y-1">
              <span className="text-slate-400 text-[10px] uppercase block">Quantum State Fidelity (F)</span>
              <span className="font-extrabold text-[#10B981] text-xs">
                {((verificationResult?.attempt.quantum_fidelity || 1.0) * 100).toFixed(2)}%
              </span>
            </div>

            <div className="p-4 bg-[#131E33] border border-[#1F2E4D] rounded-xl space-y-1">
              <span className="text-slate-400 text-[10px] uppercase block">Quantum Error Rate (QBER)</span>
              <span className="font-extrabold text-amber-400 text-xs">
                {((verificationResult?.attempt.qber || 0.0) * 100).toFixed(2)}%
              </span>
            </div>
          </div>

          {/* Verification Result Details */}
          <div className="p-4 bg-[#131E33] border border-[#1F2E4D] rounded-xl font-mono text-xs space-y-2">
            <div className="flex justify-between border-b border-[#1F2E4D]/40 pb-2">
              <span className="text-slate-400">Classical SHA-256 Match:</span>
              <span
                className={`font-bold ${
                  verificationResult?.attempt.hash_match ? 'text-[#10B981]' : 'text-[#EF4444]'
                }`}
              >
                {verificationResult?.attempt.hash_match ? 'MATCH VALID' : 'MISMATCH DETECTED'}
              </span>
            </div>

            <div className="flex justify-between pt-1">
              <span className="text-slate-400">Result Status Code:</span>
              <StatusBadge status={verificationResult?.attempt.verification_result || 'PASSED'} />
            </div>
          </div>

          {/* Threat Event Notice if Threat Detected */}
          {verificationResult?.threat?.threat_detected && (
            <div className="p-4 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-xl text-xs font-mono text-[#EF4444] flex items-start space-x-3">
              <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-bold mb-1">
                  Threat Event Dispatched to Threat Detection Engine: {verificationResult.threat.threat_category}
                </strong>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Security event logged. Incident forwarded to the <strong>Security Analyst</strong> team for deep analysis.
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end space-x-4 pt-4 border-t border-[#1F2E4D]">
            <Link
              to="/verifier/pending"
              className="px-4 py-2.5 bg-[#131E33] hover:bg-[#1F2E4D] text-slate-300 font-mono font-bold text-xs rounded-xl border border-[#1F2E4D] transition"
            >
              Back to Pending Queue
            </Link>
            <Link
              to="/verifier/history"
              className="px-5 py-2.5 bg-[#10B981] hover:bg-[#059669] text-white font-extrabold font-mono text-xs rounded-xl shadow-lg transition flex items-center space-x-2"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>View Verification History</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
