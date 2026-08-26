# Q-SHIELD Disaster Recovery Runbook

## Emergency Incident Runbooks

### Incident DR-01: PostgreSQL Database Unavailability
1. **Detection**: FastAPI logs report `psycopg2.OperationalError: could not connect to server`.
2. **Containment**: Health endpoint `/health` reports status `DEGRADED`.
3. **Recovery Step**:
   ```bash
   docker compose restart postgres
   docker compose logs --tail=100 postgres
   ```
4. **Validation**: Execute `python backend/tests/test_database.py` to confirm table readiness and transaction rollback integrity.

---

### Incident DR-02: Redis Cache & Replay Protection Outage
1. **Detection**: Nonce verification endpoints report `RedisConnectionError`.
2. **Behavior**: `ReplayProtectionService` enforces Fail-Closed policy (denies unvalidated nonces).
3. **Recovery Step**:
   ```bash
   docker compose restart redis
   docker compose exec redis redis-cli ping
   ```
4. **Validation**: Execute `backend/tests/security/test_replay.py` to confirm replay protection store recovery.

---

### Incident DR-03: Backend Service Container Failure
1. **Detection**: Nginx reverse proxy returns `502 Bad Gateway`.
2. **Recovery Step**:
   ```bash
   docker compose restart backend
   docker compose ps
   ```
3. **Validation**: Invoke `/health` endpoint to verify DB, Redis, and Quantum simulator connections.
