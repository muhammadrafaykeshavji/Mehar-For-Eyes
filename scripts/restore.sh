#!/usr/bin/env bash
# ==============================================================================
# Mehar for Eyes — Restore Database & Uploads Script
# ==============================================================================
# Usage:
#   ./scripts/restore.sh /var/backups/mehar-for-eyes/db/mehar-db-YYYYMMDD-HHMMSS.sql.gz [/var/backups/mehar-for-eyes/uploads]
# ==============================================================================

set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <path-to-mehar-db-YYYYMMDD-HHMMSS.sql.gz> [path-to-uploads-backup-dir]" >&2
  exit 1
fi

DB_DUMP_FILE="$1"
UPLOADS_BACKUP_DIR="${2:-/var/backups/mehar-for-eyes/uploads}"

APP_DIR="${APP_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"
COMPOSE_FILE="${COMPOSE_FILE:-${APP_DIR}/docker-compose.prod.yml}"
ENV_FILE="${ENV_FILE:-${APP_DIR}/.env.prod}"

if [[ ! -f "${DB_DUMP_FILE}" ]]; then
  echo "ERROR: Database dump file not found: ${DB_DUMP_FILE}" >&2
  exit 1
fi

gzip -t "${DB_DUMP_FILE}"

POSTGRES_USER="mehar"
POSTGRES_DB="mehar"
if [[ -f "${ENV_FILE}" ]]; then
  # shellcheck disable=SC1090
  set -a
  source <(grep -E '^(POSTGRES_USER|POSTGRES_DB)=' "${ENV_FILE}" || true)
  set +a
fi

echo "Restoring database from ${DB_DUMP_FILE}..."
gunzip -c "${DB_DUMP_FILE}" \
  | docker compose -f "${COMPOSE_FILE}" --env-file "${ENV_FILE}" \
    exec -T postgres psql -v ON_ERROR_STOP=1 -U "${POSTGRES_USER}" -d "${POSTGRES_DB}"

if [[ -d "${UPLOADS_BACKUP_DIR}" ]]; then
  echo "Restoring /data/uploads from ${UPLOADS_BACKUP_DIR}..."
  API_CONTAINER_ID="$(docker compose -f "${COMPOSE_FILE}" --env-file "${ENV_FILE}" ps -q api)"
  if [[ -z "${API_CONTAINER_ID}" ]]; then
    echo "ERROR: Running api container not found." >&2
    exit 1
  fi

  docker run --rm \
    --volumes-from "${API_CONTAINER_ID}" \
    -v "${UPLOADS_BACKUP_DIR}:/backup-uploads:ro" \
    alpine:3.21 \
    sh -ceu 'apk add --no-cache rsync >/dev/null && rsync -a --delete /backup-uploads/ /data/uploads/'
fi

echo "Restore complete."

