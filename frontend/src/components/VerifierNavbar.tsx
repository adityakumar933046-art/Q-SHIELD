import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, ChevronDown, Shield, RefreshCw } from 'lucide-react';
import { User, Organization } from '../types';
import { api } from '../services/api';

interface VerifierNavbarProps {
  currentUser: User | null;
}

export const VerifierNavbar: React.FC<VerifierNavbarProps> = ({ currentUser }) => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string>('');

  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        const orgList = await api.getOrganizations();
        setOrganizations(orgList);
        
        const quantumSecure = orgList.find(o => o.name.toLowerCase().includes('quantum secure'));
        if (quantumSecure) {
          setSelectedOrgId(quantumSecure.id.toString());
        } else if (currentUser?.organization) {
          setSelectedOrgId(currentUser.organization.toString());
        } else if (orgList.length > 0) {
          setSelectedOrgId(orgList[0].id.toString());
        }
      } catch (err) {
        console.error("Failed to load organizations in navbar:", err);
      }
    };
    fetchOrgs();
  }, [currentUser]);

  return (
    <header className="sticky top-0 z-40 glass-panel border-b border-white/10 px-6 py-3 flex items-center justify-between mx-4 mt-3 rounded-2xl select-none">
      {/* Organisation Dropdown & Brand */}
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500/20 to-cyan-600/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.25)]">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-base tracking-wider text-white">
                <span className="text-emerald-400">Q</span>-VERIFIER
              </span>
              <span className="text-[10px] font-mono font-bold tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                PORTAL
              </span>
            </div>
          </div>
        </div>

        {/* Organisation Selector */}
        <div className="hidden sm:flex items-center space-x-2 border-l border-white/10 pl-6">
          <div className="relative">
            <select
              value={selectedOrgId}
              onChange={(e) => setSelectedOrgId(e.target.value)}
              className="appearance-none bg-white/[0.04] border border-white/10 rounded-xl pl-3 pr-8 py-1.5 text-xs font-semibold text-slate-200 focus:outline-none focus:border-cyan-400 cursor-pointer"
            >
              {organizations.map((org) => (
                <option key={org.id} value={org.id} className="bg-slate-900 text-white">
                  {org.name}
                </option>
              ))}
              {organizations.length === 0 && (
                <option value="" className="bg-slate-900 text-white">Quantum Secure Ltd.</option>
              )}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
              <ChevronDown className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Pipeline Live, Notification and User Profile */}
      <div className="flex items-center space-x-3">
        <Link
          to="/"
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 hover:text-white text-xs font-medium transition"
        >
          <span>✨ Intro Page</span>
        </Link>

        {/* Pipeline Live Pulse */}
        <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34D399]" />
          <span className="text-emerald-400 font-medium text-[11px]">Verifier Node Live</span>
        </div>

        {/* Notification Bell */}
        <button className="p-2 text-slate-400 hover:text-white hover:bg-white/[0.05] rounded-xl transition relative border border-white/10">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400 ring-2 ring-[#070B14] shadow-[0_0_6px_#00E5FF]" />
        </button>

        {/* User Profile */}
        <div className="flex items-center space-x-2.5 px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/10">
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-emerald-500 to-cyan-600 text-white font-bold text-xs flex items-center justify-center shadow-[0_0_8px_rgba(16,185,129,0.4)]">
            {currentUser?.first_name ? currentUser.first_name[0].toUpperCase() : 'V'}
          </div>
          
          <div className="text-left hidden md:block">
            <div className="font-semibold text-white text-xs leading-none">
              {currentUser?.first_name && currentUser?.last_name 
                ? `${currentUser.first_name} ${currentUser.last_name}` 
                : currentUser?.username || 'Verifier'}
            </div>
            <div className="text-[9px] text-emerald-400 font-mono uppercase font-bold mt-0.5">
              {currentUser?.role ? currentUser.role.toLowerCase() : 'verifier'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
