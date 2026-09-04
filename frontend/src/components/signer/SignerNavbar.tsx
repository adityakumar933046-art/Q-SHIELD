import React from 'react';
import { useLocation } from 'react-router-dom';
import { ShieldCheck, Cpu, Building2 } from 'lucide-react';
import { User } from '../../types';
import { ThemeToggle } from '../common/ThemeToggle';

interface SignerNavbarProps {
  currentUser: User | null;
}

export const SignerNavbar: React.FC<SignerNavbarProps> = ({ currentUser }) => {
  const location = useLocation();

  const getPageTitle = (pathname: string) => {
    if (pathname.includes('/signer/dashboard')) return 'Signer Dashboard & QDS Telemetry';
    if (pathname.includes('/signer/create-signature') || pathname.includes('/signer/create')) return 'Generate Quantum Digital Signature';
    if (pathname.includes('/signer/signatures/')) return 'QDS Signature Record Details';
    if (pathname.includes('/signer/my-signatures') || pathname.includes('/signer/my-qds')) return 'My Quantum Digital Signatures';
    if (pathname.includes('/signer/profile')) return 'Signer Identity Profile';
    return 'Signer Workspace';
  };

  const orgName = currentUser?.organization_name || 'Organization Signer Node';

  return (
    <header className="h-16 bg-[#0B1220]/90 border-b border-[#1F2E4D] px-6 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md font-sans">
      <div className="flex items-center space-x-3">
        <h2 className="text-base font-bold text-white tracking-wide">
          {getPageTitle(location.pathname)}
        </h2>
        <span className="hidden md:inline-flex items-center space-x-1.5 px-2.5 py-0.5 bg-[#00C2FF]/10 border border-[#00C2FF]/30 rounded-full text-[10px] font-sans text-[#00C2FF]">
          <Building2 className="w-3 h-3" />
          <span>{orgName}</span>
        </span>
      </div>

      <div className="flex items-center space-x-4">
        {/* QDS Engine Active Pill */}
        <div className="hidden sm:flex items-center space-x-2 px-3 py-1 bg-[#10B981]/10 border border-[#10B981]/30 rounded-xl text-xs font-sans text-[#10B981]">
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
          <span className="font-bold">QDS Engine Online</span>
        </div>

        {/* Theme Toggle Button */}
        <ThemeToggle />

        {/* User Identity Avatar */}
        <div className="flex items-center space-x-3 pl-2 border-l border-[#1F2E4D]">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#00C2FF] to-purple-600 flex items-center justify-center text-white font-bold text-xs font-sans shadow-md">
            {currentUser?.username?.[0]?.toUpperCase() || 'S'}
          </div>
        </div>
      </div>
    </header>
  );
};
