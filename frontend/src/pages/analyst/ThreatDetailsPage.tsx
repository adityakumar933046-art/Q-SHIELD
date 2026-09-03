import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Briefcase, Cpu, CheckCircle2, AlertTriangle, FileText, Lock, Activity, ShieldCheck } from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingState } from '../../components/common/LoadingState';
import { api } from '../../services/api';
import { SecurityIncident, User } from '../../types';

interface ThreatDetailsPageProps {
  currentUser: User | null;
}

export const ThreatDetailsPage: React.FC<ThreatDetailsPageProps> = ({ currentUser }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [threat, setThreat] = useState<SecurityIncident | null>(null);

  useEffect(() => {
    loadThreatDetails();
  }, [id]);

  const loadThreatDetails = async () => {
    setLoading(true);
    try {
      if (!id) return;
      const data = await api.getIncidentById(id);
      setThreat(data);
    } catch (err) {
      console.error('Failed to load threat details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartInvestigation = async () => {
    if (!threat) return;
    try {
      if (threat.status === 'OPEN') {
        await api.updateIncidentWorkflow(threat.id, {
          status: 'INVESTIGATING',
          classification: 'CONFIRMED_THREAT',
        });
      }
      navigate(`/security-analyst/investigations/${threat.id}`);
    } catch (err) {
      console.error('Failed to update investigation state:', err);
      navigate(`/security-analyst/investigations/${threat.id}`);
    }
  };

  if (loading) {
    return <LoadingState message="Validating authorization and pulling threat evidence panel..." />;
  }

  if (!threat) {
    return (
      <div className="p-8 text-center font-mono text-slate-400">
        Threat ID #{id} not found or access denied.{' '}
        <Link to="/security-analyst/threats" className="text-[#00C2FF] underline">
          Return to Threat Monitoring
        </Link>
      </div>
    );
  }

  const evidence = threat.evidence_data || {};

  return (
    <div className="space-y-8 max-w-5xl font-sans">
      {/* Navigation */}
      <div>
        <Link
          to="/security-analyst/threats"
          className="inline-flex items-center space-x-2 text-xs font-mono text-slate-400 hover:text-[#00C2FF] transition mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Threat Monitoring</span>
        </Link>

        <div className="bg-[#0B1220] border border-[#1F2E4D] rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-2xl text-[#EF4444]">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center space-x-3">
                <h2 className="text-xl font-extrabold text-white">{threat.incident_number}</h2>
                <StatusBadge status={threat.severity} />
                <StatusBadge status={threat.status} />
              </div>
              <p className="text-xs text-slate-400 font-mono mt-1">
                Category: <strong className="text-white">{threat.category}</strong> • Detected:{' '}
                {threat.created_at ? new Date(threat.created_at).toLocaleString() : 'Recent'}
              </p>
            </div>
          </div>

          <button
            onClick={handleStartInvestigation}
            className="px-6 py-3 bg-[#EF4444] hover:bg-red-600 text-white font-black font-mono text-xs uppercase tracking-wider rounded-xl shadow-lg transition flex items-center space-x-2 shrink-0"
          >
            <Briefcase className="w-4 h-4" />
            <span>{threat.status === 'OPEN' ? 'Start Investigation' : 'Open Investigation Workspace'}</span>
          </button>
        </div>
      </div>

      {/* Grid: Basic Info & Evidence Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left 6 Cols: Basic Info & Related Entities */}
        <div className="lg:col-span-6 bg-[#0B1220]/90 border border-[#1F2E4D] rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-4">
          <h3 className="text-base font-extrabold text-white flex items-center space-x-2 border-b border-[#1F2E4D] pb-3">
            <FileText className="w-5 h-5 text-[#00C2FF]" />
            <span>Threat Incident Overview</span>
          </h3>

          <div className="space-y-3 font-mono text-xs">
            <div className="flex justify-between py-2 border-b border-[#1F2E4D]/40">
              <span className="text-slate-400">Incident Number:</span>
              <span className="font-bold text-[#00C2FF]">{threat.incident_number}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#1F2E4D]/40">
              <span className="text-slate-400">Threat Category:</span>
              <span className="font-bold text-white">{threat.category}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#1F2E4D]/40">
              <span className="text-slate-400">Detection Source:</span>
              <span className="font-bold text-purple-400">{threat.detection_source || 'QDS Verification Engine'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#1F2E4D]/40">
              <span className="text-slate-400">Related Signature ID:</span>
              <span className="font-bold text-[#00C2FF]">{threat.signature_id || 'N/A'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#1F2E4D]/40">
              <span className="text-slate-400">Source User / Node:</span>
              <span className="font-bold text-white">{threat.source_username || 'System Node'}</span>
            </div>

            <div className="pt-2 space-y-2">
              <span className="text-slate-400 block font-bold">Detection Summary Explanation:</span>
              <div className="p-3.5 bg-[#131E33] border border-[#1F2E4D] rounded-xl text-slate-300 text-xs leading-relaxed">
                {threat.description}
              </div>
            </div>
          </div>
        </div>

        {/* Right 6 Cols: EVIDENCE PANEL */}
        <div className="lg:col-span-6 bg-[#0B1220]/90 border border-[#1F2E4D] rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-4">
          <h3 className="text-base font-extrabold text-white flex items-center space-x-2 border-b border-[#1F2E4D] pb-3">
            <Cpu className="w-5 h-5 text-[#EF4444]" />
            <span>Quantum & Cryptographic Evidence Panel</span>
          </h3>

          <div className="space-y-3 font-mono text-xs">
            <div className="p-3.5 bg-[#131E33] border border-[#1F2E4D] rounded-xl flex items-center justify-between">
              <span className="text-slate-400">Quantum State Fidelity (F):</span>
              <span
                className={`font-extrabold ${
                  (threat.fidelity || 1.0) < 0.85 ? 'text-[#EF4444]' : 'text-[#10B981]'
                }`}
              >
                {((threat.fidelity || 1.0) * 100).toFixed(2)}%
              </span>
            </div>

            <div className="p-3.5 bg-[#131E33] border border-[#1F2E4D] rounded-xl flex items-center justify-between">
              <span className="text-slate-400">Quantum Error Rate (QBER):</span>
              <span
                className={`font-extrabold ${
                  (threat.qber || 0.0) > 0.11 ? 'text-[#EF4444]' : 'text-[#10B981]'
                }`}
              >
                {((threat.qber || 0.0) * 100).toFixed(2)}%
              </span>
            </div>

            <div className="p-3.5 bg-[#131E33] border border-[#1F2E4D] rounded-xl flex items-center justify-between">
              <span className="text-slate-400">Forgery Probability Metric:</span>
              <span
                className={`font-extrabold ${
                  (threat.forgery_probability || 0.0) > 0.05 ? 'text-[#EF4444]' : 'text-[#10B981]'
                }`}
              >
                {((threat.forgery_probability || 0.0) * 100).toFixed(2)}%
              </span>
            </div>

            {evidence.rules_breached && evidence.rules_breached.length > 0 && (
              <div className="p-3.5 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-xl space-y-1.5 text-[#EF4444]">
                <span className="font-bold block uppercase text-[10px]">Deterministic Rules Breached:</span>
                <ul className="list-disc list-inside space-y-1 text-[11px]">
                  {evidence.rules_breached.map((r: string, idx: number) => (
                    <li key={idx}>{r}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
