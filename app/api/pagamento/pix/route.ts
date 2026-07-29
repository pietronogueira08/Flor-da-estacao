import { NextResponse } from 'next/server'
import { createClient } from '../../../../lib/supabase/server'
import { getMpPayment, type PixData } from '@/lib/mercadopago'

interface PixPaymentBody {
  orderId: string
  email: string
  nome: string
  cpf: string
}

export async function POST(request: Request) {
  try {
    const body: PixPaymentBody = await request.json()
    const { orderId, email, nome, cpf } = body

    if (!orderId || !email || !cpf) {
      return NextResponse.json({ error: 'Dados obrigatórios ausentes' }, { status: 400 })
    }

    const supabase = await createClient()

    // Busca dados do pedido
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('total, status, order_items(*, product_variants(products(nome)))')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 })
    }

    if (order.status !== 'pendente') {
      return NextResponse.json({ error: 'Pedido já foi processado' }, { status: 400 })
    }

    const paymentClient = getMpPayment()

    const payment = await paymentClient.create({
      body: {
        transaction_amount: Number(order.total),
        payment_method_id: 'pix',
        description: `Pedido Flor da Estação #${String(orderId).slice(0, 8).toUpperCase()}`,
        payer: {
          email,
          first_name: nome.split(' ')[0],
          last_name: nome.split(' ').slice(1).join(' ') || nome,
          identification: {
            type: 'CPF',
            number: cpf.replace(/\D/g, ''),
          },
        },
        external_reference: orderId,
        ...(process.env.NEXT_PUBLIC_APP_URL?.startsWith('http://localhost')
          ? {}
          : { notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhook/mercadopago` }),
        date_of_expiration: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutos
        metadata: { orderId },
      },
    })

    // Salva o payment_id no pedido para polling posterior
    await supabase
      .from('orders')
      .update({ payment_id: String(payment.id) })
      .eq('id', orderId)

    const pixInfo = payment.point_of_interaction?.transaction_data

    const pixData: PixData = {
      payment_id: String(payment.id),
      qr_code: pixInfo?.qr_code ?? '',
      qr_code_base64: pixInfo?.qr_code_base64 ?? '',
      ticket_url: pixInfo?.ticket_url ?? null,
      expiration_date: payment.date_of_expiration ?? null,
      amount: Number(order.total),
    }

    return NextResponse.json({ success: true, pix: pixData })
  } catch (err: unknown) {
    const e = err as { message?: string }
    console.error('Erro ao criar pagamento Pix:', e)
    return NextResponse.json({ error: e.message ?? 'Erro interno' }, { status: 500 })
  }
}
