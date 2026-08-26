# Q-SHIELD Scientific & Operational Limitations

1. **Quantum Simulation Boundary**: Quantum states, Bell pairs, and teleportation circuits are simulated using **Qiskit Aer** CPU noise-free vector simulators. No physical quantum hardware execution is performed unless connected to IBM Quantum cloud APIs.
2. **Statistical Decision Bounds**: Decision engine thresholds rely on empirical error rates evaluated against preset threshold parameters ($\eta_v = 0.89$).
3. **Audit Log Tamper-Evidence**: SHA-256 event checksum chains provide cryptographic tamper detection upon audit inspection; they do not prevent direct raw database write access by privileged root database administrators.
4. **Controlled Attack Simulations**: Attack scenarios simulate specific defined threat categories (Digest Modification, Nonce Reuse, Role Escalation, Byte Mutation) against local Q-SHIELD test environment.
