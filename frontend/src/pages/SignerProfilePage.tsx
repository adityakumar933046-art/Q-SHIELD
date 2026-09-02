import React, { useEffect, useState } from 'react';
import { User as UserIcon, Building, Mail, ShieldCheck, Activity } from 'lucide-react';
import { api } from '../services/api';

export const SignerProfilePage: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const u = await api.getCurrentUser();
        setCurrentUser(u);
        const orgs = await api.getOrganizations();
        setOrganizations(orgs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400 flex items-center justify-center space-x-3 font-mono">
        <Activity className="w-5 h-5 animate-spin text-cyan-400" />
        <span>PULLING PROFILE PROTOCOLS...</span>
      </div>
    );
  }

  const userOrg = organizations.find(o => o.id === currentUser?.organization) || currentUser?.organization;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <UserIcon className="w-4 h-4" />
          </div>
          <span>My Profile & Credentials</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage your role permissions and cryptography credential profiles.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="glass-card p-6 space-y-4 md:col-span-1 text-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-cyan-500/20 to-blue-600/20 border-2 border-cyan-400/50 text-cyan-400 font-extrabold text-3xl flex items-center justify-center shadow-[0_0_20px_rgba(0,229,255,0.3)] mx-auto relative overflow-hidden">
            <div className="absolute inset-0 bg-cyan-400/10 animate-pulse" />
            <span className="relative z-10">{currentUser?.username[0].toUpperCase()}</span>
          </div>
          <div>
            <h2 className="text-base font-extrabold text-white">
              {currentUser?.first_name && currentUser?.last_name 
                ? `${currentUser.first_name} ${currentUser.last_name}` 
                : currentUser?.username}
            </h2>
            <span className="bg-cyan-500/10 text-cyan-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-cyan-500/30 uppercase tracking-wider mt-1.5 inline-block font-mono shadow-[0_0_8px_rgba(0,229,255,0.2)]">
              {currentUser?.role}
            </span>
          </div>

          <div className="pt-4 border-t border-white/10 text-left text-xs space-y-3">
            <div className="flex items-center space-x-2.5 text-slate-300">
              <Mail className="w-4 h-4 text-cyan-400" />
              <span>{currentUser?.email || 'signer@qshield.quantum'}</span>
            </div>
            <div className="flex items-center space-x-2.5 text-slate-300">
              <Building className="w-4 h-4 text-cyan-400" />
              <span>{currentUser?.department || 'Quantum Cryptography Lab'}</span>
            </div>
          </div>
        </div>

        {/* Node & Organization settings */}
        <div className="glass-card p-6 space-y-6 md:col-span-2">
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">Organization Integrity Details</h3>
            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 space-y-2.5 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-slate-400">Organization Name:</span>
                <span className="font-bold text-white">{userOrg?.name || 'Defense Quantum Cyber Command'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-slate-400">Domain Node Name:</span>
                <span className="font-bold text-cyan-400">{userOrg?.domain || 'quantum.defense.gov'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Max Quantum Nodes:</span>
                <span className="font-bold text-emerald-400">{userOrg?.max_quantum_nodes || '25'} Nodes</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">Security Credentials</h3>
            <div className="flex items-start space-x-3 bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-2xl text-slate-300 text-xs shadow-[0_0_15px_rgba(16,185,129,0.15)]">
              <ShieldCheck className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
              <div>
                <strong className="block mb-0.5 text-emerald-400">Role Verified:</strong>
                <span>You have permissions as a verified digital signer. This allows you to generate Pauli eigenstates for quantum digital signature teleportation keys.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignerProfilePage;
