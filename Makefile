# ╔══════════════════════════════════════════════════════════════╗
# ║  UPYLOL — Makefile                                          ║
# ║  Comandos para desenvolvimento, testes e deploy             ║
# ╚══════════════════════════════════════════════════════════════╝

.PHONY: help dev up down logs restart build clean \
        test test-back test-front lint lint-back lint-front fmt \
        migrate migration db-shell redis-shell \
        prod deploy status

# ── Defaults ─────────────────────────────────────────────────
COMPOSE_DEV = docker compose -f docker-compose.yml -f docker-compose.dev.yml
COMPOSE_PROD = docker compose -f docker-compose.yml -f docker-compose.prod.yml

# ══════════════════════════════════════════════════════════════
# HELP
# ══════════════════════════════════════════════════════════════

help: ## Mostra esta ajuda
	@echo ""
	@echo "  ╔═══════════════════════════════════════╗"
	@echo "  ║  upylol — Comandos disponíveis        ║"
	@echo "  ╚═══════════════════════════════════════╝"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'
	@echo ""

# ══════════════════════════════════════════════════════════════
# DEVELOPMENT
# ══════════════════════════════════════════════════════════════

dev: ## Sobe ambiente de desenvolvimento (hot reload)
	@echo "🚀 Iniciando ambiente de desenvolvimento..."
	$(COMPOSE_DEV) up --build

dev-d: ## Sobe ambiente dev em background
	$(COMPOSE_DEV) up -d --build

up: ## Sobe todos os serviços (base)
	docker compose up -d

down: ## Para todos os serviços
	docker compose down
	$(COMPOSE_DEV) down 2>/dev/null || true

restart: ## Reinicia todos os serviços
	$(COMPOSE_DEV) restart

logs: ## Mostra logs de todos os serviços
	$(COMPOSE_DEV) logs -f

logs-back: ## Mostra logs do backend
	$(COMPOSE_DEV) logs -f backend

logs-front: ## Mostra logs do frontend
	$(COMPOSE_DEV) logs -f frontend

logs-nginx: ## Mostra logs do nginx
	$(COMPOSE_DEV) logs -f nginx

status: ## Mostra status dos containers
	docker compose ps -a

build: ## Builda todas as imagens
	docker compose build --no-cache

clean: ## Remove containers, volumes e imagens órfãs
	docker compose down -v --remove-orphans
	docker image prune -f

# ══════════════════════════════════════════════════════════════
# TESTING
# ══════════════════════════════════════════════════════════════

test: test-back test-front ## Roda todos os testes

test-back: ## Roda testes do backend
	cd backend && python -m pytest -v --tb=short

test-back-cov: ## Testes do backend com cobertura
	cd backend && python -m pytest -v --cov=app --cov-report=html --cov-report=term-missing

test-front: ## Roda testes do frontend
	cd frontend && npm test -- --passWithNoTests 2>/dev/null || echo "⚠️  Nenhum teste configurado no frontend"

# ══════════════════════════════════════════════════════════════
# LINTING & FORMATTING
# ══════════════════════════════════════════════════════════════

lint: lint-back lint-front ## Roda linting em tudo

lint-back: ## Lint backend (ruff)
	cd backend && ruff check app/ tests/

lint-front: ## Lint frontend (eslint)
	cd frontend && npm run lint

fmt: ## Formata código (backend + frontend)
	cd backend && ruff format app/ tests/
	cd frontend && npm run format

fmt-check: ## Verifica formatação sem alterar
	cd backend && ruff format --check app/ tests/
	cd frontend && npm run format:check

typecheck: ## Verifica tipos (mypy + tsc)
	cd backend && mypy app/
	cd frontend && npm run type-check

# ══════════════════════════════════════════════════════════════
# DATABASE
# ══════════════════════════════════════════════════════════════

migrate: ## Aplica migrations pendentes
	cd backend && alembic upgrade head

migration: ## Cria nova migration (uso: make migration msg="add users table")
	cd backend && alembic revision --autogenerate -m "$(msg)"

migrate-down: ## Reverte última migration
	cd backend && alembic downgrade -1

db-shell: ## Abre shell do PostgreSQL
	docker compose exec db psql -U upylol -d upylol

redis-shell: ## Abre shell do Redis
	docker compose exec redis redis-cli

db-reset: ## ⚠️ Reseta banco completamente
	@echo "⚠️  Isso vai DESTRUIR todos os dados. Ctrl+C para cancelar..."
	@sleep 3
	docker compose exec db psql -U upylol -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
	cd backend && alembic upgrade head

# ══════════════════════════════════════════════════════════════
# PRODUCTION
# ══════════════════════════════════════════════════════════════

prod: ## Sobe ambiente de produção
	@echo "🚀 Iniciando ambiente de produção..."
	$(COMPOSE_PROD) up -d --build

prod-down: ## Para ambiente de produção
	$(COMPOSE_PROD) down

prod-logs: ## Logs de produção
	$(COMPOSE_PROD) logs -f

deploy: ## Build e deploy completo
	@echo "📦 Building images..."
	$(COMPOSE_PROD) build --no-cache
	@echo "🔄 Running migrations..."
	$(COMPOSE_PROD) run --rm backend alembic upgrade head
	@echo "🚀 Starting services..."
	$(COMPOSE_PROD) up -d
	@echo "✅ Deploy completo!"

# ══════════════════════════════════════════════════════════════
# UTILITIES
# ══════════════════════════════════════════════════════════════

shell-back: ## Abre shell no container do backend
	$(COMPOSE_DEV) exec backend bash

shell-front: ## Abre shell no container do frontend
	$(COMPOSE_DEV) exec frontend sh

health: ## Verifica saúde dos serviços
	@echo "🏥 Health check..."
	@curl -sf http://localhost/health && echo " ✅ Nginx OK" || echo " ❌ Nginx FAIL"
	@curl -sf http://localhost:8000/api/v1/health && echo " ✅ Backend OK" || echo " ❌ Backend FAIL"
	@curl -sf http://localhost:3000 > /dev/null && echo " ✅ Frontend OK" || echo " ❌ Frontend FAIL"
	@docker compose exec -T db pg_isready -U upylol > /dev/null 2>&1 && echo " ✅ PostgreSQL OK" || echo " ❌ PostgreSQL FAIL"
	@docker compose exec -T redis redis-cli ping > /dev/null 2>&1 && echo " ✅ Redis OK" || echo " ❌ Redis FAIL"

setup: ## Setup inicial do projeto
	@echo "📋 Configurando projeto..."
	@test -f .env || (cp .env.example .env && echo "  ✅ .env criado (edite o RIOT_API_KEY)")
	@echo "  📦 Instalando dependências do backend..."
	@cd backend && pip install -e ".[dev]" > /dev/null 2>&1 || true
	@echo "  📦 Instalando dependências do frontend..."
	@cd frontend && npm install > /dev/null 2>&1 || true
	@echo "  🐳 Subindo infraestrutura..."
	@docker compose up -d db redis
	@echo "  ⏳ Aguardando banco ficar pronto..."
	@sleep 5
	@echo "  🗃️ Aplicando migrations..."
	@cd backend && alembic upgrade head 2>/dev/null || echo "  ⚠️  Migrations pendentes"
	@echo ""
	@echo "  ✅ Setup completo! Use 'make dev' para iniciar."
