import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, AlertTriangle, CheckCircle2, ShieldCheck, ArrowRight, Eye, Clock, Activity } from 'lucide-react';
import { StatsCard } from '../../components/common/StatsCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingState } from '../../components/common/LoadingState';
import { api } from '../../services/api';
import { SecurityIncident, User } from '../../types';

interface SecurityAnalystDashboardPageProps {
  currentUser: User | null;
}

export const SecurityAnalystDashboardPage: React.FC<SecurityAnalystDashboardPageProps> = ({ currentUser }) => {
  const [loading, setLoading] = useState(true);
  const [recentThreats, setRecentThreats] = useState<SecurityIncident[]>([]);
  const [stats, setStats] = useState({
    totalThreats: 0,
    openThreats: 0,
    criticalThreats: 0,
    highSeverityThreats: 0,
    resolvedThreats: 0,
    threatsToday: 0,
    healthStatus: 'SECURE',
  });

  useEffect(() => {
    loadDashboardData();
  }, [currentUser]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsData, incidentsData] = await Promise.allSettled([
        api.getAnalystDashboardStats(),
        api.getIncidents(),
      ]);

      const dashboardStats = statsData.status === 'fulfilled' ? statsData.value : null;
      const allIncidents = incidentsData.status === 'fulfilled' ? incidentsData.value : [];

      setRecentThreats(allIncidents.slice(0, 7));

      if (dashboardStats) {
        setStats({
          totalThreats: dashboardStats.total_threat_events ?? allIncidents.length,
          openThreats: dashboardStats.open_threats ?? allIncidents.filter((i) => i.status === 'OPEN' || i.status === 'INVESTIGATING').length,
          criticalThreats: dashboardStats.critical_threats ?? allIncidents.filter((i) => i.severity === 'CRITICAL').length,
          highSeverityThreats: dashboardStats.high_severity_threats ?? allIncidents.filter((i) => i.severity === 'HIGH').length,
          resolvedThreats: dashboardStats.resolved_threats ?? allIncidents.filter((i) => i.status === 'RESOLVED' || i.status === 'CLOSED').length,
          threatsToday: dashboardStats.threats_today ?? 0,
          healthStatus: dashboardStats.security_health_status || 'SECURE',
        });
      } else {
        setStats({
          totalThreats: allIncidents.length,
          openThreats: allIncidents.filter((i) => i.status === 'OPEN').length,
          criticalThreats: allIncidents.filter((i) => i.severity === 'CRITICAL').length,
          highSeverityThreats: allIncidents.filter((i) => i.severity === 'HIGH').length,
          resolvedThreats: allIncidents.filter((i) => i.status === 'RESOLVED').length,
          threatsToday: 0,
          healthStatus: 'SECURE',
        });
      }
    } catch (err) {
      console.error('Failed to load Security Analyst Dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  const getHealthBadge = (health: string) => {
    switch (health) {
      case 'CRITICAL':
        return {
          label: 'CRITICAL SECURITY BREACH ALERT',
          bg: 'bg-[#EF4444]/15 border-[#EF4444]',
          text: 'text-[#EF4444]',
          icon: ShieldAlert,
          desc: 'Immediate action required: Critical severity open security incident detected.',
        };
      case 'HIGH_RISK':
        return {
          label: 'HIGH RISK THREAT ELEVATION',
          bg: 'bg-amber-500/15 border-amber-500',
          text: 'text-amber-400',
          icon: AlertTriangle,
          desc: 'Multiple high-severity unresolved threats require analyst investigation.',
        };
      case 'ATTENTION_REQUIRED':
        return {
          label: 'ATTENTION REQUIRED',
          bg: 'bg-yellow-500/15 border-yellow-500',
          text: 'text-yellow-400',
          icon: AlertTriangle,
          desc: 'Medium anomalies detected in signature telemetry.',
        };
      case 'SECURE':
      default:
        return {
          label: 'ORGANIZATION HEALTH SECURE',
          bg: 'bg-[#10B981]/15 border-[#10B981]',
          text: 'text-[#10B981]',
          icon: ShieldCheck,
          desc: 'All quantum state telemetries and verification nonces operating within normal parameters.',
        };
    }
  };

  const healthInfo = getHealthBadge(stats.healthStatus);
  const HealthIcon = healthInfo.icon;

  if (loading) {
    return <LoadingState message="Loading threat telemetry and security health assessment..." />;
  }

  return (
    <div className="space-y-8 font-sans">
      {/* Header Welcome Banner */}
      <div className="bg-[#0B1220] border border-[#1F2E4D] rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-[#EF4444]/10 via-purple-500/5 to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="px-2.5 py-0.5 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-full text-[10px] font-sans text-[#EF4444] font-bold uppercase">
                Threat Intelligence Command Center
              </span>
              <span className="text-xs text-slate-400 font-sans">• {currentUser?.organization_name || 'Primary Org'}</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Security Analyst Command
            </h2>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              to="/security-analyst/threats"
              className="px-4 py-2.5 bg-[#EF4444] hover:bg-red-600 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center space-x-2"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Monitor Threat Events</span>
            </Link>
          </div>
        </div>
      </div>

      {/* DETERMINISTIC HEALTH SUMMARY CARD */}
      <div className={`border rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 backdrop-blur-md ${healthInfo.bg}`}>
        <div className="flex items-center space-x-3.5">
          <div className={`p-3 rounded-xl border ${healthInfo.bg}`}>
            <HealthIcon className={`w-6 h-6 ${healthInfo.text}`} />
          </div>
          <div>
            <span className={`text-[10px] font-sans font-bold uppercase tracking-widest block ${healthInfo.text}`}>
              Security Health Summary
            </span>
            <h3 className="text-base font-bold text-white">{healthInfo.label}</h3>
            <p className="text-xs text-slate-300 font-sans mt-0.5">{healthInfo.desc}</p>
          </div>
        </div>

        <Link
          to="/security-analyst/investigations"
          className="px-4 py-2 bg-[#131E33] hover:bg-[#1F2E4D] text-white font-sans font-bold text-xs rounded-xl border border-[#1F2E4D] transition flex items-center space-x-1.5 shrink-0"
        >
          <span>View Active Investigations</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* 6 TOP SECURITY METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatsCard
          title="Total Threat Events"
          value={stats.totalThreats}
          change="Lifetime Events"
          changeType="neutral"
          icon={ShieldAlert}
          iconColor="text-[#00C2FF]"
        />
        <StatsCard
          title="Open Threats"
          value={stats.openThreats}
          change="Needs Review"
          changeType="neutral"
          icon={Clock}
          iconColor="text-amber-400"
        />
        <StatsCard
          title="Critical Threats"
          value={stats.criticalThreats}
          change="Severe Anomaly"
          changeType="decrease"
          icon={AlertTriangle}
          iconColor="text-[#EF4444]"
        />
        <StatsCard
          title="High Severity"
          value={stats.highSeverityThreats}
          change="High Risk"
          changeType="neutral"
          icon={ShieldAlert}
          iconColor="text-orange-400"
        />
        <StatsCard
          title="Resolved Threats"
          value={stats.resolvedThreats}
          change="Investigated"
          changeType="increase"
          icon={CheckCircle2}
          iconColor="text-[#10B981]"
        />
        <StatsCard
          title="Detected Today"
          value={stats.threatsToday}
          change="Last 24 Hours"
          changeType="neutral"
          icon={Activity}
          iconColor="text-purple-400"
        />
      </div>

      {/* Recent Critical Threats Table */}
      <div className="bg-[#0B1220]/90 border border-[#1F2E4D] rounded-2xl p-6 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-[#EF4444]" />
            <h3 className="text-base font-bold text-white">Recent Detected Threat Events</h3>
          </div>

          <Link
            to="/security-analyst/threats"
            className="text-xs font-sans text-[#00C2FF] hover:underline flex items-center space-x-1"
          >
            <span>View All Threat Events</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentThreats.length === 0 ? (
          <div className="p-8 text-center bg-[#131E33] border border-[#1F2E4D] rounded-xl text-xs font-sans text-slate-400">
            No security threat events recorded yet for this organization.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead>
                <tr className="border-b border-[#1F2E4D] text-slate-400 uppercase tracking-wider text-[10px] bg-[#131E33]/40">
                  <th className="py-3.5 px-4">Threat ID</th>
                  <th className="py-3.5 px-4">Threat Category</th>
                  <th className="py-3.5 px-4">Severity</th>
                  <th className="py-3.5 px-4">Related Signature</th>
                  <th className="py-3.5 px-4">Source User</th>
                  <th className="py-3.5 px-4">Detection Time</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F2E4D]/50 text-slate-200">
                {recentThreats.map((threat) => (
                  <tr key={threat.id || threat.incident_number} className="hover:bg-[#131E33]/50 transition">
                    <td className="py-3.5 px-4 font-bold text-[#00C2FF]">
                      <Link to={`/security-analyst/threats/${threat.id || threat.incident_number}`} className="hover:underline">
                        {threat.incident_number}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white">
                      {threat.category || threat.title}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={threat.severity} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 font-sans text-[11px]">
                      {threat.signature_id || (threat as any).related_signature || 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-purple-400">
                      {threat.source_username || (threat as any).user || 'System Node'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                      {threat.created_at ? new Date(threat.created_at).toLocaleString() : 'Recent'}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={threat.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/security-analyst/threats/${threat.id || threat.incident_number}`}
                        className="p-1.5 bg-[#131E33] hover:bg-[#00C2FF]/20 text-slate-300 hover:text-[#00C2FF] border border-[#1F2E4D] rounded-lg transition inline-flex items-center space-x-1 text-[11px]"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Details</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
