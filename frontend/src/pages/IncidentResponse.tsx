import React, { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle, Clock, Search } from 'lucide-react';

interface Incident {
  incident_id: str;
  title: str;
  severity: 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'INVESTIGATING' | 'CONTAINED' | 'RESOLVED' | 'CLOSED';
  correlation_id: str;
  event_count: number;
  description: str;
  created_at: str;
}

const mockIncidents: Incident[] = [
  {
    incident_id: 'inc_rep_001',
    title: 'Correlated Security Incident (REPLAY_ATTACK)',
    severity: 'HIGH',
    status: 'INVESTIGATING',
    correlation_id: 'corr_8f9a2b1c',
    event_count: 3,
    description: 'Multiple authentication failures followed by nonce reuse replay attempt.',
    created_at: new Date().toISOString()
  },
  {
    incident_id: 'inc_forg_002',
    title: 'Correlated Security Incident (FORGERY_ATTACK)',
    severity: 'CRITICAL',
    status: 'CONTAINED',
    correlation_id: 'corr_3e7d9a1f',
    event_count: 2,
    description: 'Message digest tampering detected during QDS signature verification.',
    created_at: new Date().toISOString()
  }
];

export const IncidentResponse: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>(mockIncidents);
  const [search, setSearch] = useState('');

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'CRITICAL':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'HIGH':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'MEDIUM':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Shield className="w-7 h-7 text-cyan-400" />
            Security Incident Response & Correlation
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Real-time security event correlation, alert triage, and automated incident containment.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/60 border border-slate-700/50 p-4 rounded-xl">
          <div className="text-gray-400 text-sm font-medium">Active Incidents</div>
          <div className="text-2xl font-bold text-white mt-1">{incidents.length}</div>
        </div>
        <div className="bg-slate-800/60 border border-slate-700/50 p-4 rounded-xl">
          <div className="text-gray-400 text-sm font-medium">Critical Alerts</div>
          <div className="text-2xl font-bold text-red-400 mt-1">1</div>
        </div>
        <div className="bg-slate-800/60 border border-slate-700/50 p-4 rounded-xl">
          <div className="text-gray-400 text-sm font-medium">Automated Containments</div>
          <div className="text-2xl font-bold text-cyan-400 mt-1">2</div>
        </div>
        <div className="bg-slate-800/60 border border-slate-700/50 p-4 rounded-xl">
          <div className="text-gray-400 text-sm font-medium">MTTR (Median Recovery)</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">1.2s</div>
        </div>
      </div>

      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Active Incident Console</h2>
          <div className="relative w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Filter by ID or correlation..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg pl-9 pr-3 py-1.5 text-sm focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <div className="space-y-4">
          {incidents.map((inc) => (
            <div key={inc.incident_id} className="bg-slate-900/60 border border-slate-700/50 rounded-lg p-4 flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm text-cyan-400 font-semibold">{inc.incident_id}</span>
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded border ${getSeverityBadge(inc.severity)}`}>
                    {inc.severity}
                  </span>
                  <span className="text-xs text-gray-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                    Status: {inc.status}
                  </span>
                </div>
                <h3 className="text-white font-medium">{inc.title}</h3>
                <p className="text-gray-400 text-xs">{inc.description}</p>
                <div className="text-slate-500 text-xs font-mono">
                  Correlation ID: {inc.correlation_id} | Events Correlated: {inc.event_count}
                </div>
              </div>
              <button className="px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-lg text-xs font-medium transition">
                Investigate Forensic Chain
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default IncidentResponse;
