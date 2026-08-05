-- Adicionando novas colunas na tabela store_settings para suportar a customização completa
ALTER TABLE public.store_settings 
ADD COLUMN IF NOT EXISTS hero_video TEXT,
ADD COLUMN IF NOT EXISTS utility_bar_texts JSONB DEFAULT '["FRETE GRÁTIS ACIMA DE R$ 399", "PARCELE EM ATÉ 6X SEM JUROS", "MODA COM IDENTIDADE EDITORIAL"]'::jsonb,
ADD COLUMN IF NOT EXISTS editorial_banner_image TEXT,
ADD COLUMN IF NOT EXISTS editorial_banner_text TEXT,
ADD COLUMN IF NOT EXISTS contact_whatsapp TEXT,
ADD COLUMN IF NOT EXISTS contact_email TEXT,
ADD COLUMN IF NOT EXISTS contact_address TEXT;

-- Forçar o RLs a permitir SELECT/UPDATE para os campos novos
-- Como já deve haver politicas de update na tabela, não precisamos mexer caso a role supabase_admin já tenha acesso
