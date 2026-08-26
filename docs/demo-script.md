# Q-SHIELD Live Demonstration Script (5-10 Minutes)

## Step-by-Step SIH Presentation Workflow

1. **Dashboard Overview**: Open `http://localhost`. Display live metrics (Total Signatures, Verification Success Rate, Active Threats).
2. **QDS Signature Creation**: Navigate to `/signatures`. Create a quantum digital signature for a test message payload.
3. **Legitimate Verification**: Navigate to `/verification`. Submit signature ID & canonical message. Show `ACCEPTED` decision.
4. **Quantum Protocol Inspection**: Navigate to `/quantum`. View Bell-state preparation, entanglement verification, and teleportation circuit.
5. **Measurement Table**: Inspect computational basis outcomes ($|00angle, |01angle, |10angle, |11angle$).
6. **Forgery Simulation**: Navigate to `/attacks`. Select `FORGERY` scenario with modified digest. Execute simulation. Show `BLOCKED` defensive outcome.
7. **Replay Protection**: Re-submit identical signature request. Show Replay Protection Service blocking request with nonce conflict.
8. **Impersonation Defense**: Run `IMPERSONATION` scenario. Show Role-Based Access Control (RBAC) rejection.
9. **Experiment Runner**: Navigate to `/experiments`. Execute 10 iterations of `LEGITIMATE_VERIFICATION`. Inspect latency percentiles ($p_{50}$) and throughput.
10. **Statistical Analytics**: Navigate to `/statistics`. View Wilson score 95% confidence bounds and acceptance threshold.
11. **Audit Logs & Forensics**: Navigate to `/audit`. Inspect tamper-evident SHA-256 event checksums and run forensic timeline reconstruction.
