# upylol — Infraestrutura

Configuração completa de infraestrutura para o monorepo do upylol.

## Arquitetura

```
                    ┌──────────────┐
                    │   Internet   │
                    └──────┬───────┘
                           │ :80/:443
                    ┌──────▼───────┐
                    │    Nginx     │
                    │  (proxy)     │
                    └──┬───────┬───┘
            /api/*     │       │  /*
                ┌──────▼──┐  ┌─▼──────────┐
                │ Backend │  │  Frontend   │
                │ FastAPI │  │  Next.js    │
                │  :8000  │  │   :3000     │
                └──┬──┬───┘  └────────────┘
                   │  │
           ┌───────┘  └───────┐
     ┌─────▼─────┐      ┌────▼─────┐
     │ PostgreSQL │      │  Redis   │
     │   :5432   │      │  :6379   │
     └───────────┘      └──────────┘
```

## Quick Start

```bash
# 1. Clone e configure
git clone https://github.com/user/upylol.git
cd upylol
cp .env.example .env
# Edite .env → preencha RIOT_API_KEY e DB_PASSWORD

# 2. Setup automático
make setup

# 3. Subir em desenvolvimento
make dev

# 4. Acessar
# App:     http://localhost
# API:     http://localhost:8000/api/docs
# Direct:  http://localhost:3000 (frontend)
```

## Estrutura do Monorepo

```
upylol/
├── backend/                  # FastAPI + Python 3.12
│   ├── Dockerfile
│   ├── pyproject.toml
│   ├── alembic/
│   └── app/
│
├── frontend/                 # Next.js 15 + TypeScript
│   ├── Dockerfile
│   ├── Dockerfile.dev
│   ├── package.json
│   └── src/
│
├── nginx/                    # Reverse proxy
│   ├── nginx.conf            # Produção (gzip, cache, rate limit, security headers)
│   ├── nginx.dev.conf        # Dev (sem cache, HMR WebSocket)
│   ├── conf.d/
│   │   └── ssl.conf.example  # Template SSL/TLS
│   └── ssl/                  # Certificados (gitignored)
│
├── scripts/                  # Scripts operacionais
│   ├── init-db.sql           # Inicialização do banco
│   ├── healthcheck.sh        # Health check de todos os serviços
│   ├── backup-db.sh          # Backup do PostgreSQL
│   ├── restore-db.sh         # Restore de backup
│   └── wait-for.sh           # Espera serviços (deps containers)
│
├── .github/
│   ├── workflows/
│   │   ├── backend-ci.yml    # Lint + Type Check + Tests + Docker Build
│   │   ├── frontend-ci.yml   # Lint + Type Check + Build + Docker Build
│   │   └── deploy.yml        # Build → Push → Deploy via SSH
│   └── dependabot.yml        # Auto-updates de deps
│
├── docker-compose.yml        # Base (todos os serviços)
├── docker-compose.dev.yml    # Override: hot reload, ports expostas
├── docker-compose.prod.yml   # Override: workers, limits, SSL
├── Makefile                  # Todos os comandos
├── .env.example              # Template de variáveis
├── .editorconfig             # Estilo de código
├── .dockerignore
└── .gitignore
```

## Docker Compose Profiles

| Ambiente | Comando | Descrição |
|---|---|---|
| **Dev** | `make dev` | Hot reload, ports expostas, sem cache nginx |
| **Dev (bg)** | `make dev-d` | Mesmo que dev, em background |
| **Base** | `make up` | Serviços base, sem overrides |
| **Prod** | `make prod` | Workers otimizados, resource limits, SSL |
| **Deploy** | `make deploy` | Build + migrate + start |

## Comandos (Makefile)

### Desenvolvimento
```bash
make dev          # Sobe tudo com hot reload
make logs         # Logs de todos os serviços
make logs-back    # Logs apenas do backend
make logs-front   # Logs apenas do frontend
make status       # Status dos containers
make restart      # Reinicia serviços
make down         # Para tudo
make clean        # Remove containers + volumes
```

