import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Search, Filter, RefreshCw, Eye, ArrowRight } from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';
import { api } from '../../services/api';
import { SecurityIncident, User } from '../../types';

interface InvestigationsPageProps {
  currentUser: User | null;
}

export const InvestigationsPage: React.FC<InvestigationsPageProps> = ({ currentUser }) => {
  const [loading, setLoading] = useState(true);
  const [incidents, setIncidents] = useState<SecurityIncident[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [classificationFilter, setClassificationFilter] = useState('ALL');

  useEffect(() => {
    fetchInvestigations();
  }, [currentUser]);

  const fetchInvestigations = async () => {
    setLoading(true);
    try {
      const list = await api.getIncidents();
      setIncidents(list);
    } catch (err) {
      console.error('Failed to fetch investigations:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredIncidents = incidents.filter((inc) => {
    const matchesSearch =
      inc.incident_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inc.assigned_to_username && inc.assigned_to_username.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || inc.status === statusFilter;
    const matchesClass = classificationFilter === 'ALL' || inc.classification === classificationFilter;

    return matchesSearch && matchesStatus && matchesClass;
  });

  if (loading) {
    return <LoadingState message="Loading security investigation cases..." />;
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0B1220] border border-[#1F2E4D] rounded-2xl p-6 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-purple-500/10 border border-purple-500/30 rounded-xl text-purple-400">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Security Investigations Workspace</h2>
            <p className="text-xs text-slate-400 font-sans">
              Manage incident lifecycle, notes & evidence classification for {currentUser?.organization_name || 'your organization'}
            </p>
          </div>
        </div>

        <button
          onClick={fetchInvestigations}
          className="px-3.5 py-2.5 bg-[#131E33] hover:bg-[#1F2E4D] text-[#00C2FF] font-sans font-bold text-xs rounded-xl border border-[#1F2E4D] transition flex items-center space-x-2 shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Investigations</span>
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
            placeholder="Search by Investigation ID or title..."
            className="w-full bg-[#131E33] border border-[#1F2E4D] rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 font-sans"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end font-sans text-xs">
          <div className="flex items-center space-x-1.5 text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Status:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#131E33] border border-[#1F2E4D] text-xs text-white rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-purple-400"
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="INVESTIGATING">Under Investigation</option>
            <option value="CONTAINED">Contained</option>
            <option value="RESOLVED">Resolved</option>
            <option value="FALSE_POSITIVE">False Positive</option>
            <option value="CLOSED">Closed</option>
          </select>

          <div className="flex items-center space-x-1.5 text-slate-400">
            <span>Classification:</span>
          </div>
          <select
            value={classificationFilter}
            onChange={(e) => setClassificationFilter(e.target.value)}
            className="bg-[#131E33] border border-[#1F2E4D] text-xs text-white rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-purple-400"
          >
            <option value="ALL">All Classifications</option>
            <option value="CONFIRMED_THREAT">Confirmed Threat</option>
            <option value="FALSE_POSITIVE">False Positive</option>
            <option value="INCONCLUSIVE">Inconclusive</option>
          </select>
        </div>
      </div>

      {/* Investigations Table */}
      <div className="bg-[#0B1220]/90 border border-[#1F2E4D] rounded-2xl overflow-hidden shadow-xl backdrop-blur-md">
        {filteredIncidents.length === 0 ? (
          <EmptyState
            title="No Active Investigations"
            description="There are currently no security investigations matching the selected criteria."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead>
                <tr className="border-b border-[#1F2E4D] text-slate-400 uppercase tracking-wider text-[10px] bg-[#131E33]/40">
                  <th className="py-3.5 px-4">Investigation ID</th>
                  <th className="py-3.5 px-4">Threat Title & Category</th>
                  <th className="py-3.5 px-4">Severity</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Classification</th>
                  <th className="py-3.5 px-4">Assigned Analyst</th>
                  <th className="py-3.5 px-4">Created At</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F2E4D]/50 text-slate-200">
                {filteredIncidents.map((inc) => (
                  <tr key={inc.id || inc.incident_number} className="hover:bg-[#131E33]/50 transition">
                    <td className="py-4 px-4 font-bold text-[#00C2FF]">
                      <Link to={`/security-analyst/investigations/${inc.id || inc.incident_number}`} className="hover:underline">
                        {inc.incident_number}
                      </Link>
                    </td>
                    <td className="py-4 px-4 font-bold text-white max-w-xs truncate">
                      {inc.title}
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge status={inc.severity} size="sm" />
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge status={inc.status} size="sm" />
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2 py-0.5 bg-purple-500/10 text-purple-300 border border-purple-500/30 rounded text-[10px] font-bold uppercase">
                        {inc.classification || 'INCONCLUSIVE'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-300 font-bold">
                      {inc.assigned_to_username || 'Unassigned'}
                    </td>
                    <td className="py-4 px-4 text-slate-400 whitespace-nowrap">
                      {inc.created_at ? new Date(inc.created_at).toLocaleString() : 'Recent'}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Link
                        to={`/security-analyst/investigations/${inc.id || inc.incident_number}`}
                        className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition inline-flex items-center space-x-1 text-xs shadow-md"
                      >
                        <Briefcase className="w-3.5 h-3.5" />
                        <span>Open Workspace</span>
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
