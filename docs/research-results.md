# Q-SHIELD Research Results & Comparative Analysis

## 1. Experimental Methodology & Baseline
Evaluated using **Qiskit Aer CPU simulator** ($N=1024$ shots baseline).

- **Ideal Baseline Verification**: 10/10 iterations accepted ($p_{50}=0.0039\text{s}$, $228\text{ ops/sec}$, zero false rejections).

## 2. Quantum Noise Resilience Analysis
Evaluated across bounded noise rates ($0\%, 1\%, 5\%, 10\%, 20\%$):

| Noise Level | Simulated Noise Model | Measurement Error | Verification Acceptance | Decision Outcome |
| :--- | :--- | :--- | :--- | :--- |
| **0% (Ideal)** | None | 0.000 | 100% | ACCEPT |
| **1% Noise** | Bit-Flip | 0.012 | 100% | ACCEPT |
| **5% Noise** | Bit-Flip / Depolarizing | 0.048 | 100% | ACCEPT (\eta_v=0.89) |
| **10% Noise** | Depolarizing | 0.095 | 90% | ACCEPT / BOUNDARY |
| **20% Noise** | Depolarizing | 0.198 | 0% | REJECT (Exceeds \eta_v) |

## 3. Threshold Trade-Off Matrix

| Threshold (\eta_v) | Acceptance Policy | Legitimate Acceptance | Forgery Rejection | Trade-Off Description |
| :--- | :--- | :--- | :--- | :--- |
| **0.80** | Loose | 100% | 100% | Permissive tolerance; higher risk under heavy noise |
| **0.89 (Default)** | Balanced | 100% | 100% | Optimal operational trade-off |
| **0.95** | Strict | 90% | 100% | High security; strict error bounds |

## 4. Empirical Security & Attack Detection Summary

| Attack Type | Simulated Attempt Count | Detected & Blocked | False Acceptance Rate | Primary Defense Mechanism |
| :--- | :--- | :--- | :--- | :--- |
| **Signature Forgery** | 10 | 10/10 (100%) | 0.00% | One-Time Pad & Quantum Measurement Verification |
| **Nonce Replay** | 10 | 10/10 (100%) | 0.00% | Redis Nonce & ReplayProtectionService |
| **Impersonation** | 10 | 10/10 (100%) | 0.00% | IdentityContext RBAC Authorization |
| **Channel Mutation** | 10 | 10/10 (100%) | 0.00% | Teleportation State Verification |

*Note: Results reflect simulated execution under Qiskit Aer and local Q-SHIELD test environment. Hardware execution was not available.*
