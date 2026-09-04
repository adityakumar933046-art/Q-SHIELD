import React, { useState } from 'react';
import { X, UserPlus, Lock } from 'lucide-react';
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
  const [password, setPassword] = useState('TempPass123!');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm font-sans">
      <div className="bg-white dark:bg-[#111A2E] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative text-slate-900 dark:text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-white p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/40 rounded-xl text-[#6366F1] dark:text-indigo-400">
            <UserPlus className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add Organization Team Member</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Provision Signer, Verifier, or Security Analyst user account
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3.5 mb-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 dark:bg-rose-950/50 dark:border-rose-800 dark:text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Alice Johnson"
              className="w-full bg-slate-100/80 dark:bg-slate-800/80 border border-transparent dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-[#6366F1]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alice@quantum.defense.gov"
              className="w-full bg-slate-100/80 dark:bg-slate-800/80 border border-transparent dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-[#6366F1]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
              Assign Role *
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setRole('SIGNER')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition flex flex-col items-center justify-center space-y-0.5 ${
                  role === 'SIGNER'
                    ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-400 text-sky-700 dark:text-sky-300'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <span>SIGNER</span>
                <span className="text-[10px] font-normal text-slate-400">Issues QDS</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('VERIFIER')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition flex flex-col items-center justify-center space-y-0.5 ${
                  role === 'VERIFIER'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 border-[#6366F1] text-[#6366F1] dark:text-indigo-300'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <span>VERIFIER</span>
                <span className="text-[10px] font-normal text-slate-400">Verifies QDS</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('SECURITY_ANALYST')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition flex flex-col items-center justify-center space-y-0.5 ${
                  role === 'SECURITY_ANALYST'
                    ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-400 text-purple-700 dark:text-purple-300'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <span>ANALYST</span>
                <span className="text-[10px] font-normal text-slate-400">Threat Alerts</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
              Temporary Password *
            </label>
            <input
              type="text"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-100/80 dark:bg-slate-800/80 border border-transparent dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-[#6366F1]"
            />
          </div>

          <div className="p-3 bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 rounded-xl text-[11px] text-slate-600 dark:text-slate-400 flex items-start space-x-2">
            <Lock className="w-4 h-4 text-[#6366F1] shrink-0 mt-0.5" />
            <span>
              This user will be scoped strictly to <strong>{currentUser?.organization_name || 'Defense Quantum Cyber Command'}</strong> and assigned the selected operational role.
            </span>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !fullName || !email}
              className="px-5 py-2 bg-[#6366F1] hover:bg-[#4F46E5] text-white font-semibold text-xs rounded-xl shadow-sm transition flex items-center space-x-2 disabled:opacity-50"
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
