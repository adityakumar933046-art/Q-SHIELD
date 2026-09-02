import React, { useEffect, useState } from 'react';
import { Building2, ShieldCheck, Users, HardDrive } from 'lucide-react';
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
    return <div className="p-8 text-center text-slate-500 font-mono">Loading Tenant Organizations Directory...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#0B1220] border border-[#1A263D] rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between shadow-md text-white">
        <div className="space-y-1">
          <div className="flex items-center space-x-3">
            <Building2 className="w-6 h-6 text-[#00C2FF]" />
            <h1 className="text-xl font-extrabold tracking-wide">Enterprise Organizations Directory</h1>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl font-medium">
            Multi-tenant organizational isolation, quantum fiber node quotas, and active member scoping.
          </p>
        </div>

        <div className="mt-4 md:mt-0 px-3.5 py-1.5 bg-[#131E33] border border-[#1F2E4D] rounded-lg text-xs font-mono">
          <span className="text-slate-400">Registered Tenants:</span>{' '}
          <strong className="text-[#00C2FF] font-bold">{organizations.length}</strong>
        </div>
      </div>

      {/* Grid of Organizations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {organizations.map((org) => (
          <div key={org.id} className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-4 shadow-sm flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-[#00C2FF] uppercase font-bold">Tenant ID #{org.id}</span>
                  <h3 className="text-base font-extrabold text-[#0F172A]">{org.name}</h3>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                  org.is_active ? 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30' : 'bg-slate-100 text-slate-500 border border-slate-300'
                }`}>
                  {org.is_active ? '● ACTIVE' : '○ INACTIVE'}
                </span>
              </div>

              <p className="text-xs text-slate-500 line-clamp-2">{org.description || 'Enterprise Quantum Telemetry Domain Node.'}</p>

              <div className="bg-[#F8FAFC] p-3 rounded-lg border border-[#E2E8F0] space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">Domain Node:</span>
                  <span className="text-[#0B1220] font-bold">{org.domain}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Max Quantum Nodes:</span>
                  <span className="text-[#00C2FF] font-bold">{org.max_quantum_nodes} Nodes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Active Members:</span>
                  <span className="text-[#10B981] font-bold">{org.member_count || 1} Users</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E2E8F0] flex justify-between items-center text-xs">
              <span className="text-slate-400 font-mono text-[11px]">Tenant Isolation Enforced</span>
              <span className="text-[#00C2FF] font-bold text-[11px] flex items-center space-x-1">
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
