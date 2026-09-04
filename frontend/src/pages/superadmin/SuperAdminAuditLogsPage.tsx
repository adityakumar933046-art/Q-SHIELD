import React, { useState, useEffect } from 'react';
import { FileText, Search, Filter, Calendar, RefreshCw } from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';
import { api } from '../../services/api';
import { AuditTrailRecord } from '../../types';

export const SuperAdminAuditLogsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<AuditTrailRecord[]>([]);
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const data = await api.getAuditLogs();
      setLogs(data);
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
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
    return <LoadingState message="Fetching platform-wide audit log trail..." />;
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="bg-[#0B1220] border border-[#1F2E4D] rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-[#00C2FF]/10 border border-[#00C2FF]/30 rounded-xl text-[#00C2FF]">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Platform System Audit Logs</h2>
            <p className="text-xs text-slate-400 font-sans">
              Immutable cross-organization action records and governance trail
            </p>
          </div>
        </div>

        <button
          onClick={fetchAuditLogs}
          className="px-3.5 py-2 bg-[#131E33] hover:bg-[#1F2E4D] text-[#00C2FF] font-sans font-bold text-xs rounded-xl border border-[#1F2E4D] transition flex items-center space-x-2 shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Logs</span>
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
            placeholder="Filter by user, action, or target resource..."
            className="w-full bg-[#131E33] border border-[#1F2E4D] rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00C2FF] font-sans"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          {/* Action Filter Selector */}
          <div className="flex items-center space-x-2 text-xs font-sans text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="bg-[#131E33] border border-[#1F2E4D] text-xs text-white rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#00C2FF] font-sans"
            >
              <option value="ALL">All Actions</option>
              <option value="LOGIN">Login Events</option>
              <option value="ORGANIZATION">Organization Actions</option>
              <option value="MFA">MFA Events</option>
              <option value="PASSWORD">Password Events</option>
            </select>
          </div>

          {/* Status Filter Selector */}
          <div className="flex items-center space-x-2 text-xs font-sans text-slate-400">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#131E33] border border-[#1F2E4D] text-xs text-white rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#00C2FF] font-sans"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUCCESS">Success</option>
              <option value="FAILED">Failed</option>
              <option value="LOCKED">Locked</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-[#0B1220]/90 border border-[#1F2E4D] rounded-2xl overflow-hidden shadow-xl backdrop-blur-md">
        {filteredLogs.length === 0 ? (
          <EmptyState
            title="No Audit Logs Found"
            description="No system audit records match your current filter parameters."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead>
                <tr className="border-b border-[#1F2E4D] text-slate-400 uppercase tracking-wider text-[10px] bg-[#131E33]/40">
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Organization</th>
                  <th className="py-3.5 px-4">Action</th>
                  <th className="py-3.5 px-4">Target Resource</th>
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
                      {log.user_identifier || 'system'}
                    </td>
                    <td className="py-3.5 px-4 text-purple-400 font-bold">
                      {log.details?.organization || 'Global Platform'}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#00C2FF]">{log.action_type}</td>
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
