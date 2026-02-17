#!/usr/bin/env bash
# ╔══════════════════════════════════════════════════════════════╗
# ║  UPYLOL — Database Restore Script                           ║
# ║  Uso: ./scripts/restore-db.sh backups/upylol_backup_XXX.sql.gz ║
# ╚══════════════════════════════════════════════════════════════╝

set -euo pipefail

if [ -z "${1:-}" ]; then
    echo "❌ Uso: $0 <backup_file.sql.gz>"
    echo "   Exemplo: $0 backups/upylol_backup_20260217_030000.sql.gz"
    exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Arquivo não encontrado: $BACKUP_FILE"
    exit 1
fi

echo "⚠️  Isso irá SUBSTITUIR todos os dados atuais do banco!"
echo "   Arquivo: $BACKUP_FILE"
echo "   Pressione Ctrl+C para cancelar ou Enter para continuar..."
read -r

echo "🔄 Restaurando backup..."

# Drop existing data and restore
gunzip -c "$BACKUP_FILE" | \
    docker compose exec -T db psql -U upylol -d upylol --single-transaction

echo "✅ Restauração concluída!"
