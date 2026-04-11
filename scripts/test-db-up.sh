#!/usr/bin/env bash
# Start a PostgreSQL container for running tests.
# Uses port 5433 to avoid conflicting with the local stack (port 5432).
set -euo pipefail

CONTAINER_NAME="ikary-test-pg"

if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
  echo "Test PostgreSQL is already running."
  exit 0
fi

# Remove stopped container if it exists
docker rm -f "$CONTAINER_NAME" 2>/dev/null || true

docker run -d \
  --name "$CONTAINER_NAME" \
  -e POSTGRES_USER=ikary \
  -e POSTGRES_PASSWORD=ikary \
  -e POSTGRES_DB=ikary_test \
  -p 5433:5432 \
  postgres:17-alpine

echo "Waiting for PostgreSQL to be ready..."
RETRIES=0
MAX_RETRIES=30
until docker exec "$CONTAINER_NAME" pg_isready -U ikary -q 2>/dev/null; do
  RETRIES=$((RETRIES + 1))
  if [ "$RETRIES" -ge "$MAX_RETRIES" ]; then
    echo "ERROR: PostgreSQL did not become ready within $MAX_RETRIES attempts." >&2
    exit 1
  fi
  sleep 0.5
done

echo "Test PostgreSQL is ready on port 5433."
echo "Connection URL: postgres://ikary:ikary@localhost:5433/ikary_test"
