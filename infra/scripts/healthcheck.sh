#!/usr/bin/env bash
# ╔══════════════════════════════════════════════════════════════╗
# ║  UPYLOL — Health Check Script                               ║
# ║  Uso: ./scripts/healthcheck.sh                              ║
# ║  Útil para cronjobs e monitoramento                         ║
# ╚══════════════════════════════════════════════════════════════╝

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

BASE_URL="${1:-http://localhost}"
EXIT_CODE=0

check_service() {
    local name="$1"
    local url="$2"
    local expected="${3:-200}"

    local status
    status=$(curl -sf -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || echo "000")

    if [ "$status" = "$expected" ]; then
        echo -e "  ${GREEN}✅${NC} ${name} — HTTP ${status}"
    else
        echo -e "  ${RED}❌${NC} ${name} — HTTP ${status} (esperado ${expected})"
        EXIT_CODE=1
    fi
}

check_container() {
    local name="$1"
    local container="$2"

    local state
    state=$(docker inspect --format='{{.State.Health.Status}}' "$container" 2>/dev/null || echo "not found")

    case "$state" in
        healthy)
            echo -e "  ${GREEN}✅${NC} ${name} — ${state}" ;;
        starting)
            echo -e "  ${YELLOW}⏳${NC} ${name} — ${state}" ;;
        *)
            echo -e "  ${RED}❌${NC} ${name} — ${state}"
            EXIT_CODE=1 ;;
    esac
}

echo ""
echo "╔═══════════════════════════════════════╗"
echo "║  UPYLOL Health Check                  ║"
echo "╚═══════════════════════════════════════╝"
echo ""

echo "── HTTP Endpoints ─────────────────────"
check_service "Nginx"    "${BASE_URL}/health"
check_service "Backend"  "${BASE_URL}/api/v1/health"
check_service "Frontend" "${BASE_URL}" "200"

echo ""
echo "── Container Health ───────────────────"
check_container "Backend"    "upylol-backend"
check_container "Frontend"   "upylol-frontend"
check_container "PostgreSQL" "upylol-db"
check_container "Redis"      "upylol-redis"
check_container "Nginx"      "upylol-nginx"

echo ""

# Docker resource usage
echo "── Resource Usage ─────────────────────"
docker stats --no-stream --format "  {{.Name}}: CPU {{.CPUPerc}} | MEM {{.MemUsage}}" \
    upylol-backend upylol-frontend upylol-db upylol-redis upylol-nginx 2>/dev/null || \
    echo "  ⚠️  Não foi possível obter métricas"

echo ""

if [ $EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✅ Todos os serviços estão saudáveis!${NC}"
else
    echo -e "${RED}❌ Alguns serviços apresentaram problemas.${NC}"
fi

exit $EXIT_CODE
