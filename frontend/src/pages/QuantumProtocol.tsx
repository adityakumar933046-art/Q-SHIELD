import React from 'react';
import { QuantumCircuit } from '../components/QuantumCircuit';
import { MeasurementTable } from '../components/MeasurementTable';

export const QuantumProtocol: React.FC = () => {
  return (
    <div style={{ padding: '24px', color: '#F9FAFB' }}>
      <h2>Quantum Protocol & Teleportation Inspector</h2>
      <QuantumCircuit />
      <div style={{ marginTop: '24px' }}>
        <h3>Computational Basis Measurement Outcomes</h3>
        <MeasurementTable />
      </div>
    </div>
  );
};
