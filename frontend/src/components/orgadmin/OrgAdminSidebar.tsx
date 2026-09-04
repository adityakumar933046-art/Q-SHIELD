import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Activity, ShieldAlert, FileText, Sliders, Shield, LogOut } from 'lucide-react';
import { User } from '../../types';

interface OrgAdminSidebarProps {
  currentUser: User | null;
  onLogout: () => void;
}

export const OrgAdminSidebar: React.FC<OrgAdminSidebarProps> = ({ currentUser, onLogout }) => {
  const navItems = [
    { name: 'Dashboard', path: '/org-admin/dashboard', icon: LayoutDashboard },
    { name: 'Team', path: '/org-admin/team', icon: Users },
    { name: 'Activity', path: '/org-admin/activity', icon: Activity },
    { name: 'Security Overview', path: '/org-admin/security-overview', icon: ShieldAlert },
    { name: 'Audit Logs', path: '/org-admin/audit-logs', icon: FileText },
    { name: 'Organization Settings', path: '/org-admin/settings', icon: Sliders },
  ];

  const orgName = currentUser?.organization_name || 'DEFENSE QUANTUM CYBER...';
  const initial = (currentUser?.username?.[0] || 'A').toUpperCase();

  return (
    <aside className="w-68 bg-white dark:bg-[#0E1526] border-r border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between h-screen sticky top-0 font-sans z-30 transition-colors duration-200 shrink-0">
      <div>
        {/* Branding Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800/60 flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/40 flex items-center justify-center text-[#6366F1] dark:text-indigo-400 shrink-0 shadow-sm">
            <Shield className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div className="overflow-hidden">
            <h1 className="text-lg font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              Q-SHIELD
            </h1>
            <span
              className="text-xs text-[#6366F1] dark:text-indigo-400 font-semibold uppercase tracking-wider block truncate max-w-[155px]"
              title={currentUser?.organization_name || 'Defense Quantum Cyber Command'}
            >
              {orgName.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="px-3.5 py-6 space-y-2">
          <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 mb-2.5">
            Organization Management
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-[#EEF2FF] dark:bg-indigo-950/50 text-[#6366F1] dark:text-indigo-300 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/70 dark:hover:bg-slate-800/50'
                  }`
                }
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className="tracking-wide">{item.name}</span>
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* User Footer Profile & Logout */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800/60">
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3 overflow-hidden pr-2">
            <div className="w-9 h-9 rounded-full bg-[#6366F1] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
              {initial}
            </div>
            <div className="overflow-hidden">
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100 block truncate leading-tight">
                {currentUser?.username || 'admin'}
              </span>
              <span className="inline-block text-[11px] font-bold text-[#6366F1] dark:text-indigo-300 bg-indigo-100/80 dark:bg-indigo-950/80 px-2 py-0.5 rounded uppercase tracking-wide mt-0.5">
                ORG_ADMIN
              </span>
            </div>
          </div>

          <button
            onClick={onLogout}
            title="Log Out"
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
