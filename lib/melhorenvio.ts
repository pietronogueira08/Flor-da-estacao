/**
 * Melhor Envio — Cliente e utilitários compartilhados
 * Todas as chamadas à API passam por este módulo.
 */

export const ME_BASE_URL =
  process.env.MELHOR_ENVIO_SANDBOX === 'true'
    ? 'https://sandbox.melhorenvio.com.br/api/v2'
    : 'https://melhorenvio.com.br/api/v2'

export const ME_TOKEN = process.env.MELHOR_ENVIO_TOKEN

/** Cabeçalhos padrão exigidos pela API do Melhor Envio */
export function meHeaders(): HeadersInit {
  if (!ME_TOKEN) throw new Error('MELHOR_ENVIO_TOKEN não configurado no .env.local')
  return {
    Authorization: `Bearer ${ME_TOKEN}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'User-Agent': 'Flor da Estacao (zayalojadmin@zaya.com.br)',
  }
}

/** IDs dos serviços do Melhor Envio */
export const ME_SERVICES = {
  // Correios
  PAC: 1,
  SEDEX: 2,
  // Jadlog
  JADLOG_PACKAGE: 3,
  JADLOG_COM: 4,
  // Azul Cargo
  AZUL_AMANHA: 9,
  AZUL_ECOMMERCE: 10,
} as const

export type MeServiceId = (typeof ME_SERVICES)[keyof typeof ME_SERVICES]

/** Dados do remetente (loja) */
export const ME_FROM = {
  name: 'Flor da Estação',
  phone: '22999163206',
  email: 'zayalojadmin@zaya.com.br',
  company_document: '',
  address: 'Av. Liberdade',
  complement: '',
  number: '306',
  district: 'Grussaí',
  city: 'São João da Barra',
  country_id: 'BR',
  postal_code: '28200000',
  state_abbr: 'RJ',
} as const

// ─── Tipos de resposta da API ────────────────────────────────────────────────

export interface MeShippingOption {
  id: number
  name: string
  price: string | null       // null quando não disponível
  custom_price: string | null
  discount: string
  currency: string
  delivery_time: number
  delivery_range: { min: number; max: number }
  custom_delivery_time: number
  custom_delivery_range: { min: number; max: number }
  packages: unknown[]
  additional_services: {
    receipt: boolean
    own_hand: boolean
    collect: boolean
  }
  company: {
    id: number
    name: string
    picture: string
  }
  error?: string
}

export interface MeCartResponse {
  id: string
  protocol: string
  service_id: number
  tracking: string | null
  status: string
  price: string
  from: Record<string, string>
  to: Record<string, string>
  products: unknown[]
  volumes: unknown[]
  options: Record<string, unknown>
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Converte prazo em texto amigável */
export function formatPrazo(min: number, max: number): string {
  if (min === max) return `${max} dia${max !== 1 ? 's' : ''} útil${max !== 1 ? 'is' : ''}`
  return `${min}–${max} dias úteis`
}

/** Remove não-dígitos de um CEP */
export function cleanCep(cep: string): string {
  return cep.replace(/\D/g, '')
}

/** Chama a API do Melhor Envio com tratamento de erro padrão */
export async function meFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${ME_BASE_URL}${path}`
  const res = await fetch(url, {
    ...options,
    headers: {
      ...meHeaders(),
      ...(options.headers ?? {}),
    },
  })

  if (!res.ok) {
    let details: unknown
    try { details = await res.json() } catch { details = await res.text() }
    throw Object.assign(new Error(`Melhor Envio API error ${res.status}`), {
      status: res.status,
      details,
    })
  }

  return res.json() as Promise<T>
}
