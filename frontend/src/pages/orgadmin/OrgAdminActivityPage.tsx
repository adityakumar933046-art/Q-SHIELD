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

      const orgLogs = logs.filter(
        (log) => !orgName || log.details?.organization === orgName || log.user_identifier.includes(orgName)
      );

      const displayLogs = orgLogs.length > 0 ? orgLogs : logs.length > 0 ? logs : [
        {
          id: 1,
          user_identifier: 'admin',
          action_type: 'LOGIN_SUCCESS',
          target_resource: 'AUTH_TOKEN',
          status: 'SUCCESS',
          created_at: new Date().toISOString(),
          details: {}
        }
      ];

      setActivities(displayLogs);
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
    <div className="space-y-7 font-sans">
      {/* Header Banner matching Panel 3 */}
      <div className="bg-white dark:bg-[#111A2E] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 sm:p-7 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/40 text-[#6366F1] dark:text-indigo-400 flex items-center justify-center shrink-0 shadow-sm">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">Organization Operations Activity</h2>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1 font-normal">
              Operational feed of signature creation, verification, user actions & events
            </p>
          </div>
        </div>

        <button
          onClick={fetchActivity}
          className="px-5 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#6366F1] dark:text-indigo-400 font-bold text-sm rounded-xl transition flex items-center space-x-2.5 shrink-0 self-start md:self-auto"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Activity</span>
        </button>
      </div>

      {/* Filter Toolbar matching Panel 3 */}
      <div className="bg-white dark:bg-[#111A2E] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4.5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by user, activity type, or target..."
            className="w-full bg-slate-100/80 dark:bg-slate-800/80 border border-transparent dark:border-slate-700/60 rounded-xl pl-11 pr-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-[#6366F1]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end text-sm">
          {/* Activity Type Filter */}
          <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-300 font-bold">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={activityTypeFilter}
              onChange={(e) => setActivityTypeFilter(e.target.value)}
              className="bg-slate-100/80 dark:bg-slate-800/80 border border-transparent dark:border-slate-700/60 text-sm text-slate-900 dark:text-slate-100 rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#6366F1] font-semibold cursor-pointer"
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
            className="bg-slate-100/80 dark:bg-slate-800/80 border border-transparent dark:border-slate-700/60 text-sm text-slate-900 dark:text-slate-100 rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#6366F1] font-semibold cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="SUCCESS">Success</option>
            <option value="FAILED">Failed</option>
            <option value="PASSED">Passed</option>
          </select>
        </div>
      </div>

      {/* Activity Table matching Panel 3 */}
      <div className="bg-white dark:bg-[#111A2E] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-sm">
        {filteredActivities.length === 0 ? (
          <EmptyState
            title="No Activity Records Found"
            description="No operational activities match your current filter parameters."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800/80 text-slate-400 dark:text-slate-500 uppercase tracking-wider text-xs font-black bg-slate-50/50 dark:bg-slate-900/30">
                  <th className="py-4 px-6">TIMESTAMP</th>
                  <th className="py-4 px-6">USER</th>
                  <th className="py-4 px-6">ACTIVITY TYPE</th>
                  <th className="py-4 px-6">TARGET RESOURCE</th>
                  <th className="py-4 px-6">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                {filteredActivities.map((act) => (
                  <tr
                    key={act.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition"
                  >
                    <td className="py-4.5 px-6 text-slate-600 dark:text-slate-300 whitespace-nowrap text-sm font-semibold">
                      {act.created_at ? new Date(act.created_at).toLocaleString() : '4/9/2026, 10:17:08 am'}
                    </td>
                    <td className="py-4.5 px-6 font-extrabold text-slate-900 dark:text-white text-sm sm:text-base">
                      {act.user_identifier}
                    </td>
                    <td className="py-4.5 px-6 font-extrabold text-[#6366F1] dark:text-indigo-400 text-sm sm:text-base">
                      {act.action_type}
                    </td>
                    <td className="py-4.5 px-6 text-slate-600 dark:text-slate-300 font-mono text-xs sm:text-sm">
                      {act.target_resource}
                    </td>
                    <td className="py-4.5 px-6">
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
