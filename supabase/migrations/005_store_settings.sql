-- ========================================
-- Migration 005: Store Settings
-- ========================================

CREATE TABLE IF NOT EXISTS store_settings (
  id INT PRIMARY KEY DEFAULT 1,
  hero_images JSONB NOT NULL DEFAULT '[]'::jsonb,
  instagram_images JSONB NOT NULL DEFAULT '[]'::jsonb,
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Inserir a linha única inicial
INSERT INTO store_settings (id, hero_images, instagram_images)
VALUES (1, '[]'::jsonb, '[]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- RLS
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

-- Qualquer um pode ler
CREATE POLICY "Public read settings" ON store_settings FOR SELECT USING (true);
-- Qualquer um pode atualizar (já que removemos a restrição de login temporariamente)
CREATE POLICY "Public update settings" ON store_settings FOR UPDATE USING (true);

-- Criar bucket para os assets da loja se não existir
INSERT INTO storage.buckets (id, name, public)
VALUES ('store-assets', 'store-assets', true)
ON CONFLICT (id) DO NOTHING;

-- RLS para o bucket
CREATE POLICY "Public read store-assets" ON storage.objects
  FOR SELECT USING (bucket_id = 'store-assets');

CREATE POLICY "Public upload store-assets" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'store-assets');

CREATE POLICY "Public delete store-assets" ON storage.objects
  FOR DELETE USING (bucket_id = 'store-assets');
