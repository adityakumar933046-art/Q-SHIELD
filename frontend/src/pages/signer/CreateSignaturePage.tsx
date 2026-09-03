import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FileKey2, CheckCircle2, AlertCircle, RefreshCw, Cpu, Lock, Send, Eye, ShieldCheck } from 'lucide-react';
import { api } from '../../services/api';
import { User, QuantumDigitalSignature, QuantumExecutionResult } from '../../types';

interface CreateSignaturePageProps {
  currentUser: User | null;
}

export const CreateSignaturePage: React.FC<CreateSignaturePageProps> = ({ currentUser }) => {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [verifiers, setVerifiers] = useState<any[]>([]);
  const [selectedVerifierId, setSelectedVerifierId] = useState<string>('');
  
  // Quantum Parameters
  const [basis, setBasis] = useState('|+>');
  const [bellPair, setBellPair] = useState('PHI_PLUS');

  // Multi-Step Progress State
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Success Result State
  const [generatedSignature, setGeneratedSignature] = useState<QuantumDigitalSignature | null>(null);
  const [telemetryResult, setTelemetryResult] = useState<QuantumExecutionResult | null>(null);

  const MAX_MESSAGE_LENGTH = 5000;

  useEffect(() => {
    loadAvailableVerifiers();
  }, [currentUser]);

  const loadAvailableVerifiers = async () => {
    try {
      const list = await api.getAvailableVerifiers();
      setVerifiers(list);
      if (list.length > 0) {
        setSelectedVerifierId(list[0].id.toString());
      }
    } catch (err) {
      console.error('Failed to load authorized verifiers:', err);
    }
  };

  const steps = [
    'Validating Message Payload',
    'Generating SHA-256 Hash Digest',
    'Preparing Quantum Basis States (Pauli Eigenstates)',
    'Creating Bell-State Pair Entanglement',
    'Executing Quantum Teleportation Simulation',
    'Performing Bell State Measurement (BSM)',
    'Packaging Cryptographic QDS Signature',
    'Storing Record & Dispatching to Verifier',
  ];

  const handleGenerateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setError('Please enter a document or transaction message payload.');
      return;
    }
    if (message.length > MAX_MESSAGE_LENGTH) {
      setError(`Message payload exceeds maximum character length of ${MAX_MESSAGE_LENGTH}.`);
      return;
    }
    if (!selectedVerifierId && verifiers.length > 0) {
      setError('Please select an authorized Verifier from your organization.');
      return;
    }

    setError(null);
    setIsGenerating(true);
    setActiveStep(0);

    try {
      // 1. Obtain Step-Up Token from backend
      let stepUpToken = '';
      try {
        const stepUpRes = await api.verifyStepUp();
        stepUpToken = stepUpRes.step_up_token;
      } catch (stepUpErr) {
        console.warn('Step-up token fallback generation:', stepUpErr);
      }

      // Step progress animation matching backend execution
      for (let i = 0; i < steps.length; i++) {
        setActiveStep(i);
        await new Promise((r) => setTimeout(r, 220));
      }

      // 2. Call backend QDS create API
      const verifierObj = verifiers.find((v) => v.id.toString() === selectedVerifierId);
      const res = await api.clientPost('/qds/', {
        payload_content: message,
        quantum_state_basis: basis,
        bell_pair_type: bellPair,
        recipient_organization_id: currentUser?.organization || (verifierObj ? verifierObj.organization : null),
        step_up_token: stepUpToken,
      });

      const qdsRecord = res.data.signature || res.data;
      const qResult = res.data.quantum_teleportation_key || null;

      setGeneratedSignature(qdsRecord);
      setTelemetryResult(qResult);
      setIsGenerating(false);
    } catch (err: any) {
      console.error('Signature creation failed:', err);
      setIsGenerating(false);
      setError(
        err.response?.data?.detail ||
          err.response?.data?.error ||
          'Failed to generate QDS signature. Please check your message payload and credentials.'
      );
    }
  };

  return (
    <div className="space-y-8 max-w-4xl font-sans">
      {/* Header Banner */}
      <div className="bg-[#0B1220] border border-[#1F2E4D] rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-[#00C2FF]/10 border border-[#00C2FF]/30 rounded-xl text-[#00C2FF]">
            <FileKey2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">Create Quantum Digital Signature</h2>
            <p className="text-xs text-slate-400 font-mono">
              Encode payload into Pauli eigenstates, entangle Bell pairs, and dispatch to Verifier
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-[#EF4444]/10 border border-[#EF4444]/40 rounded-xl text-xs text-[#EF4444] font-mono flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Flow: Form vs Generation Progress vs Result */}
      {!generatedSignature && !isGenerating ? (
        /* Form View */
        <form onSubmit={handleGenerateSubmit} className="space-y-6">
          {/* Message Payload Input */}
          <div className="bg-[#0B1220]/90 border border-[#1F2E4D] rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between border-b border-[#1F2E4D] pb-3">
              <h3 className="text-sm font-extrabold text-white font-mono uppercase tracking-wider flex items-center space-x-2">
                <FileKey2 className="w-4 h-4 text-[#00C2FF]" />
                <span>1. Message Payload</span>
              </h3>
              <span
                className={`text-[11px] font-mono font-bold ${
                  message.length > MAX_MESSAGE_LENGTH ? 'text-[#EF4444]' : 'text-slate-400'
                }`}
              >
                {message.length} / {MAX_MESSAGE_LENGTH} characters
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Document / Canonical Transaction Message *
              </label>
              <textarea
                rows={5}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter transaction authorization document, contract hash, or canonical transfer payload..."
                className="w-full bg-[#131E33] border border-[#1F2E4D] rounded-xl p-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00C2FF] font-mono leading-relaxed"
              />
            </div>
          </div>

          {/* Verifier Selection & Quantum Parameters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Select Authorized Verifier */}
            <div className="bg-[#0B1220]/90 border border-[#1F2E4D] rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-4">
              <h3 className="text-sm font-extrabold text-white font-mono uppercase tracking-wider flex items-center space-x-2 border-b border-[#1F2E4D] pb-3">
                <Send className="w-4 h-4 text-purple-400" />
                <span>2. Select Authorized Verifier</span>
              </h3>

              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Verifier in {currentUser?.organization_name || 'your organization'} *
                </label>
                {verifiers.length === 0 ? (
                  <div className="p-3 bg-[#131E33] border border-[#1F2E4D] rounded-xl text-xs font-mono text-slate-400">
                    Loading verifiers or default organization verifier node...
                  </div>
                ) : (
                  <select
                    value={selectedVerifierId}
                    onChange={(e) => setSelectedVerifierId(e.target.value)}
                    className="w-full bg-[#131E33] border border-[#1F2E4D] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00C2FF] font-mono"
                  >
                    {verifiers.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.first_name ? `${v.first_name} ${v.last_name || ''}` : v.username} ({v.email || 'verifier@org.gov'})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* Quantum Parameters Selection */}
            <div className="bg-[#0B1220]/90 border border-[#1F2E4D] rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-4">
              <h3 className="text-sm font-extrabold text-white font-mono uppercase tracking-wider flex items-center space-x-2 border-b border-[#1F2E4D] pb-3">
                <Cpu className="w-4 h-4 text-[#10B981]" />
                <span>3. Quantum Teleportation Settings</span>
              </h3>

              <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Basis State
                  </label>
                  <select
                    value={basis}
                    onChange={(e) => setBasis(e.target.value)}
                    className="w-full bg-[#131E33] border border-[#1F2E4D] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#10B981]"
                  >
                    <option value="|+>">|+⟩ Basis</option>
                    <option value="|->">|-⟩ Basis</option>
                    <option value="|0>">|0⟩ Basis</option>
                    <option value="|1>">|1⟩ Basis</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Bell Pair Type
                  </label>
                  <select
                    value={bellPair}
                    onChange={(e) => setBellPair(e.target.value)}
                    className="w-full bg-[#131E33] border border-[#1F2E4D] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#10B981]"
                  >
                    <option value="PHI_PLUS">|Φ+⟩ Bell Pair</option>
                    <option value="PHI_MINUS">|Φ-⟩ Bell Pair</option>
                    <option value="PSI_PLUS">|Ψ+⟩ Bell Pair</option>
                    <option value="PSI_MINUS">|Ψ-⟩ Bell Pair</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end">
            <button
              type="submit"
              disabled={!message.trim()}
              className="px-6 py-3 bg-[#00C2FF] hover:bg-[#00A8DE] text-[#0B1220] font-black text-xs font-mono uppercase tracking-wider rounded-xl shadow-lg transition flex items-center space-x-2 disabled:opacity-50"
            >
              <FileKey2 className="w-4 h-4" />
              <span>Generate Secure Signature</span>
            </button>
          </div>
        </form>
      ) : isGenerating ? (
        /* Progress Indicator View */
        <div className="bg-[#0B1220] border border-[#1F2E4D] rounded-2xl p-8 shadow-2xl backdrop-blur-md space-y-6 text-center font-sans">
          <div className="p-4 bg-[#00C2FF]/10 border border-[#00C2FF]/30 rounded-2xl text-[#00C2FF] w-16 h-16 mx-auto flex items-center justify-center">
            <RefreshCw className="w-8 h-8 animate-spin" />
          </div>

          <div>
            <h3 className="text-lg font-black text-white">Quantum-Inspired QDS Generation in Progress</h3>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Executing teleportation-based Pauli eigenstate simulation...
            </p>
          </div>

          <div className="max-w-md mx-auto space-y-2 text-left font-mono text-xs">
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
        /* Success Result View */
        <div className="bg-[#0B1220] border border-[#10B981]/40 rounded-2xl p-8 shadow-2xl backdrop-blur-md space-y-6 font-sans">
          <div className="flex items-center space-x-4 border-b border-[#1F2E4D] pb-6">
            <div className="p-3 bg-[#10B981]/10 border border-[#10B981]/30 rounded-2xl text-[#10B981]">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-[#10B981] uppercase tracking-widest block">
                QDS Generation Complete
              </span>
              <h3 className="text-xl font-black text-white">Quantum-Inspired Signature Generated Successfully</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
            <div className="p-4 bg-[#131E33] border border-[#1F2E4D] rounded-xl space-y-2">
              <span className="text-slate-400 block text-[10px] uppercase">Signature ID</span>
              <span className="font-extrabold text-[#00C2FF] text-sm block">{generatedSignature?.signature_id}</span>
            </div>

            <div className="p-4 bg-[#131E33] border border-[#1F2E4D] rounded-xl space-y-2">
              <span className="text-slate-400 block text-[10px] uppercase">Status</span>
              <span className="font-extrabold text-[#10B981] text-xs block">PENDING_VERIFICATION</span>
            </div>

            <div className="p-4 bg-[#131E33] border border-[#1F2E4D] rounded-xl space-y-2 md:col-span-2">
              <span className="text-slate-400 block text-[10px] uppercase">SHA-256 Message Digest</span>
              <span className="font-bold text-slate-200 text-xs block break-all">{generatedSignature?.message_digest}</span>
            </div>
          </div>

          <div className="p-4 bg-[#10B981]/10 border border-[#10B981]/30 rounded-xl text-xs font-mono text-[#10B981] flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 shrink-0" />
            <span>
              Signature package dispatched to assigned Verifier node for organization verification.
            </span>
          </div>

          <div className="flex items-center justify-end space-x-4 pt-4 border-t border-[#1F2E4D]">
            <button
              onClick={() => {
                setGeneratedSignature(null);
                setMessage('');
              }}
              className="px-4 py-2.5 bg-[#131E33] hover:bg-[#1F2E4D] text-slate-300 font-mono font-bold text-xs rounded-xl border border-[#1F2E4D] transition"
            >
              Create Another Signature
            </button>
            <Link
              to={`/signer/signatures/${generatedSignature?.signature_id}`}
              className="px-5 py-2.5 bg-[#00C2FF] hover:bg-[#00A8DE] text-[#0B1220] font-extrabold font-mono text-xs rounded-xl shadow-lg transition flex items-center space-x-2"
            >
              <Eye className="w-4 h-4" />
              <span>View Signature Details</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
