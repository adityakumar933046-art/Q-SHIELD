import React, { useEffect, useState } from 'react';
import { User as UserIcon, Building, Mail, Shield, ShieldCheck, Activity } from 'lucide-react';
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
      <div className="p-8 text-center text-slate-500 flex items-center justify-center space-x-3 font-sans">
        <Activity className="w-5 h-5 animate-spin text-[#00C2FF]" />
        <span>PULLING PROFILE PROTOCOLS...</span>
      </div>
    );
  }

  const userOrg = organizations.find(o => o.id === currentUser?.organization) || currentUser?.organization;

  return (
    <div className="space-y-6 text-slate-800 bg-[#F8FAFC] p-6 rounded-2xl min-h-screen">
      <div>
        <h1 className="text-xl font-bold text-slate-800 tracking-tight flex items-center space-x-2">
          <UserIcon className="w-5 h-5 text-[#00C2FF]" />
          <span>My Profile & Credentials</span>
        </h1>
        <p className="text-xs text-slate-500">
          Manage your role permissions and cryptography credential profiles.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="bg-white border border-[#E2E8F0] p-6 rounded-xl shadow-sm space-y-4 md:col-span-1 text-center">
          <div className="w-24 h-24 rounded-full bg-[#0B1220] text-[#00C2FF] font-bold text-3xl flex items-center justify-center border-4 border-slate-100 shadow-inner mx-auto">
            {currentUser?.username[0].toUpperCase()}
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">
              {currentUser?.first_name && currentUser?.last_name 
                ? `${currentUser.first_name} ${currentUser.last_name}` 
                : currentUser?.username}
            </h2>
            <span className="bg-[#00C2FF]/10 text-[#00C2FF] text-[10px] font-bold px-2 py-0.5 rounded border border-[#00C2FF]/30 uppercase tracking-wider mt-1 inline-block">
              {currentUser?.role}
            </span>
          </div>

          <div className="pt-4 border-t border-slate-100 text-left text-xs space-y-3">
            <div className="flex items-center space-x-2.5 text-slate-600">
              <Mail className="w-4 h-4 text-slate-400" />
              <span>{currentUser?.email || ''}</span>
            </div>
            <div className="flex items-center space-x-2.5 text-slate-600">
              <Building className="w-4 h-4 text-slate-400" />
              <span>{currentUser?.department || 'Quantum Physics Lab'}</span>
            </div>
          </div>
        </div>

        {/* Node & Organization settings */}
        <div className="bg-white border border-[#E2E8F0] p-6 rounded-xl shadow-sm space-y-6 md:col-span-2">
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Organization Integrity Details</h3>
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Organization Name:</span>
                <span className="font-bold text-slate-800">{userOrg?.name || 'Defense Quantum Cyber Command'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Domain Domain Name:</span>
                <span className="font-bold text-slate-800">{userOrg?.domain || 'quantum.defense.gov'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Max Quantum Nodes:</span>
                <span className="font-bold text-slate-800">{userOrg?.max_quantum_nodes || '25'}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Security Credentials</h3>
            <div className="flex items-start space-x-3 bg-emerald-50 border border-emerald-100 p-4 rounded-xl text-emerald-800 text-xs">
              <ShieldCheck className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
              <div>
                <strong className="block mb-0.5">Role Verified:</strong>
                <span>You have permissions as a digital signer. This allows you to generate Pauli eigenstates for quantum digital signature teleportation keys.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignerProfilePage;
