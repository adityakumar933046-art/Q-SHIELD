import React from 'react';
import { useLocation } from 'react-router-dom';
import { ShieldAlert, Building2 } from 'lucide-react';
import { User } from '../../types';

interface SecurityAnalystNavbarProps {
  currentUser: User | null;
}

export const SecurityAnalystNavbar: React.FC<SecurityAnalystNavbarProps> = ({ currentUser }) => {
  const location = useLocation();

  const getPageTitle = (pathname: string) => {
    if (pathname.includes('/security-analyst/dashboard')) return 'Security Operations Command & Health';
    if (pathname.includes('/security-analyst/threats/') && !pathname.includes('/investigations')) return 'Threat Incident Evidence & Details';
    if (pathname.includes('/security-analyst/threats')) return 'Threat Event Monitoring Directory';
    if (pathname.includes('/security-analyst/investigations/')) return 'Threat Investigation Workspace';
    if (pathname.includes('/security-analyst/investigations')) return 'Active Security Investigations';
    if (pathname.includes('/security-analyst/analytics')) return 'Quantum Security Metrics & Analytics';
    if (pathname.includes('/security-analyst/profile')) return 'Analyst Identity & Credentials Profile';
    return 'Security Operations Command';
  };

  const orgName = currentUser?.organization_name || 'Organization Security Operations';

  return (
    <header className="h-16 bg-[#0B1220]/90 border-b border-[#1F2E4D] px-6 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md font-sans">
      <div className="flex items-center space-x-3">
        <h2 className="text-base font-bold text-white tracking-wide">
          {getPageTitle(location.pathname)}
        </h2>
        <span className="hidden md:inline-flex items-center space-x-1.5 px-2.5 py-0.5 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-full text-[10px] font-sans text-[#EF4444]">
          <Building2 className="w-3 h-3" />
          <span>{orgName}</span>
        </span>
      </div>

      <div className="flex items-center space-x-4">
        {/* Threat Engine Active Pill */}
        <div className="hidden sm:flex items-center space-x-2 px-3 py-1 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-xl text-xs font-sans text-[#EF4444]">
          <span className="w-2 h-2 rounded-full bg-[#EF4444] animate-pulse" />
          <span className="font-bold">Threat Engine Active</span>
        </div>

        {/* User Identity Avatar */}
        <div className="flex items-center space-x-3 pl-2 border-l border-[#1F2E4D]">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#EF4444] to-purple-600 flex items-center justify-center text-white font-bold text-xs font-sans shadow-md">
            {currentUser?.username?.[0]?.toUpperCase() || 'A'}
          </div>
        </div>
      </div>
    </header>
  );
};
