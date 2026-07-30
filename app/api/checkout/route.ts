import { NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import fs from 'fs'

/**
 * Checkout simplificado — apenas cria o pedido no banco.
 * O pagamento agora é processado em /api/pagamento/cartao ou /api/pagamento/pix.
 */

/** Detecta se uma string é um UUID real (formato xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx) */
function isUUID(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { carrinho, endereco, frete } = body
    
    // DEBUG LOG - to see what's actually arriving from the frontend
    try {
      fs.appendFileSync('./debug_checkout.log', new Date().toISOString() + '\\n' + JSON.stringify(carrinho, null, 2) + '\\n\\n')
    } catch(e) {}

    if (!carrinho || carrinho.length === 0) {
      return NextResponse.json({ error: 'Carrinho vazio' }, { status: 400 })
    }

    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 1. Para cada item do carrinho, resolve o variant_id real no banco
    //    - Se o variantId já for um UUID → usa diretamente (veio da página de produto)
    //    - Se for um ID composto (quick-add) → busca pelo productId + tamanho no banco
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const carrinhoResolvido: any[] = []

    for (const item of carrinho) {
      let resolvedVariantId: string | null = null

      if (isUUID(item.variantId)) {
        // Caminho feliz: variant_id real, apenas valida que existe
        resolvedVariantId = item.variantId

        const { data: variant } = await supabaseAdmin
          .from('product_variants')
          .select('id, estoque')
          .eq('id', resolvedVariantId)
          .single()

        if (variant && variant.estoque !== null && variant.estoque < item.quantidade) {
          return NextResponse.json(
            { error: `Estoque insuficiente para ${item.nome}` },
            { status: 400 }
          )
        }
      } else {
        // Quick-add ou item antigo: busca variante pelo productId + tamanho
        // Se item.productId estiver faltando (carrinho velho), tentamos extrair do variantId (que começa com o UUID do produto)
        let extractedProductId = item.productId
        
        if (!extractedProductId && item.variantId && item.variantId.length >= 36) {
           const possibleId = item.variantId.substring(0, 36)
           // Remover "quickadd-" se existir
           const cleanVariantId = item.variantId.replace('quickadd-', '')
           const possibleId2 = cleanVariantId.substring(0, 36)
           
           if (isUUID(possibleId)) extractedProductId = possibleId
           else if (isUUID(possibleId2)) extractedProductId = possibleId2
        }

        if (extractedProductId) {
          let query = supabaseAdmin
            .from('product_variants')
            .select('id, estoque, tamanho, cor')
            .eq('product_id', extractedProductId)

          if (item.tamanho) query = query.eq('tamanho', item.tamanho)

          const { data: variants } = await query.limit(5)

          if (variants && variants.length > 0) {
            // Prefere a variante com cor exata; senão pega a primeira disponível
            const match =
              variants.find((v) => v.cor === item.cor) ??
              variants.find((v) => (v.estoque ?? 999) > 0) ??
              variants[0]

            if (match.estoque !== null && match.estoque < item.quantidade) {
              return NextResponse.json(
                { error: `Estoque insuficiente para ${item.nome}` },
                { status: 400 }
              )
            }

            resolvedVariantId = match.id
          } else {
            console.warn(`Nenhuma variante encontrada para productId=${extractedProductId}, tamanho=${item.tamanho}`)
            resolvedVariantId = null
          }
        } else {
          // Nem UUID nem productId — não há como resolver
          console.warn(`Item sem variantId UUID nem productId válido: ${JSON.stringify(item)}`)
          resolvedVariantId = null
        }
      }

      carrinhoResolvido.push({ ...item, resolvedVariantId })
    }

    const subtotal = carrinho.reduce(
      (acc: number, item: { preco: number; quantidade: number }) =>
        acc + item.preco * item.quantidade,
      0
    )
    const total = subtotal + (frete?.preco || 0)

    // 2. Cria pedido no Supabase
    const { data: orderData, error: orderError } = await supabaseAdmin
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

    // 3. Cria itens do pedido — apenas itens com variant_id resolvido (NOT NULL constraint no banco)
    const orderItems = carrinhoResolvido
      .filter((item) => item.resolvedVariantId !== null)
      .map((item) => ({
        order_id: orderId,
        variant_id: item.resolvedVariantId,
        quantidade: item.quantidade ?? 1,
        preco_unitario: item.preco,
      }))

    const skippedItems = carrinhoResolvido.filter((item) => item.resolvedVariantId === null)
    if (skippedItems.length > 0) {
      console.warn(
        `⚠️ ${skippedItems.length} item(s) do pedido ${orderId} não puderam ser inseridos (variant_id não encontrado):`,
        skippedItems.map((i) => `${i.nome} (productId=${i.productId}, tamanho=${i.tamanho})`)
      )
    }

    if (orderItems.length > 0) {
      const { error: itemsError } = await supabaseAdmin.from('order_items').insert(orderItems)
      if (itemsError) {
        console.error('Erro ao inserir itens do pedido:', itemsError)
        // Itens não gravados — pedido continua para não travar o usuário,
        // mas o admin verá 0 itens. Isso indica variantes fora de sincronia no banco.
      }
    }

    return NextResponse.json({ orderId, total })
  } catch (error) {
    console.error('Erro ao criar pedido:', error)
    return NextResponse.json({ error: 'Erro interno ao criar pedido' }, { status: 500 })
  }
}
