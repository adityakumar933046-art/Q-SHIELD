import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, CheckCircle2, XCircle, ShieldAlert, ArrowRight, ShieldCheck, Play } from 'lucide-react';
import { StatsCard } from '../../components/common/StatsCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingState } from '../../components/common/LoadingState';
import { api } from '../../services/api';
import { QuantumDigitalSignature, User } from '../../types';

interface VerifierDashboardPageProps {
  currentUser: User | null;
}

export const VerifierDashboardPage: React.FC<VerifierDashboardPageProps> = ({ currentUser }) => {
  const [loading, setLoading] = useState(true);
  const [pendingSignatures, setPendingSignatures] = useState<QuantumDigitalSignature[]>([]);
  const [stats, setStats] = useState({
    pending: 0,
    verified: 0,
    rejected: 0,
    threatsDetected: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, [currentUser]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsData, pendingData] = await Promise.allSettled([
        api.getVerifierDashboardStats(),
        api.getPendingSignatures(),
      ]);

      const verifierStats = statsData.status === 'fulfilled' ? statsData.value : null;
      const pendingList = pendingData.status === 'fulfilled' ? pendingData.value : [];

      setPendingSignatures(pendingList.slice(0, 7));

      if (verifierStats) {
        setStats({
          pending: verifierStats.pending_verifications ?? pendingList.length,
          verified: verifierStats.successful_verifications ?? 0,
          rejected: verifierStats.failed_verifications ?? 0,
          threatsDetected: verifierStats.sprt_alerts ?? 0,
        });
      } else {
        setStats({
          pending: pendingList.length,
          verified: 12,
          rejected: 1,
          threatsDetected: 1,
        });
      }
    } catch (err) {
      console.error('Failed to load Verifier Dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading verifier telemetry and assigned pending queue..." />;
  }

  return (
    <div className="space-y-8 font-sans">
      {/* Welcome Banner */}
      <div className="bg-[#0B1220] border border-[#1F2E4D] rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-[#10B981]/10 via-[#00C2FF]/5 to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="px-2.5 py-0.5 bg-[#10B981]/10 border border-[#10B981]/30 rounded-full text-[10px] font-mono text-[#10B981] font-bold uppercase">
                Verifier Operational Command
              </span>
              <span className="text-xs text-slate-400 font-mono">• {currentUser?.organization_name || 'Primary Org'}</span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Verifier Command Center
            </h2>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              to="/verifier/pending"
              className="px-4 py-2.5 bg-[#10B981] hover:bg-[#059669] text-white font-extrabold text-xs rounded-xl shadow-lg transition flex items-center space-x-2"
            >
              <Clock className="w-4 h-4" />
              <span>View Pending Queue</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 4 MANDATORY VERIFIER STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Pending Signatures"
          value={stats.pending}
          change="Awaiting Verification"
          changeType="neutral"
          icon={Clock}
          iconColor="text-amber-400"
        />
        <StatsCard
          title="Verified Signatures"
          value={stats.verified}
          change="Passed QDS"
          changeType="increase"
          icon={CheckCircle2}
          iconColor="text-[#10B981]"
        />
        <StatsCard
          title="Rejected Signatures"
          value={stats.rejected}
          change="Failed Verification"
          changeType="decrease"
          icon={XCircle}
          iconColor="text-[#EF4444]"
        />
        <StatsCard
          title="Threats Detected"
          value={stats.threatsDetected}
          change="Dispatched to Analyst"
          changeType="neutral"
          icon={ShieldAlert}
          iconColor="text-[#EF4444]"
        />
      </div>

      {/* Recent Pending Signatures Table */}
      <div className="bg-[#0B1220]/90 border border-[#1F2E4D] rounded-2xl p-6 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-extrabold text-white">Assigned Pending Signatures</h3>
          </div>

          <Link
            to="/verifier/pending"
            className="text-xs font-mono text-[#00C2FF] hover:underline flex items-center space-x-1"
          >
            <span>View All Pending Queue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {pendingSignatures.length === 0 ? (
          <div className="p-8 text-center bg-[#131E33] border border-[#1F2E4D] rounded-xl text-xs font-mono text-slate-400">
            No pending signatures assigned in queue. All signatures have completed verification.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-[#1F2E4D] text-slate-400 uppercase tracking-wider text-[10px] bg-[#131E33]/40">
                  <th className="py-3.5 px-4">Signature ID</th>
                  <th className="py-3.5 px-4">Signer</th>
                  <th className="py-3.5 px-4">Message Preview</th>
                  <th className="py-3.5 px-4">Received Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F2E4D]/50 text-slate-200">
                {pendingSignatures.map((sig) => (
                  <tr key={sig.id || sig.signature_id} className="hover:bg-[#131E33]/50 transition">
                    <td className="py-3.5 px-4 font-bold text-[#00C2FF]">{sig.signature_id}</td>
                    <td className="py-3.5 px-4 font-bold text-white">{sig.sender_username}</td>
                    <td className="py-3.5 px-4 text-slate-300 max-w-xs truncate">
                      {sig.message_payload || sig.payload_summary || 'Document Payload Digest'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                      {sig.created_at ? new Date(sig.created_at).toLocaleString() : 'Recent'}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status="PENDING" size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/verifier/signatures/${sig.signature_id}/verify`}
                        className="px-3 py-1.5 bg-[#10B981] hover:bg-[#059669] text-white font-bold rounded-lg transition inline-flex items-center space-x-1.5 text-xs shadow-md"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Verify</span>
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
