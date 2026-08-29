# Q-SHIELD — Architecture & Security Model Documentation

## 1. System Architecture

Q-SHIELD enforces a defense-in-depth security model combining classical cryptographic hashing with quantum teleportation evidence and non-machine-learning statistical mechanics.

```
+-----------------------------------------------------------------------+
|                             USER ROLES                                |
|  [Admin]       [Signer]          [Verifier]       [Security Analyst]  |
+------+------------+------------------+--------------------+-----------+
       |            |                  |                    |
       v            v                  v                    v
+-----------------------------------------------------------------------+
|                    REST API GATEWAY & RBAC PERMISSIONS                |
|  - IsAdmin        - IsSigner         - IsVerifier         - IsAnalyst |
|  - Tenant Clearance Evaluation        - Server-Side Rate Limiting     |
+-----------------------------------------------------------------------+
                                   |
                                   v
+-----------------------------------------------------------------------+
|                       CORE THREAT DETECTION ENGINE                    |
|  1. Classical Integrity Engine (SHA-256 Digest Matching)               |
|  2. Quantum Teleportation Simulator (3-Qubit Circuit, Qiskit Aer)     |
|  3. Statistical Mechanics Engine (SciPy Chi-Square & Wald SPRT)       |
|  4. Adversary Forgery Risk Bound Evaluator (Binomial CDF)             |
|  5. Non-ML Threshold Threat Evaluator                                 |
+-----------------------------------------------------------------------+
                                   |
                                   v
+-----------------------------------------------------------------------+
|                      IMMUTABLE DATABASE & AUDIT                       |
|  - PostgreSQL ORM Tenant Data Scoping                                 |
|  - One-Time Cryptographic Nonce Consumption (Replay Prevention)        |
|  - Read-Only Immutable Audit Trail (DRF ReadOnlyModelViewSet)          |
+-----------------------------------------------------------------------+
```

---

## 2. Non-Machine-Learning Threat Evaluation

Q-SHIELD relies strictly on deterministic statistical hypothesis testing and threshold physics:

1. **Chi-Square Goodness-of-Fit Test:**
   $$\chi^2 = \sum_{i} \frac{(O_i - E_i)^2}{E_i}$$
   Compares observed projective measurement shot counts against theoretical Pauli target expectations ($P(\text{target}) = 0.99$).
   Rejects null hypothesis $H_0$ if $p\text{-value} < 0.05$.

2. **Sequential Probability Ratio Test (SPRT):**
   Sequential log-likelihood ratio evaluating channel state:
   $$\Lambda_n = \sum_{i=1}^n \ln \left( \frac{P(x_i | H_1)}{P(x_i | H_0)} \right)$$
   - $H_0: \text{Honest Channel } (QBER \le 0.02)$
   - $H_1: \text{Under Attack } (QBER \ge 0.11)$
   - Lower Wald Boundary $B = \ln(\beta / (1-\alpha)) = -4.595 \implies$ `HONEST_CHANNEL`
   - Upper Wald Boundary $A = \ln((1-\beta) / \alpha) = +4.595 \implies$ `ATTACK_DETECTED`

3. **Adversary Forgery Risk Upper Bound ($P_{\text{forgery\_bound}}$):**
   $$P_{\text{forgery\_bound}} = \sum_{k=0}^{k_{\max}} \binom{N}{k} (p_{\text{error\_eve}})^k (1 - p_{\text{error\_eve}})^{N-k}$$
   where $k_{\max} = \lfloor N \cdot \eta_{QBER} \rfloor$, $N = 64$ qubits, $\eta_{QBER} = 0.11$, $p_{\text{error\_eve}} = 0.5 - 0.4 \cdot QBER$.

---

## 3. Privilege Escalation & Tenant Isolation

- **Role Scoping:**
  The custom `User` model defines explicit roles: `ADMIN`, `SIGNER`, `VERIFIER`, `SECURITY_ANALYST`.
  Public self-registration is strictly blocked from requesting `ADMIN` or `SECURITY_ANALYST` roles.
- **Tenant Clearance:**
  Every QDS transaction and verification attempt is scoped to the user's `Organization`. Cross-organization verification attempts without explicit recipient clearance are rejected with HTTP 403 Forbidden.
- **Replay Protection:**
  Verification attempts record `is_consumed = True` and timestamp `consumed_at`. Submitting an already consumed signature returns HTTP 409 Conflict.
