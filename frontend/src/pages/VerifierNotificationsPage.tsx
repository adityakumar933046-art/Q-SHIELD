import React, { useState } from 'react';
import { Bell, ShieldAlert, CheckCircle2, Info, Calendar } from 'lucide-react';

interface SystemNotification {
  id: number;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING';
  timestamp: string;
  read: boolean;
}

export const VerifierNotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<SystemNotification[]>([
    {
      id: 1,
      title: "Active Eavesdropping Attempt Mitigated",
      message: "Replay attack detected and blocked on signature QDS-140. Quantum statevector collapsed.",
      type: "WARNING",
      timestamp: "21 Apr 2025, 10:45 AM",
      read: false
    },
    {
      id: 2,
      title: "Teleportation Key Authenticated Successfully",
      message: "QDS-142 has been verified secure. Baseline overlap fidelity exceeded 97.69%.",
      type: "SUCCESS",
      timestamp: "21 Apr 2025, 11:10 AM",
      read: false
    },
    {
      id: 3,
      title: "System Threshold Rules Sync Completed",
      message: "Fidelity bounds and chi-square significance metrics updated from central security policy.",
      type: "INFO",
      timestamp: "21 Apr 2025, 09:00 AM",
      read: true
    }
  ]);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 select-none">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-3">
            <div className="p-2 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Bell className="w-6 h-6" />
            </div>
            <span>System Notifications</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time security warnings, state collapse events, and protocol update flags.
          </p>
        </div>
        <button
          onClick={markAllRead}
          className="text-xs font-bold text-cyan-400 hover:text-cyan-300 transition"
        >
          Mark all as read
        </button>
      </div>

      <div className="space-y-4">
        {notifications.map((item) => {
          const isWarning = item.type === 'WARNING';
          const isSuccess = item.type === 'SUCCESS';
          
          return (
            <div 
              key={item.id} 
              className={`glass-card p-5 flex items-start space-x-4 hover:border-cyan-500/40 transition relative ${
                !item.read ? 'border-l-4 border-l-cyan-400' : ''
              }`}
            >
              <div className="shrink-0">
                {isWarning && (
                  <div className="p-2 bg-rose-500/15 text-rose-400 border border-rose-500/30 rounded-xl">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                )}
                {isSuccess && (
                  <div className="p-2 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-xl">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                )}
                {item.type === 'INFO' && (
                  <div className="p-2 bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 rounded-xl">
                    <Info className="w-5 h-5" />
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <h4 className="text-white font-bold">{item.title}</h4>
                  <div className="flex items-center space-x-1.5 text-slate-400 font-mono text-[10px]">
                    <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{item.timestamp}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {item.message}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VerifierNotificationsPage;
