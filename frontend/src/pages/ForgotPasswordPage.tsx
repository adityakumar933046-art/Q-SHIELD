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
    <div className="min-h-screen bg-[#070C14] text-white flex items-center justify-center p-4">
      <div className="bg-[#0B1220] border border-[#1F2E4D] rounded-2xl max-w-md w-full p-8 shadow-2xl space-y-6 relative">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 bg-[#00C2FF]/10 border border-[#00C2FF]/30 rounded-xl text-[#00C2FF] mb-2">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-wide">Q-SHIELD Security</h1>
          <p className="text-xs text-slate-400">Password Recovery Portal</p>
        </div>

        {successMsg ? (
          <div className="bg-[#10B981]/10 border border-[#10B981]/30 rounded-xl p-5 space-y-3 text-center">
            <CheckCircle className="w-8 h-8 text-[#10B981] mx-auto" />
            <p className="text-xs text-slate-200 leading-relaxed font-medium">{successMsg}</p>
            <a
              href="/"
              className="inline-block mt-2 text-xs text-[#00C2FF] hover:underline font-bold"
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
              <div className="bg-[#F59E0B]/10 border border-[#F59E0B]/30 text-[#F59E0B] p-3 rounded-lg text-xs flex items-center space-x-2 font-medium">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Account Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder="user@organization.gov"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#131E33] border border-[#1F2E4D] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00C2FF] font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !email}
              className="w-full bg-[#00C2FF] hover:bg-[#00A8DE] text-[#0B1220] font-bold py-3 rounded-xl text-xs flex items-center justify-center space-x-2 transition shadow-lg disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Sending Reset Request...' : 'Send Password Reset Authorization'}</span>
            </button>
          </form>
        )}

        <div className="pt-4 border-t border-[#1F2E4D]/50 text-center">
          <a href="/" className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white transition">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Main Login</span>
          </a>
        </div>
      </div>
    </div>
  );
};
