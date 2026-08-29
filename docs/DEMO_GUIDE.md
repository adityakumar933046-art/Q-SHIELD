# Q-SHIELD — SIH Grand Finale Live Demonstration Guide

This guide provides setup and operational instructions for presenting Q-SHIELD to Smart India Hackathon judges.

---

## 1. System Launch & Startup

### Step A: Start Backend Server
```bash
cd backend
python manage.py runserver 8000
```

### Step B: Start Frontend Application
```bash
cd frontend
npm run dev
```

### Step C: Safe Demo Data Reset (Optional)
To reset signature transactions and test incidents to baseline without removing core system configurations:
```bash
cd backend
python reset_demo_data.py
```

---

## 2. Judge Presentation Script

Refer to [`JUDGE_DEMO_FLOW.md`](JUDGE_DEMO_FLOW.md) for the exact 5–10 minute demonstration sequence:

1. **DEMO 1: Legitimate QDS Creation & Verification** (`PASSED`)
2. **DEMO 2: Document Payload Tampering** (`REJECTED_DIGEST_MISMATCH`)
3. **DEMO 3: Quantum Signature State Forgery** (`SIGNATURE_FORGERY`)
4. **DEMO 4: Replay Attack Prevention** (`REJECTED_REPLAY_ATTACK` / HTTP 409)
5. **DEMO 5: Sender Impersonation Attack** (`SENDER_IMPERSONATION`)
6. **DEMO 6: Channel Manipulation Noise Sweep** (`QUANTUM_CHANNEL_MANIPULATION`)
7. **DEMO 7: Unauthorized Cross-Organization Verification** (`UNAUTHORIZED` / HTTP 403)

---

## 3. Judge Questions & Answers

- **Q: Does Q-SHIELD use AI or Machine Learning models?**
  - **A:** No. Q-SHIELD strictly uses non-machine-learning statistical mechanics (SciPy Chi-Square Goodness-of-Fit and Wald Sequential Probability Ratio Testing) to ensure 100% deterministic, audit-defensible threat detection.
- **Q: How is Replay Attack prevented?**
  - **A:** Replay detection is enforced server-side using one-time cryptographic nonces and database transaction tracking (`is_consumed`). The client cannot bypass replay detection.
- **Q: What is the difference between SHA-256 and QDS in Q-SHIELD?**
  - **A:** SHA-256 provides classical document content integrity verification, while the QDS teleportation simulation provides quantum key state measurement evidence ($QBER$, State Fidelity $\mathcal{F}$, Trace Distance $D$).
