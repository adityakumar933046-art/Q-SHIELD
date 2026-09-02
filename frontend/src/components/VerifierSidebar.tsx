import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShieldAlert, 
  ShieldCheck, 
  ListTodo, 
  MailWarning, 
  History, 
  BarChart3, 
  FileSearch, 
  Bell, 
  Settings, 
  LogOut,
  Shield
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

  return (
    <aside className="w-64 bg-[#15803D] text-white min-h-screen flex flex-col justify-between select-none shadow-lg">
      <div className="p-4 space-y-6">
        {/* Brand Header */}
        <div className="flex items-center space-x-3 px-2 py-4 border-b border-white/20">
          <div className="p-2 bg-white/10 rounded-lg flex items-center justify-center text-white">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="font-black text-lg tracking-wider">
              <span>Q-SHIELD</span>
            </div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-green-100 opacity-90">
              Verifier Portal
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-semibold transition duration-150 ${
                    isActive
                      ? 'bg-white text-[#15803D] font-bold shadow-sm'
                      : 'text-green-50 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}

          {/* Logout Button */}
          {onLogout && (
            <button
              onClick={onLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-semibold text-green-50 hover:bg-white/10 hover:text-white transition duration-150 text-left"
            >
              <LogOut className="w-5 h-5 shrink-0" />
              <span>Logout</span>
            </button>
          )}
        </nav>
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-white/20">
        <div className="bg-white/10 rounded-xl p-3 text-xs">
          <div className="font-bold text-white">{currentUser?.first_name && currentUser?.last_name ? `${currentUser.first_name} ${currentUser.last_name}` : currentUser?.username || 'Guest'}</div>
          <div className="text-[10px] text-green-100 font-mono font-bold uppercase mt-0.5">
            {currentUser?.role || 'VERIFIER'} PORTAL
          </div>
        </div>
      </div>
    </aside>
  );
};
