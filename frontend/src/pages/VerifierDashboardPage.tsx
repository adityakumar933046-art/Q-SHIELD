import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowUp, 
  ArrowDown, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  TrendingUp, 
  ShieldAlert,
  Loader2,
  ShieldCheck,
  Activity
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { api } from '../services/api';
import { SignatureVerificationAttempt } from '../types';
import { StatusBadge } from '../components/StatusBadge';

interface DashboardStats {
  total_verifications: number;
  successful_verifications: number;
  failed_verifications: number;
  pending_verifications: number;
  avg_qber: number;
  avg_fidelity: number;
  avg_trace_distance: number;
  avg_chi_square: number;
  sprt_alerts: number;
  trend: Array<{ time: string; count: number }>;
}

export const VerifierDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentVerifications, setRecentVerifications] = useState<SignatureVerificationAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, verificationsData] = await Promise.all([
        api.getVerifierDashboardStats(),
        api.getVerifications()
      ]);
      setStats(statsData);
      setRecentVerifications(verificationsData.slice(0, 5));
    } catch (err) {
      console.error("Failed to load verifier dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading || !stats) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4 font-mono">
        <div className="relative">
          <Activity className="w-8 h-8 animate-spin text-emerald-400" />
          <div className="absolute inset-0 bg-emerald-400/20 rounded-full blur-lg animate-pulse" />
        </div>
        <span className="text-xs text-slate-400 tracking-widest uppercase">INITIALIZING VERIFIER NODE METRICS...</span>
      </div>
    );
  }

  const total = stats.total_verifications || 1;
  const passedPercent = Math.round((stats.successful_verifications / total) * 100);
  const failedPercent = Math.round((stats.failed_verifications / total) * 100);
  const pendingPercent = 100 - passedPercent - failedPercent;

  const donutData = [
    { name: 'Successful', value: stats.successful_verifications, color: '#10B981' },
    { name: 'Failed', value: stats.failed_verifications, color: '#F43F5E' },
    { name: 'Pending', value: stats.pending_verifications, color: '#F59E0B' }
  ].filter(item => item.value > 0);

  const chartData = donutData.length > 0 ? donutData : [
    { name: 'No Data', value: 1, color: 'rgba(255,255,255,0.1)' }
  ];

  const formatTime = (timeStr: string) => {
    try {
      const date = new Date(timeStr);
      return date.toLocaleString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return timeStr;
    }
  };

  return (
    <div className="space-y-8 select-none">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Verifier Node Dashboard</h1>
        <p className="text-xs text-slate-400 mt-1">
          Quantum Digital Signature Integrity Metrics & Entanglement Projective Verification Telemetry Hub.
        </p>
      </div>

      {/* Grid of 5 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Verifications */}
        <div className="glass-card p-5 space-y-2">
          <div className="text-slate-400 font-bold text-[11px] uppercase tracking-wider">Total Verifications</div>
          <div className="text-3xl font-extrabold font-mono text-white">{stats.total_verifications}</div>
          <div className="flex items-center space-x-1.5 text-xs text-emerald-400 font-bold">
            <ArrowUp className="w-3.5 h-3.5" />
            <span>24 this month</span>
          </div>
        </div>

        {/* Successful */}
        <div className="glass-card p-5 space-y-2">
          <div className="text-slate-400 font-bold text-[11px] uppercase tracking-wider">Successful</div>
          <div className="text-3xl font-extrabold font-mono text-emerald-400">{stats.successful_verifications}</div>
          <div className="flex items-center space-x-1.5 text-xs text-emerald-400 font-bold">
            <ArrowUp className="w-3.5 h-3.5" />
            <span>20 this month</span>
          </div>
        </div>

        {/* Failed */}
        <div className="glass-card p-5 space-y-2">
          <div className="text-slate-400 font-bold text-[11px] uppercase tracking-wider">Failed</div>
          <div className="text-3xl font-extrabold font-mono text-rose-400">{stats.failed_verifications}</div>
          <div className="flex items-center space-x-1.5 text-xs text-rose-400 font-bold">
            <ArrowUp className="w-3.5 h-3.5" />
            <span>2 this month</span>
          </div>
        </div>

        {/* Pending */}
        <div className="glass-card p-5 space-y-2">
          <div className="text-slate-400 font-bold text-[11px] uppercase tracking-wider">Pending</div>
          <div className="text-3xl font-extrabold font-mono text-amber-400">{stats.pending_verifications}</div>
          <div className="flex items-center space-x-1.5 text-xs text-amber-400 font-bold">
            <ArrowUp className="w-3.5 h-3.5" />
            <span>3 queued today</span>
          </div>
        </div>

        {/* Average QBER */}
        <div className="glass-card p-5 space-y-2">
          <div className="text-slate-400 font-bold text-[11px] uppercase tracking-wider">Average QBER</div>
          <div className="text-3xl font-extrabold font-mono text-cyan-400">{(stats.avg_qber * 100).toFixed(2)}%</div>
          <div className="flex items-center space-x-1.5 text-xs text-emerald-400 font-bold">
            <ArrowDown className="w-3.5 h-3.5" />
            <span>0.45% drift</span>
          </div>
        </div>
      </div>

      {/* Middle Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Verification Trend Chart */}
        <div className="glass-panel p-6 rounded-3xl lg:col-span-2 space-y-4">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34D399]" />
            <span>Verification Trend</span>
          </h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
                <XAxis 
                  dataKey="time" 
                  tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(11, 18, 32, 0.95)', 
                    borderColor: 'rgba(16, 185, 129, 0.3)', 
                    borderRadius: '1rem', 
                    color: '#FFFFFF' 
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#10B981" 
                  strokeWidth={2.5} 
                  dot={{ r: 4, stroke: '#10B981', strokeWidth: 2, fill: '#070B14' }}
                  activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2, fill: '#10B981' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Verification Result Distribution Donut Chart */}
        <div className="glass-panel p-6 rounded-3xl lg:col-span-1 space-y-4">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider">Result Distribution</h2>
          <div className="flex flex-col sm:flex-row items-center justify-around h-64">
            {/* Pie Circle */}
            <div className="relative w-44 h-44 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              {/* Central Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-extrabold font-mono text-white">{stats.total_verifications}</span>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total</span>
              </div>
            </div>

            {/* Custom Legend */}
            <div className="space-y-3 font-semibold text-xs text-slate-300 min-w-[120px] pt-4 sm:pt-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34D399]" />
                  <span>Successful</span>
                </div>
                <span className="text-slate-400 font-bold pl-2 font-mono">{passedPercent}%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400 shadow-[0_0_6px_#FB7185]" />
                  <span>Failed</span>
                </div>
                <span className="text-slate-400 font-bold pl-2 font-mono">{failedPercent}%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_6px_#FBBF24]" />
                  <span>Pending</span>
                </div>
                <span className="text-slate-400 font-bold pl-2 font-mono">{pendingPercent}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Table and Security Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Recent Verifications Table */}
        <div className="glass-panel p-6 rounded-3xl lg:col-span-3 space-y-4 overflow-hidden">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider">Recent Verifications</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold text-slate-300">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="pb-3 pl-2">VER ID</th>
                  <th className="pb-3">QDS ID</th>
                  <th className="pb-3">Signer</th>
                  <th className="pb-3">Result</th>
                  <th className="pb-3">QBER</th>
                  <th className="pb-3 pr-2">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {recentVerifications.map((item) => {
                  const isSuccess = item.verification_result === 'PASSED';
                  return (
                    <tr key={item.id} className="hover:bg-white/[0.03] transition">
                      <td className="py-3.5 pl-2 font-bold text-cyan-400">{item.verification_id}</td>
                      <td className="py-3.5 text-slate-400">{item.signature_id}</td>
                      <td className="py-3.5 text-white font-sans">{(item as any).signer_full_name || ''}</td>
                      <td className="py-3.5 font-sans">
                        <StatusBadge status={item.verification_result} />
                      </td>
                      <td className="py-3.5 text-white font-bold">{(item.qber * 100).toFixed(2)}%</td>
                      <td className="py-3.5 pr-2 text-slate-400 font-sans text-[11px]">{formatTime(item.created_at)}</td>
                    </tr>
                  );
                })}
                {recentVerifications.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-400 font-sans">
                      No verifications run yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Security Metrics Card */}
        <div className="glass-panel p-6 rounded-3xl lg:col-span-1 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">Security Metrics</h2>
            
            <div className="divide-y divide-white/5 font-semibold text-xs text-slate-300 space-y-3">
              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-400">Avg Fidelity</span>
                <span className="font-mono text-emerald-400 font-bold">{stats.avg_fidelity.toFixed(3)}</span>
              </div>
              <div className="flex items-center justify-between pt-3">
                <span className="text-slate-400">Avg Trace Distance</span>
                <span className="font-mono text-cyan-400 font-bold">{stats.avg_trace_distance.toFixed(3)}</span>
              </div>
              <div className="flex items-center justify-between pt-3">
                <span className="text-slate-400">Avg Chi-Square</span>
                <span className="font-mono text-white font-bold">{stats.avg_chi_square.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between pt-3">
                <span className="text-slate-400">SPRT Alert Count</span>
                <span className={`font-mono font-bold ${stats.sprt_alerts > 0 ? 'text-rose-400' : 'text-slate-300'}`}>
                  {stats.sprt_alerts}
                </span>
              </div>
            </div>
          </div>

          <Link
            to="/verifier/analytics"
            className="w-full btn-glass py-2.5 rounded-xl font-bold text-center transition duration-150 text-xs tracking-wide text-cyan-400 hover:border-cyan-400/50"
          >
            View Full Analytics
          </Link>
        </div>
      </div>
    </div>
  );
};
