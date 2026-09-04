import React, { useState, useEffect } from 'react';
import { FileCheck2, Search, Filter, RefreshCw, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';
import { api } from '../../services/api';
import { SignatureVerificationAttempt, User } from '../../types';

interface VerificationHistoryPageProps {
  currentUser: User | null;
}

export const VerificationHistoryPage: React.FC<VerificationHistoryPageProps> = ({ currentUser }) => {
  const [loading, setLoading] = useState(true);
  const [verifications, setVerifications] = useState<SignatureVerificationAttempt[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [resultFilter, setResultFilter] = useState('ALL');

  useEffect(() => {
    fetchHistory();
  }, [currentUser]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const list = await api.getVerifications();
      setVerifications(list);
    } catch (err) {
      console.error('Failed to fetch verification history:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = verifications.filter((v) => {
    const matchesSearch =
      v.verification_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.signature_id && v.signature_id.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (v.verifier_username && v.verifier_username.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesResult =
      resultFilter === 'ALL'
        ? true
        : resultFilter === 'PASSED'
        ? v.verification_result === 'PASSED'
        : v.verification_result !== 'PASSED';

    return matchesSearch && matchesResult;
  });

  if (loading) {
    return <LoadingState message="Loading your QDS verification history records..." />;
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0B1220] border border-[#1F2E4D] rounded-2xl p-6 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-[#10B981]/10 border border-[#10B981]/30 rounded-xl text-[#10B981]">
            <FileCheck2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Verification History & Audit Trail</h2>
            <p className="text-xs text-slate-400 font-sans">
              Immutable verification attempt logs for {currentUser?.username || 'Verifier'}
            </p>
          </div>
        </div>

        <button
          onClick={fetchHistory}
          className="px-3.5 py-2.5 bg-[#131E33] hover:bg-[#1F2E4D] text-[#00C2FF] font-sans font-bold text-xs rounded-xl border border-[#1F2E4D] transition flex items-center space-x-2 shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Records</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-[#0B1220]/90 border border-[#1F2E4D] rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 backdrop-blur-md">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Verification ID or Signature ID..."
            className="w-full bg-[#131E33] border border-[#1F2E4D] rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#10B981] font-sans"
          />
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto justify-end font-sans text-xs">
          <div className="flex items-center space-x-2 text-slate-400">
            <Filter className="w-4 h-4" />
            <span>Result Filter:</span>
          </div>
          <select
            value={resultFilter}
            onChange={(e) => setResultFilter(e.target.value)}
            className="bg-[#131E33] border border-[#1F2E4D] text-xs text-white rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#10B981]"
          >
            <option value="ALL">All Results</option>
            <option value="PASSED">Passed / Verified</option>
            <option value="REJECTED">Rejected / Threat</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#0B1220]/90 border border-[#1F2E4D] rounded-2xl overflow-hidden shadow-xl backdrop-blur-md">
        {filteredHistory.length === 0 ? (
          <EmptyState
            title="No Verification History"
            description="You have not completed any verification operations matching the selected filter."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead>
                <tr className="border-b border-[#1F2E4D] text-slate-400 uppercase tracking-wider text-[10px] bg-[#131E33]/40">
                  <th className="py-3.5 px-4">Verification ID</th>
                  <th className="py-3.5 px-4">Signature ID</th>
                  <th className="py-3.5 px-4">Fidelity (F)</th>
                  <th className="py-3.5 px-4">Verification Result</th>
                  <th className="py-3.5 px-4">Threat Status</th>
                  <th className="py-3.5 px-4 text-right">Verification Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F2E4D]/50 text-slate-200">
                {filteredHistory.map((v) => (
                  <tr key={v.id || v.verification_id} className="hover:bg-[#131E33]/50 transition">
                    <td className="py-4 px-4 font-bold text-[#00C2FF]">{v.verification_id}</td>
                    <td className="py-4 px-4 font-bold text-white">{v.signature_id || (v as any).signature}</td>
                    <td className="py-4 px-4 font-bold text-[#10B981]">
                      {((v.quantum_fidelity || 1.0) * 100).toFixed(1)}%
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge status={v.verification_result} size="sm" />
                    </td>
                    <td className="py-4 px-4">
                      {v.threat_detected ? (
                        <span className="px-2 py-0.5 bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/30 rounded text-[10px] font-bold uppercase inline-flex items-center space-x-1">
                          <ShieldAlert className="w-3 h-3" />
                          <span>{v.threat_category || 'THREAT'}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Normal</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right text-slate-400 whitespace-nowrap">
                      {v.created_at ? new Date(v.created_at).toLocaleString() : 'Recent'}
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
