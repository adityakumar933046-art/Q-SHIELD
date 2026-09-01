import React, { useState, useEffect } from 'react';
import { Shield, CheckCircle, AlertCircle, Key } from 'lucide-react';
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
    <div className="min-h-screen bg-[#070B14] text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glows */}
      <div className="fixed top-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="glass-panel-glow rounded-3xl max-w-md w-full p-8 shadow-2xl space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 bg-cyan-500/15 border border-cyan-400/40 rounded-2xl text-cyan-400 mb-2 shadow-[0_0_15px_rgba(0,229,255,0.3)]">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-wide text-white">Set New Password</h1>
          <p className="text-xs text-cyan-400 font-mono">Secure Account Credentials Reset</p>
        </div>

        {successMsg ? (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-5 space-y-4 text-center">
            <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
            <p className="text-xs text-slate-200 leading-relaxed font-medium">{successMsg}</p>
            <a
              href="/login"
              className="inline-block px-5 py-2.5 btn-cyan-gradient text-xs font-bold rounded-xl shadow-md cursor-pointer"
            >
              Go to Login Screen
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 p-3 rounded-xl text-xs flex items-center space-x-2 font-medium">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                Reset Authorization Token
              </label>
              <input
                type="text"
                required
                placeholder="Enter or paste token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full glass-input px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                New Password (min 8 chars)
              </label>
              <input
                type="password"
                required
                minLength={8}
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full glass-input px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                minLength={8}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full glass-input px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !token || !newPassword || !confirmPassword}
              className="w-full btn-cyan-gradient font-bold py-3 rounded-2xl text-xs flex items-center justify-center space-x-2 transition shadow-lg disabled:opacity-50 cursor-pointer"
            >
              <Key className="w-4 h-4 text-black" />
              <span>{isSubmitting ? 'Resetting Password...' : 'Confirm Password Reset'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
