-- ════════════════════════════════════════════════════════════════════════════
-- MIGRATION: Adicionar campos do Melhor Envio na tabela orders
-- Execute este SQL no editor SQL do Supabase (SQL Editor > New Query)
-- ════════════════════════════════════════════════════════════════════════════

-- Adicionar campos de integração Melhor Envio
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS melhor_envio_id  TEXT NULL,
  ADD COLUMN IF NOT EXISTS tracking_code    TEXT NULL,
  ADD COLUMN IF NOT EXISTS label_url        TEXT NULL,
  ADD COLUMN IF NOT EXISTS frete_service_id INTEGER NULL;

-- Índice para busca rápida por código de rastreio
CREATE INDEX IF NOT EXISTS idx_orders_tracking ON orders(tracking_code)
  WHERE tracking_code IS NOT NULL;

-- Índice para busca por ID do Melhor Envio
CREATE INDEX IF NOT EXISTS idx_orders_me_id ON orders(melhor_envio_id)
  WHERE melhor_envio_id IS NOT NULL;

-- ────────────────────────────────────────────────────────────────────────────
-- Verificação: rode esta query para confirmar que as colunas foram criadas
-- ────────────────────────────────────────────────────────────────────────────
-- SELECT column_name, data_type
-- FROM information_schema.columns
-- WHERE table_name = 'orders'
-- ORDER BY ordinal_position;
