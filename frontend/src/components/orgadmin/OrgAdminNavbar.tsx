import React from 'react';
import { useLocation } from 'react-router-dom';
import { Building2, ShieldCheck, User } from 'lucide-react';
import { User as UserType } from '../../types';

interface OrgAdminNavbarProps {
  currentUser: UserType | null;
}

export const OrgAdminNavbar: React.FC<OrgAdminNavbarProps> = ({ currentUser }) => {
  const location = useLocation();

  const getPageTitle = (pathname: string) => {
    if (pathname.includes('/org-admin/dashboard')) return 'Organization Operational Dashboard';
    if (pathname.includes('/org-admin/team')) return 'Organization Team Directory & Governance';
    if (pathname.includes('/org-admin/activity')) return 'Organization Operations & Activity Trail';
    if (pathname.includes('/org-admin/security-overview')) return 'Organization Security Status & Alerts';
    if (pathname.includes('/org-admin/audit-logs')) return 'Organization System Audit Logs';
    if (pathname.includes('/org-admin/settings')) return 'Organization Settings & Access Policies';
    return 'Organization Admin Console';
  };

  const orgName = currentUser?.organization_name || 'Organization Workspace';

  return (
    <header className="h-16 bg-[#0B1220]/90 border-b border-[#1F2E4D] px-6 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md font-sans">
      <div className="flex items-center space-x-3">
        <h2 className="text-base font-extrabold text-white tracking-wide">
          {getPageTitle(location.pathname)}
        </h2>
        <span className="hidden md:inline-flex items-center space-x-1.5 px-2.5 py-0.5 bg-purple-500/10 border border-purple-500/30 rounded-full text-[10px] font-mono text-purple-400 font-bold">
          <Building2 className="w-3 h-3" />
          <span>{orgName}</span>
        </span>
      </div>

      <div className="flex items-center space-x-4">
        {/* Security Shield Status Pill */}
        <div className="hidden sm:flex items-center space-x-2 px-3 py-1 bg-[#10B981]/10 border border-[#10B981]/30 rounded-xl text-xs font-mono text-[#10B981]">
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
          <span className="font-bold">Org Security Active</span>
        </div>

        {/* User Role Badge */}
        <div className="flex items-center space-x-1.5 px-3 py-1 bg-[#131E33] border border-[#1F2E4D] rounded-xl text-xs font-mono text-purple-400">
          <ShieldCheck className="w-4 h-4" />
          <span className="hidden md:inline font-bold">ORG_ADMIN Access</span>
        </div>

        {/* User Identity Avatar */}
        <div className="flex items-center space-x-3 pl-2 border-l border-[#1F2E4D]">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-[#00C2FF] flex items-center justify-center text-white font-black text-xs font-mono shadow-md">
            {currentUser?.username?.[0]?.toUpperCase() || 'OA'}
          </div>
        </div>
      </div>
    </header>
  );
};
