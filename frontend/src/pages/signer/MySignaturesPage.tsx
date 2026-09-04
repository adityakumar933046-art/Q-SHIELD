import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileKey2, Search, Filter, Eye, RefreshCw, Plus } from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';
import { api } from '../../services/api';
import { QuantumDigitalSignature, User } from '../../types';

interface MySignaturesPageProps {
  currentUser: User | null;
}

export const MySignaturesPage: React.FC<MySignaturesPageProps> = ({ currentUser }) => {
  const [loading, setLoading] = useState(true);
  const [signatures, setSignatures] = useState<QuantumDigitalSignature[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    fetchMySignatures();
  }, [currentUser]);

  const fetchMySignatures = async () => {
    setLoading(true);
    try {
      const allSigs = await api.getSignatures();
      // STRICT AUTHORIZATION FILTER: Only display signatures created by logged-in signer
      const mySigs = allSigs.filter(
        (s) => !currentUser || s.sender_username === currentUser.username || (s as any).sender === currentUser.id
      );
      setSignatures(mySigs);
    } catch (err) {
      console.error('Failed to fetch signer signatures:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredSignatures = signatures.filter((sig) => {
    const matchesSearch =
      sig.signature_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sig.message_payload && sig.message_payload.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (sig.payload_summary && sig.payload_summary.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === 'ALL'
        ? true
        : statusFilter === 'VERIFIED'
        ? sig.is_consumed || sig.status === 'VERIFIED'
        : sig.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <LoadingState message="Loading your QDS signature records..." />;
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="bg-[#0B1220] border border-[#1F2E4D] rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-[#00C2FF]/10 border border-[#00C2FF]/30 rounded-xl text-[#00C2FF]">
            <FileKey2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">My Quantum Digital Signatures</h2>
            <p className="text-xs text-slate-400 font-sans">
              Immutable cryptographic signature repository for {currentUser?.username}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={fetchMySignatures}
            className="px-3.5 py-2.5 bg-[#131E33] hover:bg-[#1F2E4D] text-[#00C2FF] font-sans font-bold text-xs rounded-xl border border-[#1F2E4D] transition flex items-center space-x-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          <Link
            to="/signer/create-signature"
            className="px-4 py-2.5 bg-[#00C2FF] hover:bg-[#00A8DE] text-[#0B1220] font-bold font-sans text-xs rounded-xl shadow-lg transition flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Signature</span>
          </Link>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-[#0B1220]/90 border border-[#1F2E4D] rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 backdrop-blur-md">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Signature ID or payload message..."
            className="w-full bg-[#131E33] border border-[#1F2E4D] rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00C2FF] font-sans"
          />
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto justify-end font-sans text-xs">
          <div className="flex items-center space-x-2 text-slate-400">
            <Filter className="w-4 h-4" />
            <span>Status Filter:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#131E33] border border-[#1F2E4D] text-xs text-white rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#00C2FF]"
          >
            <option value="ALL">All Statuses</option>
            <option value="ISSUED">Issued / Pending</option>
            <option value="VERIFIED">Verified Secure</option>
            <option value="COMPROMISED">Compromised</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#0B1220]/90 border border-[#1F2E4D] rounded-2xl overflow-hidden shadow-xl backdrop-blur-md">
        {filteredSignatures.length === 0 ? (
          <EmptyState
            title="No Signatures Found"
            description="You have not created any signatures matching the current filter selection."
            actionText="Create New Signature"
            onAction={() => window.location.assign('/signer/create-signature')}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead>
                <tr className="border-b border-[#1F2E4D] text-slate-400 uppercase tracking-wider text-[10px] bg-[#131E33]/40">
                  <th className="py-3.5 px-4">Signature ID</th>
                  <th className="py-3.5 px-4">Message Payload Preview</th>
                  <th className="py-3.5 px-4">Created Date</th>
                  <th className="py-3.5 px-4">Assigned Verifier Node</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F2E4D]/50 text-slate-200">
                {filteredSignatures.map((sig) => (
                  <tr key={sig.id || sig.signature_id} className="hover:bg-[#131E33]/50 transition">
                    <td className="py-4 px-4 font-bold text-[#00C2FF]">
                      <Link to={`/signer/signatures/${sig.signature_id}`} className="hover:underline">
                        {sig.signature_id}
                      </Link>
                    </td>
                    <td className="py-4 px-4 text-slate-300 max-w-xs truncate">
                      {sig.message_payload || sig.payload_summary || 'Document Payload Digest'}
                    </td>
                    <td className="py-4 px-4 text-slate-400 whitespace-nowrap">
                      {sig.created_at ? new Date(sig.created_at).toLocaleString() : 'Recent'}
                    </td>
                    <td className="py-4 px-4 font-bold text-purple-400">
                      {sig.recipient_org_name || 'Organization Verifier'}
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge status={sig.is_consumed ? 'VERIFIED' : sig.status || 'ISSUED'} size="sm" />
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Link
                        to={`/signer/signatures/${sig.signature_id}`}
                        className="p-1.5 bg-[#131E33] hover:bg-[#00C2FF]/20 text-slate-300 hover:text-[#00C2FF] border border-[#1F2E4D] rounded-lg transition inline-flex items-center space-x-1"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
