#!/usr/bin/env bash
# Stop and remove the test PostgreSQL container.
set -euo pipefail

docker rm -f ikary-test-pg 2>/dev/null || true
echo "Test PostgreSQL stopped."
