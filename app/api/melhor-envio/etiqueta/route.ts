import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ME_FROM, meFetch, type MeCartResponse } from '@/lib/melhorenvio'

interface EtiquetaBody {
  orderId: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  order: Record<string, any>
  serviceId?: number
}

export async function POST(request: NextRequest) {
  const body: EtiquetaBody = await request.json()
  const { orderId, order, serviceId = 1 } = body

  if (!orderId || !order) {
    return NextResponse.json({ error: 'orderId e order são obrigatórios' }, { status: 400 })
  }

  try {
    const supabase = await createClient()

    // ── 1. Montar payload do carrinho ────────────────────────────────────────
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const products = (order.order_items ?? []).map((item: any) => ({
      name: item.product_variants?.products?.nome ?? 'Produto Flor da Estação',
      quantity: Number(item.quantidade ?? 1),
      unitary_value: Number(item.preco_unitario ?? 0),
      weight: 0.3,   // 300g por peça (roupas)
      width: 25,
      height: 10,
      length: 30,
    }))

    if (products.length === 0) {
      return NextResponse.json({ error: 'Pedido não tem itens' }, { status: 400 })
    }

    const cartPayload = {
      service: serviceId,
      from: ME_FROM,
      to: {
        name: order.endereco?.nome ?? order.cliente_nome ?? 'Cliente',
        phone: String(order.cliente_telefone ?? '').replace(/\D/g, ''),
        email: order.cliente_email ?? '',
        address: order.endereco?.rua ?? '',
        complement: order.endereco?.complemento ?? '',
        number: order.endereco?.numero ?? 'S/N',
        district: order.endereco?.bairro ?? '',
        city: order.endereco?.cidade ?? '',
        country_id: 'BR',
        postal_code: String(order.endereco?.cep ?? '').replace(/\D/g, ''),
        state_abbr: order.endereco?.estado ?? '',
      },
      products,
      volumes: [
        {
          weight: Math.max(0.3, products.reduce((a: number, p: { weight: number; quantity: number }) => a + p.weight * p.quantity, 0)),
          width: 25,
          height: 15,
          length: 30,
        },
      ],
      options: {
        insurance_value: Number(order.total ?? 0),
        receipt: false,
        own_hand: false,
        reverse: false,
        non_commercial: false,
        invoice: { key: '' },
        platform: 'Flor da Estação',
        tags: [
          { tag: `Pedido #${String(orderId).slice(0, 8).toUpperCase()}`, url: null },
        ],
      },
    }

    // ── 2. Adicionar ao carrinho do Melhor Envio ─────────────────────────────
    const cartData = await meFetch<MeCartResponse>('/me/cart', {
      method: 'POST',
      body: JSON.stringify(cartPayload),
    })

    const shipmentId = cartData.id
    if (!shipmentId) throw new Error('Melhor Envio não retornou um shipmentId')

    // ── 3. Checkout (compra a etiqueta com saldo da conta) ───────────────────
    await meFetch('/me/shipment/checkout', {
      method: 'POST',
      body: JSON.stringify({ orders: [shipmentId] }),
    })

    // ── 4. Gerar etiqueta ────────────────────────────────────────────────────
    await meFetch('/me/shipment/generate', {
      method: 'POST',
      body: JSON.stringify({ orders: [shipmentId] }),
    })

    // ── 5. Obter URL de impressão ────────────────────────────────────────────
    const printData = await meFetch<{ url: string }>('/me/shipment/print', {
      method: 'POST',
      body: JSON.stringify({ mode: 'public', orders: [shipmentId] }),
    })

    const printUrl = printData?.url ?? null

    // ── 6. Buscar código de rastreio ─────────────────────────────────────────
    let trackingCode: string | null = null
    try {
      const trackRes = await meFetch<Record<string, { tracking: string }>>(
        `/me/orders/${shipmentId}`,
        { method: 'GET' }
      )
      trackingCode = trackRes?.[shipmentId]?.tracking ?? null
    } catch {
      // Rastreio pode não estar disponível imediatamente — não é erro fatal
    }

    // ── 7. Salvar dados no Supabase ──────────────────────────────────────────
    try {
      await supabase
        .from('orders')
        .update({
          status: 'enviado',
          melhor_envio_id: shipmentId,
          tracking_code: trackingCode,
          label_url: printUrl,
        })
        .eq('id', orderId)
    } catch (dbErr) {
      // Se a coluna não existir no banco, não é erro fatal — retornamos os dados mesmo assim
      console.warn('Aviso: não foi possível salvar dados ME no Supabase:', dbErr)
    }

    return NextResponse.json({
      success: true,
      shipmentId,
      trackingCode,
      printUrl,
    })
  } catch (err: unknown) {
    const e = err as { message?: string; status?: number; details?: unknown }
    console.error('Erro ao gerar etiqueta Melhor Envio:', e)
    return NextResponse.json(
      {
        error: e.message ?? 'Erro interno ao gerar etiqueta',
        details: e.details,
      },
      { status: e.status ?? 500 }
    )
  }
}
