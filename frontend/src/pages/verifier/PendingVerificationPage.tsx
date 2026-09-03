import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Search, Filter, Play, RefreshCw, Eye } from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';
import { api } from '../../services/api';
import { QuantumDigitalSignature, User } from '../../types';

interface PendingVerificationPageProps {
  currentUser: User | null;
}

export const PendingVerificationPage: React.FC<PendingVerificationPageProps> = ({ currentUser }) => {
  const [loading, setLoading] = useState(true);
  const [signatures, setSignatures] = useState<QuantumDigitalSignature[]>([]);
  const [selectedSigForView, setSelectedSigForView] = useState<QuantumDigitalSignature | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPendingQueue();
  }, [currentUser]);

  const fetchPendingQueue = async () => {
    setLoading(true);
    try {
      const pendingList = await api.getPendingSignatures();
      setSignatures(pendingList);
    } catch (err) {
      console.error('Failed to fetch pending verification queue:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredSignatures = signatures.filter((sig) => {
    const matchesSearch =
      sig.signature_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sig.sender_username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sig.message_payload && sig.message_payload.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesSearch;
  });

  if (loading) {
    return <LoadingState message="Fetching organization pending signature queue..." />;
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0B1220] border border-[#1F2E4D] rounded-2xl p-6 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">Pending Verification Queue</h2>
            <p className="text-xs text-slate-400 font-mono">
              Signatures dispatched for QDS verification in {currentUser?.organization_name || 'your organization'}
            </p>
          </div>
        </div>

        <button
          onClick={fetchPendingQueue}
          className="px-3.5 py-2.5 bg-[#131E33] hover:bg-[#1F2E4D] text-[#00C2FF] font-mono font-bold text-xs rounded-xl border border-[#1F2E4D] transition flex items-center space-x-2 shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Search Toolbar */}
      <div className="bg-[#0B1220]/90 border border-[#1F2E4D] rounded-2xl p-4 backdrop-blur-md">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Signature ID, Signer, or message..."
            className="w-full bg-[#131E33] border border-[#1F2E4D] rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#10B981] font-mono"
          />
        </div>
      </div>

      {/* Pending Table */}
      <div className="bg-[#0B1220]/90 border border-[#1F2E4D] rounded-2xl overflow-hidden shadow-xl backdrop-blur-md">
        {filteredSignatures.length === 0 ? (
          <EmptyState
            title="No Pending Signatures"
            description="There are currently no signatures in the queue awaiting verification."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-[#1F2E4D] text-slate-400 uppercase tracking-wider text-[10px] bg-[#131E33]/40">
                  <th className="py-3.5 px-4">Signature ID</th>
                  <th className="py-3.5 px-4">Signer Name</th>
                  <th className="py-3.5 px-4">Message Preview</th>
                  <th className="py-3.5 px-4">SHA-256 Digest</th>
                  <th className="py-3.5 px-4">Received At</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F2E4D]/50 text-slate-200">
                {filteredSignatures.map((sig) => (
                  <tr key={sig.id || sig.signature_id} className="hover:bg-[#131E33]/50 transition">
                    <td className="py-4 px-4 font-bold text-[#00C2FF]">{sig.signature_id}</td>
                    <td className="py-4 px-4 font-bold text-white">{sig.sender_username}</td>
                    <td className="py-4 px-4 text-slate-300 max-w-xs truncate">
                      {sig.message_payload || sig.payload_summary || 'Document Payload Digest'}
                    </td>
                    <td className="py-4 px-4 text-slate-400 font-mono text-[11px] max-w-[140px] truncate">
                      {sig.message_digest}
                    </td>
                    <td className="py-4 px-4 text-slate-400 whitespace-nowrap">
                      {sig.created_at ? new Date(sig.created_at).toLocaleString() : 'Recent'}
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge status="PENDING" size="sm" />
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => setSelectedSigForView(sig)}
                          className="px-2.5 py-1.5 bg-[#131E33] hover:bg-[#1F2E4D] text-[#00C2FF] font-bold rounded-lg border border-[#1F2E4D] transition inline-flex items-center space-x-1 text-xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                        <Link
                          to={`/verifier/signatures/${sig.signature_id}/verify`}
                          className="px-3.5 py-1.5 bg-[#10B981] hover:bg-[#059669] text-white font-bold rounded-lg transition inline-flex items-center space-x-1.5 text-xs shadow-md"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Verify</span>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* View Signature Modal */}
        {selectedSigForView && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#0B1220] border border-[#1F2E4D] rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl font-sans">
              <div className="flex items-center justify-between border-b border-[#1F2E4D] pb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-[#00C2FF]/10 border border-[#00C2FF]/30 rounded-xl text-[#00C2FF]">
                    <Eye className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-white">Signature Package Details</h3>
                    <p className="text-xs text-slate-400 font-mono">{selectedSigForView.signature_id}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedSigForView(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#131E33]"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 font-mono text-xs max-h-[60vh] overflow-y-auto pr-1">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-[#131E33] border border-[#1F2E4D] rounded-xl space-y-1">
                    <span className="text-slate-400 text-[10px] uppercase block">Signer Username</span>
                    <span className="font-bold text-white text-xs">{selectedSigForView.sender_username}</span>
                  </div>
                  <div className="p-3 bg-[#131E33] border border-[#1F2E4D] rounded-xl space-y-1">
                    <span className="text-slate-400 text-[10px] uppercase block">Received Timestamp</span>
                    <span className="font-bold text-slate-200 text-xs">
                      {selectedSigForView.created_at ? new Date(selectedSigForView.created_at).toLocaleString() : 'Recent'}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-[#131E33] border border-[#1F2E4D] rounded-xl space-y-1">
                  <span className="text-slate-400 text-[10px] uppercase block">SHA-256 Digest Hash</span>
                  <span className="font-bold text-[#00C2FF] text-xs break-all">{selectedSigForView.message_digest}</span>
                </div>

                <div className="p-3 bg-[#131E33] border border-[#1F2E4D] rounded-xl space-y-1">
                  <span className="text-slate-400 text-[10px] uppercase block">Full Document Payload</span>
                  <p className="text-slate-200 text-xs leading-relaxed max-h-32 overflow-y-auto">
                    {selectedSigForView.message_payload || selectedSigForView.payload_summary || 'Document Payload'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-[#131E33] border border-[#1F2E4D] rounded-xl space-y-1">
                    <span className="text-slate-400 text-[10px] uppercase block">Quantum State Basis</span>
                    <span className="font-bold text-[#10B981]">{selectedSigForView.quantum_state_basis || '|+>'}</span>
                  </div>
                  <div className="p-3 bg-[#131E33] border border-[#1F2E4D] rounded-xl space-y-1">
                    <span className="text-slate-400 text-[10px] uppercase block">Bell Pair Type</span>
                    <span className="font-bold text-purple-400">{selectedSigForView.bell_pair_type || 'PHI_PLUS'}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-[#1F2E4D]">
                <button
                  onClick={() => setSelectedSigForView(null)}
                  className="px-4 py-2 bg-[#131E33] hover:bg-[#1F2E4D] text-slate-300 font-mono font-bold text-xs rounded-xl border border-[#1F2E4D] transition"
                >
                  Close
                </button>
                <Link
                  to={`/verifier/signatures/${selectedSigForView.signature_id}/verify`}
                  className="px-4 py-2 bg-[#10B981] hover:bg-[#059669] text-white font-extrabold font-mono text-xs rounded-xl shadow-lg transition flex items-center space-x-2"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Proceed to Verify Signature</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
