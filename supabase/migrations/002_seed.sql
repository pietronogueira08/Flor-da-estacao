-- ========================================
-- Migration 002: Seed de dados — Flor da Estação
-- ========================================

-- ----------------------------------------
-- CATEGORIAS
-- ----------------------------------------
INSERT INTO categories (id, nome, slug) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Vestidos',           'vestidos'),
  ('a1000000-0000-0000-0000-000000000002', 'Blusas & Camisas',   'blusas-camisas'),
  ('a1000000-0000-0000-0000-000000000003', 'Calças & Saias',     'calcas-saias'),
  ('a1000000-0000-0000-0000-000000000004', 'Conjuntos',          'conjuntos'),
  ('a1000000-0000-0000-0000-000000000005', 'Casacos & Jaquetas', 'casacos-jaquetas'),
  ('a1000000-0000-0000-0000-000000000006', 'Acessórios',         'acessorios')
ON CONFLICT (slug) DO NOTHING;

-- ----------------------------------------
-- PRODUTOS (15)
-- ----------------------------------------
INSERT INTO products (id, nome, slug, descricao, preco_base, categoria_id, ativo) VALUES
  -- VESTIDOS
  ('b1000000-0000-0000-0000-000000000001',
   'Vestido Magnólia Midi',
   'vestido-magnolia-midi',
   'Vestido midi em crepe leve com estampa floral delicada. Decote V, manga curta bufante e cinto tonal. Ideal para ocasiões especiais.',
   249.90,
   'a1000000-0000-0000-0000-000000000001',
   true),

  ('b1000000-0000-0000-0000-000000000002',
   'Vestido Lírio do Vale',
   'vestido-lirio-do-vale',
   'Vestido longo fluido em malha canelada. Alças finas, abertura lateral e modelagem evasê suave. Elegante e confortável.',
   189.90,
   'a1000000-0000-0000-0000-000000000001',
   true),

  ('b1000000-0000-0000-0000-000000000003',
   'Vestido Peônia Curto',
   'vestido-peonia-curto',
   'Vestido curto em linho lavado com bordado floral no busto. Costas cruzadas e saia godê. Perfeito para o verão.',
   169.90,
   'a1000000-0000-0000-0000-000000000001',
   true),

  -- BLUSAS & CAMISAS
  ('b1000000-0000-0000-0000-000000000004',
   'Blusa Orquídea Off-shoulder',
   'blusa-orquidea-off-shoulder',
   'Blusa ciganinha em musselina com elástico no ombro. Estampa botânica aquarelada. Frente franzida e manga sino.',
   129.90,
   'a1000000-0000-0000-0000-000000000002',
   true),

  ('b1000000-0000-0000-0000-000000000005',
   'Camisa Hortênsia Oversized',
   'camisa-hortensia-oversized',
   'Camisa em linho puro com modelagem oversized relaxada. Botões de madrepérola e gola clássica. Versátil e atemporal.',
   159.90,
   'a1000000-0000-0000-0000-000000000002',
   true),

  ('b1000000-0000-0000-0000-000000000006',
   'Blusa Flor de Cerejeira',
   'blusa-flor-de-cerejeira',
   'Blusa em tricô fino com detalhe de flores em relevo. Decote redondo e manga longa. Perfeita para transição de estação.',
   109.90,
   'a1000000-0000-0000-0000-000000000002',
   true),

  -- CALÇAS & SAIAS
  ('b1000000-0000-0000-0000-000000000007',
   'Calça Lavanda Wide Leg',
   'calca-lavanda-wide-leg',
   'Calça pantalona em tecido acetinado com cintura alta e elástico. Perna larga e fluida para movimento natural.',
   189.90,
   'a1000000-0000-0000-0000-000000000003',
   true),

  ('b1000000-0000-0000-0000-000000000008',
   'Saia Jardim Midi Plissada',
   'saia-jardim-midi-plissada',
   'Saia midi plissada em seda sintética com estampa de jardim botânico. Cós elástico e forro interno.',
   149.90,
   'a1000000-0000-0000-0000-000000000003',
   true),

  ('b1000000-0000-0000-0000-000000000009',
   'Saia Petala Longa',
   'saia-petala-longa',
   'Saia longa com camadas assimétricas em voile de seda. Efeito pétalas ao caminhar. Romantismo em movimento.',
   179.90,
   'a1000000-0000-0000-0000-000000000003',
   true),

  -- CONJUNTOS
  ('b1000000-0000-0000-0000-000000000010',
   'Conjunto Bouquet Linho',
   'conjunto-bouquet-linho',
   'Conjunto de calça wide leg e blusa cropped em linho puro. Bordado de flores silvestres no conjunto. Coordenados ou separados.',
   299.90,
   'a1000000-0000-0000-0000-000000000004',
   true),

  ('b1000000-0000-0000-0000-000000000011',
   'Conjunto Jardim Secreto',
   'conjunto-jardim-secreto',
   'Conjunto saia midi e blusa com amarração frontal em tecido estampado floral. Cores terrosas e rosé que se complementam.',
   259.90,
   'a1000000-0000-0000-0000-000000000004',
   true),

  -- CASACOS & JAQUETAS
  ('b1000000-0000-0000-0000-000000000012',
   'Casaco Camélia Trench',
   'casaco-camelia-trench',
   'Trench coat em gabardine com cinto e botões dourados. Silhueta clássica com toque romântico. Para todas as estações.',
   349.90,
   'a1000000-0000-0000-0000-000000000005',
   true),

  ('b1000000-0000-0000-0000-000000000013',
   'Jaqueta Roseira Cropped',
   'jaqueta-roseira-cropped',
   'Jaqueta cropped em tweed com fio metálico rosé. Botões florais em resina. Ideal para looks mais sofisticados.',
   289.90,
   'a1000000-0000-0000-0000-000000000005',
   true),

  -- ACESSÓRIOS
  ('b1000000-0000-0000-0000-000000000014',
   'Lenço Jardim de Inverno',
   'lenco-jardim-de-inverno',
   'Lenço grande em seda pura com estampa de jardim botânico. Pode ser usado na cabeça, no pescoço ou na bolsa.',
   89.90,
   'a1000000-0000-0000-0000-000000000006',
   true),

  ('b1000000-0000-0000-0000-000000000015',
   'Cinto Hera Largo',
   'cinto-hera-largo',
   'Cinto largo em couro vegetal com fivela dourada em formato de folha. Eleva qualquer look com elegância natural.',
   119.90,
   'a1000000-0000-0000-0000-000000000006',
   true)
