import { createClient } from '@/lib/supabase/server'
import VendasClient from '@/components/admin/VendasClient'

export const dynamic = 'force-dynamic'

type AnyRecord = Record<string, any>

async function getVendas() {
  try {
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

export default async function VendasPage() {
  const pedidos = await getVendas()
  return <VendasClient pedidos={pedidos} />
}
