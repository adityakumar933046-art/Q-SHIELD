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
  Loader2
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
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
      </div>
    );
  }

  // Calculate percentages for donut chart
  const total = stats.total_verifications || 1;
  const passedPercent = Math.round((stats.successful_verifications / total) * 100);
  const failedPercent = Math.round((stats.failed_verifications / total) * 100);
  const pendingPercent = 100 - passedPercent - failedPercent;

  const donutData = [
    { name: 'Successful', value: stats.successful_verifications, color: '#16A34A' },
    { name: 'Failed', value: stats.failed_verifications, color: '#DC2626' },
    { name: 'Pending', value: stats.pending_verifications, color: '#F59E0B' }
  ].filter(item => item.value > 0);

  // Fallback for pie chart display if empty
  const chartData = donutData.length > 0 ? donutData : [
    { name: 'No Data', value: 1, color: '#E2E8F0' }
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
    <div className="space-y-6 select-none max-w-7xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Verifier Dashboard</h1>
        <p className="text-xs text-slate-400 font-medium">
          Quantum Digital Signature Integrity Metrics & Quantum Entanglement Telemetry Hub.
        </p>
      </div>

      {/* Grid of 5 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Verifications */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-2">
          <div className="text-slate-400 font-bold text-[11px] uppercase tracking-wider">Total Verifications</div>
          <div className="text-3xl font-bold text-slate-800">{stats.total_verifications}</div>
          <div className="flex items-center space-x-1.5 text-xs text-green-600 font-bold">
            <ArrowUp className="w-3.5 h-3.5" />
            <span>24 this month</span>
          </div>
        </div>

        {/* Successful */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-2">
          <div className="text-slate-400 font-bold text-[11px] uppercase tracking-wider">Successful</div>
          <div className="text-3xl font-bold text-slate-850 text-slate-800">{stats.successful_verifications}</div>
          <div className="flex items-center space-x-1.5 text-xs text-green-600 font-bold">
            <ArrowUp className="w-3.5 h-3.5" />
            <span>20 this month</span>
          </div>
        </div>

        {/* Failed */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-2">
          <div className="text-slate-400 font-bold text-[11px] uppercase tracking-wider">Failed</div>
          <div className="text-3xl font-bold text-slate-800">{stats.failed_verifications}</div>
          <div className="flex items-center space-x-1.5 text-xs text-red-650 text-red-600 font-bold">
            <ArrowUp className="w-3.5 h-3.5" />
            <span>2 this month</span>
          </div>
        </div>

        {/* Pending */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-2">
          <div className="text-slate-400 font-bold text-[11px] uppercase tracking-wider">Pending</div>
          <div className="text-3xl font-bold text-slate-800">{stats.pending_verifications}</div>
          <div className="flex items-center space-x-1.5 text-xs text-red-600 font-bold">
            <ArrowUp className="w-3.5 h-3.5" />
            <span>3 new today</span>
          </div>
        </div>

        {/* Average QBER */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-2">
          <div className="text-slate-400 font-bold text-[11px] uppercase tracking-wider">Average QBER</div>
          <div className="text-3xl font-bold text-slate-800">{(stats.avg_qber * 100).toFixed(2)}%</div>
          <div className="flex items-center space-x-1.5 text-xs text-green-600 font-bold">
            <ArrowDown className="w-3.5 h-3.5" />
            <span>0.45%</span>
          </div>
        </div>
      </div>

      {/* Middle Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Verification Trend Chart */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm lg:col-span-2 space-y-4">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Verification Trend</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
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
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#16A34A" 
                  strokeWidth={2.5} 
                  dot={{ r: 4, stroke: '#16A34A', strokeWidth: 2, fill: '#fff' }}
                  activeDot={{ r: 6, stroke: '#16A34A', strokeWidth: 2, fill: '#16A34A' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Verification Result Distribution Donut Chart */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm lg:col-span-1 space-y-4">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Verification Result Distribution</h2>
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
                    paddingAngle={3}
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
                <span className="text-3xl font-bold text-slate-800">{stats.total_verifications}</span>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total</span>
              </div>
            </div>

            {/* Custom Legend */}
            <div className="space-y-3 font-semibold text-xs text-slate-700 min-w-[120px] pt-4 sm:pt-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-[#16A34A]" />
                  <span>Successful</span>
                </div>
                <span className="text-slate-400 font-bold pl-2">{passedPercent}%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-[#DC2626]" />
                  <span>Failed</span>
                </div>
                <span className="text-slate-400 font-bold pl-2">{failedPercent}%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-[#F59E0B]" />
                  <span>Pending</span>
                </div>
                <span className="text-slate-400 font-bold pl-2">{pendingPercent}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Table and Security Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Recent Verifications Table */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm lg:col-span-3 space-y-4 overflow-hidden">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recent Verifications</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold text-slate-600">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="pb-3 pl-2">VER ID</th>
                  <th className="pb-3">QDS ID</th>
                  <th className="pb-3">Signer</th>
                  <th className="pb-3">Result</th>
                  <th className="pb-3">QBER</th>
                  <th className="pb-3 pr-2">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentVerifications.map((item) => {
                  const isSuccess = item.verification_result === 'PASSED';
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-3.5 pl-2 font-sans font-bold text-slate-700">{item.verification_id}</td>
                      <td className="py-3.5 font-sans text-slate-400">{item.signature_id}</td>
                      <td className="py-3.5 text-slate-700">{(item as any).signer_full_name || ''}</td>
                      <td className="py-3.5">
                        <span className={`inline-flex items-center font-bold ${isSuccess ? 'text-green-600' : 'text-red-650 text-red-650/80 text-red-600'}`}>
                          {isSuccess ? 'Successful' : 'Failed'}
                        </span>
                      </td>
                      <td className="py-3.5 font-sans text-slate-550">{(item.qber * 100).toFixed(2)}%</td>
                      <td className="py-3.5 pr-2 text-slate-400 font-medium">{formatTime(item.created_at)}</td>
                    </tr>
                  );
                })}
                {recentVerifications.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-450">
                      No verifications run yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Security Metrics Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm lg:col-span-1 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Security Metrics</h2>
            
            <div className="divide-y divide-slate-100 font-semibold text-xs text-slate-700 space-y-3">
              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-400">Avg Fidelity</span>
                <span className="font-sans text-slate-800">{stats.avg_fidelity.toFixed(3)}</span>
              </div>
              <div className="flex items-center justify-between pt-3">
                <span className="text-slate-400">Avg Trace Distance</span>
                <span className="font-sans text-slate-800">{stats.avg_trace_distance.toFixed(3)}</span>
              </div>
              <div className="flex items-center justify-between pt-3">
                <span className="text-slate-400">Avg Chi-Square</span>
                <span className="font-sans text-slate-800">{stats.avg_chi_square.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between pt-3">
                <span className="text-slate-400">SPRT Alert Count</span>
                <span className={`font-sans ${stats.sprt_alerts > 0 ? 'text-red-650 text-red-600 font-bold' : 'text-slate-800'}`}>
                  {stats.sprt_alerts}
                </span>
              </div>
            </div>
          </div>

          <Link
            to="/verifier/analytics"
            className="w-full flex items-center justify-center py-2.5 rounded-lg border border-green-600 text-green-700 font-bold hover:bg-green-50 text-center transition duration-150 text-xs tracking-wide"
          >
            View Full Analytics
          </Link>
        </div>
      </div>
    </div>
  );
};