ON CONFLICT (slug) DO NOTHING;

-- ----------------------------------------
-- VARIANTES DE PRODUTOS
-- ----------------------------------------
-- Vestido Magnólia Midi (variantes P, M, G, GG × Rosa e Verde Musgo)
INSERT INTO product_variants (id, product_id, tamanho, cor, sku, estoque, preco_override) VALUES
  ('c1000001', 'b1000000-0000-0000-0000-000000000001', 'P',  'Rosa Antigo', 'VMAG-P-ROSA', 8,  NULL),
  ('c1000002', 'b1000000-0000-0000-0000-000000000001', 'M',  'Rosa Antigo', 'VMAG-M-ROSA', 12, NULL),
  ('c1000003', 'b1000000-0000-0000-0000-000000000001', 'G',  'Rosa Antigo', 'VMAG-G-ROSA', 5,  NULL),
  ('c1000004', 'b1000000-0000-0000-0000-000000000001', 'GG', 'Rosa Antigo', 'VMAG-GG-ROSA', 2, NULL),
  ('c1000005', 'b1000000-0000-0000-0000-000000000001', 'P',  'Verde Musgo', 'VMAG-P-VERD', 6,  NULL),
  ('c1000006', 'b1000000-0000-0000-0000-000000000001', 'M',  'Verde Musgo', 'VMAG-M-VERD', 10, NULL),
  ('c1000007', 'b1000000-0000-0000-0000-000000000001', 'G',  'Verde Musgo', 'VMAG-G-VERD', 3,  NULL),
  ('c1000008', 'b1000000-0000-0000-0000-000000000001', 'GG', 'Verde Musgo', 'VMAG-GG-VERD', 1, NULL),

  -- Vestido Lírio do Vale
  ('c1000009', 'b1000000-0000-0000-0000-000000000002', 'P',  'Marfim',    'VLIV-P-MARFI', 7,  NULL),
  ('c1000010', 'b1000000-0000-0000-0000-000000000002', 'M',  'Marfim',    'VLIV-M-MARFI', 15, NULL),
  ('c1000011', 'b1000000-0000-0000-0000-000000000002', 'G',  'Marfim',    'VLIV-G-MARFI', 8,  NULL),
  ('c1000012', 'b1000000-0000-0000-0000-000000000002', 'GG', 'Marfim',    'VLIV-GG-MARFI', 4, NULL),
  ('c1000013', 'b1000000-0000-0000-0000-000000000002', 'P',  'Ameixa',    'VLIV-P-AMEI', 5,  NULL),
  ('c1000014', 'b1000000-0000-0000-0000-000000000002', 'M',  'Ameixa',    'VLIV-M-AMEI', 9,  NULL),

  -- Vestido Peônia Curto
  ('c1000015', 'b1000000-0000-0000-0000-000000000003', 'P',  'Branco',    'VPEO-P-BRAN', 10, NULL),
  ('c1000016', 'b1000000-0000-0000-0000-000000000003', 'M',  'Branco',    'VPEO-M-BRAN', 14, NULL),
  ('c1000017', 'b1000000-0000-0000-0000-000000000003', 'G',  'Branco',    'VPEO-G-BRAN', 6,  NULL),
  ('c1000018', 'b1000000-0000-0000-0000-000000000003', 'GG', 'Branco',    'VPEO-GG-BRAN', 2, NULL),

  -- Blusa Orquídea Off-shoulder
  ('c1000019', 'b1000000-0000-0000-0000-000000000004', 'P',  'Lilás',     'BORQ-P-LILA', 20, NULL),
  ('c1000020', 'b1000000-0000-0000-0000-000000000004', 'M',  'Lilás',     'BORQ-M-LILA', 25, NULL),
  ('c1000021', 'b1000000-0000-0000-0000-000000000004', 'G',  'Lilás',     'BORQ-G-LILA', 15, NULL),
  ('c1000022', 'b1000000-0000-0000-0000-000000000004', 'GG', 'Lilás',     'BORQ-GG-LILA', 8, NULL),

  -- Camisa Hortênsia Oversized
  ('c1000023', 'b1000000-0000-0000-0000-000000000005', 'P',  'Areia',     'CHOR-P-AREIA', 12, NULL),
  ('c1000024', 'b1000000-0000-0000-0000-000000000005', 'M',  'Areia',     'CHOR-M-AREIA', 18, NULL),
  ('c1000025', 'b1000000-0000-0000-0000-000000000005', 'G',  'Areia',     'CHOR-G-AREIA', 10, NULL),
  ('c1000026', 'b1000000-0000-0000-0000-000000000005', 'GG', 'Areia',     'CHOR-GG-AREIA', 5, NULL),

  -- Blusa Flor de Cerejeira
  ('c1000027', 'b1000000-0000-0000-0000-000000000006', 'P',  'Rosa Claro','BCER-P-ROSACL', 3, NULL),
  ('c1000028', 'b1000000-0000-0000-0000-000000000006', 'M',  'Rosa Claro','BCER-M-ROSACL', 7, NULL),
  ('c1000029', 'b1000000-0000-0000-0000-000000000006', 'G',  'Rosa Claro','BCER-G-ROSACL', 2, NULL),
  ('c1000030', 'b1000000-0000-0000-0000-000000000006', 'GG', 'Rosa Claro','BCER-GG-ROSACL', 0, NULL),

  -- Calça Lavanda Wide Leg
  ('c1000031', 'b1000000-0000-0000-0000-000000000007', 'P',  'Lavanda',   'CLAV-P-LAV', 8,  NULL),
  ('c1000032', 'b1000000-0000-0000-0000-000000000007', 'M',  'Lavanda',   'CLAV-M-LAV', 11, NULL),
  ('c1000033', 'b1000000-0000-0000-0000-000000000007', 'G',  'Lavanda',   'CLAV-G-LAV', 6,  NULL),
  ('c1000034', 'b1000000-0000-0000-0000-000000000007', 'GG', 'Lavanda',   'CLAV-GG-LAV', 3, NULL),

  -- Saia Jardim Midi Plissada
  ('c1000035', 'b1000000-0000-0000-0000-000000000008', 'P',  'Floral Mix','SJMP-P-FLOR', 5,  NULL),
  ('c1000036', 'b1000000-0000-0000-0000-000000000008', 'M',  'Floral Mix','SJMP-M-FLOR', 9,  NULL),
  ('c1000037', 'b1000000-0000-0000-0000-000000000008', 'G',  'Floral Mix','SJMP-G-FLOR', 4,  NULL),
  ('c1000038', 'b1000000-0000-0000-0000-000000000008', 'GG', 'Floral Mix','SJMP-GG-FLOR', 1, NULL),

  -- Saia Pétala Longa
  ('c1000039', 'b1000000-0000-0000-0000-000000000009', 'P',  'Rosê',      'SPET-P-ROSE', 4,  NULL),
  ('c1000040', 'b1000000-0000-0000-0000-000000000009', 'M',  'Rosê',      'SPET-M-ROSE', 8,  NULL),
  ('c1000041', 'b1000000-0000-0000-0000-000000000009', 'G',  'Rosê',      'SPET-G-ROSE', 3,  NULL),
  ('c1000042', 'b1000000-0000-0000-0000-000000000009', 'GG', 'Rosê',      'SPET-GG-ROSE', 2, NULL),

  -- Conjunto Bouquet Linho
  ('c1000043', 'b1000000-0000-0000-0000-000000000010', 'P',  'Caqui',     'CBOU-P-CAQU', 6,  NULL),
  ('c1000044', 'b1000000-0000-0000-0000-000000000010', 'M',  'Caqui',     'CBOU-M-CAQU', 10, NULL),
  ('c1000045', 'b1000000-0000-0000-0000-000000000010', 'G',  'Caqui',     'CBOU-G-CAQU', 5,  NULL),
  ('c1000046', 'b1000000-0000-0000-0000-000000000010', 'GG', 'Caqui',     'CBOU-GG-CAQU', 2, NULL),

  -- Conjunto Jardim Secreto
  ('c1000047', 'b1000000-0000-0000-0000-000000000011', 'P',  'Terra',     'CJSE-P-TERR', 7,  NULL),
  ('c1000048', 'b1000000-0000-0000-0000-000000000011', 'M',  'Terra',     'CJSE-M-TERR', 12, NULL),
  ('c1000049', 'b1000000-0000-0000-0000-000000000011', 'G',  'Terra',     'CJSE-G-TERR', 4,  NULL),

  -- Casaco Camélia Trench
  ('c1000050', 'b1000000-0000-0000-0000-000000000012', 'P',  'Caramelo',  'CCAT-P-CARM', 3,  NULL),
  ('c1000051', 'b1000000-0000-0000-0000-000000000012', 'M',  'Caramelo',  'CCAT-M-CARM', 5,  NULL),
  ('c1000052', 'b1000000-0000-0000-0000-000000000012', 'G',  'Caramelo',  'CCAT-G-CARM', 2,  NULL),
  ('c1000053', 'b1000000-0000-0000-0000-000000000012', 'GG', 'Caramelo',  'CCAT-GG-CARM', 1, NULL),

  -- Jaqueta Roseira Cropped
  ('c1000054', 'b1000000-0000-0000-0000-000000000013', 'P',  'Rosa Antigo','JROS-P-ROSA', 4,  NULL),
  ('c1000055', 'b1000000-0000-0000-0000-000000000013', 'M',  'Rosa Antigo','JROS-M-ROSA', 6,  NULL),
  ('c1000056', 'b1000000-0000-0000-0000-000000000013', 'G',  'Rosa Antigo','JROS-G-ROSA', 3,  NULL),
  ('c1000057', 'b1000000-0000-0000-0000-000000000013', 'GG', 'Rosa Antigo','JROS-GG-ROSA', 0, NULL),

  -- Lenço Jardim de Inverno (tamanho único)
  ('c1000058', 'b1000000-0000-0000-0000-000000000014', 'Único', 'Multicolor','LENV-U-MULT', 30, NULL),
  ('c1000059', 'b1000000-0000-0000-0000-000000000014', 'Único', 'Rosa',      'LENV-U-ROSA', 20, NULL),

  -- Cinto Hera Largo (tamanhos 34-42, 44-50)
  ('c1000060', 'b1000000-0000-0000-0000-000000000015', '34-42', 'Caramelo', 'CINT-S-CARM', 15, NULL),
  ('c1000061', 'b1000000-0000-0000-0000-000000000015', '44-50', 'Caramelo', 'CINT-L-CARM', 10, NULL),
  ('c1000062', 'b1000000-0000-0000-0000-000000000015', '34-42', 'Preto',    'CINT-S-PRET', 8,  NULL),
  ('c1000063', 'b1000000-0000-0000-0000-000000000015', '44-50', 'Preto',    'CINT-L-PRET', 5,  NULL)
