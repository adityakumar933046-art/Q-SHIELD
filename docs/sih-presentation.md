# Smart India Hackathon (SIH) Presentation Deck

## Slide Structure & Content

1. **Title**: Q-SHIELD — Quantum Digital Signature & Verification Security Platform
2. **Problem Statement**: Vulnerability of classical digital signatures (RSA, ECDSA) to Shor's algorithm on quantum computers.
3. **Solution Overview**: Quantum Digital Signatures leveraging quantum state teleportation and statistical threshold verification.
4. **System Architecture**: Multi-layer FastAPI + React + Qiskit Aer + PostgreSQL + Redis topology.
5. **Quantum Engine**: Bell state pair creation ($|\Phi^+\rangle$) and quantum state teleportation.
6. **QDS Core Protocol**: One-time pad state binding, signature serialization, and session state machine.
7. **Verification Engine**: Computational basis measurement outcome evaluation and acceptance decision policy.
8. **Advanced Statistical Engine**: Empirical error rate calculation, Wilson score 95% confidence intervals, FAR/FRR.
9. **Security & Threat Model**: Nonce reuse protection, identity verification, RBAC authorization.
10. **Attack Simulation Engine**: Defense verification against Forgery, Replay, Impersonation, and Channel Byte Mutation (100% detection).
11. **Experiments & Benchmarking**: Repeated scenario iteration runner ($p_{50}$ latency: 0.0039s, throughput: 228 ops/sec).
12. **Noise Resilience Research**: Evaluated under 0%-20% noise levels; robust verification up to 5% error bounds.
13. **Audit & Forensics Engine**: SHA-256 event checksum chains and forensic investigation engine.
14. **Frontend Dashboard**: React + TypeScript executive dashboard.
15. **Production Deployment**: Docker Compose, Nginx proxy, non-root containers.
16. **Conclusion**: Production-ready Quantum Digital Signature security platform.
