# Q-SHIELD Long-Term Maintenance & Security Patching Guide

## 1. Maintenance Philosophy & Architecture Freeze

The 14-layer Q-SHIELD system architecture (`React` -> `Nginx` -> `FastAPI` -> `Security/QDS/Quantum/Verification` -> `Statistics` -> `Attacks` -> `Experiments` -> `Audit` -> `PostgreSQL/Redis`) is **FROZEN**.

All future changes must strictly address verified issues through targeted, minimal patches accompanied by regression tests.

## 2. Issue Categorization & Severity

### Issue Categories
- `BUG`: Functional defect in business logic or API routes.
- `SECURITY`: Vulnerability in authentication, authorization, replay protection, or data handling.
- `PERFORMANCE`: Latency degradation or resource exhaustion.
- `COMPATIBILITY`: Third-party library or runtime environment mismatch.
- `DOCUMENTATION`: Clarification or correction in system docs.
- `DEPLOYMENT`: Infrastructure or container configuration issue.

### Severity Levels
- `BLOCKER`: Core verification, security, or build failure.
- `CRITICAL`: Exploitable vulnerability or data corruption risk.
- `HIGH`: Major component degradation with workarounds available.
- `MEDIUM`: Minor non-critical defect.
- `LOW`: Cosmetic UI or documentation tweak.

## 3. Security Patch Workflow

```text
Issue Reported
   │
   ▼
Reproduce in Isolated Test Environment
   │
   ▼
Minimal Targeted Patch Implementation
   │
   ▼
Unit & Integration Regression Test
   │
   ▼
Full Backend & Security Test Suite Pass
   │
   ▼
Update CHANGELOG.md & Tag Patch Version (1.0.x)
```

## 4. Dependency Maintenance & Qiskit Compatibility

- **Qiskit / Qiskit Aer**: When updating Qiskit, run the full Quantum Engine test suite (`tests/quantum/`) to confirm state vector representation and measurement outcome compatibility.
- **FastAPI / Pydantic**: Ensure Pydantic schema validation contracts (`backend/app/schemas/`) remain backward compatible with frontend TypeScript models.

## 5. Backup & Disaster Recovery Procedures

- **PostgreSQL Database**: Perform daily logical backups via `pg_dump`:
  ```bash
  docker compose exec postgres pg_dump -U qshield_user qshield > backup_$(date +%Y%m%d).sql
  ```
- **Audit Logs**: Security event logs are immutable and append-only. Verify SHA-256 integrity periodically via `ForensicEngine.investigate()`.
- **Redis Cache**: Nonce replay stores can be repopulated safely upon cache invalidation without corrupting user database entities.
