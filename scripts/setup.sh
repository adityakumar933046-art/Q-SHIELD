#!/usr/bin/env bash
set -e

echo "=== Q-SHIELD Environment Setup ==="
if [ ! -f .env ]; then
    echo "Creating .env from .env.example..."
    cp .env.example .env
fi

echo "Installing backend dependencies..."
pip install -r requirements.txt

echo "Setup completed successfully."
