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
      // Reset MFA state
      setMfaChallenge(null);
      setMfaCode('');
      setRecoveryCode('');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Invalid MFA verification code or recovery code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await api.logout();
    onUserChanged(null);
    onClose();
    window.location.href = '/login';
  };

  const handleCancelMfa = () => {
    setMfaChallenge(null);
    setMfaCode('');
    setRecoveryCode('');
    setErrorMsg('');
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
            <h2 className="text-lg font-bold tracking-wide">Q-SHIELD Authentication Console</h2>
          </div>
          <p className="text-xs text-slate-400 font-sans">
            JWT-Based Enterprise Authentication with TOTP MFA & Role-Based Access Control.
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
                <div className="text-[11px] text-[#00C2FF] font-sans font-bold uppercase">{currentUser.role}</div>
                <div className="text-[10px] text-slate-400">Organization ID: #{currentUser.organization || 'Global'}</div>
              </div>
            </div>

            <div className="pt-2 border-t border-[#1A263D] flex justify-between items-center">
              <span className="text-xs text-slate-400 font-sans">Active Session Credentials</span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white text-xs font-bold rounded-lg border border-red-500/30 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        ) : mfaChallenge ? (
          /* Step 2: MFA Verification Challenge Screen */
          <form onSubmit={handleVerifyMfa} className="space-y-4 bg-[#131E33] border border-[#00C2FF]/30 p-5 rounded-xl">
            <div className="flex items-center space-x-2 text-[#00C2FF]">
              <Smartphone className="w-5 h-5" />
              <h3 className="text-sm font-bold uppercase tracking-wider">Multi-Factor Authentication</h3>
            </div>
            <p className="text-xs text-slate-300 font-sans">
              {useRecoveryCode
                ? 'Enter an unused 8-character single-use recovery code (e.g. XXXX-XXXX).'
                : 'Enter the 6-digit TOTP verification code from your authenticator app.'}
            </p>

            {errorMsg && (
              <div className="bg-[#F59E0B]/10 border border-[#F59E0B]/30 text-[#F59E0B] p-2.5 rounded-lg text-xs font-medium font-sans">
                ⚠ {errorMsg}
              </div>
            )}

            {!useRecoveryCode ? (
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-sans">
                  6-Digit Verification Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="000000"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-[#0B1220] border border-[#1F2E4D] rounded-lg p-3 text-center text-xl tracking-[0.5em] font-sans text-[#00C2FF] focus:outline-none focus:border-[#00C2FF]"
                  autoFocus
                />
              </div>
            ) : (
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-sans">
                  Recovery Code (XXXX-XXXX)
                </label>
                <input
                  type="text"
                  placeholder="XXXX-XXXX"
                  value={recoveryCode}
                  onChange={(e) => setRecoveryCode(e.target.value.toUpperCase())}
                  className="w-full bg-[#0B1220] border border-[#1F2E4D] rounded-lg p-3 text-center text-lg tracking-widest font-sans text-[#00C2FF] focus:outline-none focus:border-[#00C2FF]"
                  autoFocus
                />
              </div>
            )}

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setUseRecoveryCode(!useRecoveryCode)}
                className="text-xs text-[#00C2FF] hover:underline flex items-center space-x-1 font-sans"
              >
                <RefreshCw className="w-3 h-3" />
                <span>{useRecoveryCode ? 'Use 6-Digit Authenticator App Code' : 'Use Single-Use Recovery Code'}</span>
              </button>
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                type="button"
                onClick={handleCancelMfa}
                className="w-1/3 bg-[#0B1220] hover:bg-black text-slate-300 font-bold py-2.5 rounded-lg border border-[#1F2E4D] text-xs transition font-sans"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || (!useRecoveryCode && mfaCode.length < 6) || (useRecoveryCode && !recoveryCode)}
                className="w-2/3 bg-[#00C2FF] hover:bg-[#00A8DE] text-[#0B1220] font-bold py-2.5 rounded-lg text-xs flex items-center justify-center space-x-2 transition shadow-sm font-sans"
              >
                <Key className="w-4 h-4" />
                <span>{isSubmitting ? 'Verifying MFA...' : 'Complete Login'}</span>
              </button>
            </div>
          </form>
        ) : (
          /* Professional Enterprise Login Form */
          <form onSubmit={handleCustomLogin} className="space-y-4 font-sans">
            <div className="flex justify-between items-center">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Enter Credentials
              </label>
              <a href="/forgot-password" onClick={onClose} className="text-[11px] text-[#00C2FF] hover:underline font-medium">
                Forgot Password?
              </a>
            </div>

            {errorMsg && (
              <div className="bg-[#F59E0B]/10 border border-[#F59E0B]/30 text-[#F59E0B] p-2.5 rounded-lg text-xs font-medium">
                ⚠ {errorMsg}
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Username or Email</label>
                <input
                  type="text"
                  placeholder="user@qshield.gov or username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-[#131E33] border border-[#1F2E4D] rounded-lg p-2.5 text-white focus:outline-none focus:border-[#00C2FF]"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Password</label>
                <input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#131E33] border border-[#1F2E4D] rounded-lg p-2.5 text-white focus:outline-none focus:border-[#00C2FF]"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !username || !password}
              className="w-full bg-[#00C2FF] hover:bg-[#00A8DE] text-[#0B1220] font-bold py-2.5 rounded-lg flex items-center justify-center space-x-2 transition shadow-sm text-xs uppercase tracking-wider disabled:opacity-50"
            >
              <Key className="w-4 h-4" />
              <span>{isSubmitting ? 'Authenticating...' : 'Sign In'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
