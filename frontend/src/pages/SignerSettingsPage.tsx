import React, { useState } from 'react';
import { Settings, Shield, Cpu, Volume2, Save, ToggleLeft, ToggleRight } from 'lucide-react';

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
    <div className="space-y-6 text-slate-800 bg-[#F8FAFC] p-6 rounded-2xl min-h-screen">
      <div>
        <h1 className="text-xl font-black text-slate-800 tracking-tight flex items-center space-x-2">
          <Settings className="w-5 h-5 text-[#00C2FF]" />
          <span>Portal Settings & Preferences</span>
        </h1>
        <p className="text-xs text-slate-500">
          Configure security requirements, simulation variables, and local display controls.
        </p>
      </div>

      <div className="max-w-2xl bg-white border border-[#E2E8F0] p-6 rounded-xl shadow-sm space-y-6">
        {/* Simulator Settings */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-slate-400" />
            <span>Qiskit Simulation Engine Parameters</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-600 font-bold mb-1 uppercase text-[10px]">Simulation Execution Shots</label>
              <select
                value={shots}
                onChange={(e) => setShots(parseInt(e.target.value))}
                className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:border-[#00C2FF] font-mono"
              >
                <option value={512}>512 shots</option>
                <option value={1024}>1024 shots</option>
                <option value={2048}>2048 shots</option>
                <option value={4096}>4096 shots</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 font-bold mb-1 uppercase text-[10px]">Backend Simulator Target</label>
              <select
                value={simulator}
                onChange={(e) => setSimulator(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:border-[#00C2FF] font-mono"
              >
                <option value="qiskit_local">Qiskit Local Aer (Simulated)</option>
                <option value="ibm_cloud">IBM Quantum Cloud (Direct API)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-2">
            <Shield className="w-4 h-4 text-slate-400" />
            <span>Multi-Factor Security Credentials</span>
          </h2>

          <div className="flex items-center justify-between text-xs">
            <div>
              <strong className="block text-slate-800">Require MFA for Digital Signing Actions</strong>
              <span className="text-slate-400 text-[11px]">Require a secondary biometric or token approval before Pauli state generation.</span>
            </div>
            <button 
              onClick={() => setMfa(!mfa)}
              className="text-slate-500 hover:text-slate-700 transition"
            >
              {mfa ? (
                <ToggleRight className="w-10 h-10 text-[#00C2FF]" />
              ) : (
                <ToggleLeft className="w-10 h-10 text-slate-300" />
              )}
            </button>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div>
            {saved && (
              <span className="text-emerald-500 text-xs font-bold font-sans">
                ✓ Preferences updated and active.
              </span>
            )}
          </div>
          <button
            onClick={handleSave}
            className="bg-[#0B1220] hover:bg-[#131E33] text-[#00C2FF] font-bold px-6 py-2 rounded-lg transition text-xs border border-[#00C2FF]/30 flex items-center space-x-2 shadow-sm"
          >
            <Save className="w-4 h-4 text-[#00C2FF]" />
            <span>Save Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignerSettingsPage;
