# Q-SHIELD Architecture & Technical Specification

## SIH Problem Statement 26141
**Title:** Quantum-Inspired Cyber Threat Detection for Digital Signature Security (Q-SHIELD)

---

## 1. System Overview & Core Philosophy

Q-SHIELD is an enterprise software framework engineered to provide quantum-inspired cyber threat detection for digital signatures using teleportation-based Quantum Digital Signatures (QDS).

### Strict Non-AI / Non-ML Principle
The core threat detection and quantum anomaly analysis engine operates **strictly without Artificial Intelligence (AI) or Machine Learning (ML)**. Threat detection relies entirely on:
- Quantum statistical mechanics & density matrix state fidelity $\mathcal{F}(\rho, \sigma)$
- Quantum Bit Error Rate (QBER) security upper bounds ($\eta_{QBER} = 0.11$)
- Chi-Square ($\chi^2$) goodness-of-fit hypothesis testing against theoretical Pauli state probabilities
- Sequential Probability Ratio Test (SPRT) log-likelihood LLR limits
- Forgery probability upper bounds derived from binomial cumulative distributions $P_{forgery}$

---

## 2. Teleportation-Based Quantum Digital Signature (QDS) Mechanics

Q-SHIELD implements full 3-qubit quantum teleportation key distribution using Qiskit:

```
Alice Qubit 0 (|psi>):  ── Prep |psi> ─── ● ──── H ──── [Meas c0] ═══════════════════════╗ (Z Control)
                                         │                                                ║
Alice Qubit 1 (Bell):   ── [H] ─── ● ──── ⊕ ─────────── [Meas c1] ═══════╗ (X Control)    ║
                                   │                                     ║                ║
Bob Qubit 2 (Bell):     ─────────── ⊕ ─────────────────────────────────── ╩ ────────────── ╩ ── Pauli X/Z ── Projective P_k
```

1. **State Preparation ($| \psi \rangle$)**:
   Pauli eigenstates prepared via standard unitary rotations:
   - $|0\rangle, |1\rangle$ (Z basis)
   - $|+\rangle, |-\rangle$ (X basis)
   - $|+i\rangle, |-i\rangle$ (Y basis)
2. **Bell Entanglement Pair Preparation**:
   $$|\Phi^+\rangle = \frac{|00\rangle + |11\rangle}{\sqrt{2}}$$
3. **Bell-State Measurement (BSM)**:
   Sender (Alice) performs CNOT on qubit 0 $\to$ qubit 1, Hadamard on qubit 0, and measures classical bits $(c_0, c_1)$.
4. **Bob Pauli Recovery Operator**:
   Bob applies Pauli operator $X^{c_1} Z^{c_0}$ to reconstruct state $|\psi\rangle$ on qubit 2.
5. **Projective Verification**:
   Bob performs projective measurements $P_k = |\psi\rangle\langle\psi|$ in matching Pauli basis.

---

## 3. Modular Django App Architecture

The backend is structured into 11 decoupled domain apps:

| App Name | Responsibilities |
|---|---|
| `accounts` | User authentication, RBAC roles (`ADMIN`, `SECURITY_OFFICER`, `QUANTUM_OPERATOR`, `AUDITOR`), SimpleJWT auth. |
| `organizations` | Tenant organization node management, domain binding, max node limits. |
| `qds` | Quantum Digital Signature issuance, SHA-256 message digest hashing, key status tracking. |
| `quantum_engine` | Qiskit simulation engine for Pauli state prep, Bell entanglement, BSM, Pauli recovery, and density matrix statevector trace distance. |
| `verification` | Teleportation verification workflow, payload SHA-256 validation, projective state checks. |
| `statistics_engine` | Pure mathematical hypothesis testing: Chi-Square ($\chi^2$) goodness-of-fit, SPRT log-likelihood ratios, binomial forgery probability bounds. |
| `threat_detection` | Statistical threshold rule evaluator ($\eta_{QBER}=0.11, \eta_{fidelity}=0.85, \alpha=0.05$). Auto-flags threats & generates incidents. |
| `attack_simulator` | Malicious vector generator (Forgery, Impersonation, Replay, Quantum Channel Noise, Unauthorized Verification). |
| `incidents` | Security incident mitigation lifecycle tracking (`OPEN`, `INVESTIGATING`, `MITIGATED`, `RESOLVED`, `FALSE_POSITIVE`). |
| `analytics` | Live telemetry aggregation, time-series QBER tracking, threat category distributions. |
| `audit` | Read-only immutable transaction audit trail logging all cryptographic operations and security evaluations. |

---

## 4. Cyber Threat Vectors & Detection Rules

| Attack Vector | Physics Symptom | Detection Rule Trigger | Severity |
|---|---|---|---|
| **Signature Forgery** | Attacker lacks secret Pauli keys $\to$ Measurement outcomes randomized | $P_{forgery} > 0.05$ or $QBER > 0.20$ | CRITICAL |
| **Sender Impersonation** | Attacker tampers classical BSM bits $(c_0, c_1)$ | State Fidelity $\mathcal{F} < 0.70$ and $\chi^2$ $p$-value $< 0.01$ | HIGH |
| **Replay Attack** | Replaying stale measurement records | Deterministic timestamp/nonce mismatch or static zero-variance | HIGH |
| **Channel Manipulation** | Phase/bit flip noise or eavesdropper intercept-resend | $QBER > 0.11$ or SPRT decision `ATTACK_DETECTED` | HIGH |
| **Unauthorized Verification** | Non-authorized node requesting verification | RBAC role failure or invalid key signature | CRITICAL |

---

## 5. Security & Verification Strategy

- **Database**: PostgreSQL support via `dj-database-url` and `django-environ` with automatic SQLite fallback for local zero-config execution.
- **API Exception Handling**: Custom global DRF exception handler (`qshield.exceptions.custom_exception_handler`).
- **Logging**: Configured verbose logging to console and `logs/qshield.log`.
- **Frontend Stack**: React 18, TypeScript, Vite, Tailwind CSS with custom cyber dark theme, Recharts live telemetry visualization.
