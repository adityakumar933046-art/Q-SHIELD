import React from 'react';
import { Shield, Home, Sparkles, Globe, Bot, User, Settings } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export const LeftIconRail: React.FC = () => {
  return (
    <div className="w-14 glass-panel border-r border-white/10 min-h-[calc(100vh-65px)] py-4 flex flex-col items-center justify-between select-none shrink-0 m-3 my-4 ml-4 mr-0 rounded-3xl relative z-20">
      {/* Top Icons */}
      <div className="flex flex-col items-center space-y-4">
        {/* Brand D/Shield Icon */}
        <div className="w-9 h-9 rounded-2xl bg-white/[0.06] border border-cyan-400/30 flex items-center justify-center text-cyan-400 shadow-[0_0_10px_rgba(0,229,255,0.2)]">
          <Shield className="w-4 h-4" />
        </div>

        {/* Action / Nav Icons */}
        <div className="flex flex-col items-center space-y-2 pt-2">
          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) =>
              `w-9 h-9 rounded-xl flex items-center justify-center transition ${
                isActive
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-400/60 shadow-[0_0_12px_rgba(0,229,255,0.3)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
              }`
            }
            title="Dashboard"
          >
            <Home className="w-4 h-4" />
          </NavLink>

          <NavLink
            to="/admin/analytics"
            className={({ isActive }) =>
              `w-9 h-9 rounded-xl flex items-center justify-center transition ${
                isActive
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-400/60 shadow-[0_0_12px_rgba(0,229,255,0.3)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
              }`
            }
            title="Quantum Analytics"
          >
            <Sparkles className="w-4 h-4" />
          </NavLink>

          <NavLink
            to="/admin/threats"
            className={({ isActive }) =>
              `w-9 h-9 rounded-xl flex items-center justify-center transition ${
                isActive
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-400/60 shadow-[0_0_12px_rgba(0,229,255,0.3)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
              }`
            }
            title="Global Threat Network"
          >
            <Globe className="w-4 h-4" />
          </NavLink>

          <NavLink
            to="/admin/attack-simulator"
            className={({ isActive }) =>
              `w-9 h-9 rounded-xl flex items-center justify-center transition ${
                isActive
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-400/60 shadow-[0_0_12px_rgba(0,229,255,0.3)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
              }`
            }
            title="Agent Simulation"
          >
            <Bot className="w-4 h-4" />
          </NavLink>
        </div>
      </div>

      {/* Bottom Icons */}
      <div className="flex flex-col items-center space-y-3">
        <NavLink
          to="/admin/users"
          className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.06] transition"
          title="Users"
        >
          <User className="w-4 h-4" />
        </NavLink>
        <NavLink
          to="/admin/rules"
          className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.06] transition"
          title="Settings & Rules"
        >
          <Settings className="w-4 h-4" />
        </NavLink>
      </div>
    </div>
  );
};
