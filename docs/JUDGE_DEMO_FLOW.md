# Q-SHIELD — SIH Grand Finale 5–10 Minute Presentation Script & Judge Q&A Guide
**SIH Problem Statement 26141 — Quantum-Inspired Cyber Threat Detection for Digital Signature Security**

---

## 1. Timed 10-Minute Presentation Sequence

| Timestamp | Presentation Phase | Action / Demonstration | Key Result Shown |
|---|---|---|---|
| **0:00 - 0:45** | **Problem Statement** | Explain vulnerability of classical signatures to quantum forgery and channel tampering. | Non-ML SIH 26141 requirement. |
| **0:45 - 1:30** | **Q-SHIELD Architecture** | Show 4-role RBAC, Django API, Qiskit Aer simulation, and SciPy statistical engines. | No-AI/ML policy. |
| **1:30 - 2:30** | **Signer Creates QDS** | Login as `signer_alice`. Input text, select basis `|+>`, Bell state `PHI_PLUS`. Click Generate. | QEXEC ID, SHA-256 Digest, Nonce generated. |
| **2:30 - 3:30** | **Verifier Legitimate Demo** | Login as `verifier_bob`. Verify signature. | **VERIFIED** ($\mathcal{F}=1.0, QBER=0.0$, SPRT=Honest). |
| **3:30 - 4:00** | **Document Tampering Demo** | Verifier modifies payload text to `"TAMPERED Text"`. Click Verify. | **REJECTED_DIGEST_MISMATCH** (SHA-256 diff). |
| **4:00 - 4:45** | **Signature Forgery Demo** | Open Attack Simulator. Select `FORGERY`. Execute. | **REJECTED (SIGNATURE_FORGERY)** ($\mathcal{F}\to 0$). |
| **4:45 - 5:30** | **Replay Attack Demo** | Submit previously verified consumed signature. | **REJECTED_REPLAY_ATTACK** (HTTP 409 Conflict). |
| **5:30 - 6:15** | **Sender Impersonation Demo**| Select `IMPERSONATION` (BSM bit tamper). Execute. | **REJECTED (SENDER_IMPERSONATION)** ($\mathcal{F}=0.50$). |
| **6:15 - 7:00** | **Channel Manipulation** | Run 5%, 10%, 20%, 30%, 50% noise sweep. | **CHANNEL_MANIPULATION** (SPRT LLR > +4.595). |
| **7:00 - 7:45** | **Unauthorized Verification**| Org C verifier attempts verification on Org A signature. | **UNAUTHORIZED** (HTTP 403 Forbidden). |
| **7:45 - 8:30** | **Security Analyst SOC** | Login as `analyst_carol`. View active incidents, QBER charts, SPRT curves, Audit Trail. | Real-time backend API telemetry. |
| **8:30 - 9:30** | **Quantum & Stat Physics** | Explain density matrix trace ($\text{Tr}(\rho)=1$), Chi-Square, SPRT boundaries, Binomial CDF. | Rigorous mathematical mechanics. |
| **9:30 - 10:00** | **Scope & Conclusion** | Disclose scope (single-qubit key representation, depolarizing approximation). | Final presentation wrap-up. |

---

## 2. Concise Judge Q&A Guide (25 Questions)

### Q1: What problem are you solving?
**A:** Securing digital signatures against forgery, replay, impersonation, and quantum channel tampering using quantum teleportation principles and statistical threat detection.

### Q2: Why are classical signatures vulnerable in the quantum era?
**A:** Shor's algorithm efficiently solves prime factorization (RSA) and discrete logarithms (ECDSA). QDS provides quantum physics-based authentication properties.

### Q3: What is QDS (Quantum Digital Signature)?
**A:** A digital signature scheme where signature states are encoded in quantum states ($|0\rangle, |1\rangle, |+\rangle, |-\rangle$), enabling verification via quantum measurement and entanglement correlation.

### Q4: Where is quantum computing used in Q-SHIELD?
**A:** In the core Quantum Engine (`apps/quantum_engine/services.py`), using Qiskit Aer to simulate 3-qubit teleportation circuits, Bell pair entanglement, and density matrix statevector measurements.

### Q5: Why Qiskit?
**A:** Qiskit is the industry-standard open-source quantum SDK by IBM, enabling exact density matrix trace calculations, statevector partial tracing, and state fidelity estimation.