ON CONFLICT (sku) DO NOTHING;

-- ----------------------------------------
-- IMAGENS (placeholders)
-- ----------------------------------------
INSERT INTO product_images (product_id, url, posicao, is_placeholder) VALUES
  ('b1000000-0000-0000-0000-000000000001', 'https://placehold.co/800x1000/D2A9B1/FFF5F7?text=Vestido+Magnolia', 0, true),
  ('b1000000-0000-0000-0000-000000000001', 'https://placehold.co/800x1000/7D4F5A/FFF5F7?text=Vista+Traseira', 1, true),
  ('b1000000-0000-0000-0000-000000000002', 'https://placehold.co/800x1000/6B7860/FFF5F7?text=Vestido+Lirio', 0, true),
  ('b1000000-0000-0000-0000-000000000003', 'https://placehold.co/800x1000/D2A9B1/241B1E?text=Vestido+Peonia', 0, true),
  ('b1000000-0000-0000-0000-000000000004', 'https://placehold.co/800x1000/7D4F5A/FFF5F7?text=Blusa+Orquidea', 0, true),
  ('b1000000-0000-0000-0000-000000000005', 'https://placehold.co/800x1000/6B7860/FFF5F7?text=Camisa+Hortensia', 0, true),
  ('b1000000-0000-0000-0000-000000000006', 'https://placehold.co/800x1000/D2A9B1/241B1E?text=Blusa+Cerejeira', 0, true),
  ('b1000000-0000-0000-0000-000000000007', 'https://placehold.co/800x1000/7D4F5A/FFF5F7?text=Calca+Lavanda', 0, true),
  ('b1000000-0000-0000-0000-000000000008', 'https://placehold.co/800x1000/D2A9B1/FFF5F7?text=Saia+Jardim', 0, true),
  ('b1000000-0000-0000-0000-000000000009', 'https://placehold.co/800x1000/6B7860/FFF5F7?text=Saia+Petala', 0, true),
  ('b1000000-0000-0000-0000-000000000010', 'https://placehold.co/800x1000/241B1E/D2A9B1?text=Conjunto+Bouquet', 0, true),
  ('b1000000-0000-0000-0000-000000000011', 'https://placehold.co/800x1000/7D4F5A/FFF5F7?text=Conjunto+Jardim', 0, true),
  ('b1000000-0000-0000-0000-000000000012', 'https://placehold.co/800x1000/241B1E/D2A9B1?text=Casaco+Camelia', 0, true),
  ('b1000000-0000-0000-0000-000000000013', 'https://placehold.co/800x1000/D2A9B1/241B1E?text=Jaqueta+Roseira', 0, true),
  ('b1000000-0000-0000-0000-000000000014', 'https://placehold.co/800x1000/6B7860/FFF5F7?text=Lenco+Jardim', 0, true),
  ('b1000000-0000-0000-0000-000000000015', 'https://placehold.co/800x1000/7D4F5A/FFF5F7?text=Cinto+Hera', 0, true);

