import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FileKey2, ArrowLeft, ShieldCheck, Lock, Cpu, CheckCircle2, AlertTriangle, Key } from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingState } from '../../components/common/LoadingState';
import { api } from '../../services/api';
import { QuantumDigitalSignature, User } from '../../types';

interface SignatureDetailsPageProps {
  currentUser: User | null;
}

export const SignatureDetailsPage: React.FC<SignatureDetailsPageProps> = ({ currentUser }) => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [sig, setSig] = useState<QuantumDigitalSignature | null>(null);

  useEffect(() => {
    loadSignatureDetails();
  }, [id]);

  const loadSignatureDetails = async () => {
    setLoading(true);
    try {
      if (!id) return;
      const data = await api.getSignatureById(id);
      setSig(data);
    } catch (err) {
      console.error('Failed to load signature details:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingState message="Fetching QDS signature telemetry record..." />;
  }

  if (!sig) {
    return (
      <div className="p-8 text-center font-mono text-slate-400">
        Signature ID #{id} not found or unauthorized access.{' '}
        <Link to="/signer/my-signatures" className="text-[#00C2FF] underline">
          Return to My Signatures
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl font-sans">
      {/* Top Navigation */}
      <div>
        <Link
          to="/signer/my-signatures"
          className="inline-flex items-center space-x-2 text-xs font-mono text-slate-400 hover:text-[#00C2FF] transition mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Signatures</span>
        </Link>

        <div className="bg-[#0B1220] border border-[#1F2E4D] rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-[#00C2FF]/10 border border-[#00C2FF]/30 rounded-2xl text-[#00C2FF]">
              <FileKey2 className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center space-x-3">
                <h2 className="text-xl font-extrabold text-white">{sig.signature_id}</h2>
                <StatusBadge status={sig.is_consumed ? 'VERIFIED' : sig.status || 'ISSUED'} />
              </div>
              <p className="text-xs text-slate-400 font-mono mt-1">
                Sender: <strong className="text-white">{sig.sender_username}</strong> • Created:{' '}
                {sig.created_at ? new Date(sig.created_at).toLocaleString() : 'Recent'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Basic Info & Message Info */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left 6 Cols: Basic & Message Information */}
        <div className="lg:col-span-6 bg-[#0B1220]/90 border border-[#1F2E4D] rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-4">
          <h3 className="text-base font-extrabold text-white flex items-center space-x-2 border-b border-[#1F2E4D] pb-3">
            <FileKey2 className="w-5 h-5 text-[#00C2FF]" />
            <span>Signature & Message Metadata</span>
          </h3>

          <div className="space-y-3 font-mono text-xs">
            <div className="flex justify-between py-2 border-b border-[#1F2E4D]/40">
              <span className="text-slate-400">Signature ID:</span>
              <span className="font-bold text-[#00C2FF]">{sig.signature_id}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#1F2E4D]/40">
              <span className="text-slate-400">Creation Timestamp:</span>
              <span className="font-bold text-slate-200">
                {sig.created_at ? new Date(sig.created_at).toLocaleString() : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#1F2E4D]/40">
              <span className="text-slate-400">Assigned Verifier / Org:</span>
              <span className="font-bold text-purple-400">
                {sig.recipient_org_name || 'Organization Verifier Node'}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#1F2E4D]/40">
              <span className="text-slate-400">Current Status:</span>
              <StatusBadge status={sig.is_consumed ? 'VERIFIED' : sig.status || 'ISSUED'} size="sm" />
            </div>

            <div className="pt-2 space-y-2">
              <span className="text-slate-400 block font-bold">SHA-256 Message Digest:</span>
              <div className="p-3 bg-[#131E33] border border-[#1F2E4D] rounded-xl text-slate-200 text-[11px] break-all">
                {sig.message_digest}
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <span className="text-slate-400 block font-bold">Message Payload Preview:</span>
              <div className="p-3 bg-[#131E33] border border-[#1F2E4D] rounded-xl text-slate-300 text-xs leading-relaxed max-h-36 overflow-y-auto">
                {sig.message_payload || sig.payload_summary || 'Document Canonical Payload'}
              </div>
            </div>
          </div>
        </div>

        {/* Right 6 Cols: QDS Quantum Simulation Summary & Immutability */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-[#0B1220]/90 border border-[#1F2E4D] rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-4">
            <h3 className="text-base font-extrabold text-white flex items-center space-x-2 border-b border-[#1F2E4D] pb-3">
              <Cpu className="w-5 h-5 text-purple-400" />
              <span>QDS Simulation Telemetry Summary</span>
            </h3>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 bg-[#131E33] border border-[#1F2E4D] rounded-xl flex items-center justify-between">
                <span className="text-slate-400">Quantum Basis State:</span>
                <span className="font-extrabold text-[#10B981]">{sig.quantum_state_basis || '|+>'}</span>
              </div>
              <div className="p-3 bg-[#131E33] border border-[#1F2E4D] rounded-xl flex items-center justify-between">
                <span className="text-slate-400">Bell Pair Entanglement:</span>
                <span className="font-extrabold text-purple-400">{sig.bell_pair_type || 'PHI_PLUS'}</span>
              </div>
              <div className="p-3 bg-[#131E33] border border-[#1F2E4D] rounded-xl flex items-center justify-between">
                <span className="text-slate-400">Session ID:</span>
                <span className="font-bold text-slate-200">{sig.session_id}</span>
              </div>
              <div className="p-3 bg-[#131E33] border border-[#1F2E4D] rounded-xl flex items-center justify-between">
                <span className="text-slate-400">Replay Nonce:</span>
                <span className="font-bold text-[#00C2FF]">{sig.nonce}</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">
                QDS Pipeline Steps Executed
              </span>
              <div className="space-y-1.5 font-mono text-[11px]">
                <div className="flex items-center space-x-2 text-[#10B981]">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Pauli Eigenstate Encoding Completed</span>
                </div>
                <div className="flex items-center space-x-2 text-[#10B981]">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Bell-State Pair Entanglement Completed</span>
                </div>
                <div className="flex items-center space-x-2 text-[#10B981]">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Quantum Teleportation Simulation Executed</span>
                </div>
                <div className="flex items-center space-x-2 text-[#10B981]">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Bell State Measurement (BSM) Completed</span>
                </div>
              </div>
            </div>
          </div>

          {/* Immutability Enforcement Notice */}
          <div className="p-4 bg-[#131E33] border border-[#1F2E4D] rounded-2xl flex items-start space-x-3 text-xs text-slate-300 font-mono">
            <Lock className="w-5 h-5 text-[#00C2FF] shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block font-bold mb-1">Cryptographic Immutability Enforced</strong>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                This signature record is immutable and locked. Modifying existing signature telemetry is strictly prohibited to prevent forgery.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
