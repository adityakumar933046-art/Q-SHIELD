import React, { useState, useEffect } from 'react';
import { Activity, Search, Filter, RefreshCw } from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';
import { api } from '../../services/api';
import { AuditTrailRecord, User } from '../../types';

interface OrgAdminActivityPageProps {
  currentUser: User | null;
}

export const OrgAdminActivityPage: React.FC<OrgAdminActivityPageProps> = ({ currentUser }) => {
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<AuditTrailRecord[]>([]);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [activityTypeFilter, setActivityTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    fetchActivity();
  }, [currentUser]);

  const fetchActivity = async () => {
    setLoading(true);
    try {
      const logs = await api.getAuditLogs();
      const orgName = currentUser?.organization_name;

      // Filter by organization scope
      const orgLogs = logs.filter(
        (log) => !orgName || log.details?.organization === orgName || log.user_identifier.includes(orgName)
      );
      setActivities(orgLogs.length > 0 ? orgLogs : logs);
    } catch (err) {
      console.error('Failed to fetch activity trail:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredActivities = activities.filter((act) => {
    const matchesSearch =
      act.user_identifier.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.action_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.target_resource.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = activityTypeFilter === 'ALL' ? true : act.action_type.includes(activityTypeFilter);
    const matchesStatus = statusFilter === 'ALL' ? true : act.status.toUpperCase() === statusFilter.toUpperCase();

    return matchesSearch && matchesType && matchesStatus;
  });

  if (loading) {
    return <LoadingState message="Loading organization operational activity feed..." />;
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="bg-[#0B1220] border border-[#1F2E4D] rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-purple-500/10 border border-purple-500/30 rounded-xl text-purple-400">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">Organization Operations Activity</h2>
            <p className="text-xs text-slate-400 font-mono">
              Operational feed of signature creation, verifications, user actions & events
            </p>
          </div>
        </div>

        <button
          onClick={fetchActivity}
          className="px-3.5 py-2 bg-[#131E33] hover:bg-[#1F2E4D] text-purple-400 font-mono font-bold text-xs rounded-xl border border-[#1F2E4D] transition flex items-center space-x-2 shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Activity</span>
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
            placeholder="Search by user, activity type, or target..."
            className="w-full bg-[#131E33] border border-[#1F2E4D] rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 font-mono"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end font-mono text-xs">
          {/* Activity Type Filter */}
          <div className="flex items-center space-x-2 text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <select
              value={activityTypeFilter}
              onChange={(e) => setActivityTypeFilter(e.target.value)}
              className="bg-[#131E33] border border-[#1F2E4D] text-xs text-white rounded-xl px-3 py-1.5 focus:outline-none focus:border-purple-400"
            >
              <option value="ALL">All Activity Types</option>
              <option value="SIGNATURE">Signature Activity</option>
              <option value="VERIFY">Verification Activity</option>
              <option value="USER">User Activity</option>
              <option value="LOGIN">Login Activity</option>
            </select>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#131E33] border border-[#1F2E4D] text-xs text-white rounded-xl px-3 py-1.5 focus:outline-none focus:border-purple-400"
          >
            <option value="ALL">All Statuses</option>
            <option value="SUCCESS">Success</option>
            <option value="FAILED">Failed</option>
            <option value="PASSED">Passed</option>
          </select>
        </div>
      </div>

      {/* Activity Table */}
      <div className="bg-[#0B1220]/90 border border-[#1F2E4D] rounded-2xl overflow-hidden shadow-xl backdrop-blur-md">
        {filteredActivities.length === 0 ? (
          <EmptyState
            title="No Activity Records Found"
            description="No operational activities match your current filter parameters."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-[#1F2E4D] text-slate-400 uppercase tracking-wider text-[10px] bg-[#131E33]/40">
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Activity Type</th>
                  <th className="py-3.5 px-4">Target Resource</th>
                  <th className="py-3.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F2E4D]/50 text-slate-200">
                {filteredActivities.map((act) => (
                  <tr key={act.id} className="hover:bg-[#131E33]/50 transition">
                    <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                      {act.created_at ? new Date(act.created_at).toLocaleString() : 'Recent'}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white">
                      {act.user_identifier}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-purple-400">{act.action_type}</td>
                    <td className="py-3.5 px-4 text-slate-300">{act.target_resource}</td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={act.status || 'SUCCESS'} size="sm" />
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
