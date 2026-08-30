import React, { useState } from 'react';
import { Shield, Key, Lock, User as UserIcon, X, Check, LogOut } from 'lucide-react';
import { api } from '../services/api';
import { User } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onUserChanged: (user: User | null) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserChanged
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const demoAccounts = [
    { role: 'ADMIN', user: 'admin', pass: 'admin123', label: 'Admin' },
    { role: 'SIGNER', user: 'signer_alice', pass: 'alice123', label: 'Signer' },
    { role: 'VERIFIER', user: 'verifier_bob', pass: 'bob123', label: 'Verifier' },
    { role: 'SECURITY_ANALYST', user: 'analyst_carol', pass: 'analyst123', label: 'Security Analyst' },
  ];

  const handleCustomLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      await api.login(username, password);
      const user = await api.getCurrentUser();
      onUserChanged(user);
      onClose();
    } catch (err: any) {
      setErrorMsg('Invalid username or password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = async (user: string, pass: string) => {
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      await api.login(user, pass);
      const u = await api.getCurrentUser();
      onUserChanged(u);
      onClose();
    } catch (err: any) {
      setErrorMsg(`Failed to authenticate as ${user}.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await api.logout();
    onUserChanged(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0B1220] border border-[#1F2E4D] rounded-xl max-w-md w-full p-6 text-white space-y-5 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#131E33] transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-[#00C2FF]" />
            <h2 className="text-lg font-extrabold tracking-wide">Q-SHIELD Authentication Console</h2>
          </div>
          <p className="text-xs text-slate-400">
            JWT-Based Authentication with Role-Based Access Control (RBAC) & Tenant Isolation.
          </p>
        </div>

        {currentUser ? (
          /* Active User Profile & Logout View */
          <div className="bg-[#131E33] border border-[#1F2E4D] rounded-xl p-4 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-[#00C2FF]/20 border border-[#00C2FF]/50 text-[#00C2FF] font-bold text-sm flex items-center justify-center">
                {currentUser.username[0].toUpperCase()}
              </div>
              <div className="space-y-0.5">
                <div className="text-sm font-bold text-white">{currentUser.username}</div>
                <div className="text-[11px] text-[#00C2FF] font-mono font-bold uppercase">{currentUser.role}</div>
                <div className="text-[10px] text-slate-400">Organization ID: #{currentUser.organization || 'Global'}</div>
              </div>
            </div>

            <div className="pt-2 border-t border-[#1A263D] flex justify-between items-center">
              <span className="text-xs text-slate-400">Switch role or invalidate active session:</span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#0B1220] hover:bg-black text-white text-xs font-bold rounded-lg border border-[#1F2E4D] transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        ) : null}

        {/* Demo Quick-Switch Accounts */}
        <div className="space-y-2">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Quick-Switch SIH Demo Roles
          </label>
          <div className="grid grid-cols-2 gap-2">
            {demoAccounts.map((acc) => {
              const isActive = currentUser?.username === acc.user;
              return (
                <button
                  key={acc.user}
                  onClick={() => handleQuickLogin(acc.user, acc.pass)}
                  disabled={isSubmitting}
                  className={`p-3 rounded-lg border text-left text-xs transition flex items-center justify-between ${
                    isActive
                      ? 'bg-[#00C2FF]/10 border-[#00C2FF] text-[#00C2FF] font-bold'
                      : 'bg-[#131E33] border-[#1F2E4D] text-slate-200 hover:border-[#00C2FF]/50'
                  }`}
                >
                  <span className="text-white font-semibold">{acc.label}</span>
                  {isActive && <Check className="w-4 h-4 text-[#00C2FF] flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Login Form */}
        <form onSubmit={handleCustomLogin} className="space-y-3 pt-2 border-t border-[#1A263D]">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Or Login with Custom Credentials
          </label>

          {errorMsg && (
            <div className="bg-[#F59E0B]/10 border border-[#F59E0B]/30 text-[#F59E0B] p-2.5 rounded-lg text-xs font-medium">
              ⚠ {errorMsg}
            </div>
          )}

          <div className="space-y-2 text-xs">
            <div>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#131E33] border border-[#1F2E4D] rounded-lg p-2.5 text-white focus:outline-none focus:border-[#00C2FF] font-mono"
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#131E33] border border-[#1F2E4D] rounded-lg p-2.5 text-white focus:outline-none focus:border-[#00C2FF] font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !username || !password}
            className="w-full bg-[#00C2FF] hover:bg-[#00A8DE] text-[#0B1220] font-bold py-2.5 rounded-lg flex items-center justify-center space-x-2 transition shadow-sm"
          >
            <Key className="w-4 h-4" />
            <span>{isSubmitting ? 'Authenticating...' : 'Sign In with JWT'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
