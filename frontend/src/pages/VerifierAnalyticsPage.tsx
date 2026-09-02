import React, { useState, useEffect } from 'react';
import { BarChart3, RefreshCw, Activity } from 'lucide-react';
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
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4 font-mono">
        <div className="relative">
          <Activity className="w-8 h-8 animate-spin text-cyan-400" />
          <div className="absolute inset-0 bg-cyan-400/20 rounded-full blur-lg animate-pulse" />
        </div>
        <span className="text-xs text-slate-400 tracking-widest uppercase">LOADING QUANTUM ANALYTICS...</span>
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
    { name: 'Passed Secure', value: passed, color: '#10B981' },
    { name: 'Quantum Breach', value: threatRejections, color: '#F43F5E' },
    { name: 'Replay Attack', value: replayRejections, color: '#F59E0B' },
    { name: 'Digest Mismatch', value: digestRejections, color: '#38BDF8' },
    { name: 'Unauthorized access', value: unauthorizedRejections, color: '#A855F7' }
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
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-3">
            <div className="p-2 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <BarChart3 className="w-6 h-6" />
            </div>
            <span>Quantum Statistical Analytics</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Entanglement fidelity profiles, QBER bounds, and signal outcome probability significance tests.
          </p>
        </div>
        <button
          onClick={loadData}
          className="p-2 text-slate-400 hover:text-white hover:bg-white/[0.06] rounded-xl border border-white/10 transition"
        >
          <RefreshCw className="w-4 h-4 text-cyan-400" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Telemetry Timeline */}
        <div className="glass-card p-6 lg:col-span-2 space-y-4">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider">Fidelity & QBER Timeline (Last 15 attempts)</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorFidelityV" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="colorQberV" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#F43F5E" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="index" tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(11, 18, 32, 0.95)', border: '1px solid rgba(0, 229, 255, 0.3)', borderRadius: '1rem', color: '#FFF' }} />
                <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                <Area type="monotone" name="State Fidelity (%)" dataKey="fidelity" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorFidelityV)" />
                <Area type="monotone" name="QBER (%)" dataKey="qber" stroke="#F43F5E" strokeWidth={2.5} fillOpacity={1} fill="url(#colorQberV)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Rejection Category Breakdown */}
        <div className="glass-card p-6 lg:col-span-1 space-y-4 flex flex-col justify-between">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider">Verification Result Breakdown</h2>
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
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(11, 18, 32, 0.95)', border: '1px solid rgba(0, 229, 255, 0.3)', borderRadius: '1rem', color: '#FFF', fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-slate-400 text-xs font-semibold">No data available</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifierAnalyticsPage;
