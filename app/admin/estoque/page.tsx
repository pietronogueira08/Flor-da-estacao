import { createClient } from '@/lib/supabase/server'
import EstoqueClient from '@/components/admin/EstoqueClient'

export const dynamic = 'force-dynamic'

// Tipos explícitos para compatibilidade com retorno do Supabase
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = Record<string, any>

async function getEstoque() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (!url || url === 'your_supabase_project_url') return { variantes: [] as AnyRecord[], movimentos: [] as AnyRecord[] }

    const supabase = await createClient()

    const [variantesResult, movimentosResult] = await Promise.all([
      supabase
        .from('product_variants')
        .select(`
          id, tamanho, cor, sku, estoque, preco_override,
          products (id, nome, slug)
        `)
        .order('estoque', { ascending: true }),
      supabase
        .from('stock_movements')
        .select(`
          id, variacao_qtd, motivo, criado_em,
          product_variants (
            id, sku, tamanho, cor,
            products (nome)
          )
        `)
        .order('criado_em', { ascending: false })
        .limit(100),
    ])

    return {
      variantes: (variantesResult.data ?? []) as AnyRecord[],
      movimentos: (movimentosResult.data ?? []) as AnyRecord[],
    }
  } catch {
    return { variantes: [] as AnyRecord[], movimentos: [] as AnyRecord[] }
  }
}

export default async function EstoquePage() {
  const { variantes, movimentos } = await getEstoque()
  return <EstoqueClient variantes={variantes} movimentos={movimentos} />
}
