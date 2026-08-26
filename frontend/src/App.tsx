import React, { useState } from 'react';
import { Dashboard } from './pages/Dashboard';
import { Signatures } from './pages/Signatures';
import { Verification } from './pages/Verification';
import { QuantumProtocol } from './pages/QuantumProtocol';
import { ThreatDetection } from './pages/ThreatDetection';
import { AttackSimulator } from './pages/AttackSimulator';
import { Statistics } from './pages/Statistics';
import { Experiments } from './pages/Experiments';
import { AuditLogs } from './pages/AuditLogs';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderPage = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'signatures': return <Signatures />;
      case 'verification': return <Verification />;
      case 'quantum': return <QuantumProtocol />;
      case 'threats': return <ThreatDetection />;
      case 'attacks': return <AttackSimulator />;
      case 'statistics': return <Statistics />;
      case 'experiments': return <Experiments />;
      case 'audit': return <AuditLogs />;
      default: return <Dashboard />;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#111827', fontFamily: 'system-ui, sans-serif' }}>
      {/* Sidebar Navigation */}
      <div style={{ width: '240px', background: '#1F2937', padding: '20px', color: '#F9FAFB', borderRight: '1px solid #374151' }}>
        <h3 style={{ color: '#10B981', marginBottom: '24px' }}>🛡️ Q-SHIELD</h3>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                textAlign: 'left',
                padding: '10px 14px',
                borderRadius: '6px',
                border: 'none',
                background: activeTab === item.id ? '#374151' : 'transparent',
                color: activeTab === item.id ? '#10B981' : '#D1D5DB',
                cursor: 'pointer',
                fontWeight: activeTab === item.id ? 'bold' : 'normal',
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content Area */}
      <div style={{ flexGrow: 1, overflowY: 'auto' }}>
        {renderPage()}
      </div>
    </div>
  );
};

const navItems = [
  { id: 'dashboard', label: '📊 Dashboard' },
  { id: 'signatures', label: '✍️ Signatures' },
  { id: 'verification', label: '🔍 Verification' },
  { id: 'quantum', label: '⚛️ Quantum Protocol' },
  { id: 'threats', label: '⚠️ Threat Detection' },
  { id: 'attacks', label: '⚔️ Attack Simulator' },
  { id: 'statistics', label: '📈 Statistics' },
  { id: 'experiments', label: '🧪 Experiments' },
  { id: 'audit', label: '📜 Audit Logs' },
];

export default App;
