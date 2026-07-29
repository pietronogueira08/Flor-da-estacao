'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { CheckCircle2, Copy, Clock, Loader2, RefreshCw, Smartphone, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface PixPanelProps {
  pixData: {
    payment_id: string
    qr_code: string
    qr_code_base64: string
    ticket_url: string | null
    expiration_date: string | null
    amount: number
  }
  orderId: string
  onExpired: () => void
}

const PIX_TIMEOUT_SECONDS = 30 * 60 // 30 minutos

export function PixPanel({ pixData, orderId, onExpired }: PixPanelProps) {
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(PIX_TIMEOUT_SECONDS)
  const [status, setStatus] = useState<'waiting' | 'approved' | 'expired'>('waiting')
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // ─── Timer regressivo ───────────────────────────────────────────────────
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!)
          setStatus('expired')
          onExpired()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [onExpired])

  // ─── Polling de status ──────────────────────────────────────────────────
  const checkStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/pagamento/status?orderId=${orderId}&paymentId=${pixData.payment_id}`)
      const data = await res.json()

      if (data.status === 'approved' || data.dbStatus === 'pago') {
        setStatus('approved')
        clearInterval(pollingRef.current!)
        clearInterval(timerRef.current!)
        // Redireciona após 2s para a página de confirmação
        setTimeout(() => router.push(`/pedido/${orderId}`), 2000)
      }
    } catch {
      // Silencia erros de polling
    }
  }, [orderId, pixData.payment_id, router])

  useEffect(() => {
    // Polling a cada 5 segundos
    pollingRef.current = setInterval(checkStatus, 5000)
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [checkStatus])

  // ─── Copiar código ──────────────────────────────────────────────────────
  const copiarCodigo = () => {
    navigator.clipboard.writeText(pixData.qr_code)
    setCopied(true)
    setTimeout(() => setCopied(false), 3000)
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  // ─── Estado: Aprovado ────────────────────────────────────────────────────
  if (status === 'approved') {
    return (
      <div className="text-center py-10 space-y-4 animate-in fade-in">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 size={42} className="text-green-600" />
        </div>
        <h3 className="text-2xl font-cormorant-garamond text-[#241B1E]">Pix Recebido!</h3>
        <p className="text-sm text-gray-500 font-jost">Redirecionando para a confirmação do pedido...</p>
        <Loader2 size={20} className="animate-spin text-[#7D4F5A] mx-auto" />
      </div>
    )
  }

  // ─── Estado: Expirado ────────────────────────────────────────────────────
  if (status === 'expired') {
    return (
      <div className="text-center py-8 space-y-4">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
          <Clock size={32} className="text-red-500" />
        </div>
        <h3 className="text-xl font-cormorant-garamond text-[#241B1E]">Pix Expirado</h3>
        <p className="text-sm text-gray-500 font-jost">
          O QR Code expirou após 30 minutos. Gere um novo Pix para continuar.
        </p>
        <button
          onClick={onExpired}
          className="flex items-center gap-2 mx-auto bg-[#7D4F5A] text-white px-6 py-3 rounded-lg font-jost text-sm hover:bg-[#6B3F49] transition-colors"
        >
          <RefreshCw size={15} /> Gerar novo Pix
        </button>
      </div>
    )
  }

  // ─── Estado: Aguardando ───────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* Valor e timer */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#FBF2F0] rounded-lg">
        <div>
          <p className="text-xs text-gray-500 font-jost">Valor a pagar</p>
          <p className="text-xl font-bold text-[#241B1E] font-cormorant-garamond">
            R$ {pixData.amount.toFixed(2).replace('.', ',')}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500 font-jost">Expira em</p>
          <p className={`text-lg font-bold font-mono ${secondsLeft < 120 ? 'text-red-500' : 'text-[#7D4F5A]'}`}>
            {formatTime(secondsLeft)}
          </p>
        </div>
      </div>

      {/* QR Code */}
      <div className="flex flex-col items-center gap-3">
        {pixData.qr_code_base64 ? (
          <div className="border-4 border-white rounded-xl shadow-md p-2 bg-white">
            <img
              src={`data:image/png;base64,${pixData.qr_code_base64}`}
              alt="QR Code Pix"
              className="w-44 h-44 sm:w-52 sm:h-52"
            />
          </div>
        ) : (
          <div className="w-48 h-48 bg-gray-100 rounded-xl flex items-center justify-center">
            <Loader2 size={32} className="animate-spin text-gray-400" />
          </div>
        )}

        {/* Instruções */}
        <div className="text-center space-y-1">
          <p className="text-sm font-medium text-[#241B1E] font-jost flex items-center gap-1.5 justify-center">
            <Smartphone size={14} className="text-[#7D4F5A]" />
            Abra o app do seu banco e escaneie o QR
          </p>
          <p className="text-xs text-gray-400 font-jost">ou use o código Pix Copia e Cola abaixo</p>
        </div>
      </div>

      {/* Código Copia e Cola */}
      <div>
        <p className="text-xs text-gray-500 font-jost mb-1.5 font-medium uppercase tracking-wider">
          Pix Copia e Cola
        </p>
        <div className="flex gap-2">
          <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 font-mono text-xs text-gray-600 overflow-hidden text-ellipsis whitespace-nowrap">
            {pixData.qr_code.slice(0, 50)}...
          </div>
          <button
            onClick={copiarCodigo}
            className={`shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-lg font-jost text-sm font-medium transition-all ${
              copied
                ? 'bg-green-600 text-white'
                : 'bg-[#7D4F5A] text-white hover:bg-[#6B3F49]'
            }`}
          >
            {copied ? (
              <>
                <CheckCircle2 size={15} /> Copiado!
              </>
            ) : (
              <>
                <Copy size={15} /> Copiar
              </>
            )}
          </button>
        </div>
      </div>

      {/* Status polling indicator */}
      <div className="flex items-center gap-2 py-2">
        <div className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
        </div>
        <p className="text-xs text-gray-500 font-jost">
          Aguardando confirmação do pagamento...
        </p>
      </div>

      {/* Instruções detalhadas */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 space-y-1.5">
        <p className="text-xs font-semibold text-blue-800 font-jost">Como pagar:</p>
        {[
          'Abra o aplicativo do seu banco',
          'Selecione a opção Pix',
          'Escolha "Pagar com QR Code" ou "Copia e Cola"',
          'Confirme o pagamento de R$ ' + pixData.amount.toFixed(2).replace('.', ','),
        ].map((step, i) => (
          <p key={i} className="text-xs text-blue-700 font-jost flex gap-2">
            <span className="font-bold shrink-0">{i + 1}.</span>
            {step}
          </p>
        ))}
      </div>

      {/* Alerta de segurança */}
      <div className="flex items-start gap-2">
        <AlertCircle size={13} className="text-gray-400 shrink-0 mt-0.5" />
        <p className="text-xs text-gray-400 font-jost">
          O pedido será confirmado automaticamente após o pagamento. Não feche essa página.
        </p>
      </div>
    </div>
  )
}
