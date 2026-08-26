import React from 'react';
import { AttackPanel } from '../components/AttackPanel';

export const AttackSimulator: React.FC = () => {
  return (
    <div style={{ padding: '24px', color: '#F9FAFB' }}>
      <h2>Attack Simulation & Threat Testing</h2>
      <AttackPanel />
    </div>
  );
};
