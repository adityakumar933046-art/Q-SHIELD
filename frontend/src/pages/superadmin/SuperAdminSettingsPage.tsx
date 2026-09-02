import React, { useState } from 'react';
import { Settings, Save, Shield, Sliders, CheckCircle2, AlertCircle, HardDrive } from 'lucide-react';
import { User } from '../../types';

interface SuperAdminSettingsPageProps {
  currentUser: User | null;
}

export const SuperAdminSettingsPage: React.FC<SuperAdminSettingsPageProps> = ({ currentUser }) => {
  // Essential Global Platform Settings Only
  const [platformName, setPlatformName] = useState('Q-SHIELD Platform');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [supportEmail, setSupportEmail] = useState('admin@qshield.gov');

  // Security Configuration Settings Only
  const [sessionTimeoutMins, setSessionTimeoutMins] = useState(60);
  const [maxFailedAttempts, setMaxFailedAttempts] = useState(5);
  const [lockoutDurationMins, setLockoutDurationMins] = useState(15);
  const [globalRateLimit, setGlobalRateLimit] = useState(100);

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    setTimeout(() => {
      setSaving(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    }, 800);
  };

  return (
    <div className="space-y-6 max-w-4xl font-sans">
      {/* Header Banner */}
      <div className="bg-[#0B1220] border border-[#1F2E4D] rounded-2xl p-6 shadow-xl flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-[#00C2FF]/10 border border-[#00C2FF]/30 rounded-xl text-[#00C2FF]">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">Global Platform Settings</h2>
            <p className="text-xs text-slate-400 font-mono">
              Configure essential platform governance parameters & session security rules
            </p>
          </div>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-[#10B981]/10 border border-[#10B981]/40 rounded-xl text-xs text-[#10B981] font-mono flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Global platform configuration updated and applied successfully.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* 1. Platform Settings */}
        <div className="bg-[#0B1220]/90 border border-[#1F2E4D] rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-5">
          <h3 className="text-base font-extrabold text-white flex items-center space-x-2 border-b border-[#1F2E4D] pb-3">
            <HardDrive className="w-5 h-5 text-[#00C2FF]" />
            <span>Platform Identity & Operational Status</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Platform Name
              </label>
              <input
                type="text"
                required
                value={platformName}
                onChange={(e) => setPlatformName(e.target.value)}
                className="w-full bg-[#131E33] border border-[#1F2E4D] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#00C2FF] font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Platform Support Email
              </label>
              <input
                type="email"
                required
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full bg-[#131E33] border border-[#1F2E4D] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#00C2FF] font-mono"
              />
            </div>
          </div>

          <div className="p-4 bg-[#131E33] border border-[#1F2E4D] rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-white font-mono block">
                System Maintenance Status Mode
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                When enabled, non-admin organization users receive a maintenance notice.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setMaintenanceMode(!maintenanceMode)}
              className={`px-4 py-1.5 font-mono text-xs font-bold rounded-xl border transition ${
                maintenanceMode
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              }`}
            >
              {maintenanceMode ? 'MAINTENANCE ACTIVE' : 'SYSTEM OPERATIONAL'}
            </button>
          </div>
        </div>

        {/* 2. Security Settings */}
        <div className="bg-[#0B1220]/90 border border-[#1F2E4D] rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-5">
          <h3 className="text-base font-extrabold text-white flex items-center space-x-2 border-b border-[#1F2E4D] pb-3">
            <Shield className="w-5 h-5 text-purple-400" />
            <span>Global Security Rules & Rate Limiting</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Session Timeout (Minutes)
              </label>
              <input
                type="number"
                min={15}
                max={480}
                value={sessionTimeoutMins}
                onChange={(e) => setSessionTimeoutMins(Number(e.target.value))}
                className="w-full bg-[#131E33] border border-[#1F2E4D] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-400"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Account Lockout Threshold
              </label>
              <input
                type="number"
                min={3}
                max={10}
                value={maxFailedAttempts}
                onChange={(e) => setMaxFailedAttempts(Number(e.target.value))}
                className="w-full bg-[#131E33] border border-[#1F2E4D] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-400"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Lockout Duration (Minutes)
              </label>
              <input
                type="number"
                min={5}
                max={60}
                value={lockoutDurationMins}
                onChange={(e) => setLockoutDurationMins(Number(e.target.value))}
                className="w-full bg-[#131E33] border border-[#1F2E4D] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Global Throttling Limit (Requests / Min per IP)
            </label>
            <input
              type="number"
              min={30}
              max={1000}
              value={globalRateLimit}
              onChange={(e) => setGlobalRateLimit(Number(e.target.value))}
              className="w-full max-w-xs bg-[#131E33] border border-[#1F2E4D] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-400 font-mono"
            />
          </div>
        </div>

        {/* Submit Action Button */}
        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-[#00C2FF] hover:bg-[#00A8DE] text-[#0B1220] font-extrabold text-xs rounded-xl shadow-lg transition flex items-center space-x-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Changes...' : 'Save Platform Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
