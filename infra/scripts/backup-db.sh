#!/usr/bin/env bash
# ╔══════════════════════════════════════════════════════════════╗
# ║  UPYLOL — Database Backup Script                            ║
# ║  Uso: ./scripts/backup-db.sh [output_dir]                   ║
# ║  Cronjob: 0 3 * * * /opt/upylol/scripts/backup-db.sh       ║
# ╚══════════════════════════════════════════════════════════════╝

set -euo pipefail

BACKUP_DIR="${1:-./backups}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
FILENAME="upylol_backup_${TIMESTAMP}.sql.gz"
RETENTION_DAYS=30

# Ensure backup directory exists
mkdir -p "$BACKUP_DIR"

echo "📦 Iniciando backup do banco de dados..."

# Dump via docker exec, compress with gzip
docker compose exec -T db \
    pg_dump -U upylol -d upylol --format=plain --no-owner --no-privileges | \
    gzip > "${BACKUP_DIR}/${FILENAME}"

FILESIZE=$(du -h "${BACKUP_DIR}/${FILENAME}" | cut -f1)
echo "✅ Backup criado: ${FILENAME} (${FILESIZE})"

# Remove old backups
DELETED=$(find "$BACKUP_DIR" -name "upylol_backup_*.sql.gz" -mtime +${RETENTION_DAYS} -delete -print | wc -l)
if [ "$DELETED" -gt 0 ]; then
    echo "🗑️  Removidos ${DELETED} backups com mais de ${RETENTION_DAYS} dias"
fi

# List recent backups
echo ""
echo "── Backups recentes ─────────────────────"
ls -lh "$BACKUP_DIR"/upylol_backup_*.sql.gz 2>/dev/null | tail -5
