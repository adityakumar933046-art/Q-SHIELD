# Q-SHIELD Demo Troubleshooting & Recovery Guide

## Common Issues & Safe Recovery Procedures

### 1. Backend Service Unavailable (`502 Bad Gateway` / `Connection Refused`)
- **Diagnosis**: Container restarting or PostgreSQL connection pending.
- **Fix**:
  ```bash
  docker compose restart backend
  docker compose logs -f backend
  ```

### 2. Database Connection Error
- **Diagnosis**: PostgreSQL container initialization delayed.
- **Fix**:
  ```bash
  docker compose exec postgres pg_isready -U qshield_user -d qshield
  ```

### 3. Redis Nonce Service Connection Timeout
- **Diagnosis**: Redis container unreachable on internal bridge network.
- **Fix**:
  ```bash
  docker compose restart redis
  ```

### 4. Audit Log Integrity Check Failure
- **Diagnosis**: Test database modified out-of-band.
- **Fix**: Run `ForensicEngine.investigate()` to identify tampered records.
