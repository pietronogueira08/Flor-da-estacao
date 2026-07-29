/**
 * @deprecated Use `lib/mercadopago.ts` em vez deste arquivo.
 * Mantido apenas para compatibilidade com importações legadas (webhook).
 */
import { MercadoPagoConfig } from 'mercadopago'

export function initMercadoPagoClient(accessToken: string): MercadoPagoConfig {
  return new MercadoPagoConfig({ accessToken, options: { timeout: 10000 } })
}
