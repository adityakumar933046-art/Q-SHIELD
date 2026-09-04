import React, { useState, useEffect } from 'react';
import { FileSearch, Loader2, Shield } from 'lucide-react';
import { api } from '../services/api';
import { AuditTrailRecord } from '../types';

export const VerifierAuditPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditTrailRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const allLogs = await api.getAuditLogs();
        // Filter logs related to QDS verification or done by verifier role users
        const verifierLogs = allLogs.filter(
          log => log.action_type.includes('VERIFICATION') || log.user_identifier.includes('verifier')
        );
        setLogs(verifierLogs);
      } catch (err) {
        console.error("Failed to load audit logs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 select-none">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Audit Trail Logs</h1>
        <p className="text-xs text-slate-400 font-medium">
          Immutably tracked system activity logs mapping to quantum verification attempts, security alerts, and node sessions.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden text-xs font-semibold">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <span className="text-slate-500 font-bold">Node Security Audit Records ({logs.length})</span>
          <Shield className="w-4 h-4 text-green-600" />
        </div>

        <div className="divide-y divide-slate-100 max-h-[60vh] overflow-y-auto">
          {logs.map((log) => {
            const isBreach = log.status.includes('REJECTED') || log.status.includes('UNAUTHORIZED') || log.status.includes('COMPROMISED');
            return (
              <div key={log.id} className="p-4 hover:bg-slate-50/50 transition space-y-2">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                  <div className="flex items-center space-x-2">
                    <span className="font-sans text-slate-800 font-bold tracking-wide">{log.action_type}</span>
                    <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-bold ${
                      isBreach 
                        ? 'bg-red-50 text-red-700 border border-red-200' 
                        : 'bg-green-50 text-green-700 border border-green-200'
                    }`}>
                      {log.status}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 sm:mt-0 font-medium">
                    {new Date(log.created_at).toLocaleString()}
                  </span>
                </div>

                <div className="text-slate-500 text-[11px] font-medium flex flex-wrap gap-x-6 gap-y-1">
                  <span>Operator: <strong className="text-slate-700 font-bold">{log.user_identifier}</strong></span>
                  <span>Target Resource: <strong className="text-slate-700 font-bold">{log.target_resource}</strong></span>
                  {log.ip_address && <span>IP: <strong className="text-slate-700 font-bold">{log.ip_address}</strong></span>}
                </div>

                {log.details && Object.keys(log.details).length > 0 && (
                  <div className="mt-2 bg-slate-50 p-2.5 rounded border border-slate-100 font-sans text-[10px] text-slate-500 overflow-x-auto">
                    {JSON.stringify(log.details, null, 2)}
                  </div>
                )}
              </div>
            );
          })}
          {logs.length === 0 && (
            <div className="py-12 text-center text-slate-400">
              No audit logs captured for this node.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
