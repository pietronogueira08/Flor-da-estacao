import { createClient } from '@/lib/supabase/server'
import PedidosClient from '@/components/admin/PedidosClient'

export const dynamic = 'force-dynamic'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = Record<string, any>

async function getPedidos() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (!url || url === 'your_supabase_project_url') return [] as AnyRecord[]

    const supabase = await createClient()

    const { data } = await supabase
      .from('orders')
      .select(`
        id, cliente_nome, cliente_email, cliente_telefone,
        endereco, frete, subtotal, total, status, payment_id, criado_em,
        order_items (
          id, quantidade, preco_unitario,
          product_variants (
            id, tamanho, cor, sku,
            products (nome)
          )
        )
      `)
      .order('criado_em', { ascending: false })

    return (data ?? []) as AnyRecord[]
  } catch {
    return [] as AnyRecord[]
  }
}

export default async function PedidosPage() {
  const pedidos = await getPedidos()
  return <PedidosClient pedidos={pedidos} />
}
