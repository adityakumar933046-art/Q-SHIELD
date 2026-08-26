# Q-SHIELD QDS Protocol Specification

## Protocol Overview (Phase 4 Prototype)

The Q-SHIELD Quantum Digital Signature (QDS) protocol combines classical message canonicalization with quantum state preparation and teleportation evidence.

### Workflow Architecture
1. **Session Initialization**:
   - `create_qds_session(signer_id)` generates a cryptographically secure nonce using Phase 2 `NonceService`.
2. **Signature Creation (`signer.py`)**:
   - Computes SHA-256 message digest: $D = \text{SHA-256}(M)$.
   - Invokes Phase 3 Quantum Engine to prepare state $|\psiangle$ and execute quantum teleportation.
   - Binds signature to `session_id`, `nonce`, `signer_id`, and persists via `SignatureRepository`.
3. **Verification Evidence Collection (`verifier.py`)**:
   - Re-computes $D' = \text{SHA-256}(M)$ and verifies $D' == D$.
   - Validates session state, expiration, and Phase 2 `ReplayProtectionService`.
   - Collects computational basis measurement evidence using `MeasurementService`.
   - Returns structured `VerificationEvidence` for Phase 5 decision processing.
