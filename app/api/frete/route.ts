import { NextResponse } from 'next/server'
import {
  ME_FROM,
  ME_SERVICES,
  meFetch,
  cleanCep,
  formatPrazo,
  type MeShippingOption,
} from '@/lib/melhorenvio'

interface FreteRequestBody {
  cep_destino: string
  itens?: Array<{
    quantidade?: number
    nome?: string
  }>
}

export async function POST(request: Request) {
  try {
    const { cep_destino, itens }: FreteRequestBody = await request.json()

    if (!cep_destino) {
      return NextResponse.json({ error: 'CEP de destino obrigatório' }, { status: 400 })
    }

    const cepLimpo = cleanCep(cep_destino)
    if (cepLimpo.length !== 8) {
      return NextResponse.json({ error: 'CEP inválido' }, { status: 400 })
    }

    const qtdTotal = (itens ?? []).reduce((acc, i) => acc + (i.quantidade ?? 1), 0) || 1

    // Payload para a API de cotação do Melhor Envio
    const payload = {
      from: { postal_code: ME_FROM.postal_code },
      to: { postal_code: cepLimpo },
      // Dimensões padrão para roupas (caixa de envio)
      package: {
        height: 10,
        width: 25,
        length: 30,
        weight: Math.max(0.3, qtdTotal * 0.3), // 300g por peça, mínimo 300g
      },
      options: {
        receipt: false,
        own_hand: false,
        collect: false,
      },
      services: [
        ME_SERVICES.PAC,
        ME_SERVICES.SEDEX,
        ME_SERVICES.JADLOG_PACKAGE,
        ME_SERVICES.JADLOG_COM,
        ME_SERVICES.AZUL_ECOMMERCE,
      ].join(','),
    }

    const resultados = await meFetch<MeShippingOption[]>('/me/shipment/calculate', {
      method: 'POST',
      body: JSON.stringify(payload),
    })

    // Filtra apenas os serviços com preço e sem erro, e transforma no formato do frontend
    const opcoes = resultados
      .filter((s) => !s.error && s.price !== null && Number(s.price) > 0)
      .map((s) => ({
        id: s.id,
        nome: `${s.company.name} — ${s.name}`,
        preco: Number(s.custom_price ?? s.price),
        prazo: formatPrazo(
          s.custom_delivery_range?.min ?? s.delivery_range?.min ?? s.delivery_time,
          s.custom_delivery_range?.max ?? s.delivery_range?.max ?? s.delivery_time,
        ),
        empresa: s.company.name,
        empresa_logo: s.company.picture,
        service_id: s.id,
      }))
      // Ordena do mais barato para o mais caro
      .sort((a, b) => a.preco - b.preco)

    if (opcoes.length === 0) {
      // Fallback caso a API não retorne nada válido (sandbox às vezes é imprevisível)
      return NextResponse.json({
        opcoes: [
          { id: 1, nome: 'Correios — PAC', preco: 18.9, prazo: '7–12 dias úteis', service_id: 1 },
          { id: 2, nome: 'Correios — SEDEX', preco: 34.5, prazo: '2–4 dias úteis', service_id: 2 },
        ],
        fallback: true,
      })
    }

    return NextResponse.json({ opcoes })
  } catch (error: unknown) {
    console.error('Erro ao calcular frete (Melhor Envio):', error)

    // Se o token não está configurado ou a API falhou, usa fallback mock
    return NextResponse.json({
      opcoes: [
        { id: 1, nome: 'Correios — PAC', preco: 18.9, prazo: '7–12 dias úteis', service_id: 1 },
        { id: 2, nome: 'Correios — SEDEX', preco: 34.5, prazo: '2–4 dias úteis', service_id: 2 },
      ],
      fallback: true,
    })
  }
}
