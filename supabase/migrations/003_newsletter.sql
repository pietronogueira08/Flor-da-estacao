-- ========================================
-- Migration 003: Newsletter Leads — Flor da Estação
-- ========================================

CREATE TABLE IF NOT EXISTS newsletter_leads (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email       text NOT NULL UNIQUE,
  origem      text NOT NULL DEFAULT 'home',
  criado_em   timestamptz NOT NULL DEFAULT now()
);

-- Index for fast lookups by email
CREATE INDEX IF NOT EXISTS newsletter_leads_email_idx ON newsletter_leads (email);

-- Enable Row Level Security
ALTER TABLE newsletter_leads ENABLE ROW LEVEL SECURITY;

-- Only service role can read/write (admin access only via Supabase dashboard)
CREATE POLICY "Service role only" ON newsletter_leads
  USING (false)
  WITH CHECK (false);
