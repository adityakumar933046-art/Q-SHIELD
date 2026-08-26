#!/usr/bin/env bash
set -e

echo "=== Starting Q-SHIELD FastAPI Backend ==="
export PYTHONPATH=backend
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
