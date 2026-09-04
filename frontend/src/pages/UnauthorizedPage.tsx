import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { User } from '../types';

interface UnauthorizedPageProps {
  currentUser: User | null;
}

export const UnauthorizedPage: React.FC<UnauthorizedPageProps> = ({ currentUser }) => {
  const defaultHome = currentUser?.role === 'SIGNER'
    ? '/signer/qds'
    : currentUser?.role === 'VERIFIER'
    ? '/verifier/verify'
    : currentUser?.role === 'SECURITY_ANALYST'
    ? '/analyst/threats'
    : '/admin/dashboard';

  return (
    <div className="min-h-[calc(100vh-140px)] flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-[#0B1220] border border-[#F59E0B]/40 rounded-2xl p-8 max-w-md w-full space-y-6 shadow-2xl">
        <div className="w-16 h-16 rounded-full bg-[#F59E0B]/10 border border-[#F59E0B]/40 text-[#F59E0B] flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-sans font-bold text-[#F59E0B] uppercase tracking-widest px-3 py-1 bg-[#F59E0B]/10 rounded-full border border-[#F59E0B]/30">
            HTTP 403 Access Denied
          </span>
          <h1 className="text-xl font-bold text-white">UNAUTHORIZED ROLE ACCESS</h1>
          <p className="text-xs text-slate-300">
            Your active role <strong className="text-[#00C2FF] font-sans">[{currentUser?.role || 'UNAUTHENTICATED'}]</strong> does not have permission to access this administrative resource.
          </p>
        </div>

        <div className="pt-4 border-t border-[#1F2E4D]">
          <Link
            to={defaultHome}
            className="inline-flex items-center space-x-2 bg-[#00C2FF] hover:bg-[#00A8DE] text-[#0B1220] font-bold px-5 py-2.5 rounded-lg text-xs transition shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Permitted Workspace</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
