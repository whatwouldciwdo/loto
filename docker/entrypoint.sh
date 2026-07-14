#!/bin/sh
set -e

# Run pending Prisma migrations against the (external) PostgreSQL server.
# DATABASE_URL must be provided via environment.
echo "[entrypoint] Running prisma migrate deploy..."
node node_modules/prisma/build/index.js migrate deploy || {
    echo "[entrypoint] WARNING: prisma migrate deploy failed. Continuing to start the app."
}

echo "[entrypoint] Starting Next.js server..."
exec node server.js
