import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Zap, Search, Command, RefreshCw, Cpu, Activity, User as UserIcon } from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  currentUser: User | null;
  onLoginClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentUser, onLoginClick }) => {
  return (
    <header className="sticky top-0 z-40 glass-panel border-b border-white/10 px-6 py-3 flex items-center justify-between mx-4 mt-3 rounded-2xl">
      {/* Brand Header & Quick Action Pills */}
      <div className="flex items-center space-x-6">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-blue-600/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shadow-[0_0_12px_rgba(0,229,255,0.25)]">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-base tracking-wider text-white">
                <span className="text-cyan-400">Q</span>-SHIELD
              </span>
              <span className="text-[10px] font-mono font-bold tracking-widest px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                v2.4
              </span>
            </div>
          </div>
        </div>

        {/* Action Pills from Reference Template */}
        <div className="hidden xl:flex items-center space-x-2 border-l border-white/10 pl-6">
          <Link
            to="/"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 hover:text-white text-xs font-medium transition"
          >
            <span>✨ Intro Page</span>
          </Link>
          <button className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-slate-300 hover:text-white text-xs font-medium transition">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>Ingest</span>
          </button>
          <button className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-slate-300 hover:text-white text-xs font-medium transition">
            <Cpu className="w-3.5 h-3.5 text-blue-400" />
            <span>Features</span>
          </button>
          <button className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-slate-300 hover:text-white text-xs font-medium transition">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>Agents</span>
          </button>
        </div>
      </div>

      {/* Center Search Input with ⌘K Shortcut Badge */}
      <div className="hidden md:flex items-center flex-1 max-w-xs mx-6">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            placeholder="Search signatures, qubits, anomalies..."
            className="w-full bg-white/[0.04] border border-white/10 rounded-full pl-9 pr-12 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
          />
          <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none">
            <kbd className="flex items-center space-x-0.5 text-[10px] font-mono text-slate-400 bg-white/10 px-1.5 py-0.5 rounded border border-white/10">
              <Command className="w-2.5 h-2.5" />
              <span>K</span>
            </kbd>
          </div>
        </div>
      </div>

      {/* Right Status Indicator, Recalibrate / Action Button, & User Switch */}
      <div className="flex items-center space-x-3">
        {/* Pipeline Live Pulse Pill (From Template Screenshot) */}
        <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34D399]" />
          <span className="text-emerald-400 font-medium text-[11px]">Pipeline live</span>
        </div>

        {/* Recalibrate / Action Gradient Pill Button (From Template Screenshot) */}
        <button 
          onClick={onLoginClick}
          className="flex items-center space-x-2 px-4 py-1.5 rounded-full btn-cyan-gradient text-xs cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-black" />
          <span className="font-bold">Recalibrate</span>
        </button>

        {/* User Pill Button */}
        {currentUser ? (
          <button
            onClick={onLoginClick}
            className="flex items-center space-x-2.5 px-3 py-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 transition text-left"
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-[0_0_8px_rgba(0,229,255,0.4)]">
              {(currentUser.first_name || currentUser.username)[0].toUpperCase()}
            </div>
            <div className="text-left hidden lg:block">
              <div className="font-semibold text-white text-xs leading-none">
                {currentUser.first_name ? `${currentUser.first_name}` : currentUser.username}
              </div>
              <div className="text-[9px] text-cyan-400 font-mono uppercase font-bold mt-0.5">{currentUser.role}</div>
            </div>
          </button>
        ) : (
          <button
            onClick={onLoginClick}
            className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white font-medium px-3.5 py-1.5 rounded-full text-xs border border-white/20 transition"
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>Login</span>
          </button>
        )}
      </div>
    </header>
  );
};
