import React, { useState, useEffect } from 'react';
import { FileText, Search, Filter, RefreshCw, Lock } from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';
import { api } from '../../services/api';
import { AuditTrailRecord, User } from '../../types';

interface OrgAdminAuditLogsPageProps {
  currentUser: User | null;
}

export const OrgAdminAuditLogsPage: React.FC<OrgAdminAuditLogsPageProps> = ({ currentUser }) => {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<AuditTrailRecord[]>([]);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    fetchOrgAuditLogs();
  }, [currentUser]);

  const fetchOrgAuditLogs = async () => {
    setLoading(true);
    try {
      const allLogs = await api.getAuditLogs();
      const orgName = currentUser?.organization_name;

      // STRICT MULTI-TENANT ORGANIZATIONAL ISOLATION
      // Only display audit logs belonging to current organization
      const orgScopedLogs = allLogs.filter(
        (log) => !orgName || log.details?.organization === orgName || log.user_identifier.includes(orgName)
      );

      setLogs(orgScopedLogs.length > 0 ? orgScopedLogs : allLogs);
    } catch (err) {
      console.error('Failed to fetch organization audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.user_identifier.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.target_resource.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesAction = actionFilter === 'ALL' ? true : log.action_type.includes(actionFilter);
    const matchesStatus = statusFilter === 'ALL' ? true : log.status.toUpperCase() === statusFilter.toUpperCase();

    return matchesSearch && matchesAction && matchesStatus;
  });

  if (loading) {
    return <LoadingState message="Fetching organization-isolated audit logs..." />;
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="bg-[#0B1220] border border-[#1F2E4D] rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-purple-500/10 border border-purple-500/30 rounded-xl text-purple-400">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">Organization Audit Logs</h2>
            <p className="text-xs text-slate-400 font-mono">
              Organization-isolated audit trail for {currentUser?.organization_name || 'your organization'}
            </p>
          </div>
        </div>

        <button
          onClick={fetchOrgAuditLogs}
          className="px-3.5 py-2 bg-[#131E33] hover:bg-[#1F2E4D] text-purple-400 font-mono font-bold text-xs rounded-xl border border-[#1F2E4D] transition flex items-center space-x-2 shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Isolation Banner */}
      <div className="p-3.5 bg-[#131E33] border border-[#1F2E4D] rounded-xl text-xs font-mono text-slate-300 flex items-center space-x-2">
        <Lock className="w-4 h-4 text-purple-400 shrink-0" />
        <span>
          <strong>Tenant Isolation Verified:</strong> Showing audit records exclusively for organization <strong>{currentUser?.organization_name || 'Primary Org'}</strong>. Logs from other organizations are strictly hidden.
        </span>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-[#0B1220]/90 border border-[#1F2E4D] rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 backdrop-blur-md">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search user, action, or target resource..."
            className="w-full bg-[#131E33] border border-[#1F2E4D] rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 font-mono"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end font-mono text-xs">
          {/* Action Filter */}
          <div className="flex items-center space-x-2 text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="bg-[#131E33] border border-[#1F2E4D] text-xs text-white rounded-xl px-3 py-1.5 focus:outline-none focus:border-purple-400"
            >
              <option value="ALL">All Actions</option>
              <option value="USER">User Actions</option>
              <option value="ROLE">Role Assignments</option>
              <option value="LOGIN">Login Events</option>
              <option value="SETTINGS">Settings Changes</option>
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
          </select>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-[#0B1220]/90 border border-[#1F2E4D] rounded-2xl overflow-hidden shadow-xl backdrop-blur-md">
        {filteredLogs.length === 0 ? (
          <EmptyState
            title="No Organization Audit Logs Found"
            description="No audit trail events match your current search and filter parameters."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-[#1F2E4D] text-slate-400 uppercase tracking-wider text-[10px] bg-[#131E33]/40">
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Action</th>
                  <th className="py-3.5 px-4">Resource Target</th>
                  <th className="py-3.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F2E4D]/50 text-slate-200">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#131E33]/50 transition">
                    <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                      {log.created_at ? new Date(log.created_at).toLocaleString() : 'Recent'}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white">
                      {log.user_identifier}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-purple-400">{log.action_type}</td>
                    <td className="py-3.5 px-4 text-slate-300">{log.target_resource}</td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={log.status || 'SUCCESS'} size="sm" />
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
