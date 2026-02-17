-- ╔══════════════════════════════════════════════════════════════╗
-- ║  UPYLOL — Database Initialization                          ║
-- ║  Executado automaticamente na primeira inicialização do PG  ║
-- ╚══════════════════════════════════════════════════════════════╝

-- Extensões úteis
CREATE EXTENSION IF NOT EXISTS pg_trgm;     -- Fuzzy text search (busca de nomes)
CREATE EXTENSION IF NOT EXISTS btree_gin;   -- GIN indexes para JSONB
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;  -- Query performance monitoring

-- Schema separado para cache/staging (opcional)
CREATE SCHEMA IF NOT EXISTS cache;

-- Comentário no banco
COMMENT ON DATABASE upylol IS 'UPYLOL - League of Legends Performance Analytics';
