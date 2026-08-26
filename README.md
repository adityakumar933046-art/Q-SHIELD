# Q-SHIELD — Quantum Digital Signature & Verification System

Version: `1.0.0`

Q-SHIELD is a production-ready **Quantum Digital Signature (QDS)** security platform built with **FastAPI**, **React**, **TypeScript**, **Qiskit Aer**, **PostgreSQL**, **Redis**, and **Docker**.

## Quickstart

```bash
# 1. Clone & prepare environment
cp .env.example .env

# 2. Start services via Docker Compose
docker compose build
docker compose up -d

# 3. Access applications
# Frontend Dashboard: http://localhost
# Backend API Specs:  http://localhost/api/v1/docs
```

## System Architecture

- **Frontend**: React + TypeScript SPA served via Nginx.
- **Backend**: FastAPI Python 3.13 server.
- **Quantum Simulator**: Qiskit Aer quantum state & teleportation engine.
- **Database**: PostgreSQL 15 relational storage.
- **Cache**: Redis 7 replay protection store.

## Verification & Testing

```bash
# Run full unit test suite
bash scripts/run_tests.sh
```

## License
MIT License.