-- ----------------------------------------
-- PEDIDOS DE EXEMPLO
-- ----------------------------------------
INSERT INTO orders (id, cliente_nome, cliente_email, cliente_telefone, endereco, frete, subtotal, total, status, criado_em) VALUES
  ('d1000000-0000-0000-0000-000000000001',
   'Ana Clara Ferreira',
   'anaclara@email.com',
   '(11) 98765-4321',
   '{"rua": "Rua das Flores", "numero": "123", "bairro": "Jardim Primavera", "cidade": "São Paulo", "estado": "SP", "cep": "01310-100"}',
   18.90,
   249.90,
   268.80,
   'entregue',
   NOW() - INTERVAL '15 days'),

  ('d1000000-0000-0000-0000-000000000002',
   'Beatriz Santos',
   'beatriz.santos@email.com',
   '(21) 99876-5432',
   '{"rua": "Av. Atlântica", "numero": "456", "bairro": "Copacabana", "cidade": "Rio de Janeiro", "estado": "RJ", "cep": "22070-011"}',
   22.90,
   318.80,
   341.70,
   'enviado',
   NOW() - INTERVAL '5 days'),

  ('d1000000-0000-0000-0000-000000000003',
   'Camila Oliveira',
   'camila.oliveira@email.com',
   '(31) 97654-3210',
   '{"rua": "Rua da Bahia", "numero": "789", "bairro": "Centro", "cidade": "Belo Horizonte", "estado": "MG", "cep": "30160-011"}',
   15.90,
   189.90,
   205.80,
   'pago',
   NOW() - INTERVAL '2 days'),

  ('d1000000-0000-0000-0000-000000000004',
   'Daniela Costa',
   'daniela.costa@email.com',
   '(41) 96543-2109',
   '{"rua": "Rua XV de Novembro", "numero": "321", "bairro": "Centro", "cidade": "Curitiba", "estado": "PR", "cep": "80020-310"}',
   19.90,
   299.90,
   319.80,
   'pendente',
   NOW() - INTERVAL '1 day'),

  ('d1000000-0000-0000-0000-000000000005',
   'Eduarda Lima',
   'eduarda.lima@email.com',
   '(51) 95432-1098',
   '{"rua": "Av. Ipiranga", "numero": "654", "bairro": "Centro Histórico", "cidade": "Porto Alegre", "estado": "RS", "cep": "90160-093"}',
   12.90,
   129.90,
   142.80,
   'pendente',
   NOW() - INTERVAL '3 hours');

