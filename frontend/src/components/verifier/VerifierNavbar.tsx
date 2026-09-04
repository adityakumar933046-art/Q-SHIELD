import React from 'react';
import { useLocation } from 'react-router-dom';
import { ShieldCheck, Building2 } from 'lucide-react';
import { User } from '../../types';

interface VerifierNavbarProps {
  currentUser: User | null;
}

export const VerifierNavbar: React.FC<VerifierNavbarProps> = ({ currentUser }) => {
  const location = useLocation();

  const getPageTitle = (pathname: string) => {
    if (pathname.includes('/verifier/dashboard')) return 'Verifier Dashboard & Metrics';
    if (pathname.includes('/verifier/signatures/') && pathname.includes('/verify')) return 'QDS Signature Verification Execution';
    if (pathname.includes('/verifier/pending')) return 'Pending Signatures Queue';
    if (pathname.includes('/verifier/history')) return 'Verification History & Audit Trail';
    if (pathname.includes('/verifier/profile')) return 'Verifier Identity Profile';
    return 'Verifier Portal';
  };

  const orgName = currentUser?.organization_name || 'Organization Verifier Node';

  return (
    <header className="h-16 bg-[#0B1220]/90 border-b border-[#1F2E4D] px-6 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md font-sans">
      <div className="flex items-center space-x-3">
        <h2 className="text-base font-bold text-white tracking-wide">
          {getPageTitle(location.pathname)}
        </h2>
        <span className="hidden md:inline-flex items-center space-x-1.5 px-2.5 py-0.5 bg-[#10B981]/10 border border-[#10B981]/30 rounded-full text-[10px] font-sans text-[#10B981]">
          <Building2 className="w-3 h-3" />
          <span>{orgName}</span>
        </span>
      </div>

      <div className="flex items-center space-x-4">
        {/* Verification Engine Active Pill */}
        <div className="hidden sm:flex items-center space-x-2 px-3 py-1 bg-[#10B981]/10 border border-[#10B981]/30 rounded-xl text-xs font-sans text-[#10B981]">
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
          <span className="font-bold">Verification Engine Active</span>
        </div>

        {/* User Identity Avatar */}
        <div className="flex items-center space-x-3 pl-2 border-l border-[#1F2E4D]">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#10B981] to-[#00C2FF] flex items-center justify-center text-white font-bold text-xs font-sans shadow-md">
            {currentUser?.username?.[0]?.toUpperCase() || 'V'}
          </div>
        </div>
      </div>
    </header>
  );
};
