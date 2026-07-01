import { MercadoPagoConfig } from 'mercadopago';

let client: MercadoPagoConfig | null = null;

export function initMercadoPagoClient(accessToken: string) {
  if (!client) {
    client = new MercadoPagoConfig({ accessToken, options: { timeout: 5000 } });
  }
  return client;
}
