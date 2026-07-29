import { NextRequest, NextResponse } from 'next/server'
import { meFetch } from '@/lib/melhorenvio'

interface TrackingEvent {
  status: string
  message: string
  location?: string
  created_at: string
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const shipmentId = searchParams.get('id')

  if (!shipmentId) {
    return NextResponse.json({ error: 'Parâmetro ?id= obrigatório' }, { status: 400 })
  }

  try {
    const data = await meFetch<Record<string, {
      id: string
      protocol: string
      tracking: string | null
      status: string
      tracking_url: string | null
      tracking_events?: TrackingEvent[]
    }>>(`/me/orders/${shipmentId}`)

    const order = data?.[shipmentId]

    if (!order) {
      return NextResponse.json({ error: 'Envio não encontrado no Melhor Envio' }, { status: 404 })
    }

    return NextResponse.json({
      shipmentId: order.id,
      protocol: order.protocol,
      tracking: order.tracking,
      status: order.status,
      tracking_url: order.tracking_url,
      events: order.tracking_events ?? [],
    })
  } catch (err: unknown) {
    const e = err as { message?: string; status?: number; details?: unknown }
    console.error('Erro ao rastrear envio:', e)
    return NextResponse.json(
      { error: e.message ?? 'Erro ao consultar rastreamento', details: e.details },
      { status: e.status ?? 500 }
    )
  }
}
