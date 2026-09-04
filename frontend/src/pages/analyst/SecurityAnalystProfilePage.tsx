import React, { useState, useEffect } from 'react';
import { User as UserIcon, Mail, Building2, ShieldCheck, Smartphone, Lock } from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingState } from '../../components/common/LoadingState';
import { api } from '../../services/api';
import { User } from '../../types';

interface SecurityAnalystProfilePageProps {
  currentUser: User | null;
}

export const SecurityAnalystProfilePage: React.FC<SecurityAnalystProfilePageProps> = ({ currentUser }) => {
  const [user, setUser] = useState<User | null>(currentUser);
  const [loading, setLoading] = useState(!currentUser);

  useEffect(() => {
    if (!currentUser) {
      api.getCurrentUser()
        .then((u) => setUser(u))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [currentUser]);

  if (loading) {
    return <LoadingState message="Loading your Security Analyst credentials and organization clearance..." />;
  }

  return (
    <div className="space-y-8 max-w-4xl font-sans">
      {/* Header Banner */}
      <div className="bg-[#0B1220] border border-[#1F2E4D] rounded-2xl p-6 shadow-xl flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-xl text-[#EF4444]">
            <UserIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Security Analyst Credentials Profile</h2>
            <p className="text-xs text-slate-400 font-sans">
              Manage analyst identity credentials, security operations clearance & MFA status
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left 4 Cols: Identity Avatar & Role */}
        <div className="md:col-span-4 bg-[#0B1220]/90 border border-[#1F2E4D] rounded-2xl p-6 shadow-xl backdrop-blur-md text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#EF4444] to-purple-600 border-2 border-[#EF4444]/40 text-white font-bold text-2xl font-sans flex items-center justify-center shadow-xl mx-auto">
            {user?.username?.[0]?.toUpperCase() || 'A'}
          </div>

          <div>
            <h3 className="text-base font-bold text-white">
              {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.username}
            </h3>
            <span className="text-xs text-slate-400 font-sans block mt-0.5">@{user?.username}</span>
            <div className="mt-2">
              <span className="px-2.5 py-0.5 bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/30 text-[10px] font-sans font-bold rounded uppercase tracking-wider">
                SECURITY ANALYST ROLE
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-[#1F2E4D] text-left text-xs font-sans space-y-3">
            <div className="flex items-center space-x-2.5 text-slate-300">
              <Mail className="w-4 h-4 text-slate-500 shrink-0" />
              <span className="truncate">{user?.email || 'analyst@qshield.gov'}</span>
            </div>
            <div className="flex items-center space-x-2.5 text-slate-300">
              <Building2 className="w-4 h-4 text-slate-500 shrink-0" />
              <span>{user?.organization_name || 'Defense Cyber Command'}</span>
            </div>
          </div>
        </div>

        {/* Right 8 Cols: Organization Node & Clearance */}
        <div className="md:col-span-8 bg-[#0B1220]/90 border border-[#1F2E4D] rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-6">
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white font-sans uppercase tracking-wider border-b border-[#1F2E4D] pb-3 flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-[#EF4444]" />
              <span>Organization Clearance & Node Details</span>
            </h3>

            <div className="p-4 bg-[#131E33] border border-[#1F2E4D] rounded-xl space-y-3 font-sans text-xs">
              <div className="flex justify-between border-b border-[#1F2E4D]/40 pb-2">
                <span className="text-slate-400">Organization Name:</span>
                <span className="font-bold text-white">{user?.organization_name || 'Primary Org'}</span>
              </div>
              <div className="flex justify-between border-b border-[#1F2E4D]/40 pb-2">
                <span className="text-slate-400">Security Operations Unit:</span>
                <span className="font-bold text-[#EF4444]">{user?.department || 'Quantum Cyber Threat Intelligence Unit'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Account Status:</span>
                <StatusBadge status={user?.is_active === false ? 'INACTIVE' : 'ACTIVE'} size="sm" />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white font-sans uppercase tracking-wider border-b border-[#1F2E4D] pb-3 flex items-center space-x-2">
              <Smartphone className="w-4 h-4 text-purple-400" />
              <span>Multi-Factor Security & Investigation Clearance</span>
            </h3>

            <div className="p-4 bg-[#10B981]/10 border border-[#10B981]/30 rounded-xl text-xs font-sans text-[#10B981] flex items-start space-x-3">
              <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-bold mb-1">MFA & Threat Operations Clearance Active</strong>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Your Security Analyst account is authorized to review evidence, manage investigations, and classify quantum threat incidents.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
