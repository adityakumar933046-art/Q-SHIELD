import React, { useState, useEffect } from 'react';
import { AlertTriangle, ShieldAlert } from 'lucide-react';
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
    return <div className="p-8 text-center text-slate-500 font-mono">Loading Threat Detection System...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#0F172A] flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-[#F59E0B]" />
            <span>Statistical Threat Detection & Security Incidents</span>
          </h1>
          <p className="text-xs text-slate-500">
            Statistical threshold evaluator rules and incident mitigation tracking for QDS threats.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-[#F1F5F9] p-1 rounded-lg border border-[#E2E8F0] text-xs">
          <button
            onClick={() => setActiveTab('incidents')}
            className={`px-4 py-1.5 rounded-md font-bold transition ${
              activeTab === 'incidents' ? 'bg-[#0B1220] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Incidents ({incidents.length})
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`px-4 py-1.5 rounded-md font-bold transition ${
              activeTab === 'rules' ? 'bg-[#0B1220] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Statistical Rules ({rules.length})
          </button>
        </div>
      </div>

      {activeTab === 'incidents' ? (
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-4 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0B1220] text-white uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3 rounded-tl-lg">Incident ID</th>
                  <th className="px-4 py-3">Title & Category</th>
                  <th className="px-4 py-3">Severity</th>
                  <th className="px-4 py-3">QBER</th>
                  <th className="px-4 py-3">Fidelity</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 rounded-tr-lg">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-slate-700 font-mono">
                {incidents.map((inc) => (
                  <tr key={inc.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3 font-bold text-[#0B1220]">{inc.incident_number}</td>
                    <td className="px-4 py-3 font-sans">
                      <div className="font-semibold text-slate-900">{inc.title}</div>
                      <div className="text-[11px] text-slate-500">{inc.category}</div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={inc.severity} />
                    </td>
                    <td className="px-4 py-3 text-slate-900 font-bold">{(inc.qber * 100).toFixed(2)}%</td>
                    <td className="px-4 py-3 text-slate-900 font-bold">{(inc.fidelity * 100).toFixed(2)}%</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={inc.status} />
                    </td>
                    <td className="px-4 py-3 font-sans">
                      <button
                        onClick={() => {
                          setSelectedIncident(inc);
                          setNewStatus(inc.status);
                          setResolutionNotes(inc.resolution_notes);
                        }}
                        className="px-3 py-1 bg-white hover:bg-slate-100 text-[#0B1220] rounded border border-[#E2E8F0] text-[11px] font-bold shadow-sm"
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
            <div key={rule.id} className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-3 shadow-sm">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-[#00C2FF] uppercase font-bold">{rule.metric_type} METRIC RULE</span>
                  <h3 className="text-sm font-bold text-[#0F172A]">{rule.rule_name}</h3>
                </div>
                <StatusBadge status={rule.severity} />
              </div>

              <p className="text-xs text-slate-500">{rule.description}</p>

              <div className="bg-[#F8FAFC] p-3 rounded-lg border border-[#E2E8F0] font-mono text-xs flex justify-between items-center">
                <span className="text-slate-500">Statistical Boundary:</span>
                <span className="text-[#0B1220] font-bold text-sm">
                  {rule.metric_type} {rule.operator} {rule.threshold_value}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Incident Resolution Modal */}
      {selectedIncident && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 max-w-lg w-full space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-[#0F172A] flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 text-[#00C2FF]" />
              <span>Mitigate Security Incident: {selectedIncident.incident_number}</span>
            </h3>

            <form onSubmit={handleUpdateStatus} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1 uppercase text-[11px]">Update Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full bg-white border border-[#E2E8F0] rounded-lg p-2.5 text-slate-900 font-medium"
                >
                  <option value="OPEN">OPEN</option>
                  <option value="INVESTIGATING">UNDER INVESTIGATION</option>
                  <option value="MITIGATED">MITIGATED</option>
                  <option value="RESOLVED">RESOLVED</option>
                  <option value="FALSE_POSITIVE">FALSE POSITIVE</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1 uppercase text-[11px]">Resolution & Mitigation Notes</label>
                <textarea
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  rows={4}
                  className="w-full bg-white border border-[#E2E8F0] rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-[#00C2FF] font-mono text-xs"
                  placeholder="Enter mitigation procedures taken..."
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedIncident(null)}
                  className="px-4 py-2 bg-white border border-[#E2E8F0] text-slate-700 rounded-lg font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0B1220] hover:bg-[#131E33] text-white font-bold rounded-lg shadow-sm"
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
