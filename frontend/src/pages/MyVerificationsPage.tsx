import React, { useState, useEffect } from 'react';
import { ShieldCheck, Search, Filter, Calendar, Activity } from 'lucide-react';
import { api } from '../services/api';
import { SignatureVerificationAttempt } from '../types';
import { StatusBadge } from '../components/StatusBadge';

export const MyVerificationsPage: React.FC = () => {
  const [verifications, setVerifications] = useState<SignatureVerificationAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    const fetchVerifications = async () => {
      try {
        setLoading(true);
        const data = await api.getVerifications();
        setVerifications(data);
      } catch (err) {
        console.error("Failed to load verifications:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchVerifications();
  }, []);

  const filteredVerifications = verifications.filter((v) => {
    const matchesSearch = v.verification_id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          v.signature_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (v as any).signer_full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'ALL') return matchesSearch;
    if (statusFilter === 'SUCCESS') return matchesSearch && v.verification_result === 'PASSED';
    if (statusFilter === 'FAILED') return matchesSearch && v.verification_result !== 'PASSED';
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4 font-mono">
        <div className="relative">
          <Activity className="w-8 h-8 animate-spin text-cyan-400" />
          <div className="absolute inset-0 bg-cyan-400/20 rounded-full blur-lg animate-pulse" />
        </div>
        <span className="text-xs text-slate-400 tracking-widest uppercase">LOADING VERIFICATIONS...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 select-none max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-3">
          <div className="p-2 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <span>My Verifications</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          A list of all Quantum Digital Signature verification transactions performed by your node.
        </p>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4 glass-card p-4 text-xs font-semibold">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search by Verification ID, QDS ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full glass-input pl-9 pr-4 py-2 text-white font-mono text-xs focus:border-cyan-400"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="glass-input px-3 py-2 text-white cursor-pointer bg-[#0B1220] font-mono text-xs"
          >
            <option value="ALL" className="bg-slate-900">All Results</option>
            <option value="SUCCESS" className="bg-slate-900">Successful Only</option>
            <option value="FAILED" className="bg-slate-900">Failed Only</option>
          </select>
        </div>
      </div>

      {/* Verification List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredVerifications.map((item) => {
          return (
            <div key={item.id} className="glass-card p-6 space-y-4 hover:border-cyan-500/40 transition">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <span className="font-mono text-cyan-400 font-bold text-sm">{item.verification_id}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">QDS ID: {item.signature_id}</span>
                </div>
                <StatusBadge status={item.verification_result} />
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[9px] block">Signer (Sender)</span>
                  <span className="text-white font-bold">{(item as any).signer_full_name || 'Signer Lead'}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[9px] block">Fidelity</span>
                  <span className="font-mono text-emerald-400 font-bold">{(item.quantum_fidelity * 100).toFixed(2)}%</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[9px] block">QBER Measured</span>
                  <span className="font-mono text-cyan-400 font-bold">{(item.qber * 100).toFixed(2)}%</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[9px] block">Threat Category</span>
                  <span className="font-mono text-slate-300 font-bold truncate max-w-[150px]">{item.threat_category || 'NONE'}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-[10px] text-slate-400 pt-2 border-t border-white/10 font-mono">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                <span>{new Date(item.created_at).toLocaleString()}</span>
              </div>
            </div>
          );
        })}

        {filteredVerifications.length === 0 && (
          <div className="col-span-2 glass-card p-12 text-center text-slate-400 text-xs font-semibold">
            No verifications matching criteria.
          </div>
        )}
      </div>
    </div>
  );
};

export default MyVerificationsPage;
