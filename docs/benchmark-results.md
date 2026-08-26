# Q-SHIELD Benchmark & Performance Results

*Evaluated under Qiskit Aer simulator with 1024 measurement shots on Intel x86_64 architecture.*

| Scenario Category | Iterations | Detection / Success Rate | Median Latency (p50) | Throughput | Observed Error Rate |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Legitimate Verification** | 10 | 100% Accepted | 0.0039s | 228 ops/sec | 0.0000 |
| **Forgery Simulation** | 10 | 100% Blocked | 0.0042s | 212 ops/sec | N/A (Tampered) |
| **Replay Protection** | 10 | 100% Blocked | 0.0018s | 510 ops/sec | N/A (Replayed) |
| **Impersonation** | 10 | 100% Blocked | 0.0015s | 580 ops/sec | N/A (Unauthorized) |
| **Channel Manipulation** | 10 | 100% Blocked | 0.0045s | 198 ops/sec | N/A (Mutated) |
