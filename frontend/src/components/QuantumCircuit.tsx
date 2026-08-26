import React from 'react';

export const QuantumCircuit: React.FC = () => {
  return (
    <div style={{ background: '#111827', padding: '20px', borderRadius: '8px', color: '#F9FAFB' }}>
      <h4>Q-SHIELD Teleportation & Bell-State Circuit Schema</h4>
      <svg width="100%" height="160" style={{ background: '#1F2937', borderRadius: '6px' }}>
        {/* Qubit Wires */}
        <text x="20" y="40" fill="#9CA3AF" fontSize="14">|Ψ⟩ (q0)</text>
        <line x1="80" y1="35" x2="520" y2="35" stroke="#4B5563" strokeWidth="2" />
        
        <text x="20" y="80" fill="#9CA3AF" fontSize="14">|0⟩ (q1)</text>
        <line x1="80" y1="75" x2="520" y2="75" stroke="#4B5563" strokeWidth="2" />
        
        <text x="20" y="120" fill="#9CA3AF" fontSize="14">|0⟩ (q2)</text>
        <line x1="80" y1="115" x2="520" y2="115" stroke="#4B5563" strokeWidth="2" />

        {/* Gates */}
        {/* H Gate on q1 */}
        <rect x="120" y="60" width="30" height="30" fill="#3B82F6" rx="4" />
        <text x="130" y="80" fill="#FFF" fontWeight="bold">H</text>

        {/* CNOT q1 -> q2 */}
        <circle cx="135" cy="75" r="4" fill="#10B981" />
        <line x1="135" y1="75" x2="135" y2="115" stroke="#10B981" strokeWidth="2" />
        <circle cx="135" cy="115" r="8" fill="none" stroke="#10B981" strokeWidth="2" />

        {/* CNOT q0 -> q1 */}
        <circle cx="220" cy="35" r="4" fill="#10B981" />
        <line x1="220" y1="35" x2="220" y2="75" stroke="#10B981" strokeWidth="2" />
        <circle cx="220" cy="75" r="8" fill="none" stroke="#10B981" strokeWidth="2" />

        {/* H Gate on q0 */}
        <rect x="260" y="20" width="30" height="30" fill="#3B82F6" rx="4" />
        <text x="270" y="40" fill="#FFF" fontWeight="bold">H</text>

        {/* Measurement M */}
        <rect x="340" y="20" width="30" height="30" fill="#F59E0B" rx="4" />
        <text x="348" y="40" fill="#FFF" fontWeight="bold">M</text>

        <rect x="340" y="60" width="30" height="30" fill="#F59E0B" rx="4" />
        <text x="348" y="80" fill="#FFF" fontWeight="bold">M</text>

        {/* Pauli Corrections */}
        <rect x="440" y="100" width="30" height="30" fill="#8B5CF6" rx="4" />
        <text x="448" y="120" fill="#FFF" fontWeight="bold">XZ</text>
      </svg>
    </div>
  );
};
