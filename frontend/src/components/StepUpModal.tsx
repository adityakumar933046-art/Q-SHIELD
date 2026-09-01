import React, { useState } from 'react';
import { Key, Lock, X, AlertTriangle, Smartphone } from 'lucide-react';
import { api } from '../services/api';

interface StepUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (stepUpToken: string) => void;
}

export const StepUpModal: React.FC<StepUpModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [method, setMethod] = useState<'TOTP' | 'PASSWORD'>('TOTP');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const res = await api.verifyStepUp(
        method === 'TOTP' ? code : undefined,
        method === 'PASSWORD' ? password : undefined
      );
      onSuccess(res.step_up_token);
      onClose();
      setCode('');
      setPassword('');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Step-up authentication failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-panel border border-amber-500/30 rounded-3xl max-w-md w-full p-6 text-white space-y-5 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-amber-400">
            <AlertTriangle className="w-5 h-5" />
            <h2 className="text-base font-bold tracking-wide">Step-Up Authentication Required</h2>
          </div>
          <p className="text-xs text-slate-300">
            Digital Signature Issuance is a privileged cryptographic operation. Re-authenticating is required before signing this payload.
          </p>
        </div>

        {errorMsg && (
          <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 p-2.5 rounded-xl text-xs font-medium">
            ⚠ {errorMsg}
          </div>
        )}

        {/* Method Toggle */}
        <div className="flex border border-white/10 rounded-2xl p-1 bg-white/[0.03] text-xs font-semibold">
          <button
            type="button"
            onClick={() => setMethod('TOTP')}
            className={`flex-1 py-2 rounded-xl transition flex items-center justify-center space-x-1.5 ${
              method === 'TOTP' ? 'cyber-active-pill font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>MFA Code</span>
          </button>
          <button
            type="button"
            onClick={() => setMethod('PASSWORD')}
            className={`flex-1 py-2 rounded-xl transition flex items-center justify-center space-x-1.5 ${
              method === 'PASSWORD' ? 'cyber-active-pill font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Account Password</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {method === 'TOTP' ? (
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Enter 6-Digit Authenticator Code
              </label>
              <input
                type="text"
                maxLength={6}
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                className="w-full glass-input p-3 text-center text-xl tracking-[0.5em] font-mono text-cyan-400 focus:border-cyan-400"
                autoFocus
              />
            </div>
          ) : (
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Enter Account Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full glass-input p-2.5 text-xs text-white focus:border-cyan-400 font-mono"
                autoFocus
              />
            </div>
          )}

          <div className="flex space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 btn-glass font-bold py-2.5 rounded-xl text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || (method === 'TOTP' && code.length < 6) || (method === 'PASSWORD' && !password)}
              className="w-2/3 btn-cyan-gradient py-2.5 rounded-xl text-xs flex items-center justify-center space-x-2 font-bold"
            >
              <Key className="w-4 h-4 text-black" />
              <span>{isSubmitting ? 'Verifying...' : 'Authorize Signature'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
