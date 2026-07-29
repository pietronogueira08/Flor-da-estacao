import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '../../../../lib/supabase/server'
import { getMpPayment } from '@/lib/mercadopago'

/**
 * GET /api/pagamento/status?paymentId=xxx&orderId=yyy
 * Verifica o status atual de um pagamento (usado para polling do Pix)
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const paymentId = searchParams.get('paymentId')
  const orderId = searchParams.get('orderId')

  if (!paymentId && !orderId) {
    return NextResponse.json({ error: 'paymentId ou orderId obrigatório' }, { status: 400 })
  }

  try {
    const supabase = await createClient()

    // Primeiro consulta o banco local (mais rápido)
    if (orderId) {
      const { data: order } = await supabase
        .from('orders')
        .select('status, payment_id')
        .eq('id', orderId)
        .single()

      if (order) {
        // Se já está pago no banco, retorna imediatamente
        if (order.status === 'pago') {
          return NextResponse.json({ status: 'approved', dbStatus: 'pago', orderId })
        }

        // Se tem payment_id, consulta o MP para estado mais atualizado
        if (order.payment_id && order.status === 'pendente') {
          const paymentClient = getMpPayment()
          const payment = await paymentClient.get({ id: order.payment_id })

          return NextResponse.json({
            status: payment.status,
            status_detail: payment.status_detail,
            dbStatus: order.status,
            orderId,
          })
        }

        return NextResponse.json({ status: order.status, dbStatus: order.status, orderId })
      }
    }

    // Consulta direto no MP pelo paymentId
    if (paymentId) {
      const paymentClient = getMpPayment()
      const payment = await paymentClient.get({ id: paymentId })
      return NextResponse.json({
        status: payment.status,
        status_detail: payment.status_detail,
        external_reference: payment.external_reference,
      })
    }

    return NextResponse.json({ error: 'Pagamento não encontrado' }, { status: 404 })
  } catch (err: unknown) {
    const e = err as { message?: string }
    console.error('Erro ao verificar status:', e)
    return NextResponse.json({ error: e.message ?? 'Erro ao verificar' }, { status: 500 })
  }
}
