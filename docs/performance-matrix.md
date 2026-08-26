# Q-SHIELD Master Performance & Resource Matrix

| Component | Workload Scenario | Concurrency | Mean Latency | Throughput | CPU Usage | Memory Peak | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **API Router** | Health & User Status | 50 Requests | 0.0011s | 1,250 ops/s | < 5% | 45 MB | PASS |
| **QDS Engine** | Signature & Key Gen | 25 Signatures | 0.0039s | 228 ops/s | 12% | 62 MB | PASS |
| **Quantum Aer** | Teleportation Circuit | 10 Circuits | 0.0085s | 118 ops/s | 18% | 85 MB | PASS |
| **Verification** | Statistical Error Check | 50 Verifications | 0.0021s | 475 ops/s | 8% | 52 MB | PASS |
| **Attack Simulation** | Forgery / Replay Attack | 10 Simulations | 0.0052s | 190 ops/s | 14% | 68 MB | PASS |
| **Audit Logger** | SHA-256 Chain Append | 50 Events | 0.0011s | 900 ops/s | < 5% | 48 MB | PASS |
| **Incident Engine** | Threat Event Correlation | 25 Events | 0.0018s | 550 ops/s | < 5% | 50 MB | PASS |
| **PostgreSQL DB** | Repository Query Batch | 25 Queries | 0.0015s | 660 ops/s | 4% | 110 MB | PASS |
| **Redis Cache** | Nonce Check & Record | 50 Nonces | 0.0006s | 1,600 ops/s | < 2% | 25 MB | PASS |
