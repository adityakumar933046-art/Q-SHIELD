import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Search, Filter, RefreshCw, Eye, Briefcase } from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';
import { api } from '../../services/api';
import { SecurityIncident, User } from '../../types';

interface ThreatMonitoringPageProps {
  currentUser: User | null;
}

export const ThreatMonitoringPage: React.FC<ThreatMonitoringPageProps> = ({ currentUser }) => {
  const [loading, setLoading] = useState(true);
  const [threats, setThreats] = useState<SecurityIncident[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    fetchThreatEvents();
  }, [currentUser]);

  const fetchThreatEvents = async () => {
    setLoading(true);
    try {
      const list = await api.getIncidents();
      setThreats(list);
    } catch (err) {
      console.error('Failed to fetch threat monitoring events:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredThreats = threats.filter((t) => {
    const matchesSearch =
      t.incident_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.signature_id && t.signature_id.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = categoryFilter === 'ALL' || t.category === categoryFilter;
    const matchesSeverity = severityFilter === 'ALL' || t.severity === severityFilter;
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;

    return matchesSearch && matchesCategory && matchesSeverity && matchesStatus;
  });

  if (loading) {
    return <LoadingState message="Fetching organizational security threat events..." />;
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0B1220] border border-[#1F2E4D] rounded-2xl p-6 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-xl text-[#EF4444]">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">Threat Monitoring Directory</h2>
            <p className="text-xs text-slate-400 font-mono">
              Deterministic quantum threat telemetry for {currentUser?.organization_name || 'your organization'}
            </p>
          </div>
        </div>

        <button
          onClick={fetchThreatEvents}
          className="px-3.5 py-2.5 bg-[#131E33] hover:bg-[#1F2E4D] text-[#00C2FF] font-mono font-bold text-xs rounded-xl border border-[#1F2E4D] transition flex items-center space-x-2 shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Threats</span>
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
            placeholder="Search by Threat ID, title, or signature..."
            className="w-full bg-[#131E33] border border-[#1F2E4D] rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#EF4444] font-mono"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end font-mono text-xs">
          <div className="flex items-center space-x-1.5 text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Category:</span>
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-[#131E33] border border-[#1F2E4D] text-xs text-white rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-[#EF4444]"
          >
            <option value="ALL">All Categories</option>
            <option value="SIGNATURE_FORGERY">Signature Forgery</option>
            <option value="SENDER_IMPERSONATION">Sender Impersonation</option>
            <option value="REPLAY_ATTACK">Replay Attack</option>
            <option value="QUANTUM_CHANNEL_MANIPULATION">Quantum Channel Manipulation</option>
            <option value="UNAUTHORIZED_VERIFICATION">Unauthorized Verification</option>
          </select>

          <div className="flex items-center space-x-1.5 text-slate-400">
            <span>Severity:</span>
          </div>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-[#131E33] border border-[#1F2E4D] text-xs text-white rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-[#EF4444]"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          <div className="flex items-center space-x-1.5 text-slate-400">
            <span>Status:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#131E33] border border-[#1F2E4D] text-xs text-white rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-[#EF4444]"
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="INVESTIGATING">Under Investigation</option>
            <option value="RESOLVED">Resolved</option>
            <option value="FALSE_POSITIVE">False Positive</option>
          </select>
        </div>
      </div>

      {/* Threat Table */}
      <div className="bg-[#0B1220]/90 border border-[#1F2E4D] rounded-2xl overflow-hidden shadow-xl backdrop-blur-md">
        {filteredThreats.length === 0 ? (
          <EmptyState
            title="No Security Threats Found"
            description="There are currently no threat events matching the selected criteria."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-[#1F2E4D] text-slate-400 uppercase tracking-wider text-[10px] bg-[#131E33]/40">
                  <th className="py-3.5 px-4">Threat ID</th>
                  <th className="py-3.5 px-4">Threat Category</th>
                  <th className="py-3.5 px-4">Severity</th>
                  <th className="py-3.5 px-4">Related Signature ID</th>
                  <th className="py-3.5 px-4">Source User</th>
                  <th className="py-3.5 px-4">Detection Time</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F2E4D]/50 text-slate-200">
                {filteredThreats.map((threat) => (
                  <tr key={threat.id || threat.incident_number} className="hover:bg-[#131E33]/50 transition">
                    <td className="py-4 px-4 font-bold text-[#00C2FF]">
                      <Link to={`/security-analyst/threats/${threat.id || threat.incident_number}`} className="hover:underline">
                        {threat.incident_number}
                      </Link>
                    </td>
                    <td className="py-4 px-4 font-bold text-white">
                      {threat.category || threat.title}
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge status={threat.severity} size="sm" />
                    </td>
                    <td className="py-4 px-4 text-slate-300 font-mono text-[11px]">
                      {threat.signature_id || (threat as any).related_signature || 'N/A'}
                    </td>
                    <td className="py-4 px-4 font-bold text-purple-400">
                      {threat.source_username || (threat as any).user || 'System Node'}
                    </td>
                    <td className="py-4 px-4 text-slate-400 whitespace-nowrap">
                      {threat.created_at ? new Date(threat.created_at).toLocaleString() : 'Recent'}
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge status={threat.status} size="sm" />
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Link
                        to={`/security-analyst/threats/${threat.id || threat.incident_number}`}
                        className="px-3 py-1.5 bg-[#131E33] hover:bg-[#EF4444]/20 text-slate-300 hover:text-[#EF4444] border border-[#1F2E4D] rounded-lg transition inline-flex items-center space-x-1.5 text-xs font-bold"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Details</span>
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
