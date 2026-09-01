import React, { useState } from 'react';
import { Shield, Key, Lock, User as UserIcon, X, Check, LogOut, Smartphone, RefreshCw } from 'lucide-react';
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

  // MFA Challenge State
  const [mfaChallenge, setMfaChallenge] = useState<string | null>(null);
  const [mfaCode, setMfaCode] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [useRecoveryCode, setUseRecoveryCode] = useState(false);

  if (!isOpen) return null;

  const demoAccounts = [
    { role: 'ADMIN', user: 'admin', pass: 'admin123', label: 'Super Admin' },
    { role: 'SIGNER', user: 'signer_alice', pass: 'alice123', label: 'Signer Node' },
    { role: 'VERIFIER', user: 'verifier_bob', pass: 'bob123', label: 'Verifier Portal' },
    { role: 'SECURITY_ANALYST', user: 'analyst_carol', pass: 'analyst123', label: 'Threat SOC' },
  ];

  const handleCustomLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      const res = await api.login(username, password);
      if (res.mfa_required) {
        setMfaChallenge(res.mfa_challenge);
      } else {
        const user = await api.getCurrentUser();
        onUserChanged(user);
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Invalid username or password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mfaChallenge) return;
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      await api.verifyMfaLogin(
        mfaChallenge,
        useRecoveryCode ? undefined : mfaCode,
        useRecoveryCode ? recoveryCode : undefined
      );
      const user = await api.getCurrentUser();
      onUserChanged(user);
      onClose();
      setMfaChallenge(null);
      setMfaCode('');
      setRecoveryCode('');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Invalid MFA verification code or recovery code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = async (user: string, pass: string) => {
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      const res = await api.login(user, pass);
      if (res.mfa_required) {
        setMfaChallenge(res.mfa_challenge);
      } else {
        const u = await api.getCurrentUser();
        onUserChanged(u);
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || `Failed to authenticate as ${user}.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await api.logout();
    onUserChanged(null);
    onClose();
  };

  const handleCancelMfa = () => {
    setMfaChallenge(null);
    setMfaCode('');
    setRecoveryCode('');
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-panel max-w-md w-full p-6 text-white space-y-5 rounded-3xl relative border border-white/15 shadow-2xl">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-1/4 w-32 h-32 bg-cyan-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1 relative z-10">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-400">
              <Shield className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold tracking-wide text-white">Q-SHIELD Access Console</h2>
          </div>
          <p className="text-xs text-slate-400">
            JWT-Based Quantum Access Control with TOTP Multi-Factor Authentication.
          </p>
        </div>

        {currentUser ? (
          /* Active User Profile & Logout View */
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 space-y-4 relative z-10">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 border border-cyan-400/50 text-white font-bold text-sm flex items-center justify-center shadow-[0_0_12px_rgba(0,229,255,0.4)]">
                {(currentUser.first_name || currentUser.username)[0].toUpperCase()}
              </div>
              <div className="space-y-0.5">
                <div className="text-sm font-bold text-white">{currentUser.username}</div>
                <div className="text-[11px] text-cyan-400 font-mono font-bold uppercase">{currentUser.role}</div>
                <div className="text-[10px] text-slate-400">Organization ID: #{currentUser.organization || 'Global'}</div>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 flex justify-between items-center">
              <span className="text-xs text-slate-400">Switch role or invalidate session:</span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold rounded-xl border border-rose-500/30 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        ) : mfaChallenge ? (
          /* Step 2: MFA Verification Challenge Screen */
          <form onSubmit={handleVerifyMfa} className="space-y-4 bg-white/[0.03] border border-cyan-500/30 p-5 rounded-2xl relative z-10">
            <div className="flex items-center space-x-2 text-cyan-400">
              <Smartphone className="w-5 h-5" />
              <h3 className="text-sm font-bold uppercase tracking-wider">Multi-Factor Authentication</h3>
            </div>
            <p className="text-xs text-slate-300">
              {useRecoveryCode
                ? 'Enter an unused 8-character single-use recovery code (e.g. XXXX-XXXX).'
                : 'Enter the 6-digit TOTP verification code from your authenticator app.'}
            </p>

            {errorMsg && (
              <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 p-2.5 rounded-xl text-xs font-medium">
                ⚠ {errorMsg}
              </div>
            )}

            {!useRecoveryCode ? (
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  6-Digit Verification Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="000000"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full glass-input p-3 text-center text-xl tracking-[0.5em] font-mono text-cyan-400 focus:border-cyan-400"
                  autoFocus
                />
              </div>
            ) : (
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Recovery Code (XXXX-XXXX)
                </label>
                <input
                  type="text"
                  placeholder="XXXX-XXXX"
                  value={recoveryCode}
                  onChange={(e) => setRecoveryCode(e.target.value.toUpperCase())}
                  className="w-full glass-input p-3 text-center text-lg tracking-widest font-mono text-cyan-400 focus:border-cyan-400"
                  autoFocus
                />
              </div>
            )}

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setUseRecoveryCode(!useRecoveryCode)}
                className="text-xs text-cyan-400 hover:underline flex items-center space-x-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>{useRecoveryCode ? 'Use 6-Digit Authenticator App Code' : 'Use Single-Use Recovery Code'}</span>
              </button>
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                type="button"
                onClick={handleCancelMfa}
                className="w-1/3 btn-glass font-bold py-2.5 rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || (!useRecoveryCode && mfaCode.length < 6) || (useRecoveryCode && !recoveryCode)}
                className="w-2/3 btn-cyan-gradient py-2.5 rounded-xl text-xs flex items-center justify-center space-x-2"
              >
                <Key className="w-4 h-4 text-black" />
                <span>{isSubmitting ? 'Verifying MFA...' : 'Complete Login'}</span>
              </button>
            </div>
          </form>
        ) : (
          /* Step 1: Demo Accounts & Custom Password Login */
          <div className="space-y-4 relative z-10">
            <div className="space-y-2">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Quick-Switch Demo Roles
              </label>
              <div className="grid grid-cols-2 gap-2">
                {demoAccounts.map((acc) => (
                  <button
                    key={acc.user}
                    onClick={() => handleQuickLogin(acc.user, acc.pass)}
                    disabled={isSubmitting}
                    className="p-3 rounded-2xl border text-left text-xs transition flex items-center justify-between bg-white/[0.04] border-white/10 text-slate-200 hover:border-cyan-400/50 hover:bg-white/[0.08]"
                  >
                    <span className="text-white font-semibold">{acc.label}</span>
                    <span className="text-[10px] text-cyan-400 font-mono">→</span>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleCustomLogin} className="space-y-3 pt-2 border-t border-white/10">
              <div className="flex justify-between items-center">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Custom Credentials
                </label>
                <a href="/forgot-password" onClick={onClose} className="text-[10px] text-cyan-400 hover:underline font-medium">
                  Forgot Password?
                </a>
              </div>

              {errorMsg && (
                <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 p-2.5 rounded-xl text-xs font-medium">
                  ⚠ {errorMsg}
                </div>
              )}

              <div className="space-y-2 text-xs">
                <div>
                  <input
                    type="text"
                    placeholder="Username or Email"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full glass-input p-2.5 text-white focus:border-cyan-400 font-mono text-xs"
                  />
                </div>
                <div>
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full glass-input p-2.5 text-white focus:border-cyan-400 font-mono text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !username || !password}
                className="w-full btn-cyan-gradient py-2.5 rounded-xl flex items-center justify-center space-x-2 text-xs"
              >
                <Key className="w-4 h-4 text-black" />
                <span>{isSubmitting ? 'Authenticating...' : 'Sign In with JWT'}</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
