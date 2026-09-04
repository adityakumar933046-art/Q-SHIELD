import React, { useState } from 'react';
import { X, UserPlus, Shield, Lock, Key } from 'lucide-react';
import { api } from '../../services/api';
import { User } from '../../types';

interface AddTeamMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentUser: User | null;
}

export const AddTeamMemberModal: React.FC<AddTeamMemberModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentUser,
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'SIGNER' | 'VERIFIER' | 'SECURITY_ANALYST'>('SIGNER');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const names = fullName.trim().split(' ');
      const firstName = names[0] || 'User';
      const lastName = names.slice(1).join(' ') || 'Member';
      const username = `${firstName.toLowerCase()}_${Math.floor(1000 + Math.random() * 9000)}`;

      await api.createUser({
        username,
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        role: role,
        organization: currentUser?.organization || null,
        is_active: true,
      });

      setLoading(false);
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.detail ||
          err.response?.data?.email?.[0] ||
          'Failed to add team member. Please check input parameters.'
      );
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm font-sans">
      <div className="bg-[#0B1220] border border-[#1F2E4D] rounded-2xl w-full max-w-lg p-6 shadow-2xl relative text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-[#131E33] transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-xl text-purple-400">
            <UserPlus className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Add Organization Team Member</h3>
            <p className="text-xs text-slate-400 font-sans">
              Provision Signer, Verifier, or Security Analyst user account
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3.5 mb-4 bg-[#EF4444]/10 border border-[#EF4444]/40 rounded-xl text-xs text-[#EF4444] font-sans">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-sans font-bold text-slate-300 uppercase tracking-wider mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Alice Johnson"
              className="w-full bg-[#131E33] border border-[#1F2E4D] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 font-sans"
            />
          </div>

          <div>
            <label className="block text-[11px] font-sans font-bold text-slate-300 uppercase tracking-wider mb-1">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alice@organization.gov"
              className="w-full bg-[#131E33] border border-[#1F2E4D] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 font-sans"
            />
          </div>

          <div>
            <label className="block text-[11px] font-sans font-bold text-slate-300 uppercase tracking-wider mb-1">
              Assign Role *
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setRole('SIGNER')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-sans font-bold transition flex flex-col items-center justify-center space-y-1 ${
                  role === 'SIGNER'
                    ? 'bg-[#00C2FF]/15 border-[#00C2FF] text-[#00C2FF]'
                    : 'bg-[#131E33] border-[#1F2E4D] text-slate-400 hover:text-white'
                }`}
              >
                <span>SIGNER</span>
                <span className="text-[9px] font-normal text-slate-400">Issues QDS</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('VERIFIER')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-sans font-bold transition flex flex-col items-center justify-center space-y-1 ${
                  role === 'VERIFIER'
                    ? 'bg-[#10B981]/15 border-[#10B981] text-[#10B981]'
                    : 'bg-[#131E33] border-[#1F2E4D] text-slate-400 hover:text-white'
                }`}
              >
                <span>VERIFIER</span>
                <span className="text-[9px] font-normal text-slate-400">Verifies QDS</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('SECURITY_ANALYST')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-sans font-bold transition flex flex-col items-center justify-center space-y-1 ${
                  role === 'SECURITY_ANALYST'
                    ? 'bg-purple-500/15 border-purple-500 text-purple-400'
                    : 'bg-[#131E33] border-[#1F2E4D] text-slate-400 hover:text-white'
                }`}
              >
                <span>ANALYST</span>
                <span className="text-[9px] font-normal text-slate-400">Threat Alerts</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-sans font-bold text-slate-300 uppercase tracking-wider mb-1">
              Temporary Password *
            </label>
            <input
              type="text"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#131E33] border border-[#1F2E4D] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-400 font-sans"
            />
          </div>

          <div className="p-3 bg-[#131E33] border border-[#1F2E4D] rounded-xl text-[11px] font-sans text-slate-400 flex items-start space-x-2">
            <Lock className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <span>
              This user will be scoped strictly to <strong>{currentUser?.organization_name || 'your organization'}</strong> and assigned the selected operational role.
            </span>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-[#1F2E4D]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#131E33] hover:bg-[#1F2E4D] text-slate-300 text-xs font-bold rounded-xl border border-[#1F2E4D] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !fullName || !email}
              className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center space-x-2 disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4" />
              <span>{loading ? 'Creating...' : 'Provision Team Member'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
