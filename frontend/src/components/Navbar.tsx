import React from 'react';
import { Shield, Zap, Lock, User as UserIcon } from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  currentUser: User | null;
  onLoginClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentUser, onLoginClick }) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0B1220] border-b border-[#1A263D] px-6 py-3 flex items-center justify-between shadow-md">
      {/* Brand Header */}
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-[#131E33] border border-[#1F2E4D] rounded-lg flex items-center justify-center text-[#00C2FF]">
          <Shield className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-black text-xl tracking-wider">
              <span className="text-[#00C2FF]">Q</span>
              <span className="text-white">-SHIELD</span>
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-[#00C2FF]/10 text-[#00C2FF] border border-[#00C2FF]/30">
              QDS Threat Engine
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">QUANTUM-INSPIRED CYBER THREAT DETECTION</p>
        </div>
      </div>

      {/* Center Status Indicators */}
      <div className="hidden md:flex items-center space-x-6">
        <div className="flex items-center space-x-2 bg-[#131E33] px-3 py-1.5 rounded-lg border border-[#1F2E4D] text-xs">
          <Zap className="w-4 h-4 text-[#10B981]" />
          <span className="text-slate-400 font-medium">Qiskit Engine:</span>
          <span className="text-[#10B981] font-mono font-bold">ONLINE</span>
        </div>

        <div className="flex items-center space-x-2 bg-[#131E33] px-3 py-1.5 rounded-lg border border-[#1F2E4D] text-xs">
          <Lock className="w-4 h-4 text-[#00C2FF]" />
          <span className="text-slate-400 font-medium">Detection:</span>
          <span className="text-[#00C2FF] font-semibold">Non-ML Statistical Physics</span>
        </div>
      </div>

      {/* User / Org Info & Login Trigger */}
      <div className="flex items-center space-x-4">
        {currentUser ? (
          <button
            onClick={onLoginClick}
            className="flex items-center space-x-3 bg-[#131E33] hover:bg-[#1A2844] px-3.5 py-1.5 rounded-lg border border-[#1F2E4D] transition text-left"
          >
            <div className="w-7 h-7 rounded-full bg-[#00C2FF]/20 border border-[#00C2FF]/50 text-[#00C2FF] font-bold text-xs flex items-center justify-center">
              {currentUser.username[0].toUpperCase()}
            </div>
            <div className="text-left text-xs">
              <div className="font-semibold text-white font-mono">
                {currentUser.username}
              </div>
              <div className="text-[10px] text-[#00C2FF] font-mono uppercase font-bold">{currentUser.role}</div>
            </div>
          </button>
        ) : (
          <a
            href="/login"
            className="flex items-center space-x-2 bg-[#00C2FF] hover:bg-[#00A8DE] text-[#0B1220] font-bold px-4 py-2 rounded-lg text-xs transition duration-200 shadow-sm uppercase font-mono"
          >
            <UserIcon className="w-4 h-4" />
            <span>Sign In</span>
          </a>
        )}
      </div>
    </header>
  );
};
