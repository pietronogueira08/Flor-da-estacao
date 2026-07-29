'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useCart } from '@/lib/hooks/useCart'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Script from 'next/script'
import {
  MapPin, Truck, CreditCard, ChevronRight, Loader2,
  CheckCircle2, QrCode, ShieldCheck, AlertTriangle,
  ChevronLeft,
} from 'lucide-react'
import { CardForm } from '@/components/store/checkout/CardForm'
import { PixPanel } from '@/components/store/checkout/PixPanel'

// ─── Schema de validação ──────────────────────────────────────────────────

function formatCpf(v: string) { return v.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') }
function cleanCpf(v: string) { return v.replace(/\D/g, '') }
function validateCpf(cpf: string): boolean {
  const c = cleanCpf(cpf)
  if (c.length !== 11 || /^(\d)\1+$/.test(c)) return false
  let s = 0; for (let i = 0; i < 9; i++) s += parseInt(c[i]) * (10 - i)
  let r = (s * 10) % 11; if (r === 10 || r === 11) r = 0
  if (r !== parseInt(c[9])) return false
  s = 0; for (let i = 0; i < 10; i++) s += parseInt(c[i]) * (11 - i)
  r = (s * 10) % 11; if (r === 10 || r === 11) r = 0
  return r === parseInt(c[10])
}

const enderecoSchema = z.object({
  nome: z.string().min(3, 'Nome completo obrigatório'),
  email: z.string().email('E-mail inválido'),
  telefone: z.string().min(10, 'Telefone inválido'),
  cpf: z.string().refine((v) => validateCpf(v), 'CPF inválido'),
  cep: z.string().min(8, 'CEP deve ter 8 dígitos').max(9),
  rua: z.string().min(2, 'Rua obrigatória'),
  numero: z.string().min(1, 'Número obrigatório'),
  complemento: z.string().optional(),
  bairro: z.string().min(2, 'Bairro obrigatório'),
  cidade: z.string().min(2, 'Cidade obrigatória'),
  estado: z.string().length(2, 'UF inválida'),
})

type EnderecoData = z.infer<typeof enderecoSchema>

// ─── Tipos ────────────────────────────────────────────────────────────────

type Step = 1 | 2 | 3
type PaymentTab = 'cartao' | 'pix'

interface FreteOpcao {
  id: number
  nome: string
  preco: number
  prazo: string
  empresa?: string
  empresa_logo?: string
  service_id: number
}

interface PixData {
  payment_id: string
  qr_code: string
  qr_code_base64: string
  ticket_url: string | null
  expiration_date: string | null
  amount: number
}

const PUBLIC_KEY = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY ?? ''

// ─── Stepper ──────────────────────────────────────────────────────────────

function Stepper({ step }: { step: Step }) {
  const steps = [
    { n: 1, icon: <MapPin size={14} />, label: 'Endereço' },
    { n: 2, icon: <Truck size={14} />, label: 'Frete' },
    { n: 3, icon: <CreditCard size={14} />, label: 'Pagamento' },
  ]
  return (
    <div className="flex items-center justify-center mb-10">
      {steps.map(({ n, icon, label }, i) => {
        const done = step > n
        const active = step === n
        return (
          <React.Fragment key={n}>
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                  done
                    ? 'bg-[#7D4F5A] border-[#7D4F5A] text-white'
                    : active
                    ? 'border-[#7D4F5A] text-[#7D4F5A] bg-[#FFF5F7]'
                    : 'border-gray-200 text-gray-300 bg-white'
                }`}
              >
                {done ? <CheckCircle2 size={16} /> : icon}
              </div>
              <span
                className={`text-xs font-jost font-medium hidden sm:block ${
                  active ? 'text-[#7D4F5A]' : done ? 'text-[#7D4F5A]/70' : 'text-gray-300'
                }`}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-3 mb-4 transition-colors duration-300 ${
                  step > n ? 'bg-[#7D4F5A]' : 'bg-gray-200'
                }`}
              />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

// ─── Input estilizado ─────────────────────────────────────────────────────

function Field({
  label,
  error,
  children,
  className = '',
}: {
  label: string
  error?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-[#241B1E] mb-1.5 font-jost">{label}</label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
}

const inputCls = (hasError?: boolean) =>
  `w-full border rounded-lg px-4 py-3 font-jost text-sm focus:outline-none transition-colors ${
    hasError ? 'border-red-400 bg-red-50' : 'border-gray-300 focus:border-[#7D4F5A] bg-white'
  }`

// ─── Resumo do Pedido (lateral) ───────────────────────────────────────────

function OrderSummary({
  items,
  cartTotal,
  freteSelecionado,
}: {
  items: { variantId: string; nome: string; preco: number; quantidade: number; imageUrl?: string }[]
  cartTotal: number
  freteSelecionado: FreteOpcao | null
}) {
  const total = cartTotal + (freteSelecionado?.preco ?? 0)
  return (
    <div className="bg-[#FBF2F0] p-6 rounded-xl sticky top-24 border border-[#D2A9B1]/20">
      <h3 className="text-xl font-cormorant-garamond text-[#241B1E] mb-5 pb-4 border-b border-[#D2A9B1]/30">
        Resumo do Pedido
      </h3>
      <div className="space-y-3 mb-5 max-h-52 overflow-y-auto pr-1">
        {items.map((item) => (
          <div key={item.variantId} className="flex gap-3 items-start">
            <div className="w-12 h-14 bg-white rounded-lg flex-shrink-0 relative overflow-hidden shadow-sm">
              {item.imageUrl && (
                <Image src={item.imageUrl} alt={item.nome} fill className="object-cover" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[#241B1E] font-medium font-jost leading-tight truncate">{item.nome}</p>
              <p className="text-xs text-gray-500 font-jost mt-0.5">
                {item.quantidade}x R$ {item.preco.toFixed(2).replace('.', ',')}
              </p>
            </div>
            <p className="text-sm font-semibold text-[#241B1E] font-jost shrink-0">
              R$ {(item.preco * item.quantidade).toFixed(2).replace('.', ',')}
            </p>
          </div>
        ))}
      </div>
      <div className="border-t border-[#D2A9B1]/30 pt-4 space-y-2 font-jost text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span>R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Frete</span>
          <span>{freteSelecionado ? `R$ ${freteSelecionado.preco.toFixed(2).replace('.', ',')}` : '—'}</span>
        </div>
        <div className="flex justify-between font-bold text-base pt-2 border-t border-[#D2A9B1]/30 text-[#241B1E]">
          <span>Total</span>
          <span>R$ {total.toFixed(2).replace('.', ',')}</span>
        </div>
      </div>
      {/* Selos de segurança */}
      <div className="mt-5 pt-4 border-t border-[#D2A9B1]/20 flex items-center gap-2 text-gray-400">
        <ShieldCheck size={14} className="shrink-0" />
        <p className="text-xs font-jost">Compra 100% segura e protegida</p>
      </div>
    </div>
  )
}

// ─── Componente Principal ─────────────────────────────────────────────────

export default function CheckoutPage() {
  const { items, clearCart } = useCart()
  const cartTotal = items.reduce((acc, item) => acc + item.preco * item.quantidade, 0)
  const router = useRouter()

  const [step, setStep] = useState<Step>(1)
  const [endereco, setEndereco] = useState<EnderecoData | null>(null)
  const [orderId, setOrderId] = useState<string | null>(null)

  const [freteOpcoes, setFreteOpcoes] = useState<FreteOpcao[]>([])
  const [freteSelecionado, setFreteSelecionado] = useState<FreteOpcao | null>(null)
  const [loadingFrete, setLoadingFrete] = useState(false)

  const [paymentTab, setPaymentTab] = useState<PaymentTab>('cartao')
  const [pixData, setPixData] = useState<PixData | null>(null)
  const [loadingPix, setLoadingPix] = useState(false)
  const [loadingOrder, setLoadingOrder] = useState(false)

  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'approved' | 'pending'>('idle')

  const totalGeral = cartTotal + (freteSelecionado?.preco ?? 0)

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<EnderecoData>({
    resolver: zodResolver(enderecoSchema),
  })

  const cep = watch('cep')
  const cpfWatch = watch('cpf')

  // Redireciona se carrinho vazio
  useEffect(() => {
    if (items.length === 0 && step === 1) router.push('/')
  }, [items, router, step])

  // Máscara CPF
  useEffect(() => {
    if (cpfWatch) {
      const clean = cleanCpf(cpfWatch)
      if (clean.length <= 11) {
        const masked = clean
          .replace(/(\d{3})(\d)/, '$1.$2')
          .replace(/(\d{3})(\d)/, '$1.$2')
          .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
        if (masked !== cpfWatch) setValue('cpf', masked)
      }
    }
  }, [cpfWatch, setValue])

  // Máscara CEP
  useEffect(() => {
    if (cep && cleanCpf(cep).length === 0) return
    const digits = cep?.replace(/\D/g, '') ?? ''
    if (digits.length === 8) {
      fetch(`https://viacep.com.br/ws/${digits}/json/`)
        .then((r) => r.json())
        .then((d) => {
          if (!d.erro) {
            setValue('rua', d.logradouro)
            setValue('bairro', d.bairro)
            setValue('cidade', d.localidade)
            setValue('estado', d.uf)
          }
        })
        .catch(() => {})
    }
  }, [cep, setValue])

  // Step 1 → 2: Salva endereço e calcula frete
  const onEnderecoSubmit = (data: EnderecoData) => {
    setEndereco(data)
    setStep(2)
    calcularFrete(data.cep)
  }

  const calcularFrete = async (cepDestino: string) => {
    setLoadingFrete(true)
    try {
      const res = await fetch('/api/frete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cep_destino: cepDestino, itens: items }),
      })
      const data = await res.json()
      setFreteOpcoes(data.opcoes ?? [])
    } catch {
      setFreteOpcoes([
        { id: 1, nome: 'Correios — PAC', preco: 18.9, prazo: '7–12 dias úteis', service_id: 1 },
        { id: 2, nome: 'Correios — SEDEX', preco: 34.5, prazo: '2–4 dias úteis', service_id: 2 },
      ])
    } finally {
      setLoadingFrete(false)
    }
  }

  // Step 2 → 3: Cria pedido e vai para pagamento
  const continuarParaPagamento = async () => {
    if (!freteSelecionado) return
    setLoadingOrder(true)
    setPaymentError(null)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ carrinho: items, endereco, frete: freteSelecionado }),
      })
      const data = await res.json()
      if (data.error) { setPaymentError(data.error); return }
      setOrderId(data.orderId)
      setStep(3)
    } catch {
      setPaymentError('Erro ao criar pedido. Tente novamente.')
    } finally {
      setLoadingOrder(false)
    }
  }

  // Pagamento com cartão aprovado
  const handleCardSuccess = useCallback(
    (paymentId: string, status: 'approved' | 'pending') => {
      setPaymentStatus(status)
      if (status === 'approved') {
        clearCart()
        setTimeout(() => router.push(`/pedido/${orderId}`), 1200)
      }
    },
    [orderId, router, clearCart]
  )

  // Gera Pix
  const gerarPix = async () => {
    if (!orderId || !endereco) return
    setLoadingPix(true)
    setPaymentError(null)
    setPixData(null)
    try {
      const res = await fetch('/api/pagamento/pix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          email: endereco.email,
          nome: endereco.nome,
          cpf: endereco.cpf,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        setPaymentError(data.error ?? 'Erro ao gerar Pix')
        return
      }
      setPixData(data.pix)
    } catch {
      setPaymentError('Erro ao gerar Pix. Tente novamente.')
    } finally {
      setLoadingPix(false)
    }
  }

  // Troca para aba Pix e gera automaticamente
  const switchToPix = useCallback(() => {
    setPaymentTab('pix')
    setPaymentError(null)
    if (!pixData && orderId) gerarPix()
  }, [pixData, orderId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Pix aprovado via polling
  const handlePixApproved = useCallback(() => {
    clearCart()
  }, [clearCart])

  // ─── RENDER ───────────────────────────────────────────────────────────────

  return (
    <>
      {/* MP.js e Device Fingerprint — carregados de forma assíncrona */}
      <Script
        src="https://sdk.mercadopago.com/js/v2"
        strategy="lazyOnload"
        onLoad={() => {
          if (window.MercadoPago && PUBLIC_KEY) {
            new window.MercadoPago(PUBLIC_KEY, { locale: 'pt-BR' })
          }
        }}
      />
      <Script
        src="https://www.mercadopago.com/v2/security.js"
        strategy="lazyOnload"
        data-view="checkout"
      />

      <div className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-cormorant-garamond text-[#241B1E] mb-2 text-center">
          Finalizar Compra
        </h1>
        <p className="text-center text-sm text-gray-400 font-jost mb-8">
          Compra segura e protegida
        </p>

        <Stepper step={step} />

        <div className="flex flex-col lg:flex-row gap-8">
          {/* ── Conteúdo Principal ──────────────────────────────────────── */}
          <div className="flex-1">

            {/* ═══════════════════════════════════════════════════════════
                STEP 1 — Dados de Entrega
            ═══════════════════════════════════════════════════════════ */}
            {step === 1 && (
              <div className="bg-white p-6 sm:p-8 rounded-xl border border-[#D2A9B1]/30 shadow-sm">
                <h2 className="text-2xl font-cormorant-garamond text-[#241B1E] mb-6">
                  Dados de Entrega
                </h2>
                <form onSubmit={handleSubmit(onEnderecoSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Nome Completo" error={errors.nome?.message} className="sm:col-span-2">
                      <input {...register('nome')} autoComplete="name" className={inputCls(!!errors.nome)} />
                    </Field>
                    <Field label="E-mail" error={errors.email?.message}>
                      <input type="email" {...register('email')} autoComplete="email" className={inputCls(!!errors.email)} />
                    </Field>
                    <Field label="Telefone (WhatsApp)" error={errors.telefone?.message}>
                      <input {...register('telefone')} autoComplete="tel" placeholder="(11) 99999-9999" className={inputCls(!!errors.telefone)} />
                    </Field>
                    <Field label="CPF" error={errors.cpf?.message}>
                      <input
                        {...register('cpf')}
                        placeholder="000.000.000-00"
                        inputMode="numeric"
                        maxLength={14}
                        className={inputCls(!!errors.cpf)}
                      />
                    </Field>
                    <Field label="CEP" error={errors.cep?.message}>
                      <input
                        {...register('cep')}
                        maxLength={9}
                        inputMode="numeric"
                        placeholder="00000-000"
                        className={inputCls(!!errors.cep)}
                      />
                    </Field>
                  </div>

                  <div className="border-t border-gray-100 pt-4 grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <Field label="Rua" error={errors.rua?.message} className="sm:col-span-3">
                      <input {...register('rua')} autoComplete="street-address" className={inputCls(!!errors.rua)} />
                    </Field>
                    <Field label="Número" error={errors.numero?.message}>
                      <input {...register('numero')} className={inputCls(!!errors.numero)} />
                    </Field>
                    <Field label="Complemento" className="sm:col-span-2">
                      <input {...register('complemento')} placeholder="Apto, bloco..." className={inputCls()} />
                    </Field>
                    <Field label="Bairro" error={errors.bairro?.message} className="sm:col-span-2">
                      <input {...register('bairro')} className={inputCls(!!errors.bairro)} />
                    </Field>
                    <Field label="Cidade" error={errors.cidade?.message} className="sm:col-span-3">
                      <input {...register('cidade')} className={inputCls(!!errors.cidade)} />
                    </Field>
                    <Field label="UF" error={errors.estado?.message}>
                      <input {...register('estado')} maxLength={2} className={`${inputCls(!!errors.estado)} uppercase`} />
                    </Field>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="submit"
                      className="bg-[#7D4F5A] text-white px-8 py-3 rounded-lg font-jost font-medium hover:bg-[#6B3F49] transition-colors flex items-center gap-2 shadow-sm"
                    >
                      Continuar para Frete <ChevronRight size={18} />
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════
                STEP 2 — Frete
            ═══════════════════════════════════════════════════════════ */}
            {step === 2 && (
              <div className="bg-white p-6 sm:p-8 rounded-xl border border-[#D2A9B1]/30 shadow-sm">
                <h2 className="text-2xl font-cormorant-garamond text-[#241B1E] mb-6">
                  Opções de Entrega
                </h2>

                {/* Endereço selecionado */}
                <div className="mb-6 p-4 bg-[#FBF2F0] rounded-lg flex justify-between items-start gap-3">
                  <div className="flex items-start gap-2">
                    <MapPin size={15} className="text-[#7D4F5A] shrink-0 mt-0.5" />
                    <div className="text-sm font-jost text-gray-700">
                      <span className="font-semibold block text-[#241B1E]">Entregando em:</span>
                      {endereco?.rua}, {endereco?.numero}{endereco?.complemento && ` — ${endereco.complemento}`}<br />
                      {endereco?.bairro} · {endereco?.cidade}/{endereco?.estado} · CEP {endereco?.cep}
                    </div>
                  </div>
                  <button
                    onClick={() => setStep(1)}
                    className="text-[#7D4F5A] text-xs underline font-jost whitespace-nowrap shrink-0"
                  >
                    Editar
                  </button>
                </div>

                {loadingFrete ? (
                  <div className="flex flex-col items-center py-10 gap-3">
                    <Loader2 className="w-7 h-7 text-[#7D4F5A] animate-spin" />
                    <p className="text-sm text-gray-500 font-jost">Buscando melhores fretes...</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {freteOpcoes.map((opcao) => (
                      <label
                        key={opcao.id}
                        className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all ${
                          freteSelecionado?.id === opcao.id
                            ? 'border-[#7D4F5A] bg-[#FFF5F7] shadow-sm'
                            : 'border-gray-200 hover:border-[#D2A9B1] bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="frete"
                            className="accent-[#7D4F5A] w-4 h-4 shrink-0"
                            checked={freteSelecionado?.id === opcao.id}
                            onChange={() => setFreteSelecionado(opcao)}
                          />
                          {opcao.empresa_logo && (
                            <img src={opcao.empresa_logo} alt={opcao.empresa} className="h-6 w-auto object-contain opacity-80" />
                          )}
                          <div>
                            <p className="font-medium text-[#241B1E] text-sm font-jost">{opcao.nome}</p>
                            <p className="text-xs text-gray-500 font-jost">Entrega em {opcao.prazo}</p>
                          </div>
                        </div>
                        <span className="font-semibold text-[#241B1E] font-jost shrink-0 ml-3">
                          R$ {opcao.preco.toFixed(2).replace('.', ',')}
                        </span>
                      </label>
                    ))}
                  </div>
                )}

                {paymentError && (
                  <div className="mt-4 flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                    <AlertTriangle size={15} className="text-red-500 shrink-0" />
                    <p className="text-sm text-red-700 font-jost">{paymentError}</p>
                  </div>
                )}

                <div className="pt-6 flex justify-between items-center">
                  <button
                    onClick={() => setStep(1)}
                    className="flex items-center gap-1 text-gray-500 font-jost text-sm hover:text-[#7D4F5A] transition-colors"
                  >
                    <ChevronLeft size={16} /> Voltar
                  </button>
                  <button
                    onClick={continuarParaPagamento}
                    disabled={!freteSelecionado || loadingOrder}
                    className="bg-[#7D4F5A] text-white px-8 py-3 rounded-lg font-jost font-medium hover:bg-[#6B3F49] transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
                  >
                    {loadingOrder ? <Loader2 size={16} className="animate-spin" /> : null}
                    {loadingOrder ? 'Processando...' : <>Ir para Pagamento <ChevronRight size={18} /></>}
                  </button>
                </div>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════
                STEP 3 — Pagamento
            ═══════════════════════════════════════════════════════════ */}
            {step === 3 && (
              <div className="bg-white rounded-xl border border-[#D2A9B1]/30 shadow-sm overflow-hidden">
                {/* Header */}
                <div className="px-6 sm:px-8 py-5 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="text-2xl font-cormorant-garamond text-[#241B1E]">Pagamento</h2>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 font-jost">
                    <ShieldCheck size={13} className="text-green-500" /> SSL Seguro
                  </div>
                </div>

                {/* Status: aprovado */}
                {paymentStatus === 'approved' && (
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 size={36} className="text-green-600" />
                    </div>
                    <h3 className="text-2xl font-cormorant-garamond text-[#241B1E] mb-2">Pagamento Aprovado!</h3>
                    <p className="text-sm text-gray-500 font-jost">Redirecionando para a confirmação...</p>
                    <Loader2 size={20} className="animate-spin text-[#7D4F5A] mx-auto mt-4" />
                  </div>
                )}

                {/* Status: pendente */}
                {paymentStatus === 'pending' && (
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Loader2 size={32} className="text-yellow-600 animate-spin" />
                    </div>
                    <h3 className="text-xl font-cormorant-garamond text-[#241B1E] mb-2">Pagamento em Análise</h3>
                    <p className="text-sm text-gray-500 font-jost">
                      Seu pagamento está sendo analisado pelo banco. Você receberá uma confirmação por e-mail em breve.
                    </p>
                    <button
                      onClick={() => router.push(`/pedido/${orderId}`)}
                      className="mt-6 text-[#7D4F5A] font-jost text-sm underline"
                    >
                      Ver status do pedido →
                    </button>
                  </div>
                )}

                {/* Formulário de pagamento */}
                {paymentStatus === 'idle' && (
                  <>
                    {/* Abas: Cartão | Pix */}
                    <div className="flex border-b border-gray-100">
                      <button
                        onClick={() => { setPaymentTab('cartao'); setPaymentError(null) }}
                        className={`flex-1 flex items-center justify-center gap-2 py-4 font-jost text-sm font-medium transition-colors ${
                          paymentTab === 'cartao'
                            ? 'text-[#7D4F5A] border-b-2 border-[#7D4F5A] bg-[#FFF5F7]'
                            : 'text-gray-400 hover:text-gray-600'
                        }`}
                      >
                        <CreditCard size={16} /> Cartão de Crédito/Débito
                      </button>
                      <button
                        onClick={switchToPix}
                        className={`flex-1 flex items-center justify-center gap-2 py-4 font-jost text-sm font-medium transition-colors ${
                          paymentTab === 'pix'
                            ? 'text-[#7D4F5A] border-b-2 border-[#7D4F5A] bg-[#FFF5F7]'
                            : 'text-gray-400 hover:text-gray-600'
                        }`}
                      >
                        <QrCode size={16} /> Pix
                      </button>
                    </div>

                    <div className="p-6 sm:p-8">
                      {/* Erro geral de pagamento */}
                      {paymentError && (
                        <div className="mb-5 flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                          <AlertTriangle size={15} className="text-red-500 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm text-red-700 font-jost font-medium">{paymentError}</p>
                            {paymentTab === 'cartao' && (
                              <button
                                onClick={switchToPix}
                                className="text-xs text-red-600 underline mt-1 font-jost"
                              >
                                Tentar pagar com Pix →
                              </button>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Aba: Cartão */}
                      {paymentTab === 'cartao' && endereco && (
                        <CardForm
                          amount={totalGeral}
                          orderId={orderId!}
                          email={endereco.email}
                          nome={endereco.nome}
                          cpf={endereco.cpf}
                          publicKey={PUBLIC_KEY}
                          onSuccess={handleCardSuccess}
                          onError={(msg) => setPaymentError(msg)}
                          onPixFallback={switchToPix}
                        />
                      )}

                      {/* Aba: Pix */}
                      {paymentTab === 'pix' && (
                        <>
                          {loadingPix && (
                            <div className="flex flex-col items-center py-12 gap-3">
                              <Loader2 className="w-8 h-8 text-[#7D4F5A] animate-spin" />
                              <p className="text-sm text-gray-500 font-jost">Gerando QR Code Pix...</p>
                            </div>
                          )}
                          {!loadingPix && pixData && (
                            <PixPanel
                              pixData={pixData}
                              orderId={orderId!}
                              onExpired={() => {
                                setPixData(null)
                                gerarPix()
                              }}
                            />
                          )}
                          {!loadingPix && !pixData && !paymentError && (
                            <div className="text-center py-8">
                              <button
                                onClick={gerarPix}
                                className="bg-[#7D4F5A] text-white px-8 py-3 rounded-lg font-jost font-medium hover:bg-[#6B3F49] transition-colors flex items-center gap-2 mx-auto"
                              >
                                <QrCode size={18} /> Gerar QR Code Pix
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* ── Resumo Lateral ──────────────────────────────────────────── */}
          <div className="w-full lg:w-80">
            <OrderSummary
              items={items}
              cartTotal={cartTotal}
              freteSelecionado={freteSelecionado}
            />
          </div>
        </div>
      </div>
    </>
  )
}
