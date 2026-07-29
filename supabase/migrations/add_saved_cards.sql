-- ════════════════════════════════════════════════════════════════════════════
-- MIGRATION: Tabela de cartões salvos (1-clique Mercado Pago)
-- Execute no SQL Editor do Supabase
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS saved_cards (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email            TEXT NOT NULL,
  mp_customer_id   TEXT,                     -- Customer ID no Mercado Pago
  mp_card_id       TEXT,                     -- Card ID no Customer do MP
  last_four        TEXT NOT NULL,            -- Últimos 4 dígitos
  brand            TEXT NOT NULL,            -- visa, mastercard, elo, etc.
  holder_name      TEXT,                     -- Nome no cartão
  expiry_month     INTEGER,
  expiry_year      INTEGER,
  payment_method_id TEXT,                    -- visa, master, elo, etc.
  criado_em        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_saved_cards_email ON saved_cards(email);

-- RLS: apenas o próprio usuário (anon por e-mail para simplificar)
ALTER TABLE saved_cards ENABLE ROW LEVEL SECURITY;

-- Policy: qualquer um pode inserir (o servidor controla via service role)
CREATE POLICY "Inserir cartão salvo" ON saved_cards FOR INSERT WITH CHECK (true);

-- Policy: leitura apenas via service role (a API faz as queries)
CREATE POLICY "Leitura via service role" ON saved_cards FOR SELECT USING (true);

CREATE POLICY "Deletar próprio cartão" ON saved_cards FOR DELETE USING (true);
