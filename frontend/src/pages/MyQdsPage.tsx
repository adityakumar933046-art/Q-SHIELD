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
        // filter to user's own sent signatures
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
      <div className="p-8 text-center text-slate-500 flex items-center justify-center space-x-3 font-sans">
        <Activity className="w-5 h-5 animate-spin text-[#00C2FF]" />
        <span>LOADING SIGNED KEY STORES...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-slate-800 bg-[#F8FAFC] p-6 rounded-2xl min-h-screen">
      <div>
        <h1 className="text-xl font-bold text-slate-800 tracking-tight flex items-center space-x-2">
          <Key className="w-5 h-5 text-[#00C2FF]" />
          <span>My Quantum Digital Signatures</span>
        </h1>
        <p className="text-xs text-slate-500">
          Browse and verify keys generated via Qiskit simulation for your user credentials.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center bg-white border border-[#E2E8F0] p-4 rounded-xl shadow-sm gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search signatures..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#00C2FF] focus:ring-1 focus:ring-[#00C2FF] font-sans"
          />
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Total Signatures Issued: <span className="font-bold text-[#00C2FF]">{signatures.length}</span>
        </div>
      </div>

      <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-[#E2E8F0] text-slate-400 font-semibold uppercase text-[10px]">
              <tr>
                <th className="px-6 py-4">Signature ID</th>
                <th className="px-6 py-4">SHA-256 Digest</th>
                <th className="px-6 py-4">Quantum Basis</th>
                <th className="px-6 py-4">Bell State</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9] font-medium text-slate-600 font-sans">
              {filteredSigs.length > 0 ? (
                filteredSigs.map((sig) => (
                  <tr key={sig.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 font-bold text-slate-900">{sig.signature_id}</td>
                    <td className="px-6 py-4 text-slate-400 text-[11px] truncate max-w-[200px]" title={sig.message_digest}>
                      {sig.message_digest}
                    </td>
                    <td className="px-6 py-4 text-[#00C2FF]">{sig.quantum_state_basis}</td>
                    <td className="px-6 py-4 text-slate-800">{sig.bell_pair_type}</td>
                    <td className="px-6 py-4 font-sans">
                      <StatusBadge status={sig.status} />
                    </td>
                    <td className="px-6 py-4 text-right font-sans">
                      <button
                        onClick={() => downloadSignature(sig)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 rounded-lg transition inline-flex items-center space-x-1 border border-slate-200"
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
