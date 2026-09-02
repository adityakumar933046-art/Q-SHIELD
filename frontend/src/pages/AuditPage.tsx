import React, { useEffect, useState } from 'react';
import { FileText, Search, Activity } from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import { api } from '../services/api';
import { AuditTrailRecord } from '../types';

export const AuditPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditTrailRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAuditLogs().then((data) => {
      setLogs(data);
      setLoading(false);
    });
  }, []);

  const filteredLogs = logs.filter(
    (l) =>
      l.action_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.user_identifier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.target_resource.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4 font-mono">
        <div className="relative">
          <Activity className="w-8 h-8 animate-spin text-cyan-400" />
          <div className="absolute inset-0 bg-cyan-400/20 rounded-full blur-lg animate-pulse" />
        </div>
        <span className="text-xs text-slate-400 tracking-widest uppercase">LOADING IMMUTABLE AUDIT LOGS...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center space-x-3">
            <div className="p-2 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <FileText className="w-6 h-6" />
            </div>
            <span>Cryptographic & System Audit Trail</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Immutable log of all QDS signature requests, teleportation verifications, attack simulations, and threat events.
          </p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search audit records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full glass-input pl-10 pr-4 py-2 text-xs text-white focus:border-cyan-400 font-mono"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="glass-panel p-6 space-y-4 rounded-3xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/[0.04] text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3 rounded-l-xl">Timestamp</th>
                <th className="px-4 py-3">Action Type</th>
                <th className="px-4 py-3">User / System</th>
                <th className="px-4 py-3">Target Resource</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 rounded-r-xl">Audit Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono text-slate-300">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-white/[0.03] transition">
                  <td className="px-4 py-3.5 text-slate-400 text-[11px] font-sans">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3.5 font-bold text-cyan-400">{log.action_type}</td>
                  <td className="px-4 py-3.5 text-white font-sans font-medium">{log.user_identifier}</td>
                  <td className="px-4 py-3.5 text-slate-200">{log.target_resource || 'N/A'}</td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={log.status} />
                  </td>
                  <td className="px-4 py-3.5 text-[10px] text-slate-400 max-w-xs truncate font-mono">
                    {JSON.stringify(log.details)}
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400 font-sans">
                    No matching audit logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
