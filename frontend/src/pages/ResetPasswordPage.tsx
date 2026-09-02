import React, { useState, useEffect } from 'react';
import { Shield, Lock, CheckCircle, AlertCircle, Key } from 'lucide-react';
import { api } from '../services/api';

export const ResetPasswordPage: React.FC = () => {
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tok = params.get('token');
    if (tok) {
      setToken(tok);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (newPassword.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.resetPassword(token, newPassword, confirmPassword);
      setSuccessMsg(res.message || 'Password has been reset successfully. All active sessions have been revoked.');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || err.response?.data?.confirm_password?.[0] || 'Invalid or expired password reset token.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070C14] text-white flex items-center justify-center p-4">
      <div className="bg-[#0B1220] border border-[#1F2E4D] rounded-2xl max-w-md w-full p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 bg-[#00C2FF]/10 border border-[#00C2FF]/30 rounded-xl text-[#00C2FF] mb-2">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-wide">Set New Password</h1>
          <p className="text-xs text-slate-400">Secure Account Credentials Reset</p>
        </div>

        {successMsg ? (
          <div className="bg-[#10B981]/10 border border-[#10B981]/30 rounded-xl p-5 space-y-4 text-center">
            <CheckCircle className="w-8 h-8 text-[#10B981] mx-auto" />
            <p className="text-xs text-slate-200 leading-relaxed font-medium">{successMsg}</p>
            <a
              href="/"
              className="inline-block px-4 py-2.5 bg-[#00C2FF] text-[#0B1220] text-xs font-bold rounded-xl shadow-md hover:bg-[#00A8DE] transition"
            >
              Go to Login Screen
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="bg-[#F59E0B]/10 border border-[#F59E0B]/30 text-[#F59E0B] p-3 rounded-lg text-xs flex items-center space-x-2 font-medium">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Reset Authorization Token
              </label>
              <input
                type="text"
                required
                placeholder="Enter or paste token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full bg-[#131E33] border border-[#1F2E4D] rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00C2FF] font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                New Password (min 8 chars)
              </label>
              <input
                type="password"
                required
                minLength={8}
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-[#131E33] border border-[#1F2E4D] rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00C2FF] font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                minLength={8}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-[#131E33] border border-[#1F2E4D] rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00C2FF] font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !token || !newPassword || !confirmPassword}
              className="w-full bg-[#00C2FF] hover:bg-[#00A8DE] text-[#0B1220] font-bold py-3 rounded-xl text-xs flex items-center justify-center space-x-2 transition shadow-lg disabled:opacity-50"
            >
              <Key className="w-4 h-4" />
              <span>{isSubmitting ? 'Resetting Password...' : 'Confirm Password Reset'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