### Testes & Qualidade
```bash
make test         # Todos os testes (back + front)
make test-back    # Testes do backend (pytest)
make test-back-cov # Com cobertura
make lint         # Lint (ruff + eslint)
make fmt          # Formatação (ruff + prettier)
make typecheck    # Type check (mypy + tsc)
```

### Banco de Dados
```bash
make migrate                    # Aplica migrations
make migration msg="add table"  # Cria nova migration
make migrate-down               # Reverte última migration
make db-shell                   # psql interativo
make redis-shell                # redis-cli interativo
make db-reset                   # ⚠️ Reseta banco
```

### Produção & Deploy
```bash
make prod         # Sobe em modo produção
make deploy       # Build + migrate + deploy
make health       # Verifica saúde dos serviços
```

## Nginx

### Produção
- **Gzip** compressão (text, json, js, css, svg)
- **Rate limiting**: 30 req/s geral, 5 req/s para busca de player
- **Proxy cache**: API responses (2min), static assets (7 days)
- **Security headers**: X-Frame-Options, CSP, HSTS
- **Connection pooling**: keepalive upstream connections

### Desenvolvimento
- Sem cache
- WebSocket HMR pass-through (`/_next/webpack-hmr`)
- Logs verbosos

## CI/CD (GitHub Actions)

### Backend CI (`backend-ci.yml`)
1. **Lint** — Ruff check + format
2. **Type Check** — Mypy
3. **Tests** — Pytest com PostgreSQL e Redis em services
4. **Docker Build** — Verifica se a imagem builda

### Frontend CI (`frontend-ci.yml`)
1. **Lint** — ESLint + Prettier
2. **Type Check** — TypeScript `tsc --noEmit`
3. **Build** — `next build`
4. **Docker Build** — Verifica imagem

### Deploy (`deploy.yml`)
1. Build e push para GHCR (GitHub Container Registry)
2. SCP dos arquivos de deploy para o servidor
3. SSH: pull images → migrate → up
4. Health check pós-deploy

### Dependabot
- Python deps: semanalmente
- npm deps: semanalmente (major versions ignorados para next/react)
- Docker base images: mensalmente
- GitHub Actions: semanalmente

## Backup & Restore

```bash
# Backup (cronjob recomendado: 0 3 * * *)
./scripts/backup-db.sh

# Backup para diretório específico
./scripts/backup-db.sh /mnt/backups

# Restore
./scripts/restore-db.sh backups/upylol_backup_20260217_030000.sql.gz
```

Backups são retidos por 30 dias automaticamente.

## SSL/TLS (Produção)

Para habilitar HTTPS:

1. Obtenha certificados (Let's Encrypt recomendado)
2. Coloque em `nginx/ssl/` (`fullchain.pem` + `privkey.pem`)
3. Descomente `nginx/conf.d/ssl.conf.example` → `ssl.conf`
4. Configure `HTTPS_PORT=443` no `.env`
5. `make prod`

## Monitoramento

```bash
# Health check rápido
make health

# Script detalhado com métricas de recursos
./scripts/healthcheck.sh

# Health check remoto
./scripts/healthcheck.sh https://upylol.com
```

## Variáveis de Ambiente

| Variável | Obrigatória | Default | Descrição |
|---|---|---|---|
| `RIOT_API_KEY` | ✅ | — | Chave da Riot API |
| `DB_PASSWORD` | ✅ (prod) | `upylol` | Senha do PostgreSQL |
| `DB_NAME` | — | `upylol` | Nome do banco |
| `DB_USER` | — | `upylol` | Usuário do banco |
| `REDIS_URL` | — | `redis://redis:6379/0` | URL do Redis |
| `DEBUG` | — | `true` | Modo debug |
| `BACKEND_WORKERS` | — | `4` | Uvicorn workers (prod) |
| `CORS_ORIGINS` | — | `["http://localhost:3000"]` | Origens CORS |
| `HTTP_PORT` | — | `80` | Porta HTTP do Nginx |
| `HTTPS_PORT` | — | `443` | Porta HTTPS do Nginx |
| `DDRAGON_VERSION` | — | `15.3.1` | Versão do Data Dragon |
