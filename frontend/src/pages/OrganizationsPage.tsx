import React, { useEffect, useState } from 'react';
import { Building2, ShieldCheck, HardDrive } from 'lucide-react';
import { api } from '../services/api';
import { Organization } from '../types';

export const OrganizationsPage: React.FC = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getOrganizations().then((data) => {
      setOrganizations(data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="p-12 text-center text-slate-400 font-mono">Loading Tenant Organizations Directory...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between shadow-md">
        <div className="space-y-1">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Building2 className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-extrabold tracking-wide text-white">Enterprise Organizations Directory</h1>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl font-medium">
            Multi-tenant organizational isolation, quantum fiber node quotas, and active member scoping.
          </p>
        </div>

        <div className="mt-4 md:mt-0 px-3.5 py-1.5 bg-white/[0.04] border border-white/10 rounded-xl text-xs font-mono">
          <span className="text-slate-400">Registered Tenants:</span>{' '}
          <strong className="text-cyan-400 font-bold">{organizations.length}</strong>
        </div>
      </div>

      {/* Grid of Organizations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {organizations.map((org) => (
          <div key={org.id} className="glass-card p-6 space-y-4 flex flex-col justify-between hover:border-cyan-500/40 transition">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold tracking-wider">Tenant ID #{org.id}</span>
                  <h3 className="text-base font-extrabold text-white">{org.name}</h3>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                  org.is_active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-white/[0.05] text-slate-400 border border-white/10'
                }`}>
                  {org.is_active ? '● ACTIVE' : '○ INACTIVE'}
                </span>
              </div>

              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{org.description || 'Enterprise Quantum Telemetry Domain Node.'}</p>

              <div className="bg-white/[0.03] p-3.5 rounded-xl border border-white/5 space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Domain Node:</span>
                  <span className="text-white font-bold">{org.domain}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Max Quantum Nodes:</span>
                  <span className="text-cyan-400 font-bold">{org.max_quantum_nodes} Nodes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Active Members:</span>
                  <span className="text-emerald-400 font-bold">{org.member_count || 1} Users</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 flex justify-between items-center text-xs">
              <span className="text-slate-400 font-mono text-[11px]">Tenant Isolation Enforced</span>
              <span className="text-cyan-400 font-bold text-[11px] flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Tenant</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
