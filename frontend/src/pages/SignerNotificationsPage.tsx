import React from 'react';
import { Bell, ShieldAlert, Key, Info } from 'lucide-react';

export const SignerNotificationsPage: React.FC = () => {
  const notifications = [
    {
      id: 1,
      title: 'Signature Request Received',
      message: 'A verifier has requested a signature on agreement protocol document REQ-021.',
      time: '10 mins ago',
      type: 'request',
      icon: Key,
      color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 shadow-[0_0_12px_rgba(0,229,255,0.15)]',
    },
    {
      id: 2,
      title: 'Fidelity Warning Alert',
      message: 'Quantum channel node QC-Node-02 reported system phase noise variance. Average fidelity is within threshold (92.54%).',
      time: '1 hour ago',
      type: 'warning',
      icon: ShieldAlert,
      color: 'bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.15)]',
    },
    {
      id: 3,
      title: 'Signature Request Received',
      message: 'A verifier has requested a signature on agreement protocol document REQ-020.',
      time: '2 hours ago',
      type: 'request',
      icon: Key,
      color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 shadow-[0_0_12px_rgba(0,229,255,0.15)]',
    },
    {
      id: 4,
      title: 'Security System Operational',
      message: 'Non-ML Hypothesis threat detection engine is fully operational with Chi-Square significance alpha=0.05.',
      time: '1 day ago',
      type: 'info',
      icon: Info,
      color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.15)]',
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Bell className="w-4 h-4" />
          </div>
          <span>Security & Portal Notifications</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Stay up to date with QDS requests, quantum node telemetry alarms, and organizational security alerts.
        </p>
      </div>

      <div className="max-w-2xl glass-card p-6 space-y-4">
        {notifications.map((notif) => {
          const Icon = notif.icon;
          return (
            <div 
              key={notif.id} 
              className={`flex items-start space-x-4 p-4 border rounded-2xl transition hover:border-cyan-400/50 ${notif.color}`}
            >
              <div className="p-2 rounded-xl bg-white/[0.06] border border-white/10 flex-shrink-0">
                <Icon className="w-5 h-5" />
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex justify-between items-baseline">
                  <h3 className="font-extrabold text-white text-xs">{notif.title}</h3>
                  <span className="text-[10px] text-slate-400 font-mono font-medium">{notif.time}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{notif.message}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SignerNotificationsPage;