### Q6: What is Bell-state entanglement?
**A:** A pair of maximally entangled qubits (e.g. $|\Phi^+\rangle = \frac{|00\rangle+|11\rangle}{\sqrt{2}}$) where measuring one qubit instantly determines the state of the other.

### Q7: What is quantum teleportation?
**A:** A protocol that transfers an unknown quantum state $|\psi\rangle$ from Alice to Bob using a shared Bell pair and 2 bits of classical Bell State Measurement (BSM) information.

### Q8: What are Pauli operators?
**A:** The fundamental single-qubit quantum gates $I, X, Y, Z$. Their eigenstates ($|0\rangle, |1\rangle, |+\rangle, |-\rangle, |+i\rangle, |-i\rangle$) form orthogonal measurement bases.

### Q9: What is projective measurement?
**A:** Projecting a quantum state onto a chosen measurement basis ($X, Y,$ or $Z$), collapsing the state into a classical bit outcome ($0$ or $1$).

### Q10: What is QBER (Quantum Bit Error Rate)?
**A:** The ratio of mismatched error measurements to total measured shots: $QBER = N_{\text{error\_shots}} / N_{\text{total\_shots}}$.

### Q11: What is State Fidelity ($\mathcal{F}$)?
**A:** A measure of quantum state overlap: $\mathcal{F}(\rho, |\psi\rangle) = \langle\psi|\rho|\psi\rangle \in [0, 1]$. Ideal noiseless teleportation yields $\mathcal{F} = 1.0$.

### Q12: What is Trace Distance ($D$)?
**A:** The physical distance between two quantum density matrices: $D(\rho, \sigma) = \frac{1}{2} \text{Tr}|\rho - \sigma| \in [0, 1]$. Identical states yield $D = 0.0$.

### Q13: Why Chi-Square goodness-of-fit?
**A:** Chi-Square compares observed measurement shot counts against theoretical Pauli target expectations to detect anomalous measurement distributions without machine learning.

### Q14: Why SPRT (Sequential Probability Ratio Test)?
**A:** SPRT evaluates sequential shot streams against upper ($+4.595$) and lower ($-4.595$) Wald decision boundaries, detecting channel noise rapidly with minimal sample size.

### Q15: Why no AI or Machine Learning?
**A:** Cryptographic threat detection requires deterministic, transparent, and audit-defensible proof based on physics and mathematical hypothesis testing, avoiding ML black-box vulnerabilities and hallucination.

### Q16: How is signature forgery detected?
**A:** An adversary substituting fake states causes state overlap to drop ($\mathcal{F} \to 0$), breaching QBER thresholds and Binomial Forgery Risk CDF limits.

### Q17: How is replay attack detected?
**A:** The server checks signature consumption status (`is_consumed == True`). Replayed transactions return HTTP 409 Conflict.

### Q18: How is sender impersonation detected?
**A:** Tampering with Alice's BSM correction bits causes Bob to apply wrong Pauli recovery gates, dropping state fidelity to $\mathcal{F} = 0.50$ and spiking QBER to $0.50$.

### Q19: How is channel manipulation detected?
**A:** Depolarizing noise parameter $\eta \ge 0.20$ increases measured QBER, causing SPRT Log-Likelihood Ratio to breach the upper Wald boundary ($+4.595$).

### Q20: How is unauthorized verification detected?
**A:** The server validates tenant organization clearance; requests from unauthorized organizations return HTTP 403 Forbidden.

### Q21: How is document tampering detected?
**A:** Classical SHA-256 digest comparison between payload text and stored signature digest detects any document modification (`REJECTED_DIGEST_MISMATCH`).

### Q22: Why use SHA-256 if this is a quantum project?
**A:** SHA-256 provides classical document content integrity, while quantum teleportation simulation provides key state authentication evidence.

### Q23: Is this running on a physical quantum computer?
**A:** No. It runs on a pure high-precision Qiskit Aer statevector and density matrix simulator on the server CPU.

### Q24: What are the current limitations?
**A:** Single-qubit key symbol representation per transaction, depolarizing channel noise approximation, and simulation-based execution.

### Q25: What is the next step for real-world deployment?
**A:** Interfacing with physical Quantum Key Distribution (QKD) hardware optical channels and expanding to multi-qubit parallel key distribution arrays.
