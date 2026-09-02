import React from 'react';
import { Shield, Cpu, Lock, CheckCircle2, Server } from 'lucide-react';

export const BrandPanel: React.FC = () => {
  return (
    <div className="h-full bg-gradient-to-br from-[#070C16] via-[#0B1220] to-[#0D182E] border-r border-[#1F2E4D]/80 p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Subtle Quantum Ambient Overlay */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[radial-gradient(circle_at_70%_30%,#00C2FF12_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[radial-gradient(circle_at_30%_70%,#A855F70F_0%,transparent_70%)] pointer-events-none" />
      
      {/* Background Decorative Quantum Grid Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1F2E4D15_1px,transparent_1px),linear-gradient(to_bottom,#1F2E4D15_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* Top Branding Header */}
      <div className="relative z-10 space-y-4">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 bg-[#00C2FF]/10 rounded-2xl border border-[#00C2FF]/30 text-[#00C2FF] shadow-lg backdrop-blur-md">
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-wider text-white">Q-SHIELD</h1>
            <p className="text-xs font-mono font-semibold text-[#00C2FF] uppercase tracking-widest">
              Enterprise Cyber Security
            </p>
          </div>
        </div>

        <p className="text-slate-400 text-xs font-mono max-w-md leading-relaxed">
          Quantum-Inspired Cyber Threat Detection Platform for Digital Signature Security
        </p>
      </div>

      {/* Center Quantum Network Visual Motif */}
      <div className="relative z-10 my-8 py-6 flex flex-col items-center justify-center">
        <div className="relative w-64 h-64 flex items-center justify-center">
          {/* Outer Quantum Orbit Ring */}
          <div className="absolute inset-0 rounded-full border border-[#00C2FF]/20 animate-spin-slow" />
          <div className="absolute inset-4 rounded-full border border-purple-500/20 border-dashed" />
          
          {/* Floating Quantum Nodes */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 p-2 bg-[#0B1220] border border-[#00C2FF]/40 rounded-xl text-[#00C2FF] shadow-md">
            <Cpu className="w-4 h-4" />
          </div>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 p-2 bg-[#0B1220] border border-[#10B981]/40 rounded-xl text-[#10B981] shadow-md">
            <Lock className="w-4 h-4" />
          </div>
          <div className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-[#0B1220] border border-purple-500/40 rounded-xl text-purple-400 shadow-md">
            <Server className="w-4 h-4" />
          </div>

          {/* Core Shield Node */}
          <div className="p-6 bg-[#070C16] border-2 border-[#00C2FF] rounded-3xl text-[#00C2FF] shadow-2xl backdrop-blur-md flex flex-col items-center justify-center space-y-1">
            <Shield className="w-10 h-10 animate-pulse" />
            <span className="text-[10px] font-mono font-bold text-white tracking-widest uppercase">QDS ENGINE</span>
          </div>
        </div>
      </div>

      {/* Bottom Security Statement & Status */}
      <div className="relative z-10 space-y-4">
        <div className="p-4 bg-[#131E33]/70 border border-[#1F2E4D] rounded-2xl backdrop-blur-md space-y-2">
          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-white">
            <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
            <span>Secure Digital Signatures. Advanced Threat Detection.</span>
          </div>
          <p className="text-[11px] text-slate-400 font-mono leading-relaxed pl-6">
            Ensuring cryptographic authenticity, Bell-state teleportation fidelity analysis, and real-time forgery detection across multi-organization tenant networks.
          </p>
        </div>

        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            <span className="text-slate-300 font-bold">Quantum Telemetry Online</span>
          </span>
          <span>Version 2.4.0</span>
        </div>
      </div>
    </div>
  );
};
