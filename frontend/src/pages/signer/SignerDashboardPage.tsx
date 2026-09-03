import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileKey2, Clock, CheckCircle2, XCircle, ArrowRight, Plus, Eye, ShieldAlert } from 'lucide-react';
import { StatsCard } from '../../components/common/StatsCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingState } from '../../components/common/LoadingState';
import { api } from '../../services/api';
import { QuantumDigitalSignature, User } from '../../types';

interface SignerDashboardPageProps {
  currentUser: User | null;
}

export const SignerDashboardPage: React.FC<SignerDashboardPageProps> = ({ currentUser }) => {
  const [loading, setLoading] = useState(true);
  const [recentSignatures, setRecentSignatures] = useState<QuantumDigitalSignature[]>([]);
  const [stats, setStats] = useState({
    totalCreated: 0,
    pendingVerification: 0,
    verified: 0,
    rejected: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, [currentUser]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsData, sigsData] = await Promise.allSettled([
        api.getSignerDashboardStats(),
        api.getSignatures(),
      ]);

      const dashboardStats = statsData.status === 'fulfilled' ? statsData.value : null;
      const allSigs = sigsData.status === 'fulfilled' ? sigsData.value : [];

      // Filter signatures to only those created by the logged in signer
      const mySigs = allSigs.filter(
        (s) => !currentUser || s.sender_username === currentUser.username || (s as any).sender === currentUser.id
      );

      setRecentSignatures(mySigs.slice(0, 7));

      if (dashboardStats) {
        setStats({
          totalCreated: dashboardStats.qds_created || mySigs.length,
          pendingVerification: dashboardStats.pending_requests || mySigs.filter((s) => s.status === 'ISSUED' && !s.is_consumed).length,
          verified: dashboardStats.verified || mySigs.filter((s) => s.status === 'VERIFIED').length,
          rejected: dashboardStats.rejected || mySigs.filter((s) => s.status === 'COMPROMISED').length,
        });
      } else {
        setStats({
          totalCreated: mySigs.length,
          pendingVerification: mySigs.filter((s) => s.status === 'ISSUED' && !s.is_consumed).length,
          verified: mySigs.filter((s) => s.status === 'VERIFIED').length,
          rejected: mySigs.filter((s) => s.status === 'COMPROMISED').length,
        });
      }
    } catch (err) {
      console.error('Failed to load Signer Dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading your QDS digital signature metrics..." />;
  }

  return (
    <div className="space-y-8 font-sans">
      {/* Header Welcome Banner */}
      <div className="bg-[#0B1220] border border-[#1F2E4D] rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-[#00C2FF]/10 via-purple-500/5 to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="px-2.5 py-0.5 bg-[#00C2FF]/10 border border-[#00C2FF]/30 rounded-full text-[10px] font-mono text-[#00C2FF] font-bold uppercase">
                Cryptographic Signer Workspace
              </span>
              <span className="text-xs text-slate-400 font-mono">
                • {currentUser?.organization_name || 'Primary Org'}
              </span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Welcome back, {currentUser?.first_name || currentUser?.username}
            </h2>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              to="/signer/create-signature"
              className="px-4 py-2.5 bg-[#00C2FF] hover:bg-[#00A8DE] text-[#0B1220] font-extrabold text-xs rounded-xl shadow-lg transition flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Signature</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 4 MANDATORY STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Signatures Created"
          value={stats.totalCreated}
          change="Account Total"
          changeType="neutral"
          icon={FileKey2}
          iconColor="text-[#00C2FF]"
        />
        <StatsCard
          title="Pending Verification"
          value={stats.pendingVerification}
          change="Awaiting Verifier"
          changeType="neutral"
          icon={Clock}
          iconColor="text-amber-400"
        />
        <StatsCard
          title="Verified Secure"
          value={stats.verified}
          change="Passed QDS"
          changeType="increase"
          icon={CheckCircle2}
          iconColor="text-[#10B981]"
        />
        <StatsCard
          title="Rejected / Compromised"
          value={stats.rejected}
          change="Security Rejections"
          changeType="decrease"
          icon={XCircle}
          iconColor="text-[#EF4444]"
        />
      </div>

      {/* Recent Signatures Section */}
      <div className="bg-[#0B1220]/90 border border-[#1F2E4D] rounded-2xl p-6 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <FileKey2 className="w-5 h-5 text-[#00C2FF]" />
            <h3 className="text-base font-extrabold text-white">Recent Signatures Created</h3>
          </div>

          <Link
            to="/signer/my-signatures"
            className="text-xs font-mono text-[#00C2FF] hover:underline flex items-center space-x-1"
          >
            <span>View All Signatures</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentSignatures.length === 0 ? (
          <div className="p-8 text-center bg-[#131E33] border border-[#1F2E4D] rounded-xl text-xs font-mono text-slate-400">
            No digital signatures generated yet. Click "Create New Signature" to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-[#1F2E4D] text-slate-400 uppercase tracking-wider text-[10px] bg-[#131E33]/40">
                  <th className="py-3.5 px-4">Signature ID</th>
                  <th className="py-3.5 px-4">Message Payload Preview</th>
                  <th className="py-3.5 px-4">Created At</th>
                  <th className="py-3.5 px-4">Assigned Verifier / Target Org</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F2E4D]/50 text-slate-200">
                {recentSignatures.map((sig) => (
                  <tr key={sig.id || sig.signature_id} className="hover:bg-[#131E33]/50 transition">
                    <td className="py-3.5 px-4 font-bold text-[#00C2FF]">
                      <Link to={`/signer/signatures/${sig.signature_id}`} className="hover:underline">
                        {sig.signature_id}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 max-w-xs truncate">
                      {sig.message_payload || sig.payload_summary || 'Document Digest Payload'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                      {sig.created_at ? new Date(sig.created_at).toLocaleString() : 'Recent'}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-purple-400">
                      {sig.recipient_org_name || 'Organization Verifier Node'}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={sig.is_consumed ? 'VERIFIED' : sig.status || 'ISSUED'} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/signer/signatures/${sig.signature_id}`}
                        className="p-1.5 bg-[#131E33] hover:bg-[#00C2FF]/20 text-slate-300 hover:text-[#00C2FF] border border-[#1F2E4D] rounded-lg transition inline-flex items-center space-x-1 text-[11px]"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Details</span>
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
