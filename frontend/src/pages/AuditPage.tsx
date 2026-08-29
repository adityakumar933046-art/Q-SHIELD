import React, { useEffect, useState } from 'react';
import { FileText, Search } from 'lucide-react';
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
    return <div className="p-8 text-center text-slate-500 font-mono">Loading Immutable Audit Logs...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#0F172A] flex items-center space-x-2">
            <FileText className="w-5 h-5 text-[#00C2FF]" />
            <span>Cryptographic & System Audit Trail</span>
          </h1>
          <p className="text-xs text-slate-500">
            Immutable log of all QDS signature requests, teleportation verifications, attack simulations, and threat events.
          </p>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search audit records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-[#E2E8F0] rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#00C2FF] font-mono shadow-sm"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-4 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0B1220] text-white uppercase font-semibold">
              <tr>
                <th className="px-4 py-3 rounded-tl-lg">Timestamp</th>
                <th className="px-4 py-3">Action Type</th>
                <th className="px-4 py-3">User / System</th>
                <th className="px-4 py-3">Target Resource</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 rounded-tr-lg">Audit Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-slate-700 font-mono">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-3 text-slate-500 text-[11px] font-sans">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 font-bold text-[#0B1220]">{log.action_type}</td>
                  <td className="px-4 py-3 text-slate-900 font-sans font-medium">{log.user_identifier}</td>
                  <td className="px-4 py-3 text-slate-800">{log.target_resource || 'N/A'}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={log.status} />
                  </td>
                  <td className="px-4 py-3 text-[10px] text-slate-500 max-w-xs truncate font-mono">
                    {JSON.stringify(log.details)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
