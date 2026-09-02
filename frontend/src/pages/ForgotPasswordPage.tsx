import React, { useState } from 'react';
import { Shield, Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    try {
      const res = await api.forgotPassword(email);
      setSuccessMsg(res.message || 'If an account with that email exists, a password reset token has been generated.');
    } catch (err: any) {
      setErrorMsg('Failed to process password reset request. Please try again later.');
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
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 bg-cyan-500/15 border border-cyan-400/40 rounded-2xl text-cyan-400 mb-2 shadow-[0_0_15px_rgba(0,229,255,0.3)]">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-wide text-white">Q-SHIELD Security</h1>
          <p className="text-xs text-cyan-400 font-mono">Password Recovery Portal</p>
        </div>

        {successMsg ? (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-5 space-y-3 text-center">
            <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
            <p className="text-xs text-slate-200 leading-relaxed font-medium">{successMsg}</p>
            <a
              href="/login"
              className="inline-block mt-2 text-xs text-cyan-400 hover:underline font-bold"
            >
              Return to Login Page
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-xs text-slate-300 leading-relaxed text-center">
              Enter your registered organization email address. If an account is registered, a password reset authorization token will be issued.
            </p>

            {errorMsg && (
              <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 p-3 rounded-xl text-xs flex items-center space-x-2 font-medium">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                Account Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder="user@organization.gov"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full glass-input pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !email}
              className="w-full btn-cyan-gradient font-bold py-3 rounded-2xl text-xs flex items-center justify-center space-x-2 transition shadow-lg disabled:opacity-50 cursor-pointer"
            >
              <span>{isSubmitting ? 'Sending Reset Request...' : 'Send Password Reset Authorization'}</span>
            </button>
          </form>
        )}

        <div className="pt-4 border-t border-white/10 text-center">
          <a href="/login" className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white transition">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Main Login</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
