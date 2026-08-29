# Q-SHIELD — Final Project Executive Summary
**SIH Problem Statement 26141 — Quantum-Inspired Cyber Threat Detection for Digital Signature Security**

---

## Executive Positioning

**Q-SHIELD** is a non-machine-learning, quantum-inspired cybersecurity framework designed to evaluate, verify, and monitor the security and integrity of **teleportation-based Quantum Digital Signature (QDS)** workflows.

The system combines quantum physics principles (Qiskit Aer quantum state simulation, Bell-state entanglement, Pauli eigenstate preparation, projective basis measurements, state fidelity, and density matrix trace distance) with non-ML statistical mechanics (SciPy Chi-Square Goodness-of-Fit and Wald Sequential Probability Ratio Testing) to detect digital signature threats deterministically.

---

## Key Security Vector Coverage

Q-SHIELD automatically detects 5 major attack vectors:

1. **Signature Forgery:** Detects fake/substituted payload quantum states via fidelity degradation ($\mathcal{F} \to 0$) and Binomial Forgery Risk CDF bounds.
2. **Sender Impersonation:** Detects classical Bell State Measurement (BSM) correction bit tampering, causing Bob's state recovery to fail ($\mathcal{F} \to 0.50$, $QBER \to 0.50$).
3. **Replay Attacks:** Rejects previously consumed nonces/sessions server-side (HTTP 409 Conflict) using immutable transaction tracking (`is_consumed`).
4. **Quantum Channel Manipulation:** Detects depolarizing channel noise ($\eta \ge 0.20$) using sequential SPRT Log-Likelihood Ratio ($\Lambda_n > +4.595$).
5. **Unauthorized Verification:** Blocks cross-organization verification attempts without clearance (HTTP 403 Forbidden).

---

## Technical Stack Architecture

- **Backend:** Django 5.x, Django REST Framework, Python 3.13
- **Quantum Simulation:** Qiskit 1.x, Qiskit Aer, NumPy, SciPy (Statistical Physics Engine)
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Recharts
- **Database & Security:** PostgreSQL / SQLite ORM, JWT Authentication, RBAC Permissions, Immutable Audit Logs

---

## Strict Non-AI/ML Policy Statement

Q-SHIELD contains **zero machine learning or artificial intelligence models**. All threat evaluation decisions are driven by physical quantum density matrix calculations, statistical hypothesis tests, and deterministic security rules.
