'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { CreditCard, Lock, ChevronDown, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'

// Tipos do MP.js browser SDK
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    MercadoPago: any
    MP_DEVICE_SESSION_ID?: string
  }
}

interface Installment {
  installments: number
  recommended_message: string
  installment_amount: number
  total_amount: number
  installment_rate: number
}

interface CardFormProps {
  amount: number
  orderId: string
  email: string
  nome: string
  cpf: string
  publicKey: string
  onSuccess: (paymentId: string, status: 'approved' | 'pending') => void
  onError: (message: string) => void
  onPixFallback: () => void
}

// ─── Detecção de bandeira pelo BIN ────────────────────────────────────────

const BRAND_PATTERNS: Record<string, RegExp> = {
  visa: /^4/,
  master: /^5[1-5]|^2(2[2-9]|[3-6]\d|7[01])/,
  amex: /^3[47]/,
  elo: /^(4011|4312|4389|4514|4576|5041|5066|5067|509|6277|6362|6363|650[05]|6516|6550)/,
  hipercard: /^(6062|3841)/,
  diners: /^3(?:0[0-5]|[68])/,
}

function detectBrand(number: string): string {
  const clean = number.replace(/\s/g, '')
  for (const [brand, pattern] of Object.entries(BRAND_PATTERNS)) {
    if (pattern.test(clean)) return brand
  }
  return ''
}

const BRAND_ICONS: Record<string, string> = {
  visa: '💳',
  master: '💳',
  amex: '💳',
  elo: '💳',
  hipercard: '💳',
  diners: '💳',
}

const BRAND_COLORS: Record<string, string> = {
  visa: '#1A1F71',
  master: '#EB001B',
  elo: '#FFC72C',
  hipercard: '#B11C21',
  amex: '#007BC1',
}

// ─── Máscaras ──────────────────────────────────────────────────────────────

function maskCardNumber(value: string): string {
  return value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
}

