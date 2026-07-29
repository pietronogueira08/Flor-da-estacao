import { NextResponse } from 'next/server'
import { createClient } from '../../../../lib/supabase/server'
import { getMpPayment } from '@/lib/mercadopago'

/**
 * Webhook robusto do Mercado Pago
 * Trata: payment.created, payment.updated
 * Verifica o status real na API (nunca confiar só no payload do webhook)
 */
export async function POST(request: Request) {
  try {
    const url = new URL(request.url)
    const action = url.searchParams.get('action') || url.searchParams.get('type')
    const dataId = url.searchParams.get('data.id') || url.searchParams.get('id')

    // Tenta também ler do body (MP envia nos dois formatos)
    let bodyId = dataId
    try {
      const body = await request.json()
      bodyId = body?.data?.id ?? dataId
    } catch {
      // body pode ser vazio
    }

    const paymentId = bodyId

    // Ignora eventos que não são de pagamento
    if (
      action &&
      !['payment', 'payment.created', 'payment.updated', 'payment_created', 'payment_updated'].includes(action)
    ) {
      return NextResponse.json({ status: 'ignored', reason: `action=${action}` })
    }

    if (!paymentId) {
      return NextResponse.json({ status: 'ok', reason: 'no payment id' })
    }

    const accessToken = process.env.MP_ACCESS_TOKEN
    if (!accessToken) {
      console.warn('Webhook MP: MP_ACCESS_TOKEN não configurado')
      return NextResponse.json({ status: 'ok' })
    }

    // Consulta o pagamento real na API do MP (fonte da verdade)
    const paymentClient = getMpPayment()
    const payment = await paymentClient.get({ id: paymentId })

    const supabase = await createClient()
    const orderId = payment.external_reference

    if (!orderId) {
      return NextResponse.json({ status: 'ok', reason: 'no external_reference' })
    }

    if (payment.status === 'approved') {
      // Verifica se já está pago (idempotência)
      const { data: order } = await supabase
        .from('orders')
        .select('status')
        .eq('id', orderId)
        .single()

      if (order?.status === 'pago') {
        return NextResponse.json({ status: 'ok', reason: 'already paid' })
      }

      // Atualiza status do pedido
      await supabase
        .from('orders')
        .update({ status: 'pago', payment_id: String(paymentId) })
        .eq('id', orderId)

      // Decrementa estoque
      const { data: items } = await supabase
        .from('order_items')
        .select('variant_id, quantidade')
        .eq('order_id', orderId)

      if (items?.length) {
        for (const item of items) {
          const { data: variant } = await supabase
            .from('product_variants')
            .select('estoque')
            .eq('id', item.variant_id)
            .single()

          if (variant && variant.estoque !== null) {
            await supabase
              .from('product_variants')
              .update({ estoque: Math.max(0, variant.estoque - item.quantidade) })
              .eq('id', item.variant_id)

            await supabase.from('stock_movements').insert({
              variant_id: item.variant_id,
              variacao_qtd: -item.quantidade,
              motivo: `Venda pedido ${orderId} (webhook MP)`,
            })
          }
        }
      }

      console.log(`✅ Pedido ${orderId} confirmado como PAGO via webhook MP`)
    } else if (payment.status === 'cancelled' || payment.status === 'rejected') {
      // Só cancela se ainda estiver pendente (não cancela pedidos já pagos)
      const { data: order } = await supabase
        .from('orders')
        .select('status')
        .eq('id', orderId)
        .single()

      if (order?.status === 'pendente') {
        await supabase
          .from('orders')
          .update({ status: 'cancelado' })
          .eq('id', orderId)
      }
    }
    // in_process / pending → não faz nada, aguarda confirmação

    return NextResponse.json({ status: 'success' })
  } catch (error) {
    console.error('Erro no webhook MP:', error)
    // Retorna 200 mesmo com erro interno para MP não retentar indefinidamente
    return NextResponse.json({ status: 'error_logged' })
  }
}

// MP envia GET para verificar a URL do webhook — responder 200
export async function GET() {
  return NextResponse.json({ status: 'ok', service: 'Flor da Estação MP Webhook' })
}
