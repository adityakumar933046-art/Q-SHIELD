import React, { useState, useEffect } from 'react';
import { Shield, Activity } from 'lucide-react';
import { api } from '../services/api';
import { AuditTrailRecord } from '../types';
import { StatusBadge } from '../components/StatusBadge';

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
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4 font-mono">
        <div className="relative">
          <Activity className="w-8 h-8 animate-spin text-cyan-400" />
          <div className="absolute inset-0 bg-cyan-400/20 rounded-full blur-lg animate-pulse" />
        </div>
        <span className="text-xs text-slate-400 tracking-widest uppercase">LOADING AUDIT TRAIL LOGS...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 select-none">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-3">
          <div className="p-2 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Shield className="w-6 h-6" />
          </div>
          <span>Audit Trail Logs</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Immutably tracked system activity logs mapping to quantum verification attempts, security alerts, and node sessions.
        </p>
      </div>

      <div className="glass-card p-6 space-y-4">
        <div className="pb-3 border-b border-white/10 flex items-center justify-between">
          <span className="text-slate-300 font-bold text-xs">Node Security Audit Records ({logs.length})</span>
          <Shield className="w-4 h-4 text-cyan-400" />
        </div>

        <div className="divide-y divide-white/5 max-h-[60vh] overflow-y-auto font-mono text-xs">
          {logs.map((log) => {
            return (
              <div key={log.id} className="py-4 hover:bg-white/[0.03] transition space-y-2">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-cyan-400 font-bold tracking-wide">{log.action_type}</span>
                    <StatusBadge status={log.status} />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 sm:mt-0 font-sans">
                    {new Date(log.created_at).toLocaleString()}
                  </span>
                </div>

                <div className="text-slate-400 text-[11px] font-sans flex flex-wrap gap-x-6 gap-y-1">
                  <span>Operator: <strong className="text-white font-bold">{log.user_identifier}</strong></span>
                  <span>Target Resource: <strong className="text-white font-bold">{log.target_resource}</strong></span>
                  {log.ip_address && <span>IP: <strong className="text-cyan-400 font-bold">{log.ip_address}</strong></span>}
                </div>

                {log.details && Object.keys(log.details).length > 0 && (
                  <div className="mt-2 bg-black/40 p-2.5 rounded-xl border border-white/10 font-mono text-[10px] text-slate-300 overflow-x-auto">
                    {JSON.stringify(log.details, null, 2)}
                  </div>
                )}
              </div>
            );
          })}
          {logs.length === 0 && (
            <div className="py-12 text-center text-slate-400 font-sans">
              No audit logs captured for this node.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifierAuditPage;
