import React, { useState, useEffect } from 'react';
import { Sliders, Save, Shield, CheckCircle2, Lock, Settings, Key } from 'lucide-react';
import { User } from '../../types';

interface OrgAdminSettingsPageProps {
  currentUser: User | null;
}

export const OrgAdminSettingsPage: React.FC<OrgAdminSettingsPageProps> = ({ currentUser }) => {
  const [orgName, setOrgName] = useState(currentUser?.organization_name || 'Defense Quantum Cyber Command');
  const [orgEmail, setOrgEmail] = useState(`admin@defensequantumcybercommand.gov`);
  const [description, setDescription] = useState('Enterprise quantum digital signature governance & threat detection node.');

  const [requireMfaForTeam, setRequireMfaForTeam] = useState(true);
  const [sessionDurationHours, setSessionDurationHours] = useState(8);
  const [allowExternalVerifiers, setAllowExternalVerifiers] = useState(true);

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (currentUser?.organization_name) {
      setOrgName(currentUser.organization_name);
      setOrgEmail(`admin@${currentUser.organization_name.toLowerCase().replace(/[^a-z0-9]/g, '')}.gov`);
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
    }, 600);
  };

  return (
    <div className="space-y-7 max-w-4xl font-sans">
      {/* Header Banner matching Panel 6 */}
      <div className="bg-white dark:bg-[#111A2E] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 sm:p-7 shadow-sm flex items-center space-x-4">
        <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/40 text-[#6366F1] dark:text-indigo-400 flex items-center justify-center shrink-0 shadow-sm">
          <Sliders className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">Organization Settings</h2>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1 font-normal">
            Manage organization profile, team access rules & operational preferences
          </p>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4.5 bg-emerald-50 border border-emerald-200/80 rounded-xl text-sm font-bold text-emerald-700 dark:bg-emerald-950/50 dark:border-emerald-800 dark:text-emerald-300 flex items-center space-x-3 shadow-sm transition">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
          <span>Organization profile and access settings saved successfully.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-7">
        {/* 1. Organization Profile Section matching Panel 6 */}
        <div className="bg-white dark:bg-[#111A2E] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 sm:p-7 shadow-sm space-y-5">
          <div className="flex items-center space-x-3 pb-4 border-b border-slate-100 dark:border-slate-800/80">
            <Settings className="w-5 h-5 text-[#6366F1] dark:text-indigo-400" />
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              Organization Profile
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                Organization Name
              </label>
              <input
                type="text"
                required
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full bg-slate-100/80 dark:bg-slate-800/80 border border-transparent dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white font-semibold focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-[#6366F1]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                Organization Email
              </label>
              <input
                type="email"
                required
                value={orgEmail}
                onChange={(e) => setOrgEmail(e.target.value)}
                className="w-full bg-slate-100/80 dark:bg-slate-800/80 border border-transparent dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white font-semibold focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-[#6366F1]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
              Organization Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-100/80 dark:bg-slate-800/80 border border-transparent dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white font-semibold focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-[#6366F1]"
            />
          </div>
        </div>

        {/* 2. Organization Access & Verification Preferences Section matching Panel 6 */}
        <div className="bg-white dark:bg-[#111A2E] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 sm:p-7 shadow-sm space-y-5">
          <div className="flex items-center space-x-3 pb-4 border-b border-slate-100 dark:border-slate-800/80">
            <Shield className="w-5 h-5 text-[#6366F1] dark:text-indigo-400" />
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              Organization Access & Verification Preferences
            </h3>
          </div>

          <div className="space-y-4">
            {/* MFA Toggle Item */}
            <div className="p-4.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 rounded-xl flex items-center justify-between">
              <div className="flex items-start space-x-3.5 pr-4">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-[#6366F1] dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Key className="w-4.5 h-4.5" />
                </div>
                <div>
                  <span className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base block">
                    Require MFA for All Team Members
                  </span>
                  <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 block font-medium">
                    Enforces 2FA TOTP verification during login for Signers, Verifiers & Analysts
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setRequireMfaForTeam(!requireMfaForTeam)}
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  requireMfaForTeam ? 'bg-[#6366F1]' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    requireMfaForTeam ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Allow External Verifiers Toggle */}
            <div className="p-4.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 rounded-xl flex items-center justify-between">
              <div className="pr-4">
                <span className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base block">
                  Allow External Organization Verifiers
                </span>
                <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 block font-medium">
                  Permits Verifiers from other registered organizations to verify QDS issued by your organization
                </span>
              </div>

              <button
                type="button"
                onClick={() => setAllowExternalVerifiers(!allowExternalVerifiers)}
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  allowExternalVerifiers ? 'bg-[#6366F1]' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    allowExternalVerifiers ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Session Timeout */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                Maximum Team Session Timeout (Hours)
              </label>
              <input
                type="number"
                min={1}
                max={24}
                value={sessionDurationHours}
                onChange={(e) => setSessionDurationHours(Number(e.target.value))}
                className="w-56 bg-slate-100/80 dark:bg-slate-800/80 border border-transparent dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white font-semibold focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-[#6366F1]"
              />
            </div>
          </div>
        </div>

        {/* Global Platform Boundary Note */}
        <div className="p-4.5 bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 rounded-xl text-sm text-slate-700 dark:text-slate-200 flex items-center space-x-3.5 shadow-sm font-medium">
          <Lock className="w-5 h-5 text-[#6366F1] dark:text-indigo-400 shrink-0" />
          <span>
            <strong className="font-extrabold text-slate-900 dark:text-white">Platform Boundary Notice:</strong> Global rate limiting, quantum engine parameters, and cross-organization provisioning belong strictly to the <strong className="font-extrabold text-slate-900 dark:text-white">Super Admin</strong>.
          </span>
        </div>

        {/* Submit Action Button */}
        <div className="flex items-center justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-7 py-3 bg-[#6366F1] hover:bg-[#4F46E5] text-white font-bold text-sm rounded-xl shadow-sm hover:shadow transition flex items-center space-x-2.5 disabled:opacity-50"
          >
            <Save className="w-4.5 h-4.5" />
            <span>{saving ? 'Saving...' : 'Save Organization Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
