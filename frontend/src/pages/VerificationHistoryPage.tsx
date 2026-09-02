import React, { useState, useEffect } from 'react';
import { History, Loader2, Search } from 'lucide-react';
import { api } from '../services/api';
import { SignatureVerificationAttempt } from '../types';

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
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 select-none">
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Verification History</h1>
        <p className="text-xs text-slate-400 font-medium">
          A comprehensive log of all historical quantum signature verifications run on this network.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {/* Search Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="relative w-72">
            <input
              type="text"
              placeholder="Search history..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-3 pr-8 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-green-600"
            />
          </div>
          <History className="w-5 h-5 text-slate-400" />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-semibold text-slate-650">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Verification ID</th>
                <th className="py-3 px-4">Signature ID</th>
                <th className="py-3 px-4">Signer</th>
                <th className="py-3 px-4">Result</th>
                <th className="py-3 px-4">Fidelity</th>
                <th className="py-3 px-4">QBER</th>
                <th className="py-3 px-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredHistory.map((row) => {
                const isSuccess = row.verification_result === 'PASSED';
                return (
                  <tr key={row.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-700">{row.verification_id}</td>
                    <td className="py-3 px-4 font-mono text-slate-450">{row.signature_id}</td>
                    <td className="py-3 px-4 text-slate-700">{(row as any).signer_full_name || ''}</td>
                    <td className="py-3 px-4">
                      <span className={`font-bold ${isSuccess ? 'text-green-600' : 'text-red-650 text-red-600'}`}>
                        {row.verification_result}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700">{(row.quantum_fidelity * 100).toFixed(2)}%</td>
                    <td className="py-3 px-4 font-mono text-slate-500">{(row.qber * 100).toFixed(2)}%</td>
                    <td className="py-3 px-4 text-slate-400 font-medium">{new Date(row.created_at).toLocaleString()}</td>
                  </tr>
                );
              })}
              {filteredHistory.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
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
