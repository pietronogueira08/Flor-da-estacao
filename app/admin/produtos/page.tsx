import { createClient } from '@/lib/supabase/server'
import ProdutosClient from '@/components/admin/ProdutosClient'

export const dynamic = 'force-dynamic'

type AnyRecord = Record<string, any>

async function getProdutos() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (!url || url === 'your_supabase_project_url') return { produtos: [] as AnyRecord[], categorias: [] as AnyRecord[] }

    const supabase = await createClient()

    const [produtosResult, categoriasResult] = await Promise.all([
      supabase
        .from('products')
        .select(`
          id, nome, slug, descricao, preco_base, ativo, criado_em,
          categories (id, nome, slug),
          product_variants (id, tamanho, cor, sku, estoque, preco_override),
          product_images (id, url, posicao, is_placeholder)
        `)
        .order('criado_em', { ascending: false }),
      supabase.from('categories').select('id, nome, slug').order('nome'),
    ])

    const allProducts = (produtosResult.data ?? []) as AnyRecord[];
    const realProducts = allProducts.filter(p => !p.id.startsWith('b1000000'));
    const displayProducts = realProducts.length > 0 ? realProducts : allProducts;

    return {
      produtos: displayProducts,
      categorias: (categoriasResult.data ?? []) as AnyRecord[],
    }
  } catch {
    return { produtos: [] as AnyRecord[], categorias: [] as AnyRecord[] }
  }
}

export default async function ProdutosPage() {
  const { produtos, categorias } = await getProdutos()
  return <ProdutosClient produtos={produtos} categorias={categorias} />
}
