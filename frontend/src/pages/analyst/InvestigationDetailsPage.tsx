import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Briefcase, ArrowLeft, Send, CheckCircle2, Clock, ShieldAlert, FileText, UserCheck, Tag, MessageSquare } from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingState } from '../../components/common/LoadingState';
import { api } from '../../services/api';
import { SecurityIncident, User } from '../../types';

interface InvestigationDetailsPageProps {
  currentUser: User | null;
}

export const InvestigationDetailsPage: React.FC<InvestigationDetailsPageProps> = ({ currentUser }) => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [incident, setIncident] = useState<SecurityIncident | null>(null);

  // Form State
  const [newNote, setNewNote] = useState('');
  const [statusVal, setStatusVal] = useState('INVESTIGATING');
  const [classificationVal, setClassificationVal] = useState('CONFIRMED_THREAT');
  const [resolutionNotes, setResolutionNotes] = useState('');
  
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);
  const [isSubmittingStatus, setIsSubmittingStatus] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    loadInvestigation();
  }, [id]);

  const loadInvestigation = async () => {
    setLoading(true);
    try {
      if (!id) return;
      const data = await api.getIncidentById(id);
      setIncident(data);
      setStatusVal(data.status || 'INVESTIGATING');
      setClassificationVal(data.classification || 'CONFIRMED_THREAT');
      setResolutionNotes(data.resolution_notes || '');
    } catch (err) {
      console.error('Failed to load investigation details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim() || !incident) return;

    setIsSubmittingNote(true);
    setSuccessMsg(null);
    try {
      await api.addIncidentNote(incident.id, newNote);
      setNewNote('');
      setSuccessMsg('Investigation note added to timeline successfully.');
      await loadInvestigation();
    } catch (err) {
      console.error('Failed to add investigation note:', err);
    } finally {
      setIsSubmittingNote(false);
    }
  };

  const handleUpdateWorkflowSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incident) return;

    setIsSubmittingStatus(true);
    setSuccessMsg(null);
    try {
      const updated = await api.updateIncidentWorkflow(incident.id, {
        status: statusVal,
        classification: classificationVal,
        resolution_notes: resolutionNotes,
      });
      setIncident(updated);
      setSuccessMsg('Investigation status and classification updated successfully.');
    } catch (err) {
      console.error('Failed to update investigation status:', err);
    } finally {
      setIsSubmittingStatus(false);
    }
  };

  if (loading) {
    return <LoadingState message="Fetching investigation timeline and evidence data..." />;
  }

  if (!incident) {
    return (
      <div className="p-8 text-center font-mono text-slate-400">
        Investigation #{id} not found or access denied.{' '}
        <Link to="/security-analyst/investigations" className="text-[#00C2FF] underline">
          Return to Investigations Workspace
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl font-sans">
      {/* Top Navigation */}
      <div>
        <Link
          to="/security-analyst/investigations"
          className="inline-flex items-center space-x-2 text-xs font-mono text-slate-400 hover:text-[#00C2FF] transition mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Investigations Directory</span>
        </Link>

        <div className="bg-[#0B1220] border border-[#1F2E4D] rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-2xl text-purple-400">
              <Briefcase className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center space-x-3">
                <h2 className="text-xl font-extrabold text-white">{incident.incident_number}</h2>
                <StatusBadge status={incident.status} />
                <span className="px-2.5 py-0.5 bg-purple-500/10 text-purple-300 border border-purple-500/30 rounded text-[10px] font-mono font-bold uppercase">
                  {incident.classification || 'INCONCLUSIVE'}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-1">
                Title: <strong className="text-white">{incident.title}</strong> • Assigned Analyst:{' '}
                <strong className="text-[#00C2FF]">{incident.assigned_to_username || currentUser?.username}</strong>
              </p>
            </div>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-[#10B981]/10 border border-[#10B981]/40 rounded-xl text-xs text-[#10B981] font-mono flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Grid: Case Details & Workflow Form vs Chronological Timeline & Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left 7 Cols: Incident Information & Workflow Update Form */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-[#0B1220]/90 border border-[#1F2E4D] rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-4">
            <h3 className="text-base font-extrabold text-white flex items-center space-x-2 border-b border-[#1F2E4D] pb-3">
              <FileText className="w-5 h-5 text-[#00C2FF]" />
              <span>Case Investigation Details</span>
            </h3>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between py-2 border-b border-[#1F2E4D]/40">
                <span className="text-slate-400">Incident Number:</span>
                <span className="font-bold text-[#00C2FF]">{incident.incident_number}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#1F2E4D]/40">
                <span className="text-slate-400">Category:</span>
                <span className="font-bold text-white">{incident.category}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#1F2E4D]/40">
                <span className="text-slate-400">Severity Level:</span>
                <StatusBadge status={incident.severity} size="sm" />
              </div>
              <div className="flex justify-between py-2 border-b border-[#1F2E4D]/40">
                <span className="text-slate-400">Related Signature ID:</span>
                <span className="font-bold text-[#00C2FF]">{incident.signature_id || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#1F2E4D]/40">
                <span className="text-slate-400">Source User:</span>
                <span className="font-bold text-purple-400">{incident.source_username || 'System Node'}</span>
              </div>

              <div className="pt-2 space-y-2">
                <span className="text-slate-400 block font-bold">Threat Description:</span>
                <div className="p-3 bg-[#131E33] border border-[#1F2E4D] rounded-xl text-slate-300 text-xs leading-relaxed">
                  {incident.description}
                </div>
              </div>
            </div>
          </div>

          {/* Workflow Status & Classification Form */}
          <form onSubmit={handleUpdateWorkflowSubmit} className="bg-[#0B1220]/90 border border-[#1F2E4D] rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-4">
            <h3 className="text-base font-extrabold text-white flex items-center space-x-2 border-b border-[#1F2E4D] pb-3 font-mono text-sm uppercase tracking-wider">
              <Tag className="w-4 h-4 text-purple-400" />
              <span>Update Investigation Lifecycle & Classification</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Investigation Status *
                </label>
                <select
                  value={statusVal}
                  onChange={(e) => setStatusVal(e.target.value)}
                  className="w-full bg-[#131E33] border border-[#1F2E4D] rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-purple-400"
                >
                  <option value="OPEN">OPEN</option>
                  <option value="INVESTIGATING">UNDER INVESTIGATION</option>
                  <option value="CONTAINED">CONTAINED</option>
                  <option value="RESOLVED">RESOLVED</option>
                  <option value="FALSE_POSITIVE">FALSE POSITIVE</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Threat Classification *
                </label>
                <select
                  value={classificationVal}
                  onChange={(e) => setClassificationVal(e.target.value)}
                  className="w-full bg-[#131E33] border border-[#1F2E4D] rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-purple-400"
                >
                  <option value="CONFIRMED_THREAT">CONFIRMED THREAT</option>
                  <option value="FALSE_POSITIVE">FALSE POSITIVE</option>
                  <option value="INCONCLUSIVE">INCONCLUSIVE</option>
                </select>
              </div>
            </div>

            <div className="font-mono text-xs space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                Resolution & Containment Summary Notes
              </label>
              <textarea
                rows={3}
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Enter investigation resolution notes, mitigation procedures executed, or false positive rationale..."
                className="w-full bg-[#131E33] border border-[#1F2E4D] rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSubmittingStatus}
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-black font-mono text-xs rounded-xl shadow-lg transition flex items-center space-x-2 disabled:opacity-50"
              >
                <UserCheck className="w-4 h-4" />
                <span>Save Case Updates</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right 5 Cols: Timeline & Investigation Notes */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Notes List & New Note Form */}
          <div className="bg-[#0B1220]/90 border border-[#1F2E4D] rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-4">
            <h3 className="text-base font-extrabold text-white flex items-center space-x-2 border-b border-[#1F2E4D] pb-3">
              <MessageSquare className="w-5 h-5 text-[#00C2FF]" />
              <span>Analyst Notes & Audit Trail</span>
            </h3>

            {/* Notes List */}
            <div className="space-y-3 font-mono text-xs max-h-64 overflow-y-auto pr-1">
              {!incident.notes || incident.notes.length === 0 ? (
                <div className="p-4 bg-[#131E33] border border-[#1F2E4D] rounded-xl text-slate-400 text-center text-xs">
                  No analyst notes added yet for this case.
                </div>
              ) : (
                incident.notes.map((n: any) => (
                  <div key={n.id} className="p-3 bg-[#131E33] border border-[#1F2E4D] rounded-xl space-y-1">
                    <div className="flex justify-between items-center text-[10px] text-slate-400">
                      <span className="font-bold text-[#00C2FF]">@{n.author_username || 'Analyst'}</span>
                      <span>{new Date(n.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-slate-200 text-xs leading-relaxed">{n.note}</p>
                  </div>
                ))
              )}
            </div>

            {/* Add New Note Input */}
            <form onSubmit={handleAddNoteSubmit} className="pt-2 space-y-2 font-mono text-xs">
              <textarea
                rows={3}
                required
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add investigation findings, evidence observations, or analyst notes..."
                className="w-full bg-[#131E33] border border-[#1F2E4D] rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-[#00C2FF]"
              />
              <button
                type="submit"
                disabled={!newNote.trim() || isSubmittingNote}
                className="w-full py-2 bg-[#00C2FF] hover:bg-[#00A8DE] text-[#0B1220] font-black font-mono text-xs rounded-xl shadow-lg transition flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Add Note to Investigation</span>
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
};
