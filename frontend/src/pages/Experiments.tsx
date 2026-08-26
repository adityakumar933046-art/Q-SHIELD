import React from 'react';

export const Experiments: React.FC = () => {
  return (
    <div style={{ padding: '24px', color: '#F9FAFB' }}>
      <h2>Experiment & Benchmarking Suite</h2>
      <div style={{ background: '#1F2937', padding: '20px', borderRadius: '8px', marginTop: '16px' }}>
        <h4>Recent Experiment: LEGITIMATE_VERIFICATION (10 Iterations)</h4>
        <p><strong>Status:</strong> COMPLETED</p>
        <p><strong>Median Latency (p50):</strong> 0.0047s</p>
        <p><strong>Throughput:</strong> 92.28 ops/sec</p>
      </div>
    </div>
  );
};
