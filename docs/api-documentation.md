# Q-SHIELD REST API Reference Documentation

## Base Specification
- **Base URL**: `http://localhost:8000/api/v1`
- **Protocol**: HTTP/1.1 REST (JSON)
- **Authentication**: HTTP Bearer (`Authorization: Bearer <jwt_token>`)

---

## Endpoint Catalog

### 1. System Health & Observability
- `GET /health`: Comprehensive multi-tier system health check (`HEALTHY`, `DEGRADED`, `UNAVAILABLE`).

### 2. User & Authentication Management
- `POST /api/v1/users/register`: Register new user identity.
- `POST /api/v1/users/login`: Authenticate identity context and receive JWT bearer token.

### 3. QDS Signature Management
- `POST /api/v1/signatures`: Generate QDS signature for message digest.
- `GET /api/v1/signatures`: List active signatures with pagination.

### 4. Signature Verification & Decision
- `POST /api/v1/verification/verify`: Submit signature verification request through `VerificationEngine` and `DecisionEngine`.

### 5. Quantum Execution Engine
- `POST /api/v1/quantum/circuit`: Execute Qiskit Aer quantum circuit (Bell state / Teleportation).
- `GET /api/v1/quantum/capabilities`: Retrieve backend simulation capabilities.

### 6. Threat Testing & Attack Simulation
- `POST /api/v1/attacks/simulate`: Execute controlled threat simulation (`FORGERY`, `REPLAY`, `IMPERSONATION`, `CHANNEL_MANIPULATION`, `UNAUTHORIZED`).

### 7. Statistical & Research Engine
- `POST /api/v1/statistics/analyze`: Calculate statistical error rates and confidence intervals.

### 8. Audit & Incident Response
- `GET /api/v1/audit/logs`: Retrieve append-only SHA-256 tamper-evident audit logs.
- `GET /api/v1/incidents`: List correlated security incidents.
- `POST /api/v1/incidents/{id}/transition`: Update incident response status.
