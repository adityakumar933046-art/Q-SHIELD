import React, { useState } from 'react';
import { Settings, Shield, Cpu, Save, ToggleLeft, ToggleRight } from 'lucide-react';

export const SignerSettingsPage: React.FC = () => {
  const [shots, setShots] = useState(1024);
  const [mfa, setMfa] = useState(false);
  const [simulator, setSimulator] = useState('qiskit_local');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Settings className="w-4 h-4" />
          </div>
          <span>Portal Settings & Preferences</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure security requirements, simulation variables, and local display controls.
        </p>
      </div>

      <div className="max-w-2xl glass-card p-6 space-y-6">
        {/* Simulator Settings */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-white flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>Qiskit Simulation Engine Parameters</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-bold mb-1 uppercase text-[10px]">Simulation Execution Shots</label>
              <select
                value={shots}
                onChange={(e) => setShots(parseInt(e.target.value))}
                className="w-full glass-input p-2.5 text-white font-mono bg-[#0B1220]"
              >
                <option value={512} className="bg-slate-900">512 shots</option>
                <option value={1024} className="bg-slate-900">1024 shots</option>
                <option value={2048} className="bg-slate-900">2048 shots</option>
                <option value={4096} className="bg-slate-900">4096 shots</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1 uppercase text-[10px]">Backend Simulator Target</label>
              <select
                value={simulator}
                onChange={(e) => setSimulator(e.target.value)}
                className="w-full glass-input p-2.5 text-white font-mono bg-[#0B1220]"
              >
                <option value="qiskit_local" className="bg-slate-900">Qiskit Local Aer (Simulated)</option>
                <option value="ibm_cloud" className="bg-slate-900">IBM Quantum Cloud (Direct API)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="space-y-4 pt-4 border-t border-white/10">
          <h2 className="text-xs font-bold uppercase tracking-wider text-white flex items-center space-x-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span>Multi-Factor Security Credentials</span>
          </h2>

          <div className="flex items-center justify-between text-xs">
            <div>
              <strong className="block text-white">Require MFA for Digital Signing Actions</strong>
              <span className="text-slate-400 text-[11px]">Require a secondary biometric or token approval before Pauli state generation.</span>
            </div>
            <button 
              onClick={() => setMfa(!mfa)}
              className="text-slate-400 hover:text-white transition"
            >
              {mfa ? (
                <ToggleRight className="w-10 h-10 text-cyan-400" />
              ) : (
                <ToggleLeft className="w-10 h-10 text-slate-600" />
              )}
            </button>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
          <div>
            {saved && (
              <span className="text-emerald-400 text-xs font-bold font-mono">
                ✓ Preferences updated and active.
              </span>
            )}
          </div>
          <button
            onClick={handleSave}
            className="btn-cyan-gradient px-6 py-2.5 rounded-xl transition text-xs flex items-center space-x-2 cursor-pointer"
          >
            <Save className="w-4 h-4 text-black" />
            <span className="font-bold">Save Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignerSettingsPage;
