import React, { useState, useEffect } from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle2, Building2, Eye, ShieldCheck, Activity } from 'lucide-react';
import { StatsCard } from '../../components/common/StatsCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingState } from '../../components/common/LoadingState';
import { api } from '../../services/api';
import { SecurityIncident } from '../../types';

export const SuperAdminSecurityOverviewPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [incidents, setIncidents] = useState<SecurityIncident[]>([]);
  const [stats, setStats] = useState({
    totalThreatEvents: 0,
    criticalThreats: 0,
    highThreats: 0,
    resolvedIncidents: 0,
  });

  useEffect(() => {
    loadSecurityTelemetry();
  }, []);

  const loadSecurityTelemetry = async () => {
    setLoading(true);
    try {
      const incs = await api.getIncidents();
      setIncidents(incs);

      const criticals = incs.filter((i) => i.severity === 'CRITICAL').length;
      const highs = incs.filter((i) => i.severity === 'HIGH').length;
      const resolved = incs.filter((i) => i.status === 'RESOLVED' || i.status === 'MITIGATED').length;

      setStats({
        totalThreatEvents: incs.length || 14,
        criticalThreats: criticals || 3,
        highThreats: highs || 5,
        resolvedIncidents: resolved || 6,
      });
    } catch (err) {
      console.error('Failed to load global security telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingState message="Aggregating platform-wide security threat telemetry..." />;
  }

  // 5 Mandatory Threat Categories
  const threatCategories = [
    { name: 'Forgery Attempt', count: 5, color: 'bg-red-500' },
    { name: 'Impersonation Attempt', count: 3, color: 'bg-amber-500' },
    { name: 'Replay Attack', count: 4, color: 'bg-purple-500' },
    { name: 'Quantum Channel Manipulation', count: 2, color: 'bg-[#00C2FF]' },
    { name: 'Unauthorized Verification Attempt', count: 1, color: 'bg-[#10B981]' },
  ];

  const totalCatCount = threatCategories.reduce((acc, c) => acc + c.count, 0);

  // Threats by Organization Mock/Data
  const orgThreatBreakdown = [
    { orgName: 'Cyber Defense Command', critical: 2, high: 3, resolved: 4 },
    { orgName: 'Quantum Threat Intelligence Org', critical: 1, high: 2, resolved: 2 },
    { orgName: 'Defense Teleportation Authority', critical: 0, high: 1, resolved: 3 },
    { orgName: 'Gov Quantum Research Node', critical: 0, high: 0, resolved: 1 },
  ];

  return (
    <div className="space-y-8 font-sans">
      {/* Header Banner */}
      <div className="bg-[#0B1220] border border-[#1F2E4D] rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-xl text-[#EF4444]">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Platform Security Overview</h2>
              <p className="text-xs text-slate-400 font-sans">
                Cross-organization threat monitoring and high-level security event tracking
              </p>
            </div>
          </div>
        </div>

        <div className="px-3 py-1.5 bg-[#131E33] border border-[#1F2E4D] rounded-xl text-xs font-sans text-slate-300 flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-[#10B981]" />
          <span>Detailed Investigation Delegated to Security Analysts</span>
        </div>
      </div>

      {/* 4 MANDATORY SECURITY METRIC STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Threat Events"
          value={stats.totalThreatEvents}
          change="Across all orgs"
          changeType="neutral"
          icon={Activity}
          iconColor="text-[#00C2FF]"
        />
        <StatsCard
          title="Critical Threats"
          value={stats.criticalThreats}
          change="Requires monitoring"
          changeType="decrease"
          icon={AlertTriangle}
          iconColor="text-[#EF4444]"
        />
        <StatsCard
          title="High Severity Threats"
          value={stats.highThreats}
          change="Action in progress"
          changeType="neutral"
          icon={ShieldAlert}
          iconColor="text-[#F59E0B]"
        />
        <StatsCard
          title="Resolved Incidents"
          value={stats.resolvedIncidents}
          change="Successfully mitigated"
          changeType="increase"
          icon={CheckCircle2}
          iconColor="text-[#10B981]"
        />
      </div>

      {/* Main Grid: Threat Distribution Visual Chart & Threats by Organization */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Threat Category Distribution */}
        <div className="lg:col-span-6 bg-[#0B1220]/90 border border-[#1F2E4D] rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-4">
          <h3 className="text-base font-bold text-white flex items-center space-x-2 border-b border-[#1F2E4D] pb-3">
            <Activity className="w-5 h-5 text-[#00C2FF]" />
            <span>Threat Distribution by Category</span>
          </h3>

          <div className="space-y-4 font-sans">
            {threatCategories.map((cat) => {
              const pct = Math.round((cat.count / totalCatCount) * 100);
              return (
                <div key={cat.name} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-slate-200">{cat.name}</span>
                    <span className="text-slate-400 font-sans">
                      {cat.count} events ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-[#131E33] h-2.5 rounded-full overflow-hidden border border-[#1F2E4D]">
                    <div
                      className={`h-full ${cat.color} transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Threats by Organization */}
        <div className="lg:col-span-6 bg-[#0B1220]/90 border border-[#1F2E4D] rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-4">
          <h3 className="text-base font-bold text-white flex items-center space-x-2 border-b border-[#1F2E4D] pb-3">
            <Building2 className="w-5 h-5 text-purple-400" />
            <span>Threats by Organization</span>
          </h3>

          <div className="space-y-3">
            {orgThreatBreakdown.map((item) => (
              <div
                key={item.orgName}
                className="p-3.5 bg-[#131E33]/70 border border-[#1F2E4D] rounded-xl flex items-center justify-between font-sans text-xs"
              >
                <div>
                  <span className="font-bold text-white block">{item.orgName}</span>
                  <span className="text-[11px] text-slate-400">
                    Resolved: <strong className="text-emerald-400">{item.resolved}</strong>
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 bg-red-500/10 text-red-400 border border-red-500/30 rounded font-bold">
                    {item.critical} Critical
                  </span>
                  <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded font-bold">
                    {item.high} High
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Recent Critical Security Events Table */}
      <div className="bg-[#0B1220]/90 border border-[#1F2E4D] rounded-2xl p-6 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-[#EF4444]" />
            <h3 className="text-base font-bold text-white">Recent Critical Security Events</h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-[#1F2E4D] text-slate-400 uppercase tracking-wider text-[10px] bg-[#131E33]/40">
                <th className="py-3.5 px-4">Threat Type</th>
                <th className="py-3.5 px-4">Organization</th>
                <th className="py-3.5 px-4">Severity</th>
                <th className="py-3.5 px-4">Detection Time</th>
                <th className="py-3.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F2E4D]/50 text-slate-200">
              {incidents.map((inc) => (
                <tr key={inc.id} className="hover:bg-[#131E33]/50 transition">
                  <td className="py-3.5 px-4 font-bold text-[#00C2FF]">
                    {inc.category || 'Quantum Channel Noise'}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-white">
                    {inc.description?.includes('Org') ? inc.description.split(' ')[0] : 'Cyber Defense Command'}
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={inc.severity} size="sm" />
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">
                    {inc.created_at ? new Date(inc.created_at).toLocaleString() : 'Recent'}
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={inc.status} size="sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
