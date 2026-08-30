import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Clock, ArrowRight, Loader2, Calendar } from 'lucide-react';
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
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 select-none">
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Verification Requests</h1>
        <p className="text-xs text-slate-400 font-medium">
          Select an issued Quantum Digital Signature and run the statistical verification protocols.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {requests.map((req) => (
          <div key={req.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between space-y-4 hover:border-slate-350 hover:shadow-md transition">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="font-mono text-slate-850 font-black text-sm">{req.signature_id}</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  Pending Verification
                </span>
              </div>

              <div className="space-y-2 text-xs font-semibold text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">Sender (Signer)</span>
                  <span className="text-slate-700 font-bold">{req.sender_username}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Quantum Basis</span>
                  <span className="font-mono text-slate-700">{req.quantum_state_basis}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Bell Pair Type</span>
                  <span className="font-mono text-slate-700">{req.bell_pair_type}</span>
                </div>
                <div className="pt-2">
                  <span className="text-slate-400 block text-[9px] uppercase font-bold mb-1">Payload Sample</span>
                  <p className="text-slate-500 font-mono text-[10px] bg-slate-50 p-2 rounded border border-slate-100 line-clamp-2">
                    {req.message_payload || '(Empty payload)'}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-[10px] text-slate-400 font-semibold">
                <Calendar className="w-3.5 h-3.5" />
                <span>{new Date(req.created_at).toLocaleDateString()}</span>
              </div>
              <button
                onClick={() => handleVerify(req.signature_id)}
                className="flex items-center text-xs font-bold text-green-700 hover:text-green-800 transition"
              >
                <span>Verify Now</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        ))}

        {requests.length === 0 && (
          <div className="col-span-full bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-400 text-xs font-semibold shadow-sm">
            All issued signatures have been verified. No pending requests.
          </div>
        )}
      </div>
    </div>
  );
};
