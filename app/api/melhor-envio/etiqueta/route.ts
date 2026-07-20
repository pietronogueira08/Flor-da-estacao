import { NextRequest, NextResponse } from 'next/server'

const MELHOR_ENVIO_BASE = process.env.MELHOR_ENVIO_SANDBOX === 'true'
  ? 'https://sandbox.melhorenvio.com.br/api/v2'
  : 'https://melhorenvio.com.br/api/v2'

const MELHOR_ENVIO_TOKEN = process.env.MELHOR_ENVIO_TOKEN

export async function POST(request: NextRequest) {
  if (!MELHOR_ENVIO_TOKEN) {
    return NextResponse.json(
      { error: 'MELHOR_ENVIO_TOKEN não configurado. Adicione ao .env.local.' },
      { status: 503 }
    )
  }

  const body = await request.json()
  const { orderId, order } = body

  if (!orderId || !order) {
    return NextResponse.json({ error: 'orderId e order são obrigatórios' }, { status: 400 })
  }

  try {
    // Step 1: Add order to Melhor Envio cart
    const cartPayload = {
      service: body.serviceId ?? 1, // 1 = PAC Correios por padrão
      from: {
        name: 'Atelier Zaya',
        phone: '22999163206',
        email: 'Zayalojadmin@zaya.com.br',
        company_document: '', // CNPJ/CPF da loja (adicionar quando disponível)
        address: 'Av. Liberdade',
        complement: '',
        number: '306',
        district: 'Grussaí',
        city: 'São João da Barra',
        country_id: 'BR',
        postal_code: '28200-000',
        state_abbr: 'RJ',
      },
      to: {
        name: order.endereco?.nome ?? order.cliente_nome,
        phone: order.cliente_telefone?.replace(/\D/g, '') ?? '',
        email: order.cliente_email ?? '',
        address: order.endereco?.rua ?? '',
        complement: order.endereco?.complemento ?? '',
        number: order.endereco?.numero ?? '',
        district: order.endereco?.bairro ?? '',
        city: order.endereco?.cidade ?? '',
        country_id: 'BR',
        postal_code: (order.endereco?.cep ?? '').replace(/\D/g, ''),
        state_abbr: order.endereco?.estado ?? '',
      },
      products: (order.order_items ?? []).map((item: any) => ({
        name: item.product_variants?.products?.nome ?? 'Produto Zaya',
        quantity: item.quantidade ?? 1,
        unitary_value: item.preco_unitario ?? 0,
        weight: 0.3,
        width: 15,
        height: 10,
        length: 20,
      })),
      volumes: [{ weight: 0.5, width: 25, height: 15, length: 30 }],
      options: {
        insurance_value: order.total ?? 0,
        receipt: false,
        own_hand: false,
        reverse: false,
        non_commercial: false,
        invoice: { key: '' },
        platform: 'Zaya Atelier',
        tags: [{ tag: `Pedido #${orderId.slice(0, 8).toUpperCase()}`, url: null }],
      },
    }

    const cartRes = await fetch(`${MELHOR_ENVIO_BASE}/me/cart`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${MELHOR_ENVIO_TOKEN}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'User-Agent': 'Atelier Zaya (Zayalojadmin@zaya.com.br)',
      },
      body: JSON.stringify(cartPayload),
    })

    if (!cartRes.ok) {
      const err = await cartRes.json()
      return NextResponse.json({ error: 'Erro ao adicionar ao carrinho Melhor Envio', details: err }, { status: 500 })
    }

    const cartData = await cartRes.json()
    const shipmentId = cartData.id

    // Step 2: Checkout (purchase label)
    const checkoutRes = await fetch(`${MELHOR_ENVIO_BASE}/me/shipment/checkout`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${MELHOR_ENVIO_TOKEN}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'User-Agent': 'Atelier Zaya (Zayalojadmin@zaya.com.br)',
      },
      body: JSON.stringify({ orders: [shipmentId] }),
    })

    if (!checkoutRes.ok) {
      const err = await checkoutRes.json()
      return NextResponse.json({ error: 'Erro ao comprar etiqueta no Melhor Envio', details: err }, { status: 500 })
    }

    // Step 3: Generate label
    const labelRes = await fetch(`${MELHOR_ENVIO_BASE}/me/shipment/generate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${MELHOR_ENVIO_TOKEN}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'User-Agent': 'Atelier Zaya (Zayalojadmin@zaya.com.br)',
      },
      body: JSON.stringify({ orders: [shipmentId] }),
    })

    if (!labelRes.ok) {
      const err = await labelRes.json()
      return NextResponse.json({ error: 'Erro ao gerar etiqueta', details: err }, { status: 500 })
    }

    // Step 4: Print URL
    const printRes = await fetch(`${MELHOR_ENVIO_BASE}/me/shipment/print`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${MELHOR_ENVIO_TOKEN}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'User-Agent': 'Atelier Zaya (Zayalojadmin@zaya.com.br)',
      },
      body: JSON.stringify({ mode: 'public', orders: [shipmentId] }),
    })

    const printData = await printRes.json()

    return NextResponse.json({
      success: true,
      shipmentId,
      printUrl: printData.url ?? null,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Erro interno' }, { status: 500 })
  }
}
