# Q-SHIELD Service Dependency Matrix

| Service | Primary Dependencies | Fallback Behavior / Fail Policy | Security Impact |
| :--- | :--- | :--- | :--- |
| **Frontend** | Nginx, Backend API | Display "Degraded Mode" Error Console | Safe (No data leak) |
| **Nginx Proxy** | Frontend, Backend API | Return `502 Bad Gateway` / `503 Service Unavailable` | Safe |
| **Backend API** | PostgreSQL, Redis | Return Safe JSON Error Payload | Safe |
| **QDS Protocol** | Backend, Quantum Engine | Fail signature verification (`REJECT`) | Fail-Closed |
| **Verification Engine**| Quantum Engine, Statistics Engine | Fail verification (`REJECT`) | Fail-Closed |
| **Quantum Aer Engine**| Qiskit Simulator | Raise `QuantumSimulatorError` | Fail-Closed |
| **Replay Protection**| Redis Nonce Store | Deny unvalidated nonces (`ReplayDetectedError`) | Fail-Closed |
| **Audit Logger** | PostgreSQL Database | Mark audit chain status `DEGRADED` | Fail-Closed |
| **Incident Response**| Audit Logger, Threat Engine | Record incident fallback in local memory | Fail-Closed |
