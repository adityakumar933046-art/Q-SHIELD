import React, { useEffect, useState } from 'react';
import { Key, Search, Download, ShieldCheck, Activity } from 'lucide-react';
import { api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';

export const MyQdsPage: React.FC = () => {
  const [signatures, setSignatures] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const loadSigs = async () => {
      try {
        const u = await api.getCurrentUser();
        setCurrentUser(u);
        const sigs = await api.getSignatures();
        const userSigs = sigs.filter((s: any) => s.sender === u.id);
        setSignatures(userSigs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadSigs();
  }, []);

  const filteredSigs = signatures.filter(s => 
    s.signature_id.toLowerCase().includes(search.toLowerCase()) ||
    s.message_digest.toLowerCase().includes(search.toLowerCase()) ||
    s.message_payload.toLowerCase().includes(search.toLowerCase())
  );

  const downloadSignature = (sig: any) => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(sig, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `${sig.signature_id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4 font-mono">
        <div className="relative">
          <Activity className="w-8 h-8 animate-spin text-cyan-400" />
          <div className="absolute inset-0 bg-cyan-400/20 rounded-full blur-lg animate-pulse" />
        </div>
        <span className="text-xs text-slate-400 tracking-widest uppercase">LOADING SIGNED KEY STORES...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-3">
          <div className="p-2 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Key className="w-6 h-6" />
          </div>
          <span>My Quantum Digital Signatures</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Browse and verify keys generated via Qiskit simulation for your user credentials.
        </p>
      </div>

      <div className="glass-panel p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search signatures..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full glass-input pl-10 pr-4 py-2 text-xs text-white focus:border-cyan-400 font-mono"
          />
        </div>

        <div className="text-xs text-slate-400 font-medium">
          Total Signatures Issued: <span className="font-bold text-cyan-400 font-mono ml-1">{signatures.length}</span>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-3xl space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/[0.04] text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-5 py-3 rounded-l-xl">Signature ID</th>
                <th className="px-5 py-3">SHA-256 Digest</th>
                <th className="px-5 py-3">Quantum Basis</th>
                <th className="px-5 py-3">Bell State</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 rounded-r-xl text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono text-slate-300">
              {filteredSigs.length > 0 ? (
                filteredSigs.map((sig) => (
                  <tr key={sig.id} className="hover:bg-white/[0.03] transition">
                    <td className="px-5 py-4 font-bold text-cyan-400">{sig.signature_id}</td>
                    <td className="px-5 py-4 text-slate-400 text-[11px] truncate max-w-[200px]" title={sig.message_digest}>
                      {sig.message_digest}
                    </td>
                    <td className="px-5 py-4 text-emerald-400 font-bold">{sig.quantum_state_basis}</td>
                    <td className="px-5 py-4 text-white">{sig.bell_pair_type}</td>
                    <td className="px-5 py-4 font-sans">
                      <StatusBadge status={sig.status} />
                    </td>
                    <td className="px-5 py-4 text-right font-sans">
                      <button
                        onClick={() => downloadSignature(sig)}
                        className="btn-glass p-2 px-3 rounded-xl transition inline-flex items-center space-x-1.5 text-xs text-cyan-400 hover:border-cyan-400/50"
                        title="Download JSON Signature File"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold">Download JSON</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400 font-sans font-normal">
                    No signatures match your search query.
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

export default MyQdsPage;
