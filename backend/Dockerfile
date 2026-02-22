FROM python:3.12-slim AS base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

# ── Deps: instala apenas dependencias ──
FROM base AS deps
COPY pyproject.toml .
# Criar diretorio minimo para o setuptools encontrar o pacote
RUN mkdir -p app && touch app/__init__.py \
    && pip install --no-cache-dir ".[dev]"

# ── Runtime: copia codigo fonte ──
FROM deps AS runtime
COPY . .
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
