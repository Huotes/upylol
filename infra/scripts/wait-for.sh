#!/usr/bin/env bash
# ╔══════════════════════════════════════════════════════════════╗
# ║  UPYLOL — Wait-for-services                                 ║
# ║  Espera serviços ficarem prontos antes de iniciar o app      ║
# ║  Uso: ./scripts/wait-for.sh db:5432 redis:6379 -- cmd       ║
# ╚══════════════════════════════════════════════════════════════╝

set -euo pipefail

TIMEOUT=${TIMEOUT:-60}
INTERVAL=${INTERVAL:-2}

wait_for_host() {
    local host="$1"
    local port="$2"
    local elapsed=0

    echo "⏳ Aguardando ${host}:${port}..."

    while ! nc -z "$host" "$port" > /dev/null 2>&1; do
        elapsed=$((elapsed + INTERVAL))
        if [ "$elapsed" -ge "$TIMEOUT" ]; then
            echo "❌ Timeout esperando ${host}:${port} (${TIMEOUT}s)"
            exit 1
        fi
        sleep "$INTERVAL"
    done

    echo "✅ ${host}:${port} disponível (${elapsed}s)"
}

# Parse host:port arguments until "--"
while [ "$#" -gt 0 ] && [ "$1" != "--" ]; do
    HOST=$(echo "$1" | cut -d: -f1)
    PORT=$(echo "$1" | cut -d: -f2)
    wait_for_host "$HOST" "$PORT"
    shift
done

# Skip the "--" separator
if [ "${1:-}" = "--" ]; then
    shift
fi

# Execute remaining command
if [ "$#" -gt 0 ]; then
    echo "🚀 Iniciando: $*"
    exec "$@"
fi
