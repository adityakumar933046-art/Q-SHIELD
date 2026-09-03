import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Search, Filter, RefreshCw, Eye, FileWarning, UserX, Repeat, Cpu, Lock, Layers } from 'lucide-react';
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

  // Attack Category Quick Filter Boxes Config
  const attackCategories = [
    {
      id: 'ALL',
      name: 'All Threat Vectors',
      icon: Layers,
      color: 'text-[#00C2FF]',
      border: 'border-[#00C2FF]/30',
      bg: 'bg-[#00C2FF]/10',
    },
    {
      id: 'SIGNATURE_FORGERY',
      name: 'Signature Forgery',
      icon: FileWarning,
      color: 'text-[#EF4444]',
      border: 'border-[#EF4444]/30',
      bg: 'bg-[#EF4444]/10',
    },
    {
      id: 'SENDER_IMPERSONATION',
      name: 'Sender Impersonation',
      icon: UserX,
      color: 'text-amber-400',
      border: 'border-amber-500/30',
      bg: 'bg-amber-500/10',
    },
    {
      id: 'REPLAY_ATTACK',
      name: 'Replay Attack',
      icon: Repeat,
      color: 'text-purple-400',
      border: 'border-purple-500/30',
      bg: 'bg-purple-500/10',
    },
    {
      id: 'QUANTUM_CHANNEL_MANIPULATION',
      name: 'Quantum Channel Attack',
      icon: Cpu,
      color: 'text-[#10B981]',
      border: 'border-[#10B981]/30',
      bg: 'bg-[#10B981]/10',
    },
    {
      id: 'UNAUTHORIZED_VERIFICATION',
      name: 'Unauthorized Access',
      icon: Lock,
      color: 'text-pink-400',
      border: 'border-pink-500/30',
      bg: 'bg-pink-500/10',
    },
  ];

  // Calculate counts per category
  const getCategoryCount = (catId: string) => {
    if (catId === 'ALL') return threats.length;
    return threats.filter((t) => t.category === catId).length;
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
              Select an attack category box below to instantly filter security threats
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

      {/* QUICK ATTACK CATEGORY FILTER BOXES (Top Interactive Cards) */}
      <div className="space-y-2">
        <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider block px-1">
          Select Attack Type Category Box to Filter:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {attackCategories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = categoryFilter === cat.id;
            const count = getCategoryCount(cat.id);

            return (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className={`p-3.5 rounded-2xl border transition-all text-left font-mono relative overflow-hidden group ${
                  isSelected
                    ? `${cat.bg} ${cat.border} ring-2 ring-[#00C2FF]/50 shadow-lg scale-[1.02]`
                    : 'bg-[#0B1220]/90 border-[#1F2E4D] hover:bg-[#131E33] hover:border-slate-500'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-xl border ${cat.bg} ${cat.border} ${cat.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-[#131E33] text-slate-300'
                    }`}
                  >
                    {count}
                  </span>
                </div>

                <h4 className="text-xs font-extrabold text-white truncate group-hover:text-[#00C2FF] transition">
                  {cat.name}
                </h4>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {isSelected ? 'Active Filter' : 'Click to filter'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search & Secondary Filter Toolbar */}
      <div className="bg-[#0B1220]/90 border border-[#1F2E4D] rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 backdrop-blur-md">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Type threat ID, signature ID, or keyword..."
            className="w-full bg-[#131E33] border border-[#1F2E4D] rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#EF4444] font-mono"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end font-mono text-xs">
          <div className="flex items-center space-x-1.5 text-slate-400">
            <Filter className="w-3.5 h-3.5" />
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

          {(categoryFilter !== 'ALL' || severityFilter !== 'ALL' || statusFilter !== 'ALL' || searchQuery) && (
            <button
              onClick={() => {
                setCategoryFilter('ALL');
                setSeverityFilter('ALL');
                setStatusFilter('ALL');
                setSearchQuery('');
              }}
              className="px-2.5 py-1.5 bg-[#131E33] hover:bg-red-500/20 text-red-400 rounded-xl border border-red-500/30 transition text-[11px]"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Threat Table */}
      <div className="bg-[#0B1220]/90 border border-[#1F2E4D] rounded-2xl overflow-hidden shadow-xl backdrop-blur-md">
        {filteredThreats.length === 0 ? (
          <EmptyState
            title="No Security Threats Found"
            description="There are currently no threat events matching the selected category or search filter."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-[#1F2E4D] text-slate-400 uppercase tracking-wider text-[10px] bg-[#131E33]/40">
                  <th className="py-3.5 px-4">Threat ID</th>
                  <th className="py-3.5 px-4">Attack Vector Category</th>
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
                      <span className="px-2.5 py-1 bg-[#131E33] border border-[#1F2E4D] rounded-lg text-slate-200 inline-block">
                        {threat.category || threat.title}
                      </span>
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
