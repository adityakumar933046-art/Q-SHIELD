import React, { useState, useEffect } from 'react';
import { ShieldCheck, Loader2, Search, Filter, Calendar } from 'lucide-react';
import { api } from '../services/api';
import { SignatureVerificationAttempt } from '../types';

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
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 select-none max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">My Verifications</h1>
        <p className="text-xs text-slate-400 font-medium">
          A list of all Quantum Digital Signature verification transactions performed by your node.
        </p>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white border border-slate-200 rounded-xl p-4 shadow-sm text-xs font-semibold">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search by Verification ID, QDS ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-green-600 focus:border-green-600"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-650 focus:outline-none focus:ring-1 focus:ring-green-600 cursor-pointer"
          >
            <option value="ALL">All Results</option>
            <option value="SUCCESS">Successful Only</option>
            <option value="FAILED">Failed Only</option>
          </select>
        </div>
      </div>

      {/* Verification List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredVerifications.map((item) => {
          const isSuccess = item.verification_result === 'PASSED';
          return (
            <div key={item.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 hover:border-slate-350 hover:shadow-md transition">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="font-sans text-slate-800 font-bold text-sm">{item.verification_id}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">QDS ID: {item.signature_id}</span>
                </div>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${
                  isSuccess 
                    ? 'bg-green-55 bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {isSuccess ? 'Passed' : 'Failed'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[9px] block">Signer (Sender)</span>
                  <span className="text-slate-700 font-bold">{(item as any).signer_full_name || ''}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[9px] block">Fidelity</span>
                  <span className="font-sans text-slate-700 font-bold">{(item.quantum_fidelity * 100).toFixed(2)}%</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[9px] block">QBER Measured</span>
                  <span className="font-sans text-slate-700 font-bold">{(item.qber * 100).toFixed(2)}%</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[9px] block">Threat Category</span>
                  <span className="font-sans text-slate-700 font-bold truncate max-w-[150px]">{item.threat_category || 'NONE'}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-[10px] text-slate-400 pt-2 border-t border-slate-100">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{new Date(item.created_at).toLocaleString()}</span>
              </div>
            </div>
          );
        })}

        {filteredVerifications.length === 0 && (
          <div className="col-span-2 bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-400 text-xs font-semibold shadow-sm">
            No verifications matching criteria.
          </div>
        )}
      </div>
    </div>
  );
};