function maskExpiry(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4)
  if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`
  return digits
}

function maskCvv(value: string): string {
  return value.replace(/\D/g, '').slice(0, 4)
}

// ─── Componente Principal ─────────────────────────────────────────────────

export function CardForm({
  amount,
  orderId,
  email,
  nome,
  cpf,
  publicKey,
  onSuccess,
  onError,
  onPixFallback,
}: CardFormProps) {
  const [cardNumber, setCardNumber] = useState('')
  const [cardName, setCardName] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [installments, setInstallments] = useState(1)
  const [installmentOptions, setInstallmentOptions] = useState<Installment[]>([])
  const [saveCard, setSaveCard] = useState(false)
  const [loading, setLoading] = useState(false)
  const [brand, setBrand] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [showInstallments, setShowInstallments] = useState(false)
  const mpRef = useRef<unknown>(null)
  const binTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Inicializa MP SDK
  useEffect(() => {
    if (window.MercadoPago && !mpRef.current) {
      mpRef.current = new window.MercadoPago(publicKey, { locale: 'pt-BR' })
    }
  }, [publicKey])

  // Detecta bandeira e busca parcelas ao digitar o cartão
  const handleCardNumberChange = useCallback(
    (value: string) => {
      const masked = maskCardNumber(value)
      setCardNumber(masked)
      const detected = detectBrand(masked)
      setBrand(detected)

      const bin = masked.replace(/\s/g, '').slice(0, 6)
      if (bin.length === 6 && mpRef.current) {
        if (binTimeoutRef.current) clearTimeout(binTimeoutRef.current)
        binTimeoutRef.current = setTimeout(async () => {
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const mp = mpRef.current as any
            const result = await mp.getInstallments({
              amount: String(amount),
              bin,
              paymentTypeId: 'credit_card',
            })
            if (result?.[0]?.payer_costs) {
              const opts: Installment[] = result[0].payer_costs
                .filter((p: Installment) => p.installments <= 6)
                .map((p: Installment) => ({
                  installments: p.installments,
                  recommended_message: p.recommended_message,
                  installment_amount: p.installment_amount,
                  total_amount: p.total_amount,
                  installment_rate: p.installment_rate ?? 0,
                }))
              setInstallmentOptions(opts)
            }
          } catch {
            // silencia erro de parcelas — não é crítico
          }
        }, 600)
      }
    },
    [amount]
  )

  // Validação de campos
  function validate() {
    const errors: Record<string, string> = {}
    if (cardNumber.replace(/\s/g, '').length < 13) errors.cardNumber = 'Número inválido'
    if (cardName.trim().length < 3) errors.cardName = 'Nome obrigatório'
    const [month, year] = expiry.split('/')
    if (!month || !year || Number(month) > 12 || Number(month) < 1)
      errors.expiry = 'Data inválida'
    if (cvv.length < 3) errors.cvv = 'CVV inválido'
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    if (!mpRef.current) {
      onError('SDK do Mercado Pago não carregado. Recarregue a página.')
      return
    }

    setLoading(true)

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mp = mpRef.current as any

      // Detecta payment_method_id e issuer real via API MP
      const [expiryMonth, expiryYear] = expiry.split('/')
      const bin = cardNumber.replace(/\s/g, '').slice(0, 6)

      let paymentMethodId = brand
      let issuerId: string | undefined

      try {
        const methods = await mp.getPaymentMethods({ bin })
        if (methods?.results?.[0]) {
          paymentMethodId = methods.results[0].id
          const issuers = await mp.getIssuers({
            paymentMethodId,
            bin,
          })
          issuerId = issuers?.[0]?.id ? String(issuers[0].id) : undefined
        }
      } catch {
        // usa brand detectado localmente como fallback
      }

      // Tokeniza o cartão no browser (dados nunca vão ao nosso servidor)
      const tokenData = await mp.createCardToken({
        cardNumber: cardNumber.replace(/\s/g, ''),
        cardholderName: cardName.trim().toUpperCase(),
        cardExpirationMonth: expiryMonth.padStart(2, '0'),
        cardExpirationYear: expiryYear.length === 2 ? `20${expiryYear}` : expiryYear,
        securityCode: cvv,
        identificationType: 'CPF',
        identificationNumber: cpf.replace(/\D/g, ''),
      })

      if (!tokenData?.id) throw new Error('Falha ao tokenizar o cartão')

      // Envia para o servidor (apenas o token, nunca os dados brutos)
      const res = await fetch('/api/pagamento/cartao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          token: tokenData.id,
          payment_method_id: paymentMethodId,
          issuer_id: issuerId,
          installments,
          device_id: window.MP_DEVICE_SESSION_ID,
          salvar_cartao: saveCard,
          email,
          nome,
          cpf,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        if (data.status === 'rejected') {
          // Oferece fallback para Pix em casos de alto risco
          if (
            data.status_detail === 'cc_rejected_high_risk' ||
            data.status_detail === 'cc_rejected_blacklist'
          ) {
            onPixFallback()
            return
          }
        }
        onError(data.error ?? 'Pagamento não aprovado. Verifique os dados e tente novamente.')
        return
      }

      onSuccess(data.paymentId, data.status === 'pending' ? 'pending' : 'approved')
    } catch (err: unknown) {
      const e = err as { message?: string }
      onError(e.message ?? 'Erro inesperado. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const selectedInstallment = installmentOptions.find((o) => o.installments === installments)

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {/* Número do Cartão */}
      <div>
        <label className="block text-sm font-medium text-[#241B1E] mb-1.5 font-jost">
          Número do Cartão
        </label>
        <div className="relative">
          <input
            type="text"
            inputMode="numeric"
            value={cardNumber}
            onChange={(e) => handleCardNumberChange(e.target.value)}
            placeholder="0000 0000 0000 0000"
            maxLength={19}
            autoComplete="cc-number"
            className={`w-full border rounded-lg px-4 py-3 pr-14 font-jost text-sm tracking-wider focus:outline-none transition-colors ${
              fieldErrors.cardNumber
                ? 'border-red-400 bg-red-50 focus:border-red-400'
                : cardNumber && !fieldErrors.cardNumber
                ? 'border-[#7D4F5A] bg-[#FFF5F7]'
                : 'border-gray-300 focus:border-[#7D4F5A]'
            }`}
          />
          {/* Ícone de bandeira */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {brand ? (
              <span
                className="text-xs font-bold uppercase tracking-widest px-1.5 py-0.5 rounded text-white"
                style={{ background: BRAND_COLORS[brand] ?? '#241B1E' }}
              >
                {brand.slice(0, 4)}
              </span>
            ) : (
              <CreditCard size={20} className="text-gray-300" />
            )}
          </div>
        </div>
        {fieldErrors.cardNumber && (
          <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
            <AlertCircle size={11} /> {fieldErrors.cardNumber}
          </p>
        )}
      </div>

      {/* Nome no Cartão */}
      <div>
        <label className="block text-sm font-medium text-[#241B1E] mb-1.5 font-jost">
          Nome no Cartão
        </label>
        <input
          type="text"
          value={cardName}
          onChange={(e) => setCardName(e.target.value.toUpperCase())}
          placeholder="NOME COMO NO CARTÃO"
          autoComplete="cc-name"
          className={`w-full border rounded-lg px-4 py-3 font-jost text-sm uppercase tracking-wide focus:outline-none transition-colors ${
            fieldErrors.cardName
              ? 'border-red-400 bg-red-50'
              : 'border-gray-300 focus:border-[#7D4F5A]'
          }`}
        />
        {fieldErrors.cardName && (
          <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
            <AlertCircle size={11} /> {fieldErrors.cardName}
          </p>
        )}
      </div>

      {/* Validade + CVV */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#241B1E] mb-1.5 font-jost">
            Validade
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={expiry}
            onChange={(e) => setExpiry(maskExpiry(e.target.value))}
            placeholder="MM/AA"
            maxLength={5}
            autoComplete="cc-exp"
            className={`w-full border rounded-lg px-4 py-3 font-jost text-sm focus:outline-none transition-colors text-center tracking-widest ${
              fieldErrors.expiry
                ? 'border-red-400 bg-red-50'
                : 'border-gray-300 focus:border-[#7D4F5A]'
            }`}
          />
          {fieldErrors.expiry && (
            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
              <AlertCircle size={11} /> {fieldErrors.expiry}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-[#241B1E] mb-1.5 font-jost">
            CVV
          </label>
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              value={cvv}
              onChange={(e) => setCvv(maskCvv(e.target.value))}
              placeholder="123"
              maxLength={4}
              autoComplete="cc-csc"
              className={`w-full border rounded-lg px-4 py-3 font-jost text-sm focus:outline-none transition-colors text-center tracking-widest ${
                fieldErrors.cvv
                  ? 'border-red-400 bg-red-50'
                  : 'border-gray-300 focus:border-[#7D4F5A]'
              }`}
            />
          </div>
          {fieldErrors.cvv && (
            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
              <AlertCircle size={11} /> {fieldErrors.cvv}
            </p>
          )}
        </div>
      </div>

      {/* Parcelamento */}
      {installmentOptions.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-[#241B1E] mb-1.5 font-jost">
            Parcelamento
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowInstallments(!showInstallments)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-left font-jost text-sm focus:outline-none focus:border-[#7D4F5A] flex items-center justify-between hover:border-[#7D4F5A] transition-colors"
            >
              <span className="text-[#241B1E]">
                {selectedInstallment
                  ? selectedInstallment.recommended_message
                  : `${installments}x de R$ ${(amount / installments).toFixed(2).replace('.', ',')}`}
              </span>
              <ChevronDown
                size={16}
                className={`text-gray-400 transition-transform ${showInstallments ? 'rotate-180' : ''}`}
              />
            </button>

            {showInstallments && (
              <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                {installmentOptions.map((opt) => (
                  <button
                    key={opt.installments}
                    type="button"
                    onClick={() => {
                      setInstallments(opt.installments)
                      setShowInstallments(false)
                    }}
                    className={`w-full px-4 py-3 text-left font-jost text-sm hover:bg-[#FFF5F7] transition-colors flex items-center justify-between ${
                      installments === opt.installments ? 'bg-[#FFF5F7] text-[#7D4F5A] font-medium' : 'text-[#241B1E]'
                    }`}
                  >
                    <span>{opt.recommended_message}</span>
                    {opt.installment_rate === 0 && (
                      <span className="text-xs text-green-600 font-medium ml-2 shrink-0">sem juros</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sem parcelas ainda (fallback simples) */}
      {installmentOptions.length === 0 && (
        <div>
          <label className="block text-sm font-medium text-[#241B1E] mb-1.5 font-jost">
            Parcelamento
          </label>
          <select
            value={installments}
            onChange={(e) => setInstallments(Number(e.target.value))}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 font-jost text-sm focus:outline-none focus:border-[#7D4F5A] bg-white"
          >
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>
                {n}x de R$ {(amount / n).toFixed(2).replace('.', ',')} — sem juros
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Salvar cartão */}
      <label className="flex items-center gap-3 cursor-pointer group">
        <div
          onClick={() => setSaveCard(!saveCard)}
          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors shrink-0 ${
            saveCard ? 'bg-[#7D4F5A] border-[#7D4F5A]' : 'border-gray-300 group-hover:border-[#7D4F5A]'
          }`}
        >
          {saveCard && <CheckCircle2 size={12} className="text-white" />}
        </div>
        <span className="font-jost text-sm text-gray-600">
          Salvar cartão para próximas compras (1-clique)
        </span>
      </label>

      {/* Segurança */}
      <div className="flex items-center gap-2 py-2">
        <Lock size={13} className="text-gray-400 shrink-0" />
        <p className="text-xs text-gray-400 font-jost">
          Seus dados são protegidos por criptografia SSL. O número do cartão é processado
          diretamente pelo Mercado Pago e nunca passa pelos nossos servidores.
        </p>
      </div>

      {/* Botão de pagamento */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#7D4F5A] text-white py-4 rounded-lg font-jost font-semibold text-base hover:bg-[#6B3F49] active:scale-[0.99] transition-all disabled:opacity-60 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" /> Processando pagamento...
          </>
        ) : (
          <>
            <Lock size={16} />
            Pagar R$ {amount.toFixed(2).replace('.', ',')}
            {installments > 1 && ` em ${installments}x`}
          </>
        )}
      </button>

      {/* Fallback para Pix */}
      <button
        type="button"
        onClick={onPixFallback}
        className="w-full text-center text-sm text-[#7D4F5A] font-jost hover:underline py-1"
      >
        Prefere pagar no Pix? →
      </button>
    </form>
  )
}
