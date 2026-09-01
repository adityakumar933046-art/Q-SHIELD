import React, { useState } from 'react';
import { Settings, Shield, Sliders, BellRing, Save } from 'lucide-react';

export const VerifierSettingsPage: React.FC = () => {
  const [fidelityThreshold, setFidelityThreshold] = useState<number>(0.85);
  const [qberLimit, setQberLimit] = useState<number>(0.11);
  const [shots, setShots] = useState<number>(1024);
  const [alertOnLowFidelity, setAlertOnLowFidelity] = useState<boolean>(true);
  const [alertOnHighQber, setAlertOnHighQber] = useState<boolean>(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Verifier settings saved successfully!");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 select-none text-xs font-semibold text-slate-300">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-3">
          <div className="p-2 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Settings className="w-6 h-6" />
          </div>
          <span>Verifier Settings</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure local physical hardware thresholds, statistical test significance floors, and notification dispatch rules.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Verification Thresholds */}
        <div className="glass-card p-6 space-y-4">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span>Telemetry Boundaries</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 mb-1.5 uppercase text-[10px]">Fidelity Rejection Threshold (Floor)</label>
              <input
                type="number"
                step="0.01"
                min="0.5"
                max="1.0"
                value={fidelityThreshold}
                onChange={(e) => setFidelityThreshold(parseFloat(e.target.value))}
                className="w-full glass-input p-2.5 font-mono text-white text-xs"
              />
              <p className="text-[10px] text-slate-400 mt-1 font-medium">
                Reject signatures if state overlap drops below this limit. Default: 0.85
              </p>
            </div>

            <div>
              <label className="block text-slate-300 mb-1.5 uppercase text-[10px]">Quantum Bit Error Rate Limit (Ceiling)</label>
              <input
                type="number"
                step="0.01"
                min="0.0"
                max="0.5"
                value={qberLimit}
                onChange={(e) => setQberLimit(parseFloat(e.target.value))}
                className="w-full glass-input p-2.5 font-mono text-white text-xs"
              />
              <p className="text-[10px] text-slate-400 mt-1 font-medium">
                Flag potential eavesdropping if QBER exceeds this limit. Default: 0.11
              </p>
            </div>
          </div>
        </div>

        {/* Simulator Settings */}
        <div className="glass-card p-6 space-y-4">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span>Simulator Defaults</span>
          </h2>
          
          <div>
            <label className="block text-slate-300 mb-1.5 uppercase text-[10px]">Default Quantum Execution Shots</label>
            <select
              value={shots}
              onChange={(e) => setShots(parseInt(e.target.value))}
              className="w-full glass-input p-2.5 text-white bg-[#0B1220] font-mono text-xs"
            >
              <option value={512} className="bg-slate-900">512 shots</option>
              <option value={1024} className="bg-slate-900">1024 shots (Recommended)</option>
              <option value={2048} className="bg-slate-900">2048 shots</option>
              <option value={4096} className="bg-slate-900">4096 shots</option>
            </select>
            <p className="text-[10px] text-slate-400 mt-1 font-medium">
              Number of shots to run on the simulator to resolve measurement probability distributions.
            </p>
          </div>
        </div>

        {/* Alerts Settings */}
        <div className="glass-card p-6 space-y-4">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
            <BellRing className="w-4 h-4 text-cyan-400" />
            <span>Alert Preferences</span>
          </h2>
          
          <div className="space-y-3 font-semibold text-xs text-slate-300">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={alertOnLowFidelity}
                onChange={(e) => setAlertOnLowFidelity(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-900 border-white/20 accent-cyan-400"
              />
              <span>Trigger critical security incident on low fidelity detection</span>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={alertOnHighQber}
                onChange={(e) => setAlertOnHighQber(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-900 border-white/20 accent-cyan-400"
              />
              <span>Dispatch warning on critical QBER threshold violation</span>
            </label>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full btn-cyan-gradient py-3.5 rounded-2xl flex items-center justify-center font-bold text-xs tracking-wider cursor-pointer"
        >
          <Save className="w-4 h-4 mr-2 text-black" />
          <span>SAVE SYSTEM PARAMETERS</span>
        </button>
      </form>
    </div>
  );
};

export default VerifierSettingsPage;
