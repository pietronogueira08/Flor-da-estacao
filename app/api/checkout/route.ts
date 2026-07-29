import { NextResponse } from 'next/server'
import { createClient } from '../../../lib/supabase/server'

/**
 * Checkout simplificado — apenas cria o pedido no banco.
 * O pagamento agora é processado em /api/pagamento/cartao ou /api/pagamento/pix.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { carrinho, endereco, frete } = body

    if (!carrinho || carrinho.length === 0) {
      return NextResponse.json({ error: 'Carrinho vazio' }, { status: 400 })
    }

    const supabase = await createClient()

    // 1. Valida estoque
    for (const item of carrinho) {
      const { data: variant } = await supabase
        .from('product_variants')
        .select('estoque, products(nome)')
        .eq('id', item.variantId)
        .single()

      if (variant && variant.estoque !== null && variant.estoque < item.quantidade) {
        return NextResponse.json(
          { error: `Estoque insuficiente para ${item.nome}` },
          { status: 400 }
        )
      }
    }

    const subtotal = carrinho.reduce(
      (acc: number, item: { preco: number; quantidade: number }) =>
        acc + item.preco * item.quantidade,
      0
    )
    const total = subtotal + (frete?.preco || 0)

    // 2. Cria pedido no Supabase
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        cliente_nome: endereco.nome,
        cliente_email: endereco.email,
        cliente_telefone: endereco.telefone,
        endereco: endereco,
        frete: frete?.preco || 0,
        frete_service_id: frete?.service_id ?? null,
        subtotal,
        total,
        status: 'pendente',
      })
      .select('id')
      .single()

    if (orderError || !orderData) {
      console.error('Erro ao criar pedido:', orderError)
      return NextResponse.json({ error: 'Erro ao criar pedido' }, { status: 500 })
    }

    const orderId = orderData.id

    // 3. Cria itens do pedido
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orderItems = carrinho.map((item: any) => ({
      order_id: orderId,
      variant_id: item.variantId,
      quantidade: item.quantidade,
      preco_unitario: item.preco,
    }))

    await supabase.from('order_items').insert(orderItems)

    return NextResponse.json({ orderId, total })
  } catch (error) {
    console.error('Erro ao criar pedido:', error)
    return NextResponse.json({ error: 'Erro interno ao criar pedido' }, { status: 500 })
  }
}
