import React, { useState, useEffect } from 'react';
import { History, Search, Activity } from 'lucide-react';
import { api } from '../services/api';
import { SignatureVerificationAttempt } from '../types';
import { StatusBadge } from '../components/StatusBadge';

export const VerificationHistoryPage: React.FC = () => {
  const [history, setHistory] = useState<SignatureVerificationAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const data = await api.getVerifications();
        setHistory(data);
      } catch (err) {
        console.error("Failed to load verification history:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const filteredHistory = history.filter(h => 
    h.verification_id.toLowerCase().includes(search.toLowerCase()) ||
    h.signature_id.toLowerCase().includes(search.toLowerCase()) ||
    (h as any).signer_full_name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4 font-mono">
        <div className="relative">
          <Activity className="w-8 h-8 animate-spin text-cyan-400" />
          <div className="absolute inset-0 bg-cyan-400/20 rounded-full blur-lg animate-pulse" />
        </div>
        <span className="text-xs text-slate-400 tracking-widest uppercase">LOADING VERIFICATION HISTORY...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 select-none">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-3">
          <div className="p-2 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <History className="w-6 h-6" />
          </div>
          <span>Verification History</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          A comprehensive log of all historical quantum signature verifications run on this network.
        </p>
      </div>

      <div className="glass-card p-6 space-y-4">
        {/* Search Header */}
        <div className="pb-4 border-b border-white/10 flex items-center justify-between">
          <div className="relative w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search history..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full glass-input pl-9 pr-4 py-2 text-xs text-white focus:border-cyan-400 font-mono"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="table-cyber">
            <thead>
              <tr>
                <th>Verification ID</th>
                <th>Signature ID</th>
                <th>Signer</th>
                <th>Result</th>
                <th>Fidelity</th>
                <th>QBER</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map((row) => {
                return (
                  <tr key={row.id}>
                    <td className="font-mono font-bold text-cyan-400">{row.verification_id}</td>
                    <td className="font-mono text-slate-400">{row.signature_id}</td>
                    <td className="text-white font-sans">{(row as any).signer_full_name || 'Signer Lead'}</td>
                    <td>
                      <StatusBadge status={row.verification_result} />
                    </td>
                    <td className="font-mono text-emerald-400 font-bold">{(row.quantum_fidelity * 100).toFixed(2)}%</td>
                    <td className="font-mono text-cyan-400 font-bold">{(row.qber * 100).toFixed(2)}%</td>
                    <td className="text-slate-400 font-mono text-[11px]">{new Date(row.created_at).toLocaleString()}</td>
                  </tr>
                );
              })}
              {filteredHistory.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-sans">
                    No matching verification records found.
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

export default VerificationHistoryPage;
