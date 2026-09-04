import React from 'react';
import { Bell, ShieldAlert, Key, MessageSquare, Info } from 'lucide-react';

export const SignerNotificationsPage: React.FC = () => {
  const notifications = [
    {
      id: 1,
      title: 'Signature Request Received',
      message: 'A verifier has requested a signature on agreement protocol document REQ-021.',
      time: '10 mins ago',
      type: 'request',
      icon: Key,
      color: 'bg-blue-50 text-blue-500 border-blue-100',
    },
    {
      id: 2,
      title: 'Fidelity Warning Alert',
      message: 'Quantum channel node QC-Node-02 reported system phase noise variance. Average fidelity is within threshold (92.54%).',
      time: '1 hour ago',
      type: 'warning',
      icon: ShieldAlert,
      color: 'bg-amber-50 text-amber-500 border-amber-100',
    },
    {
      id: 3,
      title: 'Signature Request Received',
      message: 'A verifier has requested a signature on agreement protocol document REQ-020.',
      time: '2 hours ago',
      type: 'request',
      icon: Key,
      color: 'bg-blue-50 text-blue-500 border-blue-100',
    },
    {
      id: 4,
      title: 'Security System Operational',
      message: 'Non-ML Hypothesis threat detection engine is fully operational with Chi-Square significance alpha=0.05.',
      time: '1 day ago',
      type: 'info',
      icon: Info,
      color: 'bg-emerald-50 text-emerald-500 border-emerald-100',
    }
  ];

  return (
    <div className="space-y-6 text-slate-800 bg-[#F8FAFC] p-6 rounded-2xl min-h-screen">
      <div>
        <h1 className="text-xl font-bold text-slate-800 tracking-tight flex items-center space-x-2">
          <Bell className="w-5 h-5 text-[#00C2FF]" />
          <span>Security & Portal Notifications</span>
        </h1>
        <p className="text-xs text-slate-500">
          Stay up to date with QDS requests, quantum node telemetry alarms, and organizational security alerts.
        </p>
      </div>

      <div className="max-w-2xl bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden p-6 space-y-4">
        {notifications.map((notif) => {
          const Icon = notif.icon;
          return (
            <div 
              key={notif.id} 
              className={`flex items-start space-x-4 p-4 border rounded-xl transition hover:shadow-sm ${notif.color}`}
            >
              <div className="p-2 rounded-lg bg-white shadow-inner flex-shrink-0">
                <Icon className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between items-baseline">
                  <h3 className="font-bold text-slate-800 text-xs">{notif.title}</h3>
                  <span className="text-[10px] text-slate-400 font-semibold">{notif.time}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">{notif.message}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SignerNotificationsPage;
