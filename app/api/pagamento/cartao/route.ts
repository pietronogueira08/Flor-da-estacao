import { NextResponse } from 'next/server'
import { createClient } from '../../../../lib/supabase/server'
import { getMpPayment, getMpErrorMessage, getMpCustomer, type PaymentResult } from '@/lib/mercadopago'

interface CardPaymentBody {
  orderId: string
  token: string                // Card token gerado pelo MP.js no browser
  payment_method_id: string   // 'visa', 'master', 'elo', etc.
  issuer_id?: string
  installments: number
  device_id?: string          // Fingerprint antifraude
  salvar_cartao?: boolean
  // Dados do pagador
  email: string
  nome: string
  cpf: string
}

export async function POST(request: Request) {
  try {
    const body: CardPaymentBody = await request.json()
    const {
      orderId,
      token,
      payment_method_id,
      issuer_id,
      installments,
      device_id,
      salvar_cartao,
      email,
      nome,
      cpf,
    } = body

    if (!orderId || !token || !payment_method_id || !email || !cpf) {
      return NextResponse.json({ error: 'Dados obrigatórios ausentes' }, { status: 400 })
    }

    const supabase = await createClient()

    // 1. Busca dados do pedido
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*, order_items(*, product_variants(tamanho, cor, products(nome)))')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 })
    }

    if (order.status !== 'pendente') {
      return NextResponse.json({ error: 'Pedido já foi processado' }, { status: 400 })
    }

    // 2. Monta payload de pagamento com antifraude completo
    const paymentClient = getMpPayment()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const paymentPayload: any = {
      transaction_amount: Number(order.total),
      token,
      description: `Pedido Flor da Estação #${String(orderId).slice(0, 8).toUpperCase()}`,
      installments: Number(installments),
      payment_method_id,
      payer: {
        email,
        first_name: nome.split(' ')[0],
        last_name: nome.split(' ').slice(1).join(' ') || nome.split(' ')[0],
        identification: {
          type: 'CPF',
          number: cpf.replace(/\D/g, ''),
        },
        address: {
          zip_code: String(order.endereco?.cep ?? '').replace(/\D/g, ''),
          street_name: order.endereco?.rua ?? '',
          street_number: order.endereco?.numero ?? '',
        },
      },
      external_reference: orderId,
      ...(process.env.NEXT_PUBLIC_APP_URL?.startsWith('http://localhost')
        ? {}
        : { notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhook/mercadopago` }),
      statement_descriptor: 'FLOR DA ESTACAO',
      // Dados adicionais para antifraude
      additional_info: {
        ip_address: request.headers.get('x-forwarded-for') ?? '127.0.0.1',
        items: (order.order_items ?? []).map((item: {
          quantidade: number;
          preco_unitario: number;
          product_variants?: { products?: { nome?: string }; tamanho?: string; cor?: string };
        }) => ({
          id: item.product_variants?.products?.nome ?? 'produto',
          title: item.product_variants?.products?.nome ?? 'Produto Flor da Estação',
          description: [item.product_variants?.tamanho, item.product_variants?.cor]
            .filter(Boolean)
            .join(' / '),
          category_id: 'fashion',
          quantity: item.quantidade,
          unit_price: Number(item.preco_unitario),
        })),
        payer: {
          first_name: nome.split(' ')[0],
          last_name: nome.split(' ').slice(1).join(' ') || '',
          phone: {
            area_code: String(order.cliente_telefone ?? '').replace(/\D/g, '').slice(0, 2),
            number: String(order.cliente_telefone ?? '').replace(/\D/g, '').slice(2),
          },
          registration_date: new Date().toISOString(),
        },
        shipments: {
          receiver_address: {
            zip_code: String(order.endereco?.cep ?? '').replace(/\D/g, ''),
            street_name: order.endereco?.rua ?? '',
            street_number: order.endereco?.numero ?? '',
            floor: order.endereco?.complemento ?? '',
            apartment: '',
            city_name: order.endereco?.cidade ?? '',
            state_name: order.endereco?.estado ?? '',
          },
        },
      },
    }

    // Adiciona issuer_id se disponível (melhora aprovação)
    if (issuer_id) paymentPayload.issuer_id = String(issuer_id)

    // Device ID do fingerprint antifraude
    if (device_id) paymentPayload.metadata = { device_session_id: device_id }

    // 3. Processa o pagamento
    const payment = await paymentClient.create({ body: paymentPayload })

    const result: PaymentResult = {
      id: String(payment.id),
      status: payment.status as PaymentResult['status'],
      status_detail: payment.status_detail ?? '',
      external_reference: payment.external_reference ?? null,
      transaction_amount: payment.transaction_amount ?? 0,
      payment_method_id: payment.payment_method_id ?? '',
      installments: payment.installments ?? 1,
    }

    // 4. Atualiza o pedido conforme o status
    if (result.status === 'approved') {
      // Aprovado — atualiza status e decrementa estoque
      await supabase
        .from('orders')
        .update({ status: 'pago', payment_id: result.id })
        .eq('id', orderId)

      await decrementarEstoque(supabase, orderId)

      // Salvar cartão (1-clique) se solicitado
      if (salvar_cartao) {
        await salvarCartao({ email, nome, cpf, payment_method_id, payment, supabase })
      }

      return NextResponse.json({ success: true, status: 'approved', paymentId: result.id })
    }

    if (result.status === 'in_process' || result.status === 'pending') {
      await supabase
        .from('orders')
        .update({ payment_id: result.id })
        .eq('id', orderId)

      return NextResponse.json({
        success: true,
        status: 'pending',
        paymentId: result.id,
        message: 'Pagamento em análise. Você receberá uma confirmação por e-mail.',
      })
    }

    // Rejeitado
    return NextResponse.json(
      {
        success: false,
        status: 'rejected',
        error: getMpErrorMessage(result.status_detail),
        status_detail: result.status_detail,
      },
      { status: 422 }
    )
  } catch (err: unknown) {
    const e = err as { message?: string; cause?: { description?: string } }
    console.error('Erro ao processar pagamento com cartão:', e)

    const detail = e?.cause?.description ?? e?.message ?? 'Erro interno'
    return NextResponse.json({ error: detail }, { status: 500 })
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function decrementarEstoque(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  orderId: string
) {
  const { data: items } = await supabase
    .from('order_items')
    .select('variant_id, quantidade')
    .eq('order_id', orderId)

  if (!items?.length) return

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
        motivo: `Venda pedido ${orderId}`,
      })
    }
  }
}

async function salvarCartao({
  email,
  nome,
  cpf,
  payment_method_id,
  payment,
  supabase,
}: {
  email: string
  nome: string
  cpf: string
  payment_method_id: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payment: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any
}) {
  try {
    const customerClient = getMpCustomer()

    // Busca ou cria customer no MP
    const existing = await customerClient.search({ options: { email } })
    let customerId: string

    if (existing.results && existing.results.length > 0) {
      customerId = String(existing.results[0].id)
    } else {
      const newCustomer = await customerClient.create({
        body: {
          email,
          first_name: nome.split(' ')[0],
          last_name: nome.split(' ').slice(1).join(' ') || '',
          identification: { type: 'CPF', number: cpf.replace(/\D/g, '') },
        },
      })
      customerId = String(newCustomer.id)
    }

    // Salva no banco local para exibição na próxima compra
    const cardData = payment.card ?? {}
    await supabase.from('saved_cards').insert({
      email,
      mp_customer_id: customerId,
      last_four: cardData.last_four_digits ?? '',
      brand: payment_method_id,
      holder_name: cardData.cardholder?.name ?? nome,
      expiry_month: cardData.expiration_month ?? null,
      expiry_year: cardData.expiration_year ?? null,
      payment_method_id,
    })
  } catch (e) {
    console.warn('Aviso: não foi possível salvar o cartão:', e)
    // Não é erro fatal — o pagamento já foi aprovado
  }
}
