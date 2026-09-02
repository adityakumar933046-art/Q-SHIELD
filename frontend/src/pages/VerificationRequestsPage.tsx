import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowRight, Calendar, Activity } from 'lucide-react';
import { api } from '../services/api';
import { QuantumDigitalSignature } from '../types';

export const VerificationRequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<QuantumDigitalSignature[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await api.getSignatures();
      // Filter for ISSUED QDS signatures
      const issued = data.filter(s => s.status === 'ISSUED' && !s.is_consumed);
      setRequests(issued);
    } catch (err) {
      console.error("Failed to load verification requests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleVerify = (signatureId: string) => {
    navigate(`/verifier/verify?qds_id=${signatureId}`);
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4 font-mono">
        <div className="relative">
          <Activity className="w-8 h-8 animate-spin text-cyan-400" />
          <div className="absolute inset-0 bg-cyan-400/20 rounded-full blur-lg animate-pulse" />
        </div>
        <span className="text-xs text-slate-400 tracking-widest uppercase">LOADING VERIFICATION REQUESTS...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 select-none">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-3">
          <div className="p-2 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Mail className="w-6 h-6" />
          </div>
          <span>Verification Requests</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Select an issued Quantum Digital Signature and run the statistical verification protocols.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {requests.map((req) => (
          <div key={req.id} className="glass-card p-6 flex flex-col justify-between space-y-4 hover:border-cyan-500/40 transition">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="font-mono text-cyan-400 font-bold text-sm">{req.signature_id}</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  Pending Verification
                </span>
              </div>

              <div className="space-y-2 text-xs font-semibold text-slate-300">
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">Sender (Signer)</span>
                  <span className="text-white font-bold">{req.sender_username}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">Quantum Basis</span>
                  <span className="font-mono text-emerald-400 font-bold">{req.quantum_state_basis}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">Bell Pair Type</span>
                  <span className="font-mono text-white">{req.bell_pair_type}</span>
                </div>
                <div className="pt-2">
                  <span className="text-slate-400 block text-[9px] uppercase font-bold mb-1">Payload Sample</span>
                  <p className="text-slate-300 font-mono text-[10px] bg-black/40 p-2.5 rounded-xl border border-white/10 line-clamp-2">
                    {req.message_payload || '(Empty payload)'}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-[10px] text-slate-400 font-mono">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                <span>{new Date(req.created_at).toLocaleDateString()}</span>
              </div>
              <button
                onClick={() => handleVerify(req.signature_id)}
                className="flex items-center text-xs font-bold text-cyan-400 hover:text-cyan-300 transition"
              >
                <span>Verify Now</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        ))}

        {requests.length === 0 && (
          <div className="col-span-full glass-card p-12 text-center text-slate-400 text-xs font-semibold">
            All issued signatures have been verified. No pending requests.
          </div>
        )}
      </div>
    </div>
  );
};

export default VerificationRequestsPage;
