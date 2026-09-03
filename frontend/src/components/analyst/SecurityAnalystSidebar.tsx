import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ShieldAlert, Briefcase, BarChart3, User, Shield, LogOut } from 'lucide-react';
import { User as UserType } from '../../types';

interface SecurityAnalystSidebarProps {
  currentUser: UserType | null;
  onLogout: () => void;
}

export const SecurityAnalystSidebar: React.FC<SecurityAnalystSidebarProps> = ({ currentUser, onLogout }) => {
  // STRICT SECURITY ANALYST SIDEBAR LINKS ONLY
  const navItems = [
    { name: 'Dashboard', path: '/security-analyst/dashboard', icon: LayoutDashboard },
    { name: 'Threat Monitoring', path: '/security-analyst/threats', icon: ShieldAlert },
    { name: 'Investigations', path: '/security-analyst/investigations', icon: Briefcase },
    { name: 'Security Analytics', path: '/security-analyst/analytics', icon: BarChart3 },
    { name: 'Profile', path: '/security-analyst/profile', icon: User },
  ];

  const orgName = currentUser?.organization_name || 'Organization Security Operations';

  return (
    <aside className="w-64 bg-[#070C16] border-r border-[#1F2E4D] flex flex-col justify-between h-screen sticky top-0 font-sans z-30">
      <div>
        {/* Branding Header */}
        <div className="p-6 border-b border-[#1F2E4D]/60 flex items-center space-x-3">
          <div className="p-2.5 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-xl text-[#EF4444]">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-black text-white tracking-wider">Q-SHIELD</h1>
            <span className="text-[10px] text-[#EF4444] font-mono font-bold tracking-widest uppercase block truncate max-w-[130px]" title={orgName}>
              Security Analyst
            </span>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="px-4 py-6 space-y-1.5">
          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest px-3 mb-2 block">
            Threat Intelligence
          </span>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3.5 py-3 rounded-xl text-xs font-semibold font-mono transition duration-150 ${
                    isActive
                      ? 'bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30 shadow-md'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-[#131E33]'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* User Footer Profile & Logout */}
      <div className="p-4 border-t border-[#1F2E4D]/60 space-y-3">
        <div className="p-3 bg-[#131E33] border border-[#1F2E4D] rounded-xl flex items-center justify-between">
          <div className="overflow-hidden pr-2">
            <span className="text-xs font-bold text-white font-mono block truncate">
              {currentUser?.username || 'SecurityAnalyst'}
            </span>
            <span className="inline-block text-[9px] font-mono font-bold text-[#EF4444] bg-[#EF4444]/10 border border-[#EF4444]/30 px-1.5 py-0.2 rounded mt-0.5 uppercase">
              ANALYST ROLE
            </span>
          </div>

          <button
            onClick={onLogout}
            title="Log Out"
            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
