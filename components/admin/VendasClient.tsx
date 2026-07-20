'use client'

import { useState, useMemo } from 'react'
import { format, subDays, subYears, startOfDay, startOfWeek, startOfYear, isAfter } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { TrendingUp, ShoppingBag, DollarSign, Tag, FileText, Printer, ChevronDown, ChevronUp, Loader2, AlertCircle, CheckCircle } from 'lucide-react'

type AnyRecord = Record<string, any>

type Period = 'hoje' | 'semana' | '30dias' | 'ano' | 'tudo'

const PERIOD_LABELS: Record<Period, string> = {
  hoje: 'Hoje',
  semana: 'Esta Semana',
  '30dias': 'Últimos 30 Dias',
  ano: 'Este Ano',
  tudo: 'Tudo',
}

const STATUS_COLORS: Record<string, string> = {
  pendente: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  pago: 'bg-blue-50 text-blue-700 border-blue-200',
  enviado: 'bg-purple-50 text-purple-700 border-purple-200',
  entregue: 'bg-green-50 text-green-700 border-green-200',
  cancelado: 'bg-red-50 text-red-700 border-red-200',
}

const STATUS_LABELS: Record<string, string> = {
  pendente: 'Pendente',
  pago: 'Pago',
  enviado: 'Enviado',
  entregue: 'Entregue',
  cancelado: 'Cancelado',
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function getPeriodStart(period: Period): Date | null {
  const now = new Date()
  switch (period) {
    case 'hoje': return startOfDay(now)
    case 'semana': return startOfWeek(now, { weekStartsOn: 1 })
    case '30dias': return subDays(now, 30)
    case 'ano': return startOfYear(now)
    case 'tudo': return null
  }
}

interface PedidoCardProps {
  pedido: AnyRecord
  expanded: boolean
  onToggle: () => void
}

function PedidoCard({ pedido, expanded, onToggle }: PedidoCardProps) {
  const [etiquetaLoading, setEtiquetaLoading] = useState(false)
  const [etiquetaMsg, setEtiquetaMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [declLoading, setDeclLoading] = useState(false)

  const handleEtiqueta = async () => {
    setEtiquetaLoading(true)
    setEtiquetaMsg(null)
    try {
      const res = await fetch('/api/melhor-envio/etiqueta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: pedido.id, order: pedido }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (data.error?.includes('MELHOR_ENVIO_TOKEN')) {
          setEtiquetaMsg({ type: 'error', text: 'Token do Melhor Envio não configurado ainda.' })
        } else {
          setEtiquetaMsg({ type: 'error', text: data.error ?? 'Erro ao gerar etiqueta.' })
        }
        return
      }
      if (data.printUrl) {
        window.open(data.printUrl, '_blank')
        setEtiquetaMsg({ type: 'success', text: 'Etiqueta gerada! Abrindo para impressão...' })
      } else {
        setEtiquetaMsg({ type: 'success', text: 'Etiqueta enviada para o Melhor Envio.' })
      }
    } catch {
      setEtiquetaMsg({ type: 'error', text: 'Erro de rede. Tente novamente.' })
    } finally {
      setEtiquetaLoading(false)
    }
  }

  const handleDeclaracao = async () => {
    setDeclLoading(true)
    try {
      const res = await fetch('/api/melhor-envio/declaracao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: pedido }),
      })
      const html = await res.text()
      const win = window.open('', '_blank')
      if (win) {
        win.document.write(html)
        win.document.close()
      }
    } catch {
      alert('Erro ao gerar declaração de conteúdo.')
    } finally {
      setDeclLoading(false)
    }
  }

  const statusClass = STATUS_COLORS[pedido.status] ?? 'bg-gray-50 text-gray-700 border-gray-200'
  const statusLabel = STATUS_LABELS[pedido.status] ?? pedido.status
  const endereco = pedido.endereco ?? {}
  const itens = pedido.order_items ?? []

  return (
    <div className="bg-branco border border-claro rounded-sm shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md">
      {/* Card Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-claro/5 transition-colors"
      >
        {/* Order number */}
        <div className="hidden sm:block w-20 shrink-0">
          <code className="font-mono text-xs text-preto/50 bg-claro/20 px-1.5 py-0.5 rounded">
            #{pedido.id?.slice(0, 8).toUpperCase()}
          </code>
        </div>

        {/* Client */}
        <div className="flex-1 min-w-0">
          <p className="font-archivo text-sm font-medium text-preto truncate">{pedido.cliente_nome}</p>
          <p className="font-archivo text-xs text-preto/50 truncate hidden sm:block">{pedido.cliente_email}</p>
        </div>

        {/* Date */}
        <div className="hidden md:block shrink-0">
          <p className="font-archivo text-xs text-preto/50">
            {format(new Date(pedido.criado_em), "dd/MM/yy 'às' HH:mm", { locale: ptBR })}
          </p>
        </div>

        {/* Status */}
        <span className={`font-archivo text-xs px-2.5 py-1 rounded-full border shrink-0 ${statusClass}`}>
          {statusLabel}
        </span>

        {/* Total */}
        <div className="shrink-0 text-right">
          <p className="font-archivo text-sm font-semibold text-preto">{formatCurrency(pedido.total)}</p>
        </div>

        {/* Expand icon */}
        <div className="text-preto/30 shrink-0">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-claro/50 px-5 py-4 space-y-4 animate-[fadeSlideUp_0.25s_ease]">
          {/* Items */}
          {itens.length > 0 && (
            <div>
              <p className="font-archivo text-xs uppercase tracking-wider text-preto/50 mb-2">Itens do Pedido</p>
              <div className="space-y-1.5">
                {itens.map((item: any) => {
                  const variant = item.product_variants
                  const nome = variant?.products?.nome ?? 'Produto'
                  const variante = [variant?.tamanho, variant?.cor].filter(Boolean).join(' / ')
                  return (
                    <div key={item.id} className="flex items-center justify-between text-sm">
                      <span className="font-archivo text-preto/80">
                        {item.quantidade}× {nome}
                        {variante && <span className="text-preto/40 ml-1">({variante})</span>}
                      </span>
                      <span className="font-archivo text-preto/60">{formatCurrency(item.preco_unitario * item.quantidade)}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Endereço */}
          <div>
            <p className="font-archivo text-xs uppercase tracking-wider text-preto/50 mb-1">Endereço de Entrega</p>
            <p className="font-archivo text-sm text-preto/70">
              {endereco.rua}, {endereco.numero}{endereco.complemento ? ` — ${endereco.complemento}` : ''}<br />
              {endereco.bairro} · {endereco.cidade}/{endereco.estado} · CEP {endereco.cep}
            </p>
          </div>

          {/* Summary */}
          <div className="flex items-center gap-6 text-sm font-archivo text-preto/60">
            <span>Subtotal: {formatCurrency(pedido.subtotal)}</span>
            <span>Frete: {formatCurrency(pedido.frete)}</span>
            <span className="font-semibold text-preto">Total: {formatCurrency(pedido.total)}</span>
          </div>

          {/* Feedback messages */}
          {etiquetaMsg && (
            <div className={`flex items-center gap-2 px-3 py-2 rounded-sm text-xs font-archivo ${
              etiquetaMsg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              {etiquetaMsg.type === 'success'
                ? <CheckCircle size={13} />
                : <AlertCircle size={13} />
              }
              {etiquetaMsg.text}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              onClick={handleEtiqueta}
              disabled={etiquetaLoading}
              className="flex items-center gap-2 px-4 py-2 bg-preto text-branco font-archivo text-xs font-medium rounded-sm hover:bg-dourado transition-colors duration-200 disabled:opacity-60 group"
            >
              {etiquetaLoading
                ? <Loader2 size={13} className="animate-spin" />
                : <Tag size={13} className="group-hover:scale-110 transition-transform" />
              }
              {etiquetaLoading ? 'Gerando...' : 'Imprimir Etiqueta'}
            </button>

            <button
              onClick={handleDeclaracao}
              disabled={declLoading}
              className="flex items-center gap-2 px-4 py-2 border border-dourado text-dourado font-archivo text-xs font-medium rounded-sm hover:bg-dourado hover:text-branco transition-colors duration-200 disabled:opacity-60 group"
            >
              {declLoading
                ? <Loader2 size={13} className="animate-spin" />
                : <FileText size={13} className="group-hover:scale-110 transition-transform" />
              }
              {declLoading ? 'Gerando...' : 'Declaração de Conteúdo'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function VendasClient({ pedidos }: { pedidos: AnyRecord[] }) {
  const [period, setPeriod] = useState<Period>('30dias')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const start = getPeriodStart(period)
    if (!start) return pedidos
    return pedidos.filter(p => isAfter(new Date(p.criado_em), start))
  }, [pedidos, period])

  const stats = useMemo(() => {
    const receita = filtered
      .filter(p => ['pago', 'enviado', 'entregue'].includes(p.status))
      .reduce((acc, p) => acc + Number(p.total), 0)
    const total = filtered.length
    const ticket = total > 0 ? receita / filtered.filter(p => ['pago', 'enviado', 'entregue'].includes(p.status)).length : 0
    return { receita, total, ticket }
  }, [filtered])

  return (
    <div className="min-h-screen bg-branco">
      {/* Header */}
      <div className="border-b border-claro bg-branco px-4 md:px-8 py-6">
        <h1 className="font-bodoni text-3xl text-preto italic">Vendas</h1>
        <p className="font-archivo text-sm text-zaya mt-1">Histórico de pedidos e expedição</p>
      </div>

      <div className="p-4 md:p-8 space-y-6">
        {/* Period Filter */}
        <div className="flex flex-wrap gap-2">
          {(Object.keys(PERIOD_LABELS) as Period[]).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 font-archivo text-sm rounded-sm transition-colors duration-150 ${
                period === p
                  ? 'bg-preto text-branco'
                  : 'bg-branco border border-claro text-preto/60 hover:border-dourado hover:text-dourado'
              }`}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-branco border border-claro rounded-sm p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-archivo text-xs uppercase tracking-wider text-preto/50 mb-2">Receita</p>
                <p className="font-bodoni text-3xl text-dourado">{formatCurrency(stats.receita)}</p>
                <p className="font-archivo text-xs text-preto/40 mt-1">pedidos confirmados</p>
              </div>
              <div className="p-2.5 bg-dourado/10 rounded-sm">
                <DollarSign size={20} className="text-dourado" />
              </div>
            </div>
          </div>

          <div className="bg-branco border border-claro rounded-sm p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-archivo text-xs uppercase tracking-wider text-preto/50 mb-2">Pedidos</p>
                <p className="font-bodoni text-3xl text-preto">{stats.total}</p>
                <p className="font-archivo text-xs text-preto/40 mt-1">no período selecionado</p>
              </div>
              <div className="p-2.5 bg-claro/30 rounded-sm">
                <ShoppingBag size={20} className="text-preto/50" />
              </div>
            </div>
          </div>

          <div className="bg-branco border border-claro rounded-sm p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-archivo text-xs uppercase tracking-wider text-preto/50 mb-2">Ticket Médio</p>
                <p className="font-bodoni text-3xl text-preto">{formatCurrency(isNaN(stats.ticket) ? 0 : stats.ticket)}</p>
                <p className="font-archivo text-xs text-preto/40 mt-1">por pedido confirmado</p>
              </div>
              <div className="p-2.5 bg-claro/30 rounded-sm">
                <TrendingUp size={20} className="text-preto/50" />
              </div>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bodoni text-xl text-preto italic">
              Pedidos — {PERIOD_LABELS[period]}
            </h2>
            <span className="font-archivo text-xs text-preto/40">{filtered.length} pedido{filtered.length !== 1 ? 's' : ''}</span>
          </div>

          {filtered.length === 0 ? (
            <div className="bg-branco border border-claro rounded-sm p-12 text-center">
              <ShoppingBag size={40} className="text-claro/40 mx-auto mb-3" />
              <p className="font-bodoni text-xl text-preto/40 italic">Nenhum pedido no período</p>
              <p className="font-archivo text-sm text-preto/30 mt-1">Tente selecionar um período maior</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(pedido => (
                <PedidoCard
                  key={pedido.id}
                  pedido={pedido}
                  expanded={expandedId === pedido.id}
                  onToggle={() => setExpandedId(prev => prev === pedido.id ? null : pedido.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
