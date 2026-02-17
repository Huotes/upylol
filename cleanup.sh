#!/bin/bash
# ╔══════════════════════════════════════════════════════════════╗
# ║  UPYLOL — Script de limpeza de arquivos redundantes         ║
# ║  Execute na raiz do projeto: bash cleanup.sh                ║
# ╚══════════════════════════════════════════════════════════════╝

set -e

echo "🧹 Iniciando limpeza do projeto UPYLOL..."

# ── Backend: pasta shcemas (typo) — totalmente vazia ──
echo "  Removendo backend/app/shcemas/ (typo, vazia)..."
rm -rf backend/app/shcemas/

# ── Backend: endpoints vazios (toda lógica está em riot/client.py) ──
echo "  Removendo backend/app/riot/endpoints/ (vazios)..."
rm -rf backend/app/riot/endpoints/

# ── Backend: stubs vazios ──
echo "  Removendo stubs vazios do backend..."
rm -f backend/app/analysis/otp_finder.py
rm -f backend/app/models/benchmark.py
rm -f backend/app/models/match_cache.py
rm -f backend/app/api/v1/live.py
rm -f backend/app/core/middleware.py

# ── Frontend: rotas summoner (duplicatas de player) ──
echo "  Removendo frontend/src/app/summoner/ (duplicata de player)..."
rm -rf frontend/src/app/summoner/

# ── Frontend: componentes summoner (duplicatas) ──
echo "  Removendo frontend/src/components/summoner/ (duplicata)..."
rm -rf frontend/src/components/summoner/

# ── Frontend: hook e types summoner (substituídos por player) ──
echo "  Removendo useSummoner.ts e types/summoner.ts..."
rm -f frontend/src/hooks/useSummoner.ts
rm -f frontend/src/types/summoner.ts

# ── Infra: renomear script com typo ──
if [ -f infra/scripts/seed_banchmarks.py ]; then
    echo "  Renomeando seed_banchmarks.py → seed_benchmarks.py..."
    mv infra/scripts/seed_banchmarks.py infra/scripts/seed_benchmarks.py
fi

echo ""
echo "✅ Limpeza concluída! Arquivos removidos:"
echo "   - backend/app/shcemas/ (pasta inteira)"
echo "   - backend/app/riot/endpoints/ (pasta inteira)"
echo "   - backend/app/analysis/otp_finder.py"
echo "   - backend/app/models/benchmark.py"
echo "   - backend/app/models/match_cache.py"
echo "   - backend/app/api/v1/live.py"
echo "   - backend/app/core/middleware.py"
echo "   - frontend/src/app/summoner/ (pasta inteira)"
echo "   - frontend/src/components/summoner/ (pasta inteira)"
echo "   - frontend/src/hooks/useSummoner.ts"
echo "   - frontend/src/types/summoner.ts"
echo "   - infra/scripts/seed_banchmarks.py → seed_benchmarks.py (renomeado)"
echo ""
echo "📌 Próximo passo: git add -A && git status"
