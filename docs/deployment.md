# Q-SHIELD Production Deployment Guide

## Overview

Q-SHIELD is deployed via Docker Compose orchestration packaging:
- **Nginx**: Reverse proxy and SPA static asset server (Port 80/443).
- **Frontend**: React + TypeScript built SPA.
- **Backend**: FastAPI Python 3.13 application server (Port 8000).
- **PostgreSQL**: Relational storage for signatures, verifications, and audit logs (Port 5432 internal).
- **Redis**: Key-value cache for nonce replay protection (Port 6379 internal).

## Quickstart Deployment

```bash
# 1. Clone repository & configure environment
cp .env.example .env

# 2. Build and start containers
docker compose build
docker compose up -d

# 3. Verify health status
docker compose ps
curl http://localhost/health
```

## Security Hardening
- PostgreSQL and Redis containers do not expose public ports outside the Docker bridge network.
- Secret key validation enforces rejection of default/weak secret strings when `ENVIRONMENT=production`.
- Nginx provides HTTP security headers (`X-Frame-Options`, `X-Content-Type-Options`, `X-XSS-Protection`).
