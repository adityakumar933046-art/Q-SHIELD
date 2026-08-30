import React, { useEffect, useState } from 'react';
import { Shield, Key, AlertTriangle, Activity } from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import { api } from '../services/api';
import { AnalyticsSummary, SecurityIncident } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export const DashboardPage: React.FC = () => {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [incidents, setIncidents] = useState<SecurityIncident[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    try {
      const sumData = await api.getAnalyticsSummary();
      const incData = await api.getIncidents();
      setSummary(sumData);
      setIncidents(incData.slice(0, 5));
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500 flex items-center justify-center space-x-3 font-mono">
        <Activity className="w-5 h-5 animate-spin text-[#00C2FF]" />
        <span>INITIALIZING QUANTUM THREAT TELEMETRY...</span>
      </div>
    );
  }

  const qberVal = summary?.quantum_telemetry.system_avg_qber || 0;
  const fidelityVal = summary?.quantum_telemetry.system_avg_fidelity || 1;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#0B1220] border border-[#1A263D] rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between shadow-md text-white">
        <div className="space-y-1">
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-extrabold tracking-wide">Threat Telemetry & QDS Command</h1>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl font-medium">
            Real-time monitoring of Teleportation-based Quantum Digital Signatures, Bell-state entanglement fidelity, and non-machine-learning statistical threshold breach detection.
          </p>
        </div>

        <div className="mt-4 md:mt-0 flex items-center space-x-3">
          <div className="bg-[#131E33] px-4 py-2 rounded-lg border border-[#1F2E4D] text-right">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">System QBER Avg</span>
            <div className={`text-lg font-bold font-mono ${qberVal <= 0.11 ? 'text-[#00C2FF]' : 'text-[#F59E0B]'}`}>
              {(qberVal * 100).toFixed(2)}%
            </div>
          </div>
          <div className="bg-[#131E33] px-4 py-2 rounded-lg border border-[#1F2E4D] text-right">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">State Fidelity Avg</span>
            <div className={`text-lg font-bold font-mono ${fidelityVal >= 0.85 ? 'text-[#10B981]' : 'text-[#F59E0B]'}`}>
              {(fidelityVal * 100).toFixed(2)}%
            </div>
          </div>
        </div>
      </div>

      {/* Grid Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Signatures Issued"
          value={summary?.signatures.total || 0}
          subtitle={`${summary?.signatures.verified || 0} verified secure`}
          icon={Key}
        />
        <StatCard
          title="Total Verifications"
          value={summary?.verifications.total || 0}
          subtitle="Quantum projective checks"
          icon={Shield}
        />
        <StatCard
          title="Active Security Incidents"
          value={summary?.incidents.open || 0}
          subtitle={`${summary?.incidents.critical || 0} critical breaches`}
          icon={AlertTriangle}
        />
        <StatCard
          title="System Status"
          value={qberVal <= 0.11 ? '● OPERATIONAL' : '● BREACH'}
          subtitle="Threshold Limit: 11.00%"
          icon={Activity}
        />
      </div>

      {/* Controlled Palette Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real-time QBER Timeline Chart */}
        <div className="lg:col-span-2 bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                Quantum Bit Error Rate (QBER) Live Timeline
              </h2>
              <p className="text-xs text-slate-500">
                Continuous measurement of channel phase & bit flip noise against 11% security limit
              </p>
            </div>
            <span className="text-[10px] font-mono bg-[#00C2FF]/10 text-[#00C2FF] px-2.5 py-1 rounded border border-[#00C2FF]/30 font-bold">
              Limit: 0.11
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={summary?.qber_timeline || []}>
                <defs>
                  <linearGradient id="colorCyan" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00C2FF" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#00C2FF" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="time" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} domain={[0, 0.4]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B1220', borderColor: '#1F2E4D', color: '#FFFFFF' }}
                  formatter={(val: number) => [`${(val * 100).toFixed(2)}%`, 'QBER']}
                />
                <Area type="monotone" dataKey="qber" stroke="#00C2FF" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCyan)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Threat Category Breakdown Chart */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-3 shadow-sm">
          <div>
            <h2 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">Threat Vectors Triggered</h2>
            <p className="text-xs text-slate-500">Statistical anomalies classified by non-ML rules</p>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary?.threat_category_breakdown || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="category" stroke="#64748B" fontSize={10} tickFormatter={(val) => val.split('_')[0]} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0B1220', borderColor: '#1F2E4D', color: '#FFFFFF' }} />
                <Bar dataKey="count" fill="#0B1220" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Security Incidents Table */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-[#F59E0B]" />
            <span>Recent Threat Detection Flags</span>
          </h2>
          <span className="text-xs text-slate-500">Auto-generated via Chi-Square & QBER bounds</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0B1220] text-white uppercase font-semibold">
              <tr>
                <th className="px-4 py-3 rounded-tl-lg">Incident ID</th>
                <th className="px-4 py-3">Threat Category</th>
                <th className="px-4 py-3">Severity</th>
                <th className="px-4 py-3">QBER</th>
                <th className="px-4 py-3">Fidelity</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 rounded-tr-lg">Logged Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-slate-700 font-mono">
              {incidents.length > 0 ? (
                incidents.map((inc) => (
                  <tr key={inc.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3 font-bold text-[#0B1220]">{inc.incident_number}</td>
                    <td className="px-4 py-3 text-slate-900 font-sans font-medium">{inc.category}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={inc.severity} />
                    </td>
                    <td className="px-4 py-3 text-slate-900 font-bold">{(inc.qber * 100).toFixed(2)}%</td>
                    <td className="px-4 py-3 text-slate-900 font-bold">{(inc.fidelity * 100).toFixed(2)}%</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={inc.status} />
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-[11px] font-sans">
                      {new Date(inc.created_at).toLocaleTimeString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-slate-500 font-sans">
                    No active threat incidents. Quantum channel operating within secure statistical bounds.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
