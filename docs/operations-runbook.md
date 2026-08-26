# Q-SHIELD Operations Runbook

## 1. System Health Monitoring & Diagnostics

Q-SHIELD provides standardized operational health endpoints:
- `GET /health`: Overall system health status (`HEALTHY`, `DEGRADED`, `UNAVAILABLE`).
- `GET /api/v1/incidents`: Active security incident console.
- `GET /api/v1/audit/logs`: Audit log event viewer.

---

## 2. Container Startup Sequence & Dependency Probes

Correct container initialization ordering:
1. `postgres` (Health check: `pg_isready -U qshield`)
2. `redis` (Health check: `redis-cli ping`)
3. `backend` (Depends on `postgres` and `redis` health)
4. `frontend` / `nginx` (Depends on `backend` readiness)

---

## 3. Log Rotation & Maintenance

- **Application Logs**: Rotated daily with 14-day retention (`/var/log/qshield/app.log`).
- **Audit Logs**: Persistent in PostgreSQL with SHA-256 tamper-evident hash chaining.
