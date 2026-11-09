#!/usr/bin/env bash
# ==============================================================================
# Mehar for Eyes — Nightly Database & Uploads Backup Script
# ==============================================================================
#
# What this script does:
# 1. Dumps the production Postgres database via `pg_dump` (gzipped) into
#    ${BACKUP_DIR}/db/mehar-db-YYYYMMDD-HHMMSS.sql.gz
# 2. Verifies the compressed SQL archive integrity (`gzip -t`).
# 3. Syncs the Docker `uploads` volume (/data/uploads) to a second location
#    (${BACKUP_DIR}/uploads/) using `rsync -a --delete`.
# 4. Optionally rsyncs the entire backup directory to an offsite/remote target
#    if OFFSITE_RSYNC_TARGET is set (e.g., user@backup-box:/backups/mehar).
# 5. Deletes database dumps older than 14 days (RETENTION_DAYS=14).
#
# ------------------------------------------------------------------------------
# Cron installation (run every night at 03:15 AM server time):
#   sudo mkdir -p /var/backups/mehar-for-eyes
#   sudo chown "$(whoami):$(whoami)" /var/backups/mehar-for-eyes
#   chmod +x /opt/mehar-for-eyes/scripts/backup.sh /opt/mehar-for-eyes/scripts/restore.sh
#   crontab -e
#
# Add this line:
#   15 3 * * * APP_DIR=/opt/mehar-for-eyes BACKUP_DIR=/var/backups/mehar-for-eyes /opt/mehar-for-eyes/scripts/backup.sh >> /var/log/mehar-backup.log 2>&1
#
# ------------------------------------------------------------------------------
# Restore instructions:
#   See scripts/restore.sh or run manually:
#
#   1. Restore Postgres database from a specific dump:
#      gunzip -c /var/backups/mehar-for-eyes/db/mehar-db-YYYYMMDD-HHMMSS.sql.gz \
#        | docker compose -f /opt/mehar-for-eyes/docker-compose.prod.yml --env-file /opt/mehar-for-eyes/.env.prod \
#          exec -T postgres psql -U mehar -d mehar
#
#   2. Restore /data/uploads into the Docker `uploads` volume:
#      UPLOADS_MOUNT="$(docker volume inspect mehar-for-eyes_uploads -f '{{ .Mountpoint }}')"
#      sudo rsync -a --delete /var/backups/mehar-for-eyes/uploads/ "${UPLOADS_MOUNT}/"
# ==============================================================================

set -euo pipefail
umask 077

APP_DIR="${APP_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"
COMPOSE_FILE="${COMPOSE_FILE:-${APP_DIR}/docker-compose.prod.yml}"
ENV_FILE="${ENV_FILE:-${APP_DIR}/.env.prod}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/mehar-for-eyes}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"
OFFSITE_RSYNC_TARGET="${OFFSITE_RSYNC_TARGET:-}"

TIMESTAMP="$(date -u +"%Y%m%d-%H%M%S")"
DB_BACKUP_DIR="${BACKUP_DIR}/db"
UPLOADS_BACKUP_DIR="${BACKUP_DIR}/uploads"
DB_DUMP_FILE="${DB_BACKUP_DIR}/mehar-db-${TIMESTAMP}.sql.gz"
DB_DUMP_TMP="${DB_DUMP_FILE}.tmp"

mkdir -p "${DB_BACKUP_DIR}" "${UPLOADS_BACKUP_DIR}"

# Load POSTGRES_USER and POSTGRES_DB from .env.prod if present.
POSTGRES_USER="mehar"
POSTGRES_DB="mehar"
if [[ -f "${ENV_FILE}" ]]; then
  # shellcheck disable=SC1090
  set -a
  source <(grep -E '^(POSTGRES_USER|POSTGRES_DB)=' "${ENV_FILE}" || true)
  set +a
fi

echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] Starting Mehar for Eyes backup..."

# 1. Dump Postgres database
docker compose -f "${COMPOSE_FILE}" --env-file "${ENV_FILE}" \
  exec -T postgres \
  pg_dump -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" --clean --if-exists --no-owner --no-privileges \
  | gzip -9 > "${DB_DUMP_TMP}"

# Verify gzip integrity and non-empty archive
gzip -t "${DB_DUMP_TMP}"
if [[ ! -s "${DB_DUMP_TMP}" ]]; then
  echo "ERROR: Database backup archive is empty!" >&2
  rm -f "${DB_DUMP_TMP}"
  exit 1
fi
mv "${DB_DUMP_TMP}" "${DB_DUMP_FILE}"
echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] Database dump saved: ${DB_DUMP_FILE}"

# 2. Sync /data/uploads to second location via rsync
# Uses a temporary helper container mounting the same `uploads` volume as api
# so it works regardless of host Docker storage driver permissions.
API_CONTAINER_ID="$(docker compose -f "${COMPOSE_FILE}" --env-file "${ENV_FILE}" ps -q api)"
if [[ -z "${API_CONTAINER_ID}" ]]; then
  echo "ERROR: Could not find running api container to locate uploads volume." >&2
  exit 1
fi

docker run --rm \
  --volumes-from "${API_CONTAINER_ID}:ro" \
  -v "${UPLOADS_BACKUP_DIR}:/backup-uploads" \
  alpine:3.21 \
  sh -ceu 'apk add --no-cache rsync >/dev/null && rsync -a --delete /data/uploads/ /backup-uploads/'

echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] Uploads synced to: ${UPLOADS_BACKUP_DIR}"

# 3. Optional offsite rsync to a remote server / second disk
if [[ -n "${OFFSITE_RSYNC_TARGET}" ]]; then
  rsync -az --delete "${BACKUP_DIR}/" "${OFFSITE_RSYNC_TARGET}/"
  echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] Offsite backup synced to: ${OFFSITE_RSYNC_TARGET}"
fi

# 4. Prune database dumps older than RETENTION_DAYS (default 14 days)
find "${DB_BACKUP_DIR}" -type f -name "mehar-db-*.sql.gz" -mtime +"${RETENTION_DAYS}" -print -delete

echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] Backup finished successfully."

