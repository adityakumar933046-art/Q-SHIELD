import React, { useEffect, useState } from 'react';
import { Key, Activity, X } from 'lucide-react';
import { api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { QuantumCircuitVisualizer } from '../components/QuantumCircuitVisualizer';

export const SigningRequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'COMPLETED' | 'REJECTED'>('ALL');
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Signing modal state
  const [signingRequest, setSigningRequest] = useState<any>(null);
  const [signingBasis, setSigningBasis] = useState('|+>');
  const [signingBell, setSigningBell] = useState('PHI_PLUS');
  const [isSigning, setIsSigning] = useState(false);
  const [signingResult, setSigningResult] = useState<any>(null);

  const loadRequests = async () => {
    try {
      const u = await api.getCurrentUser();
      setCurrentUser(u);
      const reqs = await api.getSigningRequests();
      setRequests(reqs.filter((r: any) => r.signer === u.id));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleOpenSign = (req: any) => {
    setSigningRequest(req);
    setSigningResult(null);
    setSigningBasis('|+>');
    setSigningBell('PHI_PLUS');
  };

  const handleExecuteSign = async () => {
    if (!signingRequest) return;
    setIsSigning(true);
    try {
      const res = await api.signRequest(signingRequest.id, {
        quantum_state_basis: signingBasis,
        bell_pair_type: signingBell
      });
      setSigningResult(res);
      await loadRequests();
    } catch (err) {
      console.error(err);
      alert('Failed to sign. Please try again.');
    } finally {
      setIsSigning(false);
    }
  };

  const handleReject = async (req: any) => {
    if (!window.confirm(`Are you sure you want to reject request ${req.request_id}?`)) return;
    try {
      await api.rejectRequest(req.id);
      await loadRequests();
    } catch (err) {
      console.error(err);
      alert('Failed to reject request.');
    }
  };

  const filteredRequests = requests.filter(r => {
    if (activeTab === 'ALL') return true;
    return r.status === activeTab;
  });

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400 flex items-center justify-center space-x-3 font-mono">
        <Activity className="w-5 h-5 animate-spin text-cyan-400" />
        <span>PULLING OUTGOING SIGNATURE REQUESTS...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Key className="w-4 h-4" />
          </div>
          <span>Signing Requests Inbox</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Sign document requests sent to you using your secure Quantum Teleportation Key.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 text-xs font-bold space-x-6">
        {(['ALL', 'PENDING', 'COMPLETED', 'REJECTED'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 px-1 border-b-2 transition uppercase tracking-wider ${
              activeTab === tab 
                ? 'border-cyan-400 text-cyan-400 font-bold shadow-[0_2px_10px_rgba(0,229,255,0.4)]' 
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            {tab.toLowerCase()} ({requests.filter(r => tab === 'ALL' || r.status === tab).length})
          </button>
        ))}
      </div>

      {/* Request Table */}
      <div className="glass-card p-6 space-y-4">
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="table-cyber">
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Requested By</th>
                <th>Purpose</th>
                <th className="text-center">Verifiers Required</th>
                <th>Date</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.length > 0 ? (
                filteredRequests.map((r) => (
                  <tr key={r.id}>
                    <td className="font-bold text-cyan-400 font-mono">{r.request_id}</td>
                    <td className="text-slate-300 font-sans">{r.requester_username || ''}</td>
                    <td className="text-white font-bold">{r.purpose}</td>
                    <td className="text-center text-slate-200">{r.verifiers_count}</td>
                    <td className="text-slate-400 text-[11px] font-mono">
                      {new Date(r.created_at).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                    </td>
                    <td>
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="text-right">
                      {r.status === 'PENDING' ? (
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleReject(r)}
                            className="btn-glass-danger px-3 py-1 rounded-xl text-xs font-semibold"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleOpenSign(r)}
                            className="btn-cyan-gradient px-4 py-1.5 rounded-xl text-xs flex items-center space-x-1.5 cursor-pointer"
                          >
                            <Key className="w-3.5 h-3.5 text-black" />
                            <span>Sign</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-500 font-mono text-[11px]">Processed</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-sans">
                    No requests found in this view category.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Signing Request Modal */}
      {signingRequest && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-panel-glow border border-white/15 rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-5 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h2 className="text-sm font-bold text-white uppercase flex items-center space-x-2">
                <Key className="w-4 h-4 text-cyan-400" />
                <span>Issue QDS: {signingRequest.request_id}</span>
              </h2>
              <button 
                onClick={() => setSigningRequest(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {!signingResult ? (
              <div className="space-y-4 text-xs">
                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 space-y-2 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Requested By:</span>
                    <span className="font-bold text-white">{signingRequest.requester_username}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Document Purpose:</span>
                    <span className="font-bold text-cyan-400">{signingRequest.purpose}</span>
                  </div>
                  <div className="flex flex-col space-y-1 pt-2 border-t border-white/10">
                    <span className="text-slate-400">Payload Message Content:</span>
                    <p className="text-[11px] bg-black/40 border border-white/10 p-3 rounded-xl text-slate-200 truncate">
                      {signingRequest.payload_content}
                    </p>
                  </div>
                </div>

                {/* Pauli & Bell Config */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1 uppercase text-[10px]">Pauli State Basis</label>
                    <select
                      value={signingBasis}
                      onChange={(e) => setSigningBasis(e.target.value)}
                      className="w-full glass-input p-2.5 text-white font-mono text-xs bg-[#0B1220]"
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
                    <label className="block text-slate-300 font-bold mb-1 uppercase text-[10px]">Entangled Bell State</label>
                    <select
                      value={signingBell}
                      onChange={(e) => setSigningBell(e.target.value)}
                      className="w-full glass-input p-2.5 text-white font-mono text-xs bg-[#0B1220]"
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
                    onClick={() => setSigningRequest(null)}
                    className="flex-1 btn-glass py-2.5 rounded-xl font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleExecuteSign}
                    disabled={isSigning}
                    className="flex-1 btn-cyan-gradient py-2.5 rounded-xl flex items-center justify-center space-x-2 font-bold cursor-pointer"
                  >
                    <Key className="w-4 h-4 text-black" />
                    <span>{isSigning ? 'Teleporting...' : 'Generate QDS'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-xs font-mono">
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 space-y-1 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                  <strong className="block text-emerald-400 font-bold">✓ Quantum Signature Generated Successfully!</strong>
                  <div>Signature ID: <span className="font-bold text-white">{signingResult.signature.signature_id}</span></div>
                  <div>QBER: <span className="font-bold text-white">{(signingResult.quantum_teleportation_key.qber * 100).toFixed(2)}%</span></div>
                  <div>Fidelity: <span className="font-bold text-white">{(signingResult.quantum_teleportation_key.fidelity * 100).toFixed(2)}%</span></div>
                </div>

                <QuantumCircuitVisualizer
                  inputState={signingResult.quantum_teleportation_key.input_state_symbol}
                  bellType={signingResult.quantum_teleportation_key.bell_state_type}
                  fidelity={signingResult.quantum_teleportation_key.fidelity}
                  qber={signingResult.quantum_teleportation_key.qber}
                  attackInjected={false}
                />

                <button
                  onClick={() => setSigningRequest(null)}
                  className="w-full btn-cyan-gradient py-2.5 rounded-xl font-bold text-xs"
                >
                  Done & Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SigningRequestsPage;
