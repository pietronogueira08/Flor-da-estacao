/**
 * Mercado Pago — Cliente centralizado (server-side only)
 * Todas as chamadas à API do MP passam por este módulo.
 */
import { MercadoPagoConfig, Payment, Customer } from 'mercadopago'

/** Inicializa o cliente MP com o access token de produção */
export function getMpClient(): MercadoPagoConfig {
  const token = process.env.MP_ACCESS_TOKEN
  if (!token) throw new Error('MP_ACCESS_TOKEN não configurado no .env.local')
  return new MercadoPagoConfig({
    accessToken: token,
    options: { timeout: 10000, idempotencyKey: undefined },
  })
}

export function getMpPayment() {
  return new Payment(getMpClient())
}

export function getMpCustomer() {
  return new Customer(getMpClient())
}

// ─── Mapeamento de erros do MP para português ──────────────────────────────

const MP_ERROR_MESSAGES: Record<string, string> = {
  cc_rejected_bad_filled_card_number: 'Número do cartão inválido. Verifique e tente novamente.',
  cc_rejected_bad_filled_date: 'Data de vencimento inválida. Verifique e tente novamente.',
  cc_rejected_bad_filled_other: 'Dados do cartão inválidos. Verifique e tente novamente.',
  cc_rejected_bad_filled_security_code: 'CVV inválido. Verifique o código de segurança.',
  cc_rejected_blacklist: 'Não foi possível processar o pagamento com este cartão.',
  cc_rejected_call_for_authorize: 'Ligue para o seu banco para autorizar o pagamento.',
  cc_rejected_card_disabled: 'Cartão inativo. Entre em contato com o seu banco.',
  cc_rejected_card_error: 'Erro ao processar o cartão. Tente novamente.',
  cc_rejected_duplicated_payment: 'Pagamento duplicado detectado. Aguarde antes de tentar novamente.',
  cc_rejected_high_risk: 'Pagamento recusado por segurança. Tente outro cartão ou pague no Pix.',
  cc_rejected_insufficient_amount: 'Limite insuficiente. Verifique o saldo ou tente outro cartão.',
  cc_rejected_invalid_installments: 'Parcelamento não permitido para este cartão.',
  cc_rejected_max_attempts: 'Número máximo de tentativas atingido. Aguarde e tente novamente.',
  cc_rejected_other_reason: 'Pagamento não aprovado. Tente outro cartão ou pague no Pix.',
  pending_contingency: 'Pagamento em análise. Você receberá uma confirmação em breve.',
  pending_review_manual: 'Pagamento em análise pelo banco. Aguarde a confirmação.',
  rejected_by_bank: 'Pagamento recusado pelo banco. Entre em contato com o seu banco.',
  rejected_insufficient_data: 'Dados insuficientes. Verifique as informações e tente novamente.',
}

export function getMpErrorMessage(statusDetail: string, fallback?: string): string {
  return (
    MP_ERROR_MESSAGES[statusDetail] ??
    fallback ??
    'Pagamento não aprovado. Tente outro método de pagamento.'
  )
}

// ─── Tipos de resultado ───────────────────────────────────────────────────

export type PaymentStatus = 'approved' | 'pending' | 'in_process' | 'rejected' | 'cancelled'

export interface PaymentResult {
  id: string
  status: PaymentStatus
  status_detail: string
  external_reference: string | null
  transaction_amount: number
  payment_method_id: string
  installments: number
}

export interface PixData {
  payment_id: string
  qr_code: string
  qr_code_base64: string
  ticket_url: string | null
  expiration_date: string | null
  amount: number
}
