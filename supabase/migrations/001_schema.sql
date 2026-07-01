-- ========================================
-- Migration 001: Schema completo Flor da Estação
-- ========================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------
-- TABELA: categories
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS categories (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome       TEXT NOT NULL,
  slug       TEXT NOT NULL UNIQUE,
  criado_em  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------
-- TABELA: products
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS products (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome         TEXT NOT NULL,
  slug         TEXT NOT NULL UNIQUE,
  descricao    TEXT,
  preco_base   NUMERIC(10, 2) NOT NULL,
  categoria_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  ativo        BOOLEAN NOT NULL DEFAULT true,
  criado_em    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_categoria ON products(categoria_id);
CREATE INDEX IF NOT EXISTS idx_products_ativo ON products(ativo);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);

-- ----------------------------------------
-- TABELA: product_variants
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS product_variants (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id     UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  tamanho        TEXT NOT NULL,
  cor            TEXT NOT NULL,
  sku            TEXT NOT NULL UNIQUE,
  estoque        INTEGER NOT NULL DEFAULT 0,
  preco_override NUMERIC(10, 2) NULL
);

CREATE INDEX IF NOT EXISTS idx_variants_product ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_variants_sku ON product_variants(sku);

-- ----------------------------------------
-- TABELA: product_images
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS product_images (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id     UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url            TEXT NOT NULL,
  posicao        INTEGER NOT NULL DEFAULT 0,
  is_placeholder BOOLEAN NOT NULL DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_images_product ON product_images(product_id);

-- ----------------------------------------
-- TABELA: orders
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS orders (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cliente_nome     TEXT NOT NULL,
  cliente_email    TEXT NOT NULL,
  cliente_telefone TEXT,
  endereco         JSONB NOT NULL DEFAULT '{}',
  frete            NUMERIC(10, 2) NOT NULL DEFAULT 0,
  subtotal         NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total            NUMERIC(10, 2) NOT NULL DEFAULT 0,
  status           TEXT NOT NULL DEFAULT 'pendente'
                   CHECK (status IN ('pendente', 'pago', 'enviado', 'entregue', 'cancelado')),
  payment_id       TEXT NULL,
  criado_em        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(cliente_email);
CREATE INDEX IF NOT EXISTS idx_orders_criado_em ON orders(criado_em DESC);

-- ----------------------------------------
-- TABELA: order_items
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS order_items (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id        UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  variant_id      UUID NOT NULL REFERENCES product_variants(id) ON DELETE RESTRICT,
  quantidade      INTEGER NOT NULL CHECK (quantidade > 0),
  preco_unitario  NUMERIC(10, 2) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_variant ON order_items(variant_id);

-- ----------------------------------------
-- TABELA: stock_movements
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS stock_movements (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  variant_id   UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  variacao_qtd INTEGER NOT NULL,
  motivo       TEXT NOT NULL,
  criado_em    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stock_movements_variant ON stock_movements(variant_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_criado_em ON stock_movements(criado_em DESC);

-- ----------------------------------------
-- ROW LEVEL SECURITY
-- ----------------------------------------
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;

-- Políticas públicas de leitura (loja)
CREATE POLICY "Categorias públicas" ON categories FOR SELECT USING (true);
CREATE POLICY "Produtos ativos públicos" ON products FOR SELECT USING (ativo = true);
CREATE POLICY "Variantes públicas" ON product_variants FOR SELECT USING (true);
CREATE POLICY "Imagens públicas" ON product_images FOR SELECT USING (true);

-- Políticas admin (usuários autenticados têm acesso total)
CREATE POLICY "Admin total categories" ON categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin total products" ON products FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin total variants" ON product_variants FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin total images" ON product_images FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin total orders" ON orders FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin total order_items" ON order_items FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin total stock_movements" ON stock_movements FOR ALL USING (auth.role() = 'authenticated');

-- Clientes podem inserir pedidos
CREATE POLICY "Inserir pedido" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Inserir itens pedido" ON order_items FOR INSERT WITH CHECK (true);

-- ----------------------------------------
-- STORAGE: bucket product-images
-- ----------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Imagens produto públicas" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Admin upload imagens" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');

CREATE POLICY "Admin delete imagens" ON storage.objects
  FOR DELETE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');
