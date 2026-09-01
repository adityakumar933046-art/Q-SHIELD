import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShieldCheck, 
  ListTodo, 
  MailWarning, 
  History, 
  BarChart3, 
  FileSearch, 
  Bell, 
  Settings, 
  LogOut,
  ChevronDown
} from 'lucide-react';
import { User } from '../types';

interface VerifierSidebarProps {
  currentUser: User | null;
  onLogout?: () => void;
}

export const VerifierSidebar: React.FC<VerifierSidebarProps> = ({ currentUser, onLogout }) => {
  const menuItems = [
    { to: '/verifier/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/verifier/verify', label: 'Verify QDS', icon: ShieldCheck },
    { to: '/verifier/my-verifications', label: 'My Verifications', icon: ListTodo },
    { to: '/verifier/requests', label: 'Verification Requests', icon: MailWarning },
    { to: '/verifier/history', label: 'Verification History', icon: History },
    { to: '/verifier/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/verifier/audit', label: 'Audit Trail', icon: FileSearch },
    { to: '/verifier/notifications', label: 'Notifications', icon: Bell },
    { to: '/verifier/settings', label: 'Settings', icon: Settings },
  ];

  const userInitial = (currentUser?.first_name || currentUser?.username || 'V')[0].toUpperCase();
  const displayName = currentUser?.first_name && currentUser?.last_name 
    ? `${currentUser.first_name} ${currentUser.last_name}` 
    : currentUser?.username || 'Verifier Lead';
  const displayId = currentUser?.id ? `ID: 942-X0${currentUser.id}` : 'ID: 942-X02';

  return (
    <aside className="w-64 glass-panel border-r border-white/10 min-h-[calc(100vh-65px)] p-4 flex flex-col justify-between select-none shrink-0 m-3 my-4 ml-4 rounded-3xl relative z-20">
      <div className="space-y-6">
        {/* User Profile Pill Capsule */}
        <div className="flex items-center justify-between p-2 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-cyan-500/40 transition">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500/30 to-emerald-600/30 border border-cyan-400/50 flex items-center justify-center text-white font-bold text-sm shadow-[0_0_12px_rgba(0,229,255,0.35)] shrink-0 overflow-hidden relative">
              <div className="absolute inset-0 bg-emerald-400/10 animate-pulse" />
              <span>{userInitial}</span>
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white truncate">{displayName}</div>
              <div className="text-[10px] font-mono text-slate-400">{displayId}</div>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
        </div>

        {/* Navigation Items */}
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2 px-3 py-1">
            <span className="text-[11px] font-medium text-slate-400">Verifier Workspace</span>
            <div className="h-px bg-white/10 flex-1" />
          </div>

          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition duration-200 ${
                    isActive
                      ? 'cyber-active-pill font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.06] border border-transparent'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-white/10 space-y-2">
        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/[0.03] border border-white/5 text-[11px]">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34D399]" />
            <span className="font-mono text-emerald-400 font-bold uppercase tracking-wider">VERIFIER</span>
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              title="Logout"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
