# Q-SHIELD Master Security Control Matrix

| Invariant | Evaluated Threat | Primary Control Mechanism | Validation Test Case | Status | Residual Risk |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **INV-01** | Signature Forgery | OTP & Quantum State Verification | `test_forgery.py` | PASS | None |
| **INV-02** | Request Replay | Redis Nonce & Replay Protection | `test_replay.py` | PASS | None |
| **INV-03** | Privilege Escalation | Identity Context RBAC Policy | `test_authorization.py` | PASS | None |
| **INV-04** | Client Security Bypass | Authoritative Backend Dependencies | `test_authorization.py` | PASS | None |
| **INV-05** | Audit Repudiation | SHA-256 Cryptographic Event Chains | `test_forensic.py` | PASS | Low |
| **INV-06** | Decision Forgery | Backend `DecisionEngine` | `test_verification.py` | PASS | None |
| **INV-07** | Measurement Tampering | `MeasurementService` Qiskit Driver | `test_measurement.py` | PASS | None |
| **INV-08** | Unverifiable Results | `ExperimentResultExporter` Metadata | `test_results.py` | PASS | None |
| **INV-09** | Research Backdoors | Mandatory Identity & Audit Layers | `test_research_validation.py` | PASS | None |
| **INV-10** | Unauthorized Hardware | `QuantumBackendAdapter` Readiness | `test_hardware_readiness.py` | PASS | None |
