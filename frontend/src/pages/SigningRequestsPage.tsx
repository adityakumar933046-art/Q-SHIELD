import React, { useEffect, useState } from 'react';
import { Key, Activity, Clock, CheckCircle2, AlertOctagon } from 'lucide-react';
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
      <div className="p-8 text-center text-slate-500 flex items-center justify-center space-x-3 font-sans">
        <Activity className="w-5 h-5 animate-spin text-[#00C2FF]" />
        <span>PULLING OUTGOING SIGNATURE REQUESTS...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-slate-800 bg-[#F8FAFC] p-6 rounded-2xl min-h-screen">
      <div>
        <h1 className="text-xl font-bold text-slate-800 tracking-tight flex items-center space-x-2">
          <Key className="w-5 h-5 text-[#00C2FF]" />
          <span>Signing Requests Inbox</span>
        </h1>
        <p className="text-xs text-slate-500">
          Sign document requests sent to you using your secure Quantum Teleportation Key.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 text-xs font-bold space-x-6">
        {(['ALL', 'PENDING', 'COMPLETED', 'REJECTED'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2.5 px-1 border-b-2 transition uppercase ${
              activeTab === tab 
                ? 'border-[#00C2FF] text-[#00C2FF] font-bold' 
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            {tab.toLowerCase()} ({requests.filter(r => tab === 'ALL' || r.status === tab).length})
          </button>
        ))}
      </div>

      {/* Request Table */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-[#E2E8F0] text-slate-400 font-semibold uppercase text-[10px]">
              <tr>
                <th className="px-6 py-4">Request ID</th>
                <th className="px-6 py-4">Requested By</th>
                <th className="px-6 py-4">Purpose</th>
                <th className="px-6 py-4 text-center">Verifiers Required</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9] font-medium text-slate-600 font-sans">
              {filteredRequests.length > 0 ? (
                filteredRequests.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 font-bold text-slate-900">{r.request_id}</td>
                    <td className="px-6 py-4 text-slate-500 font-sans">{r.requester_username || ''}</td>
                    <td className="px-6 py-4 text-slate-800 font-sans font-bold">{r.purpose}</td>
                    <td className="px-6 py-4 text-center text-slate-800">{r.verifiers_count}</td>
                    <td className="px-6 py-4 text-slate-400 font-sans text-[11px]">
                      {new Date(r.created_at).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 font-sans">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-6 py-4 text-right font-sans space-x-2">
                      {r.status === 'PENDING' ? (
                        <>
                          <button
                            onClick={() => handleReject(r)}
                            className="bg-slate-50 hover:bg-red-50 text-red-500 font-bold px-3 py-1.5 rounded-lg border border-slate-200 hover:border-red-200 transition text-[11px]"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleOpenSign(r)}
                            className="bg-[#0B1220] hover:bg-[#131E33] text-[#00C2FF] font-bold px-4 py-1.5 rounded-lg border border-[#00C2FF]/30 transition text-[11px]"
                          >
                            Sign
                          </button>
                        </>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-semibold uppercase">Closed</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-400 font-sans font-normal">
                    No signature requests found in this folder.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Signing modal */}
      {signingRequest && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-xl w-full shadow-2xl space-y-4 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-800 uppercase flex items-center space-x-2">
                <Key className="w-4 h-4 text-[#00C2FF]" />
                <span>Issue QDS: {signingRequest.request_id}</span>
              </h2>
              <button 
                onClick={() => setSigningRequest(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {!signingResult ? (
              <div className="space-y-4 text-xs">
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Requested By:</span>
                    <span className="font-bold text-slate-700">{signingRequest.requester_username}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Document Purpose:</span>
                    <span className="font-bold text-slate-700">{signingRequest.purpose}</span>
                  </div>
                  <div className="flex flex-col space-y-1 pt-1 border-t border-slate-200">
                    <span className="text-slate-500">Payload Message Content:</span>
                    <p className="font-sans text-[11px] bg-white border border-slate-200 p-2.5 rounded-lg text-slate-800 truncate">
                      {signingRequest.payload_content}
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
                      className="w-full bg-white border border-[#E2E8F0] rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-[#00C2FF] font-sans"
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
                      className="w-full bg-white border border-[#E2E8F0] rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-[#00C2FF] font-sans"
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
                    onClick={() => setSigningRequest(null)}
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
                  <div className="text-emerald-700 font-bold text-sm">Signature Success!</div>
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
                  onClick={() => setSigningRequest(null)}
                  className="w-full bg-[#0B1220] text-white font-bold py-2 rounded-lg text-xs"
                >
                  Done
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
