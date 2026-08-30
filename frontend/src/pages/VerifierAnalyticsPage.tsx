import React, { useState, useEffect } from 'react';
import { BarChart3, Loader2, RefreshCw } from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { api } from '../services/api';
import { SignatureVerificationAttempt } from '../types';

export const VerifierAnalyticsPage: React.FC = () => {
  const [verifications, setVerifications] = useState<SignatureVerificationAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await api.getVerifications();
      setVerifications(data);
    } catch (err) {
      console.error("Failed to load analytics data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
      </div>
    );
  }

  // Calculate statistics
  const total = verifications.length;
  const passed = verifications.filter(v => v.verification_result === 'PASSED').length;
  const threatRejections = verifications.filter(v => v.verification_result === 'REJECTED_QUANTUM_THREAT').length;
  const replayRejections = verifications.filter(v => v.verification_result === 'REJECTED_REPLAY_ATTACK').length;
  const digestRejections = verifications.filter(v => v.verification_result === 'REJECTED_DIGEST_MISMATCH').length;
  const unauthorizedRejections = verifications.filter(v => v.verification_result === 'UNAUTHORIZED').length;

  const resultBreakdown = [
    { name: 'Passed Secure', value: passed, color: '#16A34A' },
    { name: 'Quantum Breach', value: threatRejections, color: '#DC2626' },
    { name: 'Replay Attack', value: replayRejections, color: '#F59E0B' },
    { name: 'Digest Mismatch', value: digestRejections, color: '#3B82F6' },
    { name: 'Unauthorized access', value: unauthorizedRejections, color: '#8B5CF6' }
  ].filter(item => item.value > 0);

  // Map timeline data (sort chronologically first)
  const timelineData = [...verifications]
    .reverse()
    .slice(-15) // last 15 attempts
    .map((v, i) => ({
      index: i + 1,
      id: v.verification_id,
      fidelity: parseFloat((v.quantum_fidelity * 100).toFixed(2)),
      qber: parseFloat((v.qber * 100).toFixed(2))
    }));

  return (
    <div className="max-w-6xl mx-auto space-y-6 select-none">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Quantum Statistical Analytics</h1>
          <p className="text-xs text-slate-400 font-medium">
            Entanglement fidelity profiles, QBER bounds, and signal outcome probability significance tests.
          </p>
        </div>
        <button
          onClick={loadData}
          className="p-2 text-slate-400 hover:text-slate-650 hover:bg-slate-100 rounded-lg transition"
        >
          <RefreshCw className="w-4.5 h-4.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Telemetry Timeline */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm lg:col-span-2 space-y-4">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fidelity & QBER Timeline (Last 15 attempts)</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorFidelity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16A34A" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#16A34A" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="colorQber" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#DC2626" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#DC2626" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="index" tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold' }} />
                <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                <Area type="monotone" name="State Fidelity (%)" dataKey="fidelity" stroke="#16A34A" strokeWidth={2} fillOpacity={1} fill="url(#colorFidelity)" />
                <Area type="monotone" name="QBER (%)" dataKey="qber" stroke="#DC2626" strokeWidth={2} fillOpacity={1} fill="url(#colorQber)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Rejection Category Breakdown */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm lg:col-span-1 space-y-4 flex flex-col justify-between">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Verification Result Breakdown</h2>
          <div className="h-60 flex items-center justify-center relative">
            {resultBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={resultBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {resultBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-slate-400 text-xs font-semibold">No data available</div>
            )}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-slate-800">{total}</span>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Verifications</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-650 pt-2 border-t border-slate-100">
            {resultBreakdown.map((item, idx) => (
              <div key={idx} className="flex items-center space-x-1.5 truncate">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="truncate">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
