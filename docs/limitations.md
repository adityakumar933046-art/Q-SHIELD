# Q-SHIELD — Scientific Limitations & Scope Disclosures

> [!NOTE]
> **Academic & Simulation Disclosure**  
> Q-SHIELD is a quantum-inspired software framework designed to simulate, analyze, and demonstrate teleportation-based Quantum Digital Signatures (QDS) and non-machine-learning statistical threat detection.

---

## Recognized Scientific Limitations

### 1. Single-Qubit Teleportation Representation
- **Current Scope:** The quantum simulation engine executes 3-qubit teleportation for a representative single key symbol per signature transaction rather than an array of $N \gg 1$ physical qubits.
- **Impact:** Statistical measurement distributions scale with simulated shot counts ($N_{\text{shots}} = 1024$), modeling multi-shot quantum statevector measurements.

### 2. Depolarizing Channel Model Approximation
- **Current Scope:** Quantum channel disturbance is simulated via density matrix depolarizing noise:
  $$\rho_{\text{noisy}} = (1-\eta)\rho + \eta \frac{I_2}{2}$$
- **Impact:** Depolarizing noise accurately models bit/phase flip decoherence, preserving trace $\text{Tr}(\rho) = 1$, but does not simulate full physical fiber optic thermal phase damping matrices.

### 3. Simulation-Based Quantum Hardware Execution
- **Current Scope:** Quantum circuits and statevector operations are executed using Qiskit Aer pure simulation on backend CPU instances rather than real physical Quantum Processing Units (QPUs).

### 4. Attacker Model Assumptions for Forgery Bounds
- **Current Scope:** Adversary forgery risk upper bounds ($P_{\text{forgery\_bound}}$) utilize an eavesdropping estimation parameter ($p_{\text{error\_eve}} = 0.5 - 0.4 \cdot QBER$) under Fuchs-Peres state estimation assumptions rather than an empirical multi-stage eavesdropping strategy.
