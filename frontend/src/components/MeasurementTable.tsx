import React from 'react';

interface Props {
  counts?: Record<string, number>;
  shots?: number;
}

export const MeasurementTable: React.FC<Props> = ({ counts = { '0': 512, '1': 512 }, shots = 1024 }) => {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '12px', background: '#1F2937', color: '#F9FAFB' }}>
      <thead>
        <tr style={{ background: '#374151', textAlign: 'left' }}>
          <th style={cellStyle}>Computational Basis Outcome</th>
          <th style={cellStyle}>Count</th>
          <th style={cellStyle}>Empirical Probability</th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(counts).map(([outcome, count]) => (
          <tr key={outcome} style={{ borderBottom: '1px solid #374151' }}>
            <td style={cellStyle}>|{outcome}⟩</td>
            <td style={cellStyle}>{count}</td>
            <td style={cellStyle}>{(count / (shots || 1)).toFixed(4)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const cellStyle: React.CSSProperties = {
  padding: '10px',
};
