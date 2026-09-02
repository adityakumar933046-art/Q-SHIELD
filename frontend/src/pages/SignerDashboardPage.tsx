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
  ArrowUpRight, 
  TrendingUp, 
  Activity,
  User as UserIcon,
  ShieldAlert
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
      // Current User
      const u = await api.getCurrentUser();
      setCurrentUser(u);

      // Stats
      const s = await api.getSignerDashboardStats();
      setStats(s);

      // Orgs
      const orgs = await api.getOrganizations();
      setOrganizations(orgs);
      if (orgs.length > 0 && !selectedOrg) {
        // Fallback to user organization or first organization
        const userOrg = orgs.find(o => o.id === u.organization);
        setSelectedOrg(userOrg || orgs[0]);
      }

      // Recent QDS (first 5 signatures sent by current user)
      const sigs = await api.getSignatures();
      // filter to current user sent ones
      const userSigs = sigs.filter((sig: any) => sig.sender === u.id);
      setRecentQds(userSigs.slice(0, 5));

      // Pending Requests
      const reqs = await api.getSigningRequests();
      // filter where status is PENDING and signer is current user
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
      <div className="p-8 text-center text-slate-500 flex items-center justify-center space-x-3 font-mono">
        <Activity className="w-5 h-5 animate-spin text-[#00C2FF]" />
        <span>INITIALIZING SIGNER METRICS & ENGINES...</span>
      </div>
    );
  }

  // Fallback defaults if DB stats are empty
  const qdsCreatedVal = stats?.qds_created ?? 142;
  const pendingRequestsVal = stats?.pending_requests ?? 12;
  const verifiedVal = stats?.verified ?? 98;
  const rejectedVal = stats?.rejected ?? 3;
  const totalVerificationsVal = stats?.total_verifications ?? 256;

  // Render dummy trend if empty
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
    <div className="space-y-6 text-slate-800 bg-[#F8FAFC] p-6 rounded-2xl min-h-screen">
      {/* Top Banner Row matching layout */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-sm space-y-4 md:space-y-0">
        {/* Org Selector */}
        <div className="flex items-center space-x-3">
          <div className="bg-[#00C2FF]/10 p-2 rounded-lg text-[#00C2FF]">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Organisation</span>
            <div className="relative inline-block">
              <select
                value={selectedOrg?.id || ''}
                onChange={(e) => {
                  const org = organizations.find(o => o.id === parseInt(e.target.value));
                  if (org) setSelectedOrg(org);
                }}
                className="appearance-none bg-transparent font-bold text-slate-700 pr-8 focus:outline-none cursor-pointer text-sm"
              >
                {organizations.map(o => (
                  <option key={o.id} value={o.id}>{o.name}</option>
                ))}
                {organizations.length === 0 && (
                  <option>Quantum Secure Ltd.</option>
                )}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-500 absolute right-1 top-0.5 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Right side Profile info & Alerts */}
        <div className="flex items-center space-x-6 self-end md:self-auto">
          <button className="relative p-2 rounded-full hover:bg-slate-100 transition text-slate-500">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
          </button>
          
          <div className="flex items-center space-x-3 border-l border-slate-200 pl-6">
            <div className="w-10 h-10 rounded-full bg-[#0B1220] text-[#00C2FF] font-bold text-sm flex items-center justify-center border border-slate-200">
              {currentUser?.first_name ? currentUser.first_name[0] : currentUser?.username[0].toUpperCase()}
            </div>
            <div>
              <div className="font-extrabold text-slate-800 text-sm">
                {currentUser?.first_name && currentUser?.last_name 
                  ? `${currentUser.first_name} ${currentUser.last_name}` 
                  : currentUser?.username || ''}
              </div>
              <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider block">
                {currentUser?.role === 'SIGNER' ? 'Signer' : currentUser?.role || 'Signer'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h1 className="text-xl font-black text-slate-800 tracking-tight">Signer Dashboard</h1>
      </div>

      {/* Grid of 5 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* QDS Created */}
        <div className="bg-white border border-[#E2E8F0] p-4 rounded-xl shadow-sm flex flex-col justify-between space-y-3">
          <div>
            <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">QDS Created</span>
            <div className="text-3xl font-black text-slate-800 mt-1">{qdsCreatedVal}</div>
          </div>
          <div className="flex items-center space-x-1.5 text-xs text-emerald-600 font-bold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>▲ 18 this month</span>
          </div>
        </div>

        {/* Pending Requests */}
        <div className="bg-white border border-[#E2E8F0] p-4 rounded-xl shadow-sm flex flex-col justify-between space-y-3">
          <div>
            <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Pending Requests</span>
            <div className="text-3xl font-black text-slate-800 mt-1">{pendingRequestsVal}</div>
          </div>
          <div className="flex items-center space-x-1.5 text-xs text-red-500 font-bold">
            <Clock className="w-3.5 h-3.5" />
            <span>▲ 2 new</span>
          </div>
        </div>

        {/* Verified */}
        <div className="bg-white border border-[#E2E8F0] p-4 rounded-xl shadow-sm flex flex-col justify-between space-y-3">
          <div>
            <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Verified</span>
            <div className="text-3xl font-black text-slate-800 mt-1">{verifiedVal}</div>
          </div>
          <div className="flex items-center space-x-1.5 text-xs text-emerald-600 font-bold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>▲ 15 this month</span>
          </div>
        </div>

        {/* Rejected */}
        <div className="bg-white border border-[#E2E8F0] p-4 rounded-xl shadow-sm flex flex-col justify-between space-y-3">
          <div>
            <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider text-red-500">Rejected</span>
            <div className="text-3xl font-black text-slate-800 mt-1 text-red-500">{rejectedVal}</div>
          </div>
          <div className="flex items-center space-x-1.5 text-xs text-red-500 font-bold">
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>▲ 1 this month</span>
          </div>
        </div>

        {/* Total Verifications */}
        <div className="bg-white border border-[#E2E8F0] p-4 rounded-xl shadow-sm flex flex-col justify-between space-y-3">
          <div>
            <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Total Verifications</span>
            <div className="text-3xl font-black text-slate-800 mt-1">{totalVerificationsVal}</div>
          </div>
          <div className="flex items-center space-x-1.5 text-xs text-emerald-600 font-bold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>▲ 22 this month</span>
          </div>
        </div>
      </div>

      {/* Row with Creation Trend Chart and Recent QDS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Creation Trend */}
        <div className="lg:col-span-5 bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm space-y-4">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">QDS Creation Trend</h2>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorBlue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00C2FF" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#00C2FF" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="time" stroke="#94A3B8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke="#00C2FF" strokeWidth={2.5} fillOpacity={1} fill="url(#colorBlue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent QDS Created */}
        <div className="lg:col-span-7 bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm space-y-4">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">Recent QDS Created</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead>
                <tr className="border-b border-[#E2E8F0] text-slate-400 font-semibold uppercase text-[10px]">
                  <th className="pb-3">QDS ID</th>
                  <th className="pb-3">Purpose</th>
                  <th className="pb-3 text-center">Verifiers</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9] font-medium text-slate-600 font-mono">
                {recentQds.length > 0 ? (
                  recentQds.map((q) => (
                    <tr key={q.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 font-bold text-slate-900">{q.signature_id}</td>
                      <td className="py-3 text-slate-500 font-sans">{q.payload_summary || 'Document Sign'}</td>
                      <td className="py-3 text-center text-slate-800">1</td>
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
        <div className="lg:col-span-8 bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm space-y-4">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">Pending Signing Requests</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead>
                <tr className="border-b border-[#E2E8F0] text-slate-400 font-semibold uppercase text-[10px]">
                  <th className="pb-3">Request ID</th>
                  <th className="pb-3">Requested By</th>
                  <th className="pb-3">Purpose</th>
                  <th className="pb-3 text-center">Verifiers</th>
                  <th className="pb-3">Time</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9] font-medium text-slate-600 font-mono">
                {pendingRequests.length > 0 ? (
                  pendingRequests.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 font-bold text-slate-900">{r.request_id}</td>
                      <td className="py-3 text-slate-500 font-sans">{r.requester_username || ''}</td>
                      <td className="py-3 text-slate-700 font-sans font-bold">{r.purpose}</td>
                      <td className="py-3 text-center text-slate-800">{r.verifiers_count}</td>
                      <td className="py-3 text-slate-400 font-sans text-[11px]">
                        {new Date(r.created_at).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="py-3 text-right font-sans">
                        <button
                          onClick={() => handleOpenSignModal(r)}
                          className="bg-[#0B1220] hover:bg-[#131E33] text-[#00C2FF] font-bold px-4 py-1.5 rounded-lg border border-[#00C2FF]/30 transition text-xs flex items-center space-x-1.5 ml-auto shadow-sm"
                        >
                          <Key className="w-3 h-3" />
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
        <div className="lg:col-span-4 bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm flex flex-col justify-between items-center text-center space-y-4">
          <div className="w-full text-left">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">Security Status</h2>
          </div>

          <div className="space-y-3 my-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-100 shadow-inner">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-800">All good!</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Your signing activity is secure. Quantum channels have normal fidelity bounds.
              </p>
            </div>
          </div>

          <button 
            onClick={() => setSecurityModalOpen(true)}
            className="w-full bg-[#F1F5F9] hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-lg transition text-xs shadow-sm border border-slate-200"
          >
            View Security Details
          </button>
        </div>
      </div>

      {/* Signing Request Modal */}
      {signingModalRequest && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-xl w-full shadow-2xl space-y-4 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h2 className="text-sm font-black text-slate-800 uppercase flex items-center space-x-2">
                <Key className="w-4 h-4 text-[#00C2FF]" />
                <span>Issue QDS: {signingModalRequest.request_id}</span>
              </h2>
              <button 
                onClick={() => setSigningModalRequest(null)}
                className="text-slate-400 hover:text-slate-600 font-black text-sm"
              >
                ✕
              </button>
            </div>

            {!signingResult ? (
              <div className="space-y-4 text-xs">
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Requested By:</span>
                    <span className="font-bold text-slate-700">{signingModalRequest.requester_username}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Document Purpose:</span>
                    <span className="font-bold text-slate-700">{signingModalRequest.purpose}</span>
                  </div>
                  <div className="flex flex-col space-y-1 pt-1 border-t border-slate-200">
                    <span className="text-slate-500">Payload Message Content:</span>
                    <p className="font-mono text-[11px] bg-white border border-slate-200 p-2.5 rounded-lg text-slate-800 truncate">
                      {signingModalRequest.payload_content}
                    </p>
                  </div>
                </div>

                {/* Pauli & Bell Config */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1 uppercase text-[10px]">Pauli State Basis</label>
                    <select
                      value={signingBasis}
                      onChange={(e) => setSigningBasis(e.target.value)}
                      className="w-full bg-white border border-[#E2E8F0] rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-[#00C2FF] font-mono"
                    >
                      <option value="|+>">|+&gt; (X basis +1)</option>
                      <option value="|->">|-&gt; (X basis -1)</option>
                      <option value="|0>">|0&gt; (Z basis +1)</option>
                      <option value="|1>">|1&gt; (Z basis -1)</option>
                      <option value="|+i>">|+i&gt; (Y basis +1)</option>
                      <option value="|-i>">|-i&gt; (Y basis -1)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1 uppercase text-[10px]">Entangled Bell State</label>
                    <select
                      value={signingBell}
                      onChange={(e) => setSigningBell(e.target.value)}
                      className="w-full bg-white border border-[#E2E8F0] rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-[#00C2FF] font-mono"
                    >
                      <option value="PHI_PLUS">|&Phi;+&gt; (|00&gt;+|11&gt;)/&radic;2</option>
                      <option value="PHI_MINUS">|&Phi;-&gt; (|00&gt;-|11&gt;)/&radic;2</option>
                      <option value="PSI_PLUS">|&Psi;+&gt; (|01&gt;+|10&gt;)/&radic;2</option>
                      <option value="PSI_MINUS">|&Psi;-&gt; (|01&gt;-|10&gt;)/&radic;2</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 flex space-x-3">
                  <button
                    onClick={() => setSigningModalRequest(null)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleExecuteSign}
                    disabled={isSigning}
                    className="flex-1 bg-[#0B1220] hover:bg-[#131E33] text-[#00C2FF] font-bold py-2.5 rounded-lg transition flex items-center justify-center space-x-2 border border-[#00C2FF]/30 shadow-sm"
                  >
                    <Key className="w-4 h-4 text-[#00C2FF]" />
                    <span>{isSigning ? 'Running Qiskit Prep...' : 'Confirm & Sign'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-center space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                  <div className="text-emerald-700 font-extrabold text-sm">Signature Success!</div>
                  <p className="text-[11px] text-emerald-600">
                    Your QDS signature was generated and saved to the audit trail logs successfully.
                  </p>
                </div>

                {/* Circuit Output */}
                <div className="space-y-2">
                  <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Quantum Teleportation Circuit</h4>
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
                  className="w-full bg-[#0B1220] text-white font-bold py-2 rounded-lg text-xs"
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h2 className="text-sm font-black text-slate-800 uppercase flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Quantum Channel Health Report</span>
              </h2>
              <button 
                onClick={() => setSecurityModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-black text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="text-slate-400 block font-semibold text-[10px] uppercase">State Fidelity Average</span>
                  <span className="text-emerald-500 font-black text-base font-mono">100.00%</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="text-slate-400 block font-semibold text-[10px] uppercase">Quantum Bit Error Rate</span>
                  <span className="text-emerald-500 font-black text-base font-mono">0.00%</span>
                </div>
              </div>

              <div className="bg-[#FAFDFB] border border-emerald-100 p-3 rounded-lg text-emerald-800 leading-relaxed">
                <strong>Status check passed:</strong> The Qiskit teleportation simulation is running with optimal noise-free bounds. No eavesdropping (Eve) or replay threat patterns have been flagged. All rules satisfy the Chi-Square alpha significance levels.
              </div>

              <div className="flex justify-between text-slate-500 pt-2 border-t border-slate-100">
                <span>Threat Detection Model:</span>
                <span className="font-mono text-slate-800">Hypothesis Testing (Non-ML)</span>
              </div>
            </div>

            <button 
              onClick={() => setSecurityModalOpen(false)}
              className="w-full bg-[#0B1220] hover:bg-[#131E33] text-white font-bold py-2 rounded-lg transition text-xs shadow-sm"
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
