import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Key, 
  AlertTriangle, 
  BarChart3, 
  FileText, 
  Cpu, 
  Users, 
  Building2, 
  Sliders, 
  LogOut, 
  Bell, 
  User as UserIcon, 
  Settings, 
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import { User } from '../types';

interface SidebarProps {
  currentUser: User | null;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentUser, onLogout }) => {
  const role = currentUser?.role || 'ADMIN';

  let groups: { title: string; items: { to: string; label: string; icon: any }[] }[] = [];

  if (role === 'ADMIN') {
    groups = [
      {
        title: 'Project',
        items: [
          { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/admin/qds', label: 'QDS Transactions', icon: Key },
          { to: '/admin/analytics', label: 'Quantum Analytics', icon: BarChart3 },
        ]
      },
      {
        title: 'Security SOC',
        items: [
          { to: '/admin/threats', label: 'Threats & SOC', icon: AlertTriangle },
          { to: '/admin/attack-simulator', label: 'Attack Simulator', icon: Cpu },
        ]
      },
      {
        title: 'Management',
        items: [
          { to: '/admin/users', label: 'User Directory', icon: Users },
          { to: '/admin/orgs', label: 'Organizations', icon: Building2 },
          { to: '/admin/rules', label: 'Security Rules', icon: Sliders },
          { to: '/admin/audit', label: 'Audit Trail', icon: FileText },
        ]
      }
    ];
  } else if (role === 'SIGNER') {
    groups = [
      {
        title: 'Project',
        items: [
          { to: '/signer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/signer/create', label: 'Create QDS', icon: Key },
          { to: '/signer/my-qds', label: 'My QDS Signatures', icon: FileText },
          { to: '/signer/requests', label: 'Signing Requests', icon: ShieldCheck },
        ]
      },
      {
        title: 'Account & Audit',
        items: [
          { to: '/signer/profile', label: 'Profile', icon: UserIcon },
          { to: '/signer/notifications', label: 'Notifications', icon: Bell },
          { to: '/signer/audit', label: 'Audit Trail', icon: FileText },
          { to: '/signer/settings', label: 'Settings', icon: Settings },
          { to: '#logout', label: 'Logout', icon: LogOut },
        ]
      }
    ];
  } else if (role === 'VERIFIER') {
    groups = [
      {
        title: 'Project',
        items: [
          { to: '/verifier/verify', label: 'Verify QDS', icon: ShieldCheck },
        ]
      },
      {
        title: 'System',
        items: [
          { to: '/verifier/audit', label: 'Audit Trail', icon: FileText },
        ]
      }
    ];
  } else if (role === 'SECURITY_ANALYST') {
    groups = [
      {
        title: 'Project',
        items: [
          { to: '/analyst/threats', label: 'Threat SOC', icon: AlertTriangle },
          { to: '/analyst/attack-simulator', label: 'Attack Simulator', icon: Cpu },
          { to: '/analyst/analytics', label: 'Analytics', icon: BarChart3 },
        ]
      },
      {
        title: 'System',
        items: [
          { to: '/analyst/audit', label: 'Audit Trail', icon: FileText },
        ]
      }
    ];
  }

  const userInitial = (currentUser?.first_name || currentUser?.username || 'U')[0].toUpperCase();
  const displayName = currentUser?.first_name && currentUser?.last_name 
    ? `${currentUser.first_name} ${currentUser.last_name}` 
    : currentUser?.username || 'SecOps Lead';
  const displayId = currentUser?.id ? `ID: 942-X0${currentUser.id}` : 'ID: 942-X01';

  return (
    <aside className="w-64 glass-panel border-r border-white/10 min-h-[calc(100vh-65px)] p-4 flex flex-col justify-between select-none shrink-0 m-3 my-4 ml-4 rounded-3xl relative z-20">
      <div className="space-y-6">
        {/* User Profile Pill Capsule (Matching Template Screenshot) */}
        <div className="flex items-center justify-between p-2 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-cyan-500/40 transition">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500/30 to-blue-600/30 border border-cyan-400/50 flex items-center justify-center text-white font-bold text-sm shadow-[0_0_12px_rgba(0,229,255,0.35)] shrink-0 overflow-hidden relative">
              <div className="absolute inset-0 bg-cyan-400/10 animate-pulse" />
              <span>{userInitial}</span>
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white truncate">{displayName}</div>
              <div className="text-[10px] font-mono text-slate-400">{displayId}</div>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
        </div>

        {/* Navigation Groups */}
        {groups.map((group) => (
          <div key={group.title} className="space-y-1.5">
            <div className="flex items-center space-x-2 px-3 py-1">
              <span className="text-[11px] font-medium text-slate-400">{group.title}</span>
              <div className="h-px bg-white/10 flex-1" />
            </div>
            {group.items.map((item) => {
              const Icon = item.icon;
              if (item.label === 'Logout') {
                return (
                  <button
                    key={item.to}
                    onClick={onLogout}
                    className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent transition"
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              }
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
        ))}
      </div>

      {/* Footer Scope / Version Box */}
      <div className="pt-4 border-t border-white/10 space-y-2">
        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/[0.03] border border-white/5 text-[11px]">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#00E5FF]" />
            <span className="font-mono text-cyan-400 font-bold uppercase tracking-wider">{role}</span>
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
