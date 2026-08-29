import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Key, ShieldAlert, AlertTriangle, BarChart3, FileText, Cpu, Users, Building2, Sliders, LogOut } from 'lucide-react';
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
        title: 'OVERVIEW',
        items: [
          { to: '/admin/dashboard', label: 'Admin Dashboard', icon: LayoutDashboard },
        ]
      },
      {
        title: 'MANAGEMENT',
        items: [
          { to: '/admin/users', label: 'User Directory', icon: Users },
          { to: '/admin/orgs', label: 'Organizations', icon: Building2 },
        ]
      },
      {
        title: 'SECURITY',
        items: [
          { to: '/admin/threats', label: 'Threats & Incidents', icon: AlertTriangle },
          { to: '/admin/attack-simulator', label: 'Attack Simulator', icon: Cpu },
        ]
      },
      {
        title: 'QUANTUM',
        items: [
          { to: '/admin/qds', label: 'QDS Transactions', icon: Key },
          { to: '/admin/analytics', label: 'Quantum Analytics', icon: BarChart3 },
        ]
      },
      {
        title: 'SYSTEM',
        items: [
          { to: '/admin/rules', label: 'Security Rules', icon: Sliders },
          { to: '/admin/audit', label: 'Audit Trail', icon: FileText },
        ]
      }
    ];
  } else if (role === 'SIGNER') {
    groups = [
      {
        title: 'SIGNER WORKSPACE',
        items: [
          { to: '/signer/qds', label: 'QDS Signer Studio', icon: Key },
        ]
      },
      {
        title: 'SYSTEM',
        items: [
          { to: '/signer/audit', label: 'Audit Log Trail', icon: FileText },
        ]
      }
    ];
  } else if (role === 'VERIFIER') {
    groups = [
      {
        title: 'VERIFIER WORKSPACE',
        items: [
          { to: '/verifier/verify', label: 'QDS Verifier Studio', icon: Key },
        ]
      },
      {
        title: 'SYSTEM',
        items: [
          { to: '/verifier/audit', label: 'Audit Log Trail', icon: FileText },
        ]
      }
    ];
  } else if (role === 'SECURITY_ANALYST') {
    groups = [
      {
        title: 'ANALYST SOC',
        items: [
          { to: '/analyst/attack-simulator', label: 'Attack Simulator', icon: Cpu },
          { to: '/analyst/threats', label: 'Threat SOC', icon: AlertTriangle },
        ]
      },
      {
        title: 'QUANTUM',
        items: [
          { to: '/analyst/analytics', label: 'Statistical Analytics', icon: BarChart3 },
        ]
      },
      {
        title: 'SYSTEM',
        items: [
          { to: '/analyst/audit', label: 'Audit Trail', icon: FileText },
        ]
      }
    ];
  }

  return (
    <aside className="w-64 bg-[#0B1220] border-r border-[#1A263D] min-h-[calc(100vh-61px)] p-4 flex flex-col justify-between select-none">
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="px-2 border-b border-[#1A263D] pb-3">
          <div className="flex items-center space-x-2">
            <span className="font-black text-lg tracking-wider">
              <span className="text-[#00C2FF]">Q</span>
              <span className="text-white">-SHIELD</span>
            </span>
          </div>
          <div className="mt-1 flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-[#00C2FF]" />
            <span className="text-[10px] font-mono text-[#00C2FF] font-bold tracking-widest uppercase">
              {role} WORKSPACE
            </span>
          </div>
        </div>

        {/* Navigation Groups */}
        {groups.map((group) => (
          <div key={group.title} className="space-y-1">
            <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {group.title}
            </div>
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition duration-150 ${
                      isActive
                        ? 'bg-[#00C2FF]/10 text-[#00C2FF] border-l-4 border-[#00C2FF] pl-2 font-bold shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-[#131E33]'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer User Profile & Scope Box */}
      <div className="space-y-3 pt-4 border-t border-[#1A263D]">
        <div className="bg-[#131E33] border border-[#1F2E4D] rounded-xl p-3 text-xs flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="font-bold text-white text-[11px]">{currentUser?.username || 'Guest'}</div>
            <div className="text-[10px] text-[#00C2FF] font-mono font-bold uppercase">{role}</div>
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              title="Logout"
              className="p-1.5 rounded-lg hover:bg-[#0B1220] text-slate-400 hover:text-white transition border border-transparent hover:border-[#1F2E4D]"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
