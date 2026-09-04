import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Building2, ShieldAlert, FileText, Settings, Shield, LogOut } from 'lucide-react';
import { User } from '../../types';

interface SuperAdminSidebarProps {
  currentUser: User | null;
  onLogout: () => void;
}

export const SuperAdminSidebar: React.FC<SuperAdminSidebarProps> = ({ currentUser, onLogout }) => {
  const navItems = [
    { name: 'Dashboard', path: '/super-admin/dashboard', icon: LayoutDashboard },
    { name: 'Organizations', path: '/super-admin/organizations', icon: Building2 },
    { name: 'Security Overview', path: '/super-admin/security-overview', icon: ShieldAlert },
    { name: 'Audit Logs', path: '/super-admin/audit-logs', icon: FileText },
    { name: 'Settings', path: '/super-admin/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#070C16] border-r border-[#1F2E4D] flex flex-col justify-between h-screen sticky top-0 font-sans z-30">
      <div>
        {/* Branding Header */}
        <div className="p-6 border-b border-[#1F2E4D]/60 flex items-center space-x-3">
          <div className="p-2.5 bg-[#00C2FF]/10 rounded-xl border border-[#00C2FF]/30 text-[#00C2FF]">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">Q-SHIELD</h1>
            <span className="text-xs text-emerald-400 font-medium uppercase tracking-wider block">
              Super Admin Console
            </span>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="px-4 py-6 space-y-1.5">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-3 block">
            Platform Operations
          </span>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3.5 py-3 rounded-xl text-sm font-medium transition duration-150 ${
                    isActive
                      ? 'bg-[#00C2FF]/15 text-[#00C2FF] border border-[#00C2FF]/30 shadow-md font-semibold'
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
            <span className="text-xs font-semibold text-white block truncate">
              {currentUser?.username || 'Super Admin'}
            </span>
            <span className="inline-block text-[10px] font-semibold text-purple-300 bg-purple-500/10 border border-purple-500/30 px-2 py-0.5 rounded mt-0.5 uppercase tracking-wider">
              Global Admin
            </span>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-600 text-red-400 hover:text-white text-xs font-semibold rounded-xl border border-red-500/30 transition duration-150 shadow-sm"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
};
