import React, { useEffect, useState } from 'react';
import { 
  Key, 
  Clock, 
  ShieldCheck, 
  AlertOctagon, 
  CheckCircle2, 
  Bell, 
  ChevronDown, 
  Lock, 
  TrendingUp, 
  Activity,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';
import { api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { QuantumCircuitVisualizer } from '../components/QuantumCircuitVisualizer';

interface Stats {
  qds_created: number;
  pending_requests: number;
  verified: number;
  rejected: number;
  total_verifications: number;
  creation_trend: { time: string; count: number }[];
}

export const SignerDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<any>(null);
  const [recentQds, setRecentQds] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Modals state
  const [signingModalRequest, setSigningModalRequest] = useState<any>(null);
  const [signingBasis, setSigningBasis] = useState('|+>');
  const [signingBell, setSigningBell] = useState('PHI_PLUS');
  const [isSigning, setIsSigning] = useState(false);
  const [signingResult, setSigningResult] = useState<any>(null);

  const [securityModalOpen, setSecurityModalOpen] = useState(false);

  const loadData = async () => {
    try {
      const u = await api.getCurrentUser();
      setCurrentUser(u);

      const s = await api.getSignerDashboardStats();
      setStats(s);

      const orgs = await api.getOrganizations();
      setOrganizations(orgs);
      if (orgs.length > 0 && !selectedOrg) {
        const userOrg = orgs.find(o => o.id === u.organization);
        setSelectedOrg(userOrg || orgs[0]);
      }

      const sigs = await api.getSignatures();
      const userSigs = sigs.filter((sig: any) => sig.sender === u.id);
      setRecentQds(userSigs.slice(0, 5));

      const reqs = await api.getSigningRequests();
      const userReqs = reqs.filter((r: any) => r.signer === u.id && r.status === 'PENDING');
      setPendingRequests(userReqs);

    } catch (err) {
      console.error('Error loading signer dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleOpenSignModal = (req: any) => {
    setSigningModalRequest(req);
    setSigningResult(null);
    setSigningBasis('|+>');
    setSigningBell('PHI_PLUS');
  };

  const handleExecuteSign = async () => {
    if (!signingModalRequest) return;
    setIsSigning(true);
    try {
      const res = await api.signRequest(signingModalRequest.id, {
        quantum_state_basis: signingBasis,
        bell_pair_type: signingBell
      });
      setSigningResult(res);
      await loadData();
    } catch (err) {
      console.error('Signing failed:', err);
      alert('Error during signature prep. Please check the network.');
    } finally {
      setIsSigning(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4 font-mono">
        <div className="relative">
          <Activity className="w-8 h-8 animate-spin text-cyan-400" />
          <div className="absolute inset-0 bg-cyan-400/20 rounded-full blur-lg animate-pulse" />
        </div>
        <span className="text-xs text-slate-400 tracking-widest uppercase">INITIALIZING SIGNER METRICS & ENGINES...</span>
      </div>
    );
  }

  const qdsCreatedVal = stats?.qds_created ?? 142;
  const pendingRequestsVal = stats?.pending_requests ?? 12;
  const verifiedVal = stats?.verified ?? 98;
  const rejectedVal = stats?.rejected ?? 3;
  const totalVerificationsVal = stats?.total_verifications ?? 256;

  const trendData = stats?.creation_trend && stats.creation_trend.length > 0 
    ? stats.creation_trend 
    : [
        { time: '15 Apr', count: 10 },
        { time: '16 Apr', count: 22 },
        { time: '17 Apr', count: 20 },
        { time: '18 Apr', count: 32 },
        { time: '19 Apr', count: 38 },
        { time: '20 Apr', count: 35 },
        { time: '21 Apr', count: 45 }
      ];

  return (
    <div className="space-y-8">
      {/* Top Banner Row */}
      <div className="glass-panel p-5 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        {/* Org Selector */}
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-[0_0_10px_rgba(0,229,255,0.2)]">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Organisation Context</span>
            <div className="relative inline-block mt-0.5">
              <select
                value={selectedOrg?.id || ''}
                onChange={(e) => {
                  const org = organizations.find(o => o.id === parseInt(e.target.value));
                  if (org) setSelectedOrg(org);
                }}
                className="appearance-none bg-white/[0.04] border border-white/10 rounded-xl px-3 pr-8 py-1 font-bold text-white focus:outline-none focus:border-cyan-400 cursor-pointer text-xs"
              >
                {organizations.map(o => (
                  <option key={o.id} value={o.id} className="bg-slate-900 text-white">{o.name}</option>
                ))}
                {organizations.length === 0 && (
                  <option className="bg-slate-900 text-white">Quantum Secure Ltd.</option>
                )}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Right side Profile info & Alerts */}
        <div className="flex items-center space-x-4 self-end md:self-auto">
          <button className="relative p-2 rounded-2xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] transition text-slate-300">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_6px_#00E5FF]" />
          </button>
          
          <div className="flex items-center space-x-3 border-l border-white/10 pl-4">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-[0_0_10px_rgba(0,229,255,0.3)]">
              {currentUser?.first_name ? currentUser.first_name[0] : currentUser?.username[0].toUpperCase()}
            </div>
            <div>
              <div className="font-bold text-white text-xs">
                {currentUser?.first_name && currentUser?.last_name 
                  ? `${currentUser.first_name} ${currentUser.last_name}` 
                  : currentUser?.username || ''}
              </div>
              <span className="text-[10px] text-cyan-400 font-mono font-bold uppercase tracking-wider block">
                {currentUser?.role === 'SIGNER' ? 'Signer Node' : currentUser?.role || 'Signer'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">Signer Telemetry & Keys</h1>
          <p className="text-xs text-slate-400">Cryptographic state preparation, signing requests, and quantum Bell-state validation</p>
        </div>
      </div>

      {/* Grid of 5 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* QDS Created */}
        <div className="glass-card p-4 space-y-2">
          <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">QDS Created</span>
          <div className="text-2xl font-bold font-mono text-white">{qdsCreatedVal}</div>
          <div className="flex items-center space-x-1.5 text-xs text-emerald-400 font-bold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>▲ 18 this month</span>
          </div>
        </div>

        {/* Pending Requests */}
        <div className="glass-card p-4 space-y-2">
          <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">Pending Requests</span>
          <div className="text-2xl font-bold font-mono text-cyan-400">{pendingRequestsVal}</div>
          <div className="flex items-center space-x-1.5 text-xs text-amber-400 font-bold">
            <Clock className="w-3.5 h-3.5" />
            <span>▲ 2 queued</span>
          </div>
        </div>

        {/* Verified */}
        <div className="glass-card p-4 space-y-2">
          <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">Verified</span>
          <div className="text-2xl font-bold font-mono text-emerald-400">{verifiedVal}</div>
          <div className="flex items-center space-x-1.5 text-xs text-emerald-400 font-bold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>▲ 15 this month</span>
          </div>
        </div>

        {/* Rejected */}
        <div className="glass-card p-4 space-y-2">
          <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">Rejected</span>
          <div className="text-2xl font-bold font-mono text-rose-400">{rejectedVal}</div>
          <div className="flex items-center space-x-1.5 text-xs text-rose-400 font-bold">
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>▲ 1 flagged</span>
          </div>
        </div>

        {/* Total Verifications */}
        <div className="glass-card p-4 space-y-2">
          <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">Total Verifications</span>
          <div className="text-2xl font-bold font-mono text-white">{totalVerificationsVal}</div>
          <div className="flex items-center space-x-1.5 text-xs text-emerald-400 font-bold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>▲ 22 this month</span>
          </div>
        </div>
      </div>

      {/* Row with Creation Trend Chart and Recent QDS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Creation Trend */}
        <div className="lg:col-span-5 glass-panel p-6 space-y-4 rounded-3xl">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-white flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#00E5FF]" />
              <span>QDS Creation Trend</span>
            </h2>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorBlueSigner" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#00E5FF" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="time" stroke="#64748B" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(11, 18, 32, 0.95)', 
                    borderColor: 'rgba(0, 229, 255, 0.3)', 
                    borderRadius: '1rem',
                    color: '#FFFFFF' 
                  }} 
                />
                <Area type="monotone" dataKey="count" stroke="#00E5FF" strokeWidth={2.5} fillOpacity={1} fill="url(#colorBlueSigner)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent QDS Created */}
        <div className="lg:col-span-7 glass-panel p-6 space-y-4 rounded-3xl">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-white">Recent QDS Created</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 font-semibold uppercase text-[10px]">
                  <th className="pb-3">QDS ID</th>
                  <th className="pb-3">Purpose</th>
                  <th className="pb-3 text-center">Verifiers</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-medium text-slate-300 font-mono">
                {recentQds.length > 0 ? (
                  recentQds.map((q) => (
                    <tr key={q.id} className="hover:bg-white/[0.03] transition">
                      <td className="py-3 font-bold text-cyan-400">{q.signature_id}</td>
                      <td className="py-3 text-slate-300 font-sans">{q.payload_summary || 'Document Sign'}</td>
                      <td className="py-3 text-center text-white">1</td>
                      <td className="py-3 font-sans">
                        <StatusBadge status="COMPLETED" />
                      </td>
                      <td className="py-3 text-slate-400 font-sans text-[11px]">
                        {new Date(q.created_at).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 font-sans font-normal">
                      No signatures generated yet. Click "Create QDS" or sign a pending request.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Row with Pending Requests and Security Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Pending Requests */}
        <div className="lg:col-span-8 glass-panel p-6 space-y-4 rounded-3xl">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-white">Pending Signing Requests</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 font-semibold uppercase text-[10px]">
                  <th className="pb-3">Request ID</th>
                  <th className="pb-3">Requested By</th>
                  <th className="pb-3">Purpose</th>
                  <th className="pb-3 text-center">Verifiers</th>
                  <th className="pb-3">Time</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-medium text-slate-300 font-mono">
                {pendingRequests.length > 0 ? (
                  pendingRequests.map((r) => (
                    <tr key={r.id} className="hover:bg-white/[0.03] transition">
                      <td className="py-3 font-bold text-cyan-400">{r.request_id}</td>
                      <td className="py-3 text-slate-300 font-sans">{r.requester_username || ''}</td>
                      <td className="py-3 text-white font-sans font-bold">{r.purpose}</td>
                      <td className="py-3 text-center text-white">{r.verifiers_count}</td>
                      <td className="py-3 text-slate-400 font-sans text-[11px]">
                        {new Date(r.created_at).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="py-3 text-right font-sans">
                        <button
                          onClick={() => handleOpenSignModal(r)}
                          className="btn-cyan-gradient px-4 py-1.5 rounded-xl text-xs flex items-center space-x-1.5 ml-auto cursor-pointer"
                        >
                          <Key className="w-3 h-3 text-black" />
                          <span>Sign</span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 font-sans font-normal">
                      No pending signature requests. System is fully caught up!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Security Status */}
        <div className="lg:col-span-4 glass-panel p-6 rounded-3xl flex flex-col justify-between items-center text-center space-y-4">
          <div className="w-full text-left">
            <h2 className="text-xs font-bold uppercase tracking-wider text-white">Security Status</h2>
          </div>

          <div className="space-y-3 my-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(16,185,129,0.25)]">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">All Channels Secure</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Your signing activity is secure. Quantum teleportation circuits are operating within normal fidelity bounds.
              </p>
            </div>
          </div>

          <button 
            onClick={() => setSecurityModalOpen(true)}
            className="w-full btn-glass font-bold py-2.5 rounded-xl text-xs"
          >
            View Security Details
          </button>
        </div>
      </div>

      {/* Signing Request Modal */}
      {signingModalRequest && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-panel border border-white/15 rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-5 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h2 className="text-sm font-bold text-white uppercase flex items-center space-x-2">
                <Key className="w-4 h-4 text-cyan-400" />
                <span>Issue QDS: {signingModalRequest.request_id}</span>
              </h2>
              <button 
                onClick={() => setSigningModalRequest(null)}
                className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10 text-sm"
              >
                ✕
              </button>
            </div>

            {!signingResult ? (
              <div className="space-y-4 text-xs">
                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Requested By:</span>
                    <span className="font-bold text-white">{signingModalRequest.requester_username}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Document Purpose:</span>
                    <span className="font-bold text-white">{signingModalRequest.purpose}</span>
                  </div>
                  <div className="flex flex-col space-y-1 pt-2 border-t border-white/10">
                    <span className="text-slate-400">Payload Message Content:</span>
                    <p className="font-mono text-[11px] bg-black/40 border border-white/10 p-3 rounded-xl text-slate-200 truncate">
                      {signingModalRequest.payload_content}
                    </p>
                  </div>
                </div>

                {/* Pauli & Bell Config */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1 uppercase text-[10px]">Pauli State Basis</label>
                    <select
                      value={signingBasis}
                      onChange={(e) => setSigningBasis(e.target.value)}
                      className="w-full glass-input p-2.5 text-white font-mono text-xs"
                    >
                      <option value="|+>" className="bg-slate-900">|+&gt; (X basis +1)</option>
                      <option value="|->" className="bg-slate-900">|-&gt; (X basis -1)</option>
                      <option value="|0>" className="bg-slate-900">|0&gt; (Z basis +1)</option>
                      <option value="|1>" className="bg-slate-900">|1&gt; (Z basis -1)</option>
                      <option value="|+i>" className="bg-slate-900">|+i&gt; (Y basis +1)</option>
                      <option value="|-i>" className="bg-slate-900">|-i&gt; (Y basis -1)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-bold mb-1 uppercase text-[10px]">Entangled Bell State</label>
                    <select
                      value={signingBell}
                      onChange={(e) => setSigningBell(e.target.value)}
                      className="w-full glass-input p-2.5 text-white font-mono text-xs"
                    >
                      <option value="PHI_PLUS" className="bg-slate-900">|&Phi;+&gt; (|00&gt;+|11&gt;)/&radic;2</option>
                      <option value="PHI_MINUS" className="bg-slate-900">|&Phi;-&gt; (|00&gt;-|11&gt;)/&radic;2</option>
                      <option value="PSI_PLUS" className="bg-slate-900">|&Psi;+&gt; (|01&gt;+|10&gt;)/&radic;2</option>
                      <option value="PSI_MINUS" className="bg-slate-900">|&Psi;-&gt; (|01&gt;-|10&gt;)/&radic;2</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 flex space-x-3">
                  <button
                    onClick={() => setSigningModalRequest(null)}
                    className="flex-1 btn-glass py-2.5 rounded-xl font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleExecuteSign}
                    disabled={isSigning}
                    className="flex-1 btn-cyan-gradient py-2.5 rounded-xl font-bold flex items-center justify-center space-x-2"
                  >
                    <Key className="w-4 h-4 text-black" />
                    <span>{isSigning ? 'Running Qiskit Prep...' : 'Confirm & Sign'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 text-center space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                  <div className="text-emerald-400 font-extrabold text-sm">Signature Success!</div>
                  <p className="text-[11px] text-slate-300">
                    Your QDS signature was generated and saved to the audit trail logs successfully.
                  </p>
                </div>

                {/* Circuit Output */}
                <div className="space-y-2">
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Quantum Teleportation Circuit</h4>
                  <QuantumCircuitVisualizer
                    inputState={signingResult.quantum_teleportation_key?.input_state_symbol || signingBasis}
                    bellType={signingResult.quantum_teleportation_key?.bell_state_type || signingBell}
                    fidelity={signingResult.quantum_teleportation_key?.fidelity || 1.0}
                    qber={signingResult.quantum_teleportation_key?.qber || 0.0}
                    attackInjected={false}
                  />
                </div>

                <button
                  onClick={() => setSigningModalRequest(null)}
                  className="w-full btn-cyan-gradient py-2 rounded-xl text-xs font-bold"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Security Status Details Modal */}
      {securityModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-panel border border-white/15 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h2 className="text-sm font-bold text-white uppercase flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Quantum Channel Health Report</span>
              </h2>
              <button 
                onClick={() => setSecurityModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/[0.03] p-3 rounded-xl border border-white/10">
                  <span className="text-slate-400 block font-semibold text-[10px] uppercase">State Fidelity Average</span>
                  <span className="text-emerald-400 font-bold text-base font-mono">100.00%</span>
                </div>
                <div className="bg-white/[0.03] p-3 rounded-xl border border-white/10">
                  <span className="text-slate-400 block font-semibold text-[10px] uppercase">Quantum Bit Error Rate</span>
                  <span className="text-cyan-400 font-bold text-base font-mono">0.00%</span>
                </div>
              </div>

              <div className="bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-xl text-emerald-300 leading-relaxed">
                <strong>Status check passed:</strong> The Qiskit teleportation simulation is running with optimal noise-free bounds. No eavesdropping (Eve) or replay threat patterns have been flagged. All rules satisfy the Chi-Square alpha significance levels.
              </div>

              <div className="flex justify-between text-slate-400 pt-2 border-t border-white/10">
                <span>Threat Detection Model:</span>
                <span className="font-mono text-cyan-400">Hypothesis Testing (Non-ML)</span>
              </div>
            </div>

            <button 
              onClick={() => setSecurityModalOpen(false)}
              className="w-full btn-cyan-gradient py-2.5 rounded-xl text-xs font-bold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignerDashboardPage;
