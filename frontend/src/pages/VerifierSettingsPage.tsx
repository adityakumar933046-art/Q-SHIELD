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
    <div className="max-w-3xl mx-auto space-y-6 select-none text-xs font-semibold text-slate-700">
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center space-x-2">
          <Settings className="w-6 h-6 text-[#15803D]" />
          <span>Verifier Settings</span>
        </h1>
        <p className="text-xs text-slate-400 font-medium">
          Configure local physical hardware thresholds, statistical test significance floors, and notification dispatch rules.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Verification Thresholds */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-green-600" />
            <span>Telemetry Boundaries</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-500 mb-1.5">Fidelity Rejection Threshold (Floor)</label>
              <input
                type="number"
                step="0.01"
                min="0.5"
                max="1.0"
                value={fidelityThreshold}
                onChange={(e) => setFidelityThreshold(parseFloat(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-mono text-slate-700 focus:outline-none focus:ring-1 focus:ring-green-600"
              />
              <p className="text-[10px] text-slate-400 mt-1 font-medium">
                Reject signatures if state overlap drops below this limit. Default: 0.85
              </p>
            </div>

            <div>
              <label className="block text-slate-500 mb-1.5">Quantum Bit Error Rate Limit (Ceiling)</label>
              <input
                type="number"
                step="0.01"
                min="0.0"
                max="0.5"
                value={qberLimit}
                onChange={(e) => setQberLimit(parseFloat(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-mono text-slate-700 focus:outline-none focus:ring-1 focus:ring-green-600"
              />
              <p className="text-[10px] text-slate-400 mt-1 font-medium">
                Flag potential eavesdropping if QBER exceeds this limit. Default: 0.11
              </p>
            </div>
          </div>
        </div>

        {/* Simulator Settings */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-2">
            <Shield className="w-4 h-4 text-green-600" />
            <span>Simulator Defaults</span>
          </h2>
          
          <div>
            <label className="block text-slate-500 mb-1.5">Default Quantum Execution Shots</label>
            <select
              value={shots}
              onChange={(e) => setShots(parseInt(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-green-600"
            >
              <option value={512}>512 shots</option>
              <option value={1024}>1024 shots (Recommended)</option>
              <option value={2048}>2048 shots</option>
              <option value={4096}>4096 shots</option>
            </select>
            <p className="text-[10px] text-slate-400 mt-1 font-medium">
              Number of shots to run on the simulator to resolve measurement probability distributions.
            </p>
          </div>
        </div>

        {/* Alerts Settings */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-2">
            <BellRing className="w-4 h-4 text-green-600" />
            <span>Alert Preferences</span>
          </h2>
          
          <div className="space-y-3 font-semibold text-xs text-slate-700">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={alertOnLowFidelity}
                onChange={(e) => setAlertOnLowFidelity(e.target.checked)}
                className="w-4 h-4 rounded text-green-650 bg-slate-50 border-slate-200 accent-green-600 focus:ring-0 focus:ring-offset-0"
              />
              <span>Trigger critical security incident on low fidelity detection</span>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={alertOnHighQber}
                onChange={(e) => setAlertOnHighQber(e.target.checked)}
                className="w-4 h-4 rounded text-green-650 bg-slate-50 border-slate-200 accent-green-600 focus:ring-0 focus:ring-offset-0"
              />
              <span>Dispatch email/SMS warning on critical QBER threshold violation</span>
            </label>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full flex items-center justify-center py-3 bg-[#15803D] hover:bg-[#166534] text-white font-bold rounded-lg transition duration-150 text-xs tracking-wider"
        >
          <Save className="w-4 h-4 mr-2" />
          <span>SAVE SYSTEM PARAMETERS</span>
        </button>
      </form>
    </div>
  );
};
