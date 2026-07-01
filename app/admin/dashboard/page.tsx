import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
import DashboardClient from '@/components/admin/DashboardClient'

async function getDashboardData() {
  try {
    const supabase = await createClient()

    // Verificar se Supabase está configurado
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (!url || url === 'your_supabase_project_url') {
      return null
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

    // Pedidos de hoje
    const { count: pedidosHoje } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .gte('criado_em', today.toISOString())

    // Receita do mês
    const { data: receitaMes } = await supabase
      .from('orders')
      .select('total')
      .gte('criado_em', firstDayOfMonth.toISOString())
      .in('status', ['pago', 'enviado', 'entregue'])

    const totalReceita = receitaMes?.reduce((acc: number, o: any) => acc + Number(o.total), 0) ?? 0

    // Produtos ativos
    const { count: produtosAtivos } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('ativo', true)

    // Estoque baixo (≤ 3)
    const { count: estoqueBaixo } = await supabase
      .from('product_variants')
      .select('*', { count: 'exact', head: true })
      .lte('estoque', 3)

    // Pedidos recentes
    const { data: pedidosRecentes } = await supabase
      .from('orders')
      .select('id, cliente_nome, total, status, criado_em')
      .order('criado_em', { ascending: false })
      .limit(5)

    // Vendas dos últimos 30 dias (agrupadas por dia)
    const { data: vendasPeriodo } = await supabase
      .from('orders')
      .select('total, criado_em')
      .gte('criado_em', thirtyDaysAgo.toISOString())
      .in('status', ['pago', 'enviado', 'entregue'])
      .order('criado_em', { ascending: true })

    // Produtos mais vendidos
    const { data: itensMaisVendidos } = await supabase
      .from('order_items')
      .select(`
        quantidade,
        product_variants (
          product_id,
          products (nome, preco_base)
        )
      `)
      .limit(50)

    // Processar produtos mais vendidos
    const produtoMap = new Map<string, { nome: string; total: number; preco: number }>()
    itensMaisVendidos?.forEach((item: any) => {
      const variant = item.product_variants as unknown as { product_id: string; products: { nome: string; preco_base: number } } | null
      if (!variant?.products) return
      const pid = variant.product_id
      const existing = produtoMap.get(pid)
      if (existing) {
        existing.total += item.quantidade
      } else {
        produtoMap.set(pid, {
          nome: variant.products.nome,
          total: item.quantidade,
          preco: variant.products.preco_base,
        })
      }
    })

    const maisVendidos = Array.from(produtoMap.entries())
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)

    // Processar gráfico de vendas por dia
    const vendasPorDia = new Map<string, number>()
    vendasPeriodo?.forEach((v: any) => {
      const dia = new Date(v.criado_em).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
      })
      vendasPorDia.set(dia, (vendasPorDia.get(dia) ?? 0) + Number(v.total))
    })

    const graficoVendas = Array.from(vendasPorDia.entries()).map(([data, valor]) => ({
      data,
      valor,
    }))

    return {
      pedidosHoje: pedidosHoje ?? 0,
      totalReceita,
      produtosAtivos: produtosAtivos ?? 0,
      estoqueBaixo: estoqueBaixo ?? 0,
      pedidosRecentes: pedidosRecentes ?? [],
      maisVendidos,
      graficoVendas,
    }
  } catch {
    return null
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData()

  return <DashboardClient data={data} />
}