-- Order items
INSERT INTO order_items (order_id, variant_id, quantidade, preco_unitario) VALUES
  ('d1000000-0000-0000-0000-000000000001', 'c1000002', 1, 249.90),
  ('d1000000-0000-0000-0000-000000000002', 'c1000010', 1, 189.90),
  ('d1000000-0000-0000-0000-000000000002', 'c1000036', 1, 149.90),
  ('d1000000-0000-0000-0000-000000000003', 'c1000014', 1, 189.90),
  ('d1000000-0000-0000-0000-000000000004', 'c1000044', 1, 299.90),
  ('d1000000-0000-0000-0000-000000000005', 'c1000019', 1, 129.90);

-- Movimentações de estoque
INSERT INTO stock_movements (variant_id, variacao_qtd, motivo, criado_em) VALUES
  ('c1000002', 20, 'Estoque inicial',          NOW() - INTERVAL '30 days'),
  ('c1000002', -8, 'Venda pedido #D1000001',   NOW() - INTERVAL '15 days'),
  ('c1000010', 25, 'Estoque inicial',          NOW() - INTERVAL '30 days'),
  ('c1000010', -10, 'Vendas diversas',         NOW() - INTERVAL '10 days'),
  ('c1000019', 30, 'Estoque inicial',          NOW() - INTERVAL '30 days'),
  ('c1000027',  5, 'Reposição emergencial',    NOW() - INTERVAL '5 days'),
  ('c1000030', -3, 'Ajuste inventário',        NOW() - INTERVAL '3 days'),
  ('c1000057', -2, 'Amostras para influencer', NOW() - INTERVAL '7 days');
