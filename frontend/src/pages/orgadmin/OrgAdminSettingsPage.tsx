import React, { useState, useEffect } from 'react';
import { Sliders, Save, Building2, Shield, CheckCircle2, Lock } from 'lucide-react';
import { User } from '../../types';

interface OrgAdminSettingsPageProps {
  currentUser: User | null;
}

export const OrgAdminSettingsPage: React.FC<OrgAdminSettingsPageProps> = ({ currentUser }) => {
  const [orgName, setOrgName] = useState(currentUser?.organization_name || 'Cyber Defense Command');
  const [orgEmail, setOrgEmail] = useState(`admin@${currentUser?.organization_name?.toLowerCase().replace(/\s+/g, '') || 'cdc'}.gov`);
  const [description, setDescription] = useState('Enterprise quantum digital signature governance & threat detection node.');

  // Basic Organization-Level Security Rules
  const [requireMfaForTeam, setRequireMfaForTeam] = useState(true);
  const [sessionDurationHours, setSessionDurationHours] = useState(8);
  const [allowExternalVerifiers, setAllowExternalVerifiers] = useState(true);

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (currentUser?.organization_name) {
      setOrgName(currentUser.organization_name);
    }
  }, [currentUser]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    setTimeout(() => {
      setSaving(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    }, 700);
  };

  return (
    <div className="space-y-6 max-w-4xl font-sans">
      {/* Header Banner */}
      <div className="bg-[#0B1220] border border-[#1F2E4D] rounded-2xl p-6 shadow-xl flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-purple-500/10 border border-purple-500/30 rounded-xl text-purple-400">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">Organization Settings</h2>
            <p className="text-xs text-slate-400 font-mono">
              Manage organization profile, team access rules & operational preferences
            </p>
          </div>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-[#10B981]/10 border border-[#10B981]/40 rounded-xl text-xs text-[#10B981] font-mono flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Organization profile and access settings saved successfully.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* 1. Organization Profile */}
        <div className="bg-[#0B1220]/90 border border-[#1F2E4D] rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-5">
          <h3 className="text-base font-extrabold text-white flex items-center space-x-2 border-b border-[#1F2E4D] pb-3">
            <Building2 className="w-5 h-5 text-purple-400" />
            <span>Organization Profile</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Organization Name
              </label>
              <input
                type="text"
                required
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full bg-[#131E33] border border-[#1F2E4D] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-400 font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Organization Email
              </label>
              <input
                type="email"
                required
                value={orgEmail}
                onChange={(e) => setOrgEmail(e.target.value)}
                className="w-full bg-[#131E33] border border-[#1F2E4D] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-400 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Organization Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#131E33] border border-[#1F2E4D] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-400 font-mono"
            />
          </div>
        </div>

        {/* 2. Basic Organization Security Rules */}
        <div className="bg-[#0B1220]/90 border border-[#1F2E4D] rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-5">
          <h3 className="text-base font-extrabold text-white flex items-center space-x-2 border-b border-[#1F2E4D] pb-3">
            <Shield className="w-5 h-5 text-[#00C2FF]" />
            <span>Organization Access & Verification Preferences</span>
          </h3>

          <div className="space-y-4 font-mono text-xs">
            <div className="p-4 bg-[#131E33] border border-[#1F2E4D] rounded-xl flex items-center justify-between">
              <div>
                <span className="font-bold text-white block">Require MFA for All Team Members</span>
                <span className="text-[11px] text-slate-400 font-normal">
                  Enforces 2FA TOTP verification during login for Signers, Verifiers & Analysts
                </span>
              </div>
              <input
                type="checkbox"
                checked={requireMfaForTeam}
                onChange={(e) => setRequireMfaForTeam(e.target.checked)}
                className="w-4 h-4 accent-purple-500 rounded cursor-pointer"
              />
            </div>

            <div className="p-4 bg-[#131E33] border border-[#1F2E4D] rounded-xl flex items-center justify-between">
              <div>
                <span className="font-bold text-white block">Allow External Organization Verifiers</span>
                <span className="text-[11px] text-slate-400 font-normal">
                  Permits Verifiers from other registered organizations to verify QDS issued by your organization
                </span>
              </div>
              <input
                type="checkbox"
                checked={allowExternalVerifiers}
                onChange={(e) => setAllowExternalVerifiers(e.target.checked)}
                className="w-4 h-4 accent-purple-500 rounded cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Maximum Team Session Timeout (Hours)
              </label>
              <input
                type="number"
                min={1}
                max={24}
                value={sessionDurationHours}
                onChange={(e) => setSessionDurationHours(Number(e.target.value))}
                className="w-48 bg-[#131E33] border border-[#1F2E4D] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-400"
              />
            </div>
          </div>
        </div>

        {/* Global Settings Note */}
        <div className="p-4 bg-[#131E33] border border-[#1F2E4D] rounded-xl text-xs font-mono text-slate-300 flex items-center space-x-3">
          <Lock className="w-5 h-5 text-purple-400 shrink-0" />
          <span>
            <strong>Platform Boundary Notice:</strong> Global rate limiting, quantum engine parameters, and cross-organization provisioning belong strictly to the <strong>Super Admin</strong>.
          </span>
        </div>

        {/* Submit Action Button */}
        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition flex items-center space-x-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Organization Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
