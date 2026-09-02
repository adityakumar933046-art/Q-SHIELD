import React from 'react';
import { useLocation } from 'react-router-dom';
import { ShieldCheck, Bell, Server } from 'lucide-react';
import { User } from '../../types';

interface SuperAdminNavbarProps {
  currentUser: User | null;
}

export const SuperAdminNavbar: React.FC<SuperAdminNavbarProps> = ({ currentUser }) => {
  const location = useLocation();

  const getPageTitle = (pathname: string) => {
    if (pathname.includes('/super-admin/dashboard')) return 'Global Platform Overview';
    if (pathname.includes('/super-admin/organizations/')) return 'Organization Details & Management';
    if (pathname.includes('/super-admin/organizations')) return 'Organization Governance & Directory';
    if (pathname.includes('/super-admin/security-overview')) return 'Platform Security Telemetry & Threats';
    if (pathname.includes('/super-admin/audit-logs')) return 'Platform System Audit Logs';
    if (pathname.includes('/super-admin/settings')) return 'Global Platform Settings';
    return 'Super Admin Console';
  };

  return (
    <header className="h-16 bg-[#0B1220]/90 border-b border-[#1F2E4D] px-6 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md font-sans">
      <div className="flex items-center space-x-3">
        <h2 className="text-base font-extrabold text-white tracking-wide">
          {getPageTitle(location.pathname)}
        </h2>
        <span className="hidden md:inline-flex items-center space-x-1.5 px-2.5 py-0.5 bg-[#00C2FF]/10 border border-[#00C2FF]/30 rounded-full text-[10px] font-mono text-[#00C2FF]">
          <Server className="w-3 h-3" />
          <span>Platform Level</span>
        </span>
      </div>

      <div className="flex items-center space-x-4">
        {/* Network Status Badge */}
        <div className="hidden sm:flex items-center space-x-2 px-3 py-1 bg-[#10B981]/10 border border-[#10B981]/30 rounded-xl text-xs font-mono text-[#10B981]">
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
          <span className="font-bold">Quantum Network Online</span>
        </div>

        {/* Global Security Clearance Pill */}
        <div className="flex items-center space-x-1.5 px-3 py-1 bg-[#131E33] border border-[#1F2E4D] rounded-xl text-xs font-mono text-purple-400">
          <ShieldCheck className="w-4 h-4" />
          <span className="hidden md:inline font-bold">SUPER_ADMIN Access</span>
        </div>

        {/* User Identity Avatar */}
        <div className="flex items-center space-x-3 pl-2 border-l border-[#1F2E4D]">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#00C2FF] to-purple-600 flex items-center justify-center text-white font-black text-xs font-mono shadow-md">
            {currentUser?.username?.[0]?.toUpperCase() || 'SA'}
          </div>
        </div>
      </div>
    </header>
  );
};
