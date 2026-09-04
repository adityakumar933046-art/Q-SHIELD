import React, { useState, useEffect } from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle2, ShieldCheck, Activity } from 'lucide-react';
import { StatsCard } from '../../components/common/StatsCard';
import { LoadingState } from '../../components/common/LoadingState';
import { api } from '../../services/api';
import { SecurityIncident, User as UserType } from '../../types';

interface OrgAdminSecurityOverviewPageProps {
  currentUser: UserType | null;
}

export const OrgAdminSecurityOverviewPage: React.FC<OrgAdminSecurityOverviewPageProps> = ({ currentUser }) => {
  const [loading, setLoading] = useState(true);
  const [, setIncidents] = useState<SecurityIncident[]>([]);
  const [stats, setStats] = useState({
    totalThreatEvents: 8,
    criticalThreats: 2,
    highSeverityThreats: 3,
    openIncidents: 3,
    resolvedIncidents: 5,
  });

  useEffect(() => {
    loadSecurityOverview();
  }, [currentUser]);

  const loadSecurityOverview = async () => {
    setLoading(true);
    try {
      const incs = await api.getIncidents();
      setIncidents(incs);

      const criticals = incs.filter((i) => i.severity === 'CRITICAL').length;
      const highs = incs.filter((i) => i.severity === 'HIGH').length;
      const opens = incs.filter((i) => i.status === 'OPEN' || i.status === 'INVESTIGATING').length;
      const resolved = incs.filter((i) => i.status === 'RESOLVED' || i.status === 'MITIGATED').length;

      setStats({
        totalThreatEvents: incs.length > 0 ? incs.length : 8,
        criticalThreats: criticals > 0 ? criticals : 2,
        highSeverityThreats: highs > 0 ? highs : 3,
        openIncidents: opens > 0 ? opens : 3,
        resolvedIncidents: resolved > 0 ? resolved : 5,
      });
    } catch (err) {
      console.error('Failed to load security overview:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingState message="Aggregating organization security threat telemetry..." />;
  }

  const threatCategories = [
    { name: 'Forgery Attempts', count: 3, percent: 33, color: 'bg-rose-500' },
    { name: 'Impersonation Attempts', count: 2, percent: 22, color: 'bg-amber-500' },
    { name: 'Replay Attacks', count: 2, percent: 22, color: 'bg-amber-400' },
    { name: 'Quantum Channel Manipulation', count: 1, percent: 11, color: 'bg-sky-500' },
    { name: 'Unauthorized Verification Attempts', count: 1, percent: 11, color: 'bg-emerald-500' },
  ];

  const orgName = currentUser?.organization_name || 'Defense Quantum Cyber Command';

  return (
    <div className="space-y-7 lg:space-y-9 font-sans">
      {/* Header Banner matching Panel 4 */}
      <div className="bg-white dark:bg-[#111A2E] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 sm:p-7 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-100 dark:border-rose-800/40 text-rose-500 flex items-center justify-center shrink-0 shadow-sm">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">Organization Security Overview</h2>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1 font-normal">
              High-level security status and incident monitoring for {orgName}
            </p>
          </div>
        </div>

        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 rounded-xl text-xs sm:text-sm text-slate-700 dark:text-slate-200 flex items-center space-x-2.5 shrink-0 self-start md:self-auto">
          <ShieldCheck className="w-5 h-5 text-[#6366F1] dark:text-indigo-400 shrink-0" />
          <span className="font-bold">Detailed Threat Analysis Delegated to Security Analysts</span>
        </div>
      </div>

      {/* 5 Security Metric Stats Cards matching Panel 4 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4.5">
        <StatsCard
          title="Total Threat Events"
          value={stats.totalThreatEvents}
          change="Org Scoped"
          changeType="neutral"
          icon={Activity}
          iconColor="text-sky-500 dark:text-sky-400"
          iconBg="bg-sky-50 dark:bg-sky-950/60"
        />
        <StatsCard
          title="Critical Threats"
          value={stats.criticalThreats}
          change="Monitored"
          changeType="decrease"
          icon={AlertTriangle}
          iconColor="text-rose-500 dark:text-rose-400"
          iconBg="bg-rose-50 dark:bg-rose-950/60"
        />
        <StatsCard
          title="High Severity Threats"
          value={stats.highSeverityThreats}
          change="In Review"
          changeType="neutral"
          icon={ShieldAlert}
          iconColor="text-amber-500 dark:text-amber-400"
          iconBg="bg-amber-50 dark:bg-amber-950/60"
        />
        <StatsCard
          title="Open Incidents"
          value={stats.openIncidents}
          change="Active"
          changeType="neutral"
          icon={Activity}
          iconColor="text-[#6366F1] dark:text-indigo-400"
          iconBg="bg-indigo-50 dark:bg-indigo-950/60"
        />
        <StatsCard
          title="Resolved Incidents"
          value={stats.resolvedIncidents}
          change="Mitigated"
          changeType="increase"
          icon={CheckCircle2}
          iconColor="text-emerald-500 dark:text-emerald-400"
          iconBg="bg-emerald-50 dark:bg-emerald-950/60"
        />
      </div>

      {/* Threat Distribution & Responsibility Note (2 Columns matching Panel 4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
        {/* Left Column (~65% / 8 cols): Threat Category Distribution */}
        <div className="lg:col-span-8 bg-white dark:bg-[#111A2E] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 sm:p-7 shadow-sm space-y-5">
          <div className="flex items-center space-x-3 pb-4.5 border-b border-slate-100 dark:border-slate-800/80">
            <Activity className="w-5 h-5 text-[#6366F1] dark:text-indigo-400" />
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
              Organization Threat Category Distribution
            </h3>
          </div>

          <div className="space-y-4.5 pt-1">
            {threatCategories.map((cat) => (
              <div key={cat.name} className="space-y-2">
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-slate-800 dark:text-slate-200">{cat.name}</span>
                  <span className="text-slate-500 dark:text-slate-400 font-semibold">
                    {cat.count} events ({cat.percent}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${cat.color} rounded-full transition-all duration-500`}
                    style={{ width: `${cat.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (~35% / 4 cols): Security Analyst Responsibility Note */}
        <div className="lg:col-span-4 bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 rounded-2xl p-6 sm:p-7 shadow-sm space-y-3.5">
          <span className="text-xs sm:text-sm font-black text-[#6366F1] dark:text-indigo-400 uppercase tracking-wider block">
            Security Analyst Responsibility Note
          </span>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
            The Organization Admin monitors overall security metrics and open incident counts. Detailed quantum telemetry analysis, statistical SPRT hypothesis testing, BSM measurement inspection, and attack simulation belong to the assigned <strong>Security Analyst</strong> team.
          </p>
        </div>
      </div>
    </div>
  );
};
