import React, { useState, useEffect } from 'react';
import { BarChart3, ShieldAlert, Cpu, Activity, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import { StatsCard } from '../../components/common/StatsCard';
import { LoadingState } from '../../components/common/LoadingState';
import { api } from '../../services/api';
import { User } from '../../types';

interface SecurityAnalyticsPageProps {
  currentUser: User | null;
}

export const SecurityAnalyticsPage: React.FC<SecurityAnalyticsPageProps> = ({ currentUser }) => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    loadAnalytics();
  }, [currentUser, timeRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const data = await api.getAnalystDashboardStats();
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to load Security Analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingState message="Aggregating quantum security metrics & threat distribution telemetry..." />;
  }

  const vMetrics = analytics?.verification_metrics || {};
  const catDist = analytics?.category_distribution || [];
  const sevDist = analytics?.severity_distribution || [];
  const statusDist = analytics?.status_distribution || [];
  const trend = analytics?.trend || [];

  return (
    <div className="space-y-8 font-sans">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0B1220] border border-[#1F2E4D] rounded-2xl p-6 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-[#00C2FF]/10 border border-[#00C2FF]/30 rounded-xl text-[#00C2FF]">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">Quantum Security Analytics & Metrics</h2>
            <p className="text-xs text-slate-400 font-mono">
              Real deterministic threat distribution, fidelity metrics & verification security analytics
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 shrink-0 font-mono text-xs">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-[#131E33] border border-[#1F2E4D] text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-[#00C2FF]"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>

          <button
            onClick={loadAnalytics}
            className="px-3.5 py-2 bg-[#131E33] hover:bg-[#1F2E4D] text-[#00C2FF] font-bold rounded-xl border border-[#1F2E4D] transition flex items-center space-x-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* D. VERIFICATION SECURITY METRICS TOP CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard
          title="Avg State Fidelity (F)"
          value={`${((vMetrics.avg_fidelity || 1.0) * 100).toFixed(1)}%`}
          change="Normalized State"
          changeType="increase"
          icon={Cpu}
          iconColor="text-[#10B981]"
        />
        <StatsCard
          title="Avg QBER Error Rate"
          value={`${((vMetrics.avg_qber || 0.0) * 100).toFixed(1)}%`}
          change="Channel Noise"
          changeType="neutral"
          icon={Activity}
          iconColor="text-amber-400"
        />
        <StatsCard
          title="Avg Match Rate"
          value={`${((vMetrics.avg_match_rate || 1.0) * 100).toFixed(1)}%`}
          change="Measurement Match"
          changeType="increase"
          icon={CheckCircle2}
          iconColor="text-[#00C2FF]"
        />
        <StatsCard
          title="Total Successful"
          value={vMetrics.successful_verifications || 0}
          change="Passed Verifications"
          changeType="increase"
          icon={CheckCircle2}
          iconColor="text-[#10B981]"
        />
        <StatsCard
          title="Total Failed"
          value={vMetrics.failed_verifications || 0}
          change="Verification Rejections"
          changeType="decrease"
          icon={XCircle}
          iconColor="text-[#EF4444]"
        />
      </div>

      {/* Grid: A & B Distribution Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* A. Threat Category Distribution */}
        <div className="bg-[#0B1220]/90 border border-[#1F2E4D] rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-4">
          <h3 className="text-sm font-extrabold text-white font-mono uppercase tracking-wider border-b border-[#1F2E4D] pb-3 flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-[#EF4444]" />
            <span>A. Threat Category Distribution</span>
          </h3>

          <div className="space-y-3 font-mono text-xs">
            {catDist.length === 0 ? (
              <div className="p-4 bg-[#131E33] border border-[#1F2E4D] rounded-xl text-slate-400 text-center">
                No threat categories recorded.
              </div>
            ) : (
              catDist.map((c: any) => (
                <div key={c.category} className="p-3 bg-[#131E33] border border-[#1F2E4D] rounded-xl space-y-1.5">
                  <div className="flex justify-between font-bold">
                    <span className="text-white">{c.category}</span>
                    <span className="text-[#00C2FF]">{c.count} Events</span>
                  </div>
                  <div className="w-full bg-[#070C16] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#00C2FF] to-purple-500 h-full rounded-full"
                      style={{
                        width: `${Math.min(
                          100,
                          (c.count / Math.max(1, analytics?.total_threat_events || 1)) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* B & C. Severity & Status Breakdown */}
        <div className="bg-[#0B1220]/90 border border-[#1F2E4D] rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-6">
          <div className="space-y-3">
            <h3 className="text-sm font-extrabold text-white font-mono uppercase tracking-wider border-b border-[#1F2E4D] pb-3 flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-purple-400" />
              <span>B. Threat Severity Breakdown</span>
            </h3>

            <div className="grid grid-cols-2 gap-3 font-mono text-xs">
              {sevDist.map((s: any) => (
                <div key={s.severity} className="p-3 bg-[#131E33] border border-[#1F2E4D] rounded-xl flex items-center justify-between">
                  <span className="text-slate-400 uppercase text-[10px]">{s.severity}:</span>
                  <span className="font-extrabold text-white">{s.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-extrabold text-white font-mono uppercase tracking-wider border-b border-[#1F2E4D] pb-3 flex items-center space-x-2">
              <Activity className="w-4 h-4 text-[#10B981]" />
              <span>C. Threat Lifecycle Status Breakdown</span>
            </h3>

            <div className="grid grid-cols-2 gap-3 font-mono text-xs">
              {statusDist.map((st: any) => (
                <div key={st.status} className="p-3 bg-[#131E33] border border-[#1F2E4D] rounded-xl flex items-center justify-between">
                  <span className="text-slate-400 uppercase text-[10px]">{st.status}:</span>
                  <span className="font-extrabold text-[#00C2FF]">{st.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* E. Detection Trend Over Time */}
      <div className="bg-[#0B1220]/90 border border-[#1F2E4D] rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-4">
        <h3 className="text-sm font-extrabold text-white font-mono uppercase tracking-wider border-b border-[#1F2E4D] pb-3 flex items-center space-x-2">
          <Activity className="w-4 h-4 text-[#00C2FF]" />
          <span>E. Threat Detection Event Trend</span>
        </h3>

        <div className="grid grid-cols-7 gap-2 pt-2">
          {trend.map((t: any) => (
            <div key={t.time} className="p-3 bg-[#131E33] border border-[#1F2E4D] rounded-xl text-center font-mono space-y-1">
              <span className="text-[10px] text-slate-400 block">{t.time}</span>
              <span className="text-sm font-black text-[#00C2FF] block">{t.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
