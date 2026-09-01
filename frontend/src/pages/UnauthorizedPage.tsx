import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { User } from '../types';

interface UnauthorizedPageProps {
  currentUser: User | null;
}

export const UnauthorizedPage: React.FC<UnauthorizedPageProps> = ({ currentUser }) => {
  const defaultHome = currentUser?.role === 'SIGNER'
    ? '/signer/dashboard'
    : currentUser?.role === 'VERIFIER'
    ? '/verifier/dashboard'
    : currentUser?.role === 'SECURITY_ANALYST'
    ? '/analyst/threats'
    : '/admin/dashboard';

  return (
    <div className="min-h-[calc(100vh-140px)] flex flex-col items-center justify-center p-6 text-center">
      <div className="glass-panel border-amber-500/40 rounded-3xl p-8 max-w-md w-full space-y-6 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(245,158,11,0.2)]">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest px-3 py-1 bg-amber-500/10 rounded-full border border-amber-500/30">
            HTTP 403 Access Denied
          </span>
          <h1 className="text-xl font-extrabold text-white">UNAUTHORIZED ROLE ACCESS</h1>
          <p className="text-xs text-slate-300 leading-relaxed">
            Your active role <strong className="text-cyan-400 font-mono">[{currentUser?.role || 'UNAUTHENTICATED'}]</strong> does not have permission to access this operational resource.
          </p>
        </div>

        <div className="pt-4 border-t border-white/10">
          <Link
            to={defaultHome}
            className="inline-flex items-center space-x-2 btn-cyan-gradient px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-md"
          >
            <ArrowLeft className="w-4 h-4 text-black" />
            <span>Return to Permitted Workspace</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
