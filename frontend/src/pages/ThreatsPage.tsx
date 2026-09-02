import React, { useState, useEffect } from 'react';
import { AlertTriangle, ShieldAlert, X } from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import { api } from '../services/api';
import { SecurityIncident, ThresholdRule } from '../types';

export const ThreatsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'incidents' | 'rules'>('incidents');
  const [incidents, setIncidents] = useState<SecurityIncident[]>([]);
  const [rules, setRules] = useState<ThresholdRule[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedIncident, setSelectedIncident] = useState<SecurityIncident | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [newStatus, setNewStatus] = useState('RESOLVED');

  const loadData = async () => {
    try {
      const incData = await api.getIncidents();
      const ruleData = await api.getThresholdRules();
      setIncidents(incData);
      setRules(ruleData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIncident) return;
    try {
      await api.updateIncidentStatus(selectedIncident.id, newStatus, resolutionNotes);
      setSelectedIncident(null);
      setResolutionNotes('');
      await loadData();
    } catch (err) {
      console.error("Failed to update incident:", err);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400 font-mono flex items-center justify-center space-x-2">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
        <span>Loading Threat Detection System...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center space-x-3">
            <div className="p-2 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <span>Statistical Threat Detection & Security Incidents</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Statistical threshold evaluator rules and incident mitigation tracking for QDS threats.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-white/[0.04] p-1.5 rounded-2xl border border-white/10 text-xs">
          <button
            onClick={() => setActiveTab('incidents')}
            className={`px-4 py-2 rounded-xl font-bold transition ${
              activeTab === 'incidents' ? 'cyber-active-pill' : 'text-slate-400 hover:text-white'
            }`}
          >
            Incidents ({incidents.length})
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`px-4 py-2 rounded-xl font-bold transition ${
              activeTab === 'rules' ? 'cyber-active-pill' : 'text-slate-400 hover:text-white'
            }`}
          >
            Statistical Rules ({rules.length})
          </button>
        </div>
      </div>

      {activeTab === 'incidents' ? (
        <div className="glass-panel p-6 space-y-4 rounded-3xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/[0.04] text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3 rounded-l-xl">Incident ID</th>
                  <th className="px-4 py-3">Title & Category</th>
                  <th className="px-4 py-3">Severity</th>
                  <th className="px-4 py-3">QBER</th>
                  <th className="px-4 py-3">Fidelity</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 rounded-r-xl">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono text-slate-300">
                {incidents.map((inc) => (
                  <tr key={inc.id} className="hover:bg-white/[0.03] transition">
                    <td className="px-4 py-3.5 font-bold text-cyan-400">{inc.incident_number}</td>
                    <td className="px-4 py-3.5 font-sans">
                      <div className="font-semibold text-white">{inc.title}</div>
                      <div className="text-[11px] text-slate-400">{inc.category}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={inc.severity} />
                    </td>
                    <td className="px-4 py-3.5 text-white font-bold">{(inc.qber * 100).toFixed(2)}%</td>
                    <td className="px-4 py-3.5 text-white font-bold">{(inc.fidelity * 100).toFixed(2)}%</td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={inc.status} />
                    </td>
                    <td className="px-4 py-3.5 font-sans">
                      <button
                        onClick={() => {
                          setSelectedIncident(inc);
                          setNewStatus(inc.status);
                          setResolutionNotes(inc.resolution_notes);
                        }}
                        className="px-3 py-1.5 btn-glass text-cyan-400 hover:border-cyan-400/50 rounded-xl text-xs font-bold"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Statistical Threshold Rules Table */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rules.map((rule) => (
            <div key={rule.id} className="glass-card p-5 space-y-3">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold tracking-wider">{rule.metric_type} METRIC RULE</span>
                  <h3 className="text-sm font-bold text-white">{rule.rule_name}</h3>
                </div>
                <StatusBadge status={rule.severity} />
              </div>

              <p className="text-xs text-slate-400">{rule.description}</p>

              <div className="bg-white/[0.03] p-3 rounded-xl border border-white/5 font-mono text-xs flex justify-between items-center">
                <span className="text-slate-400">Statistical Boundary:</span>
                <span className="text-cyan-400 font-bold text-sm">
                  {rule.metric_type} {rule.operator} {rule.threshold_value}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Incident Resolution Modal */}
      {selectedIncident && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel border border-cyan-500/30 rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <ShieldAlert className="w-5 h-5 text-cyan-400" />
                <span>Mitigate Incident: {selectedIncident.incident_number}</span>
              </h3>
              <button 
                onClick={() => setSelectedIncident(null)}
                className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateStatus} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1 uppercase text-[10px] tracking-wider">Update Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full glass-input p-2.5 text-white font-medium focus:border-cyan-400"
                >
                  <option value="OPEN" className="bg-slate-900 text-white">OPEN</option>
                  <option value="INVESTIGATING" className="bg-slate-900 text-white">UNDER INVESTIGATION</option>
                  <option value="MITIGATED" className="bg-slate-900 text-white">MITIGATED</option>
                  <option value="RESOLVED" className="bg-slate-900 text-white">RESOLVED</option>
                  <option value="FALSE_POSITIVE" className="bg-slate-900 text-white">FALSE POSITIVE</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1 uppercase text-[10px] tracking-wider">Resolution & Mitigation Notes</label>
                <textarea
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  rows={4}
                  className="w-full glass-input p-3 text-white font-mono text-xs focus:border-cyan-400"
                  placeholder="Enter mitigation procedures taken..."
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedIncident(null)}
                  className="px-4 py-2.5 btn-glass text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 btn-cyan-gradient text-xs font-bold rounded-xl"
                >
                  Save Incident Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
