'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  X,
  ChevronRight,
  Gem,
  Truck,
  Printer,
  FileText,
  Package,
  MapPin,
  ExternalLink,
  Loader2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Copy,
  Search,
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Pedido = Record<string, any>

type Status = 'pendente' | 'pago' | 'enviado' | 'entregue' | 'cancelado'

const statusColors: Record<Status, string> = {
  pendente: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  pago: 'bg-blue-100 text-blue-800 border-blue-200',
  enviado: 'bg-purple-100 text-purple-800 border-purple-200',
  entregue: 'bg-green-100 text-green-800 border-green-200',
  cancelado: 'bg-red-100 text-red-800 border-red-200',
}

const statusLabels: Record<Status, string> = {
  pendente: 'Pendente',
  pago: 'Pago',
  enviado: 'Enviado',
  entregue: 'Entregue',
  cancelado: 'Cancelado',
}

const statusFlow: Partial<Record<Status, Status>> = {
  pendente: 'pago',
  pago: 'enviado',
  enviado: 'entregue',
}

const ALL_STATUSES: Status[] = ['pendente', 'pago', 'enviado', 'entregue', 'cancelado']

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getItemProductName(item: any): string {
  const pv = item.product_variants
  if (!pv) return 'Produto'
  const variant = Array.isArray(pv) ? pv[0] : pv
  const prod = variant?.products
  if (!prod) return 'Produto'
  if (Array.isArray(prod)) return prod[0]?.nome ?? 'Produto'
  return prod.nome ?? 'Produto'
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getItemVariantInfo(item: any): string {
  const pv = item.product_variants
  if (!pv) return ''
  const variant = Array.isArray(pv) ? pv[0] : pv
  if (!variant) return ''
  const parts = [variant.tamanho, variant.cor, variant.sku].filter(Boolean)
  return parts.join(' · ')
}

// ─── Sub-componente: Painel de ações Melhor Envio ─────────────────────────────
function MelhorEnvioPanel({ pedido, onSuccess }: { pedido: Pedido; onSuccess: () => void }) {
  const [loadingEtiqueta, setLoadingEtiqueta] = useState(false)
  const [etiquetaResult, setEtiquetaResult] = useState<{
    printUrl: string | null
    trackingCode: string | null
    shipmentId: string | null
  } | null>(
    pedido.melhor_envio_id
      ? {
          printUrl: pedido.label_url ?? null,
          trackingCode: pedido.tracking_code ?? null,
          shipmentId: pedido.melhor_envio_id,
        }
      : null
  )
  const [etiquetaError, setEtiquetaError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const isPaid = pedido.status === 'pago'
  const isEnviado = pedido.status === 'enviado'
  const isEntregue = pedido.status === 'entregue'
  const jaTemEtiqueta = !!(etiquetaResult?.shipmentId || pedido.melhor_envio_id)

  const gerarEtiqueta = async () => {
    setLoadingEtiqueta(true)
    setEtiquetaError(null)
    try {
      const res = await fetch('/api/melhor-envio/etiqueta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: pedido.id,
          order: pedido,
          serviceId: pedido.frete_service_id ?? 1,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        setEtiquetaError(data.error ?? 'Erro ao gerar etiqueta')
        return
      }
      setEtiquetaResult({
        printUrl: data.printUrl,
        trackingCode: data.trackingCode,
        shipmentId: data.shipmentId,
      })
      onSuccess()
    } catch {
      setEtiquetaError('Falha de conexão ao gerar etiqueta')
    } finally {
      setLoadingEtiqueta(false)
    }
  }

  const gerarDeclaracao = () => {
    const url = `/api/melhor-envio/declaracao`
    const win = window.open('', '_blank')
    if (!win) return
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order: pedido }),
    })
      .then((r) => r.text())
      .then((html) => {
        win.document.write(html)
        win.document.close()
      })
  }

  const copiarCodigo = () => {
    if (!etiquetaResult?.trackingCode) return
    navigator.clipboard.writeText(etiquetaResult.trackingCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Se o pedido está apenas pendente (não pago), não mostra o painel ME
  if (pedido.status === 'pendente' || pedido.status === 'cancelado') return null

  return (
    <div className="rounded-sm border border-[#B8976A]/30 bg-gradient-to-br from-[#FDF8F0] to-[#FFF9F0] p-4 space-y-4">
      {/* Header do painel */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-sm bg-[#B8976A]/15 flex items-center justify-center">
          <Package size={16} className="text-[#B8976A]" />
        </div>
        <div>
          <p className="font-archivo text-sm font-semibold text-preto">Melhor Envio</p>
          <p className="font-archivo text-xs text-preto/50">Gestão de frete e etiquetas</p>
        </div>
        {jaTemEtiqueta && (
          <span className="ml-auto flex items-center gap-1 text-xs font-archivo text-green-700 bg-green-100 border border-green-200 px-2 py-0.5 rounded-full">
            <CheckCircle2 size={11} /> Etiqueta gerada
          </span>
        )}
      </div>

      {/* Erro */}
      {etiquetaError && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-sm p-3">
          <AlertCircle size={15} className="text-red-500 shrink-0 mt-0.5" />
          <p className="font-archivo text-xs text-red-700">{etiquetaError}</p>
        </div>
      )}

      {/* Código de rastreio */}
      {etiquetaResult?.trackingCode && (
        <div className="bg-white border border-[#B8976A]/20 rounded-sm p-3">
          <p className="font-archivo text-xs text-preto/50 mb-1 uppercase tracking-wider">
            Código de Rastreio
          </p>
          <div className="flex items-center gap-2">
            <code className="font-mono text-sm text-preto font-semibold flex-1">
              {etiquetaResult.trackingCode}
            </code>
            <button
              onClick={copiarCodigo}
              className="p-1.5 rounded hover:bg-[#B8976A]/10 text-[#B8976A] transition-colors"
              title="Copiar código"
            >
              {copied ? <CheckCircle2 size={14} className="text-green-600" /> : <Copy size={14} />}
            </button>
          </div>
        </div>
      )}

      {/* Botões de ação */}
      <div className="grid grid-cols-1 gap-2">
        {/* Gerar / Reimprimir etiqueta */}
        {!jaTemEtiqueta ? (
          (isPaid || isEnviado) && (
            <button
              onClick={gerarEtiqueta}
              disabled={loadingEtiqueta}
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-[#B8976A] text-white rounded-sm font-archivo text-sm font-medium hover:bg-[#9A7A52] transition-colors disabled:opacity-60"
            >
              {loadingEtiqueta ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Truck size={15} />
              )}
              {loadingEtiqueta ? 'Gerando etiqueta...' : 'Gerar Etiqueta de Envio'}
            </button>
          )
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {/* Imprimir etiqueta */}
            {etiquetaResult?.printUrl && (
              <a
                href={etiquetaResult.printUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-2.5 px-3 bg-[#B8976A] text-white rounded-sm font-archivo text-sm font-medium hover:bg-[#9A7A52] transition-colors"
              >
                <Printer size={14} />
                Imprimir Etiqueta
              </a>
            )}
            {/* Reimprimir / Regenerar */}
            <button
              onClick={gerarEtiqueta}
              disabled={loadingEtiqueta}
              className="flex items-center justify-center gap-2 py-2.5 px-3 border border-[#B8976A]/40 text-[#B8976A] rounded-sm font-archivo text-sm hover:bg-[#B8976A]/10 transition-colors disabled:opacity-60"
            >
              {loadingEtiqueta ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Truck size={14} />
              )}
              {loadingEtiqueta ? 'Gerando...' : 'Nova Etiqueta'}
            </button>
          </div>
        )}

        {/* Declaração de Conteúdo */}
        <button
          onClick={gerarDeclaracao}
          className="flex items-center justify-center gap-2 w-full py-2.5 px-4 border border-[#B8976A]/30 text-[#9A7A52] rounded-sm font-archivo text-sm hover:bg-[#B8976A]/10 transition-colors"
        >
          <FileText size={15} />
          Declaração de Conteúdo (Correios)
        </button>

        {/* Rastrear envio */}
        {(etiquetaResult?.shipmentId || pedido.melhor_envio_id) && (
          <a
            href={`https://www.melhorrastreio.com.br/rastreio/${etiquetaResult?.trackingCode ?? pedido.tracking_code ?? ''}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 border border-blue-200 text-blue-700 rounded-sm font-archivo text-sm hover:bg-blue-50 transition-colors"
          >
            <MapPin size={15} />
            Rastrear Envio
            <ExternalLink size={12} className="ml-auto opacity-60" />
          </a>
        )}

        {/* Link do comprovante imprimível */}
        {etiquetaResult?.printUrl && (
          <a
            href={etiquetaResult.printUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 w-full py-2 px-3 text-xs font-archivo text-preto/50 hover:text-preto/80 transition-colors"
          >
            <ExternalLink size={11} />
            Ver etiqueta no Melhor Envio
          </a>
        )}
      </div>

      {/* Info de status atual */}
      {isEntregue && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-sm p-3">
          <CheckCircle2 size={15} className="text-green-600 shrink-0" />
          <p className="font-archivo text-xs text-green-800">
            Pedido marcado como entregue. Você ainda pode consultar o histórico de rastreio.
          </p>
        </div>
      )}
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function PedidosClient({ pedidos }: { pedidos: Pedido[] }) {
  const [filtroStatus, setFiltroStatus] = useState<Status | 'todos'>('todos')
  const [busca, setBusca] = useState('')
  const [detalhe, setDetalhe] = useState<Pedido | null>(null)
  const [advancing, setAdvancing] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const pedidosFiltrados = pedidos
    .filter((p) => filtroStatus === 'todos' || p.status === filtroStatus)
    .filter((p) => {
      if (!busca) return true
      const q = busca.toLowerCase()
      return (
        p.cliente_nome?.toLowerCase().includes(q) ||
        p.cliente_email?.toLowerCase().includes(q) ||
        p.id?.toLowerCase().includes(q) ||
        p.tracking_code?.toLowerCase().includes(q)
      )
    })

  const handleAdvanceStatus = async (pedido: Pedido) => {
    const nextStatus = statusFlow[pedido.status as Status]
    if (!nextStatus) return

    setAdvancing(true)
    await supabase
      .from('orders')
      .update({ status: nextStatus })
      .eq('id', pedido.id)

    setAdvancing(false)
    setDetalhe(null)
    router.refresh()
  }

  const handleCancel = async (id: string) => {
    if (!confirm('Confirma o cancelamento deste pedido?')) return
    await supabase.from('orders').update({ status: 'cancelado' }).eq('id', id)
    setDetalhe(null)
    router.refresh()
  }

  const endereco = detalhe?.endereco ?? {}

  // Métricas rápidas
  const totalPendente = pedidos.filter((p) => p.status === 'pendente').length
  const totalPago = pedidos.filter((p) => p.status === 'pago').length
  const totalEnviado = pedidos.filter((p) => p.status === 'enviado').length
  const receitaTotal = pedidos
    .filter((p) => p.status !== 'cancelado')
    .reduce((acc, p) => acc + Number(p.total ?? 0), 0)

  return (
    <div className="min-h-screen bg-branco">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="border-b border-claro bg-branco px-4 md:px-8 py-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="font-bodoni text-3xl text-preto italic">Pedidos</h1>
            <p className="font-archivo text-sm text-zaya mt-1">
              {pedidos.length} pedido{pedidos.length !== 1 ? 's' : ''} no total ·{' '}
              <span className="text-[#B8976A] font-medium">{formatCurrency(receitaTotal)} em receita</span>
            </p>
          </div>

          {/* Busca */}
          <div className="relative max-w-xs w-full">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-preto/40" />
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar cliente, e-mail, rastreio..."
              className="w-full pl-9 pr-3 py-2 font-archivo text-sm border border-claro rounded-sm focus:outline-none focus:border-dourado bg-white"
            />
          </div>
        </div>

        {/* KPI chips */}
        <div className="flex gap-3 mt-4 flex-wrap">
          {[
            { label: 'Aguard. pagamento', value: totalPendente, color: 'bg-yellow-50 border-yellow-200 text-yellow-800' },
            { label: 'Pago · ag. envio', value: totalPago, color: 'bg-blue-50 border-blue-200 text-blue-800' },
            { label: 'Em trânsito', value: totalEnviado, color: 'bg-purple-50 border-purple-200 text-purple-800' },
          ].map(({ label, value, color }) => (
            <div key={label} className={`flex items-center gap-2 px-3 py-1.5 rounded-full border font-archivo text-xs ${color}`}>
              <span className="font-bold text-sm">{value}</span>
              {label}
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 md:p-8">
        {/* ── Filtros ──────────────────────────────────────────────────────── */}
        <div className="flex gap-2 flex-wrap mb-6">
          <button
            onClick={() => setFiltroStatus('todos')}
            className={`px-4 py-2 font-archivo text-sm rounded-sm border transition-colors ${
              filtroStatus === 'todos'
                ? 'bg-dourado text-branco border-dourado'
                : 'bg-branco text-preto/60 border-claro hover:border-dourado'
            }`}
          >
            Todos ({pedidos.length})
          </button>
          {ALL_STATUSES.map((s) => {
            const count = pedidos.filter((p) => p.status === s).length
            return (
              <button
                key={s}
                onClick={() => setFiltroStatus(s)}
                className={`px-4 py-2 font-archivo text-sm rounded-sm border transition-colors ${
                  filtroStatus === s
                    ? 'bg-dourado text-branco border-dourado'
                    : 'bg-branco text-preto/60 border-claro hover:border-dourado'
                }`}
              >
                {statusLabels[s]} ({count})
              </button>
            )
          })}
        </div>

        {/* ── Tabela / Cards ───────────────────────────────────────────────── */}
        {pedidosFiltrados.length === 0 ? (
          <div className="bg-branco border border-claro rounded-sm p-12 text-center">
            <Gem size={40} className="text-claro/40 mx-auto mb-3" />
            <p className="font-bodoni text-xl text-preto/50 italic">Nenhum pedido encontrado</p>
          </div>
        ) : (
          <>
            {/* Mobile Cards */}
            <div className="block md:hidden space-y-3">
              {pedidosFiltrados.map((pedido) => (
                <div
                  key={pedido.id}
                  className="bg-branco border border-claro rounded-sm shadow-sm p-4 flex items-center gap-3 cursor-pointer active:bg-claro/10 transition-colors"
                  onClick={() => setDetalhe(pedido)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-archivo text-sm font-semibold text-preto truncate">
                      {pedido.cliente_nome}
                    </p>
                    <p className="font-archivo text-xs text-preto/50 truncate">{pedido.cliente_email}</p>
                    <p className="font-archivo text-xs text-preto/40 mt-0.5">
                      {format(new Date(pedido.criado_em), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span
                        className={`font-archivo text-xs px-2 py-0.5 rounded-full border ${
                          statusColors[pedido.status as Status] ?? 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {statusLabels[pedido.status as Status] ?? pedido.status}
                      </span>
                      {pedido.tracking_code && (
                        <span className="font-mono text-xs text-purple-700 bg-purple-50 border border-purple-200 px-1.5 py-0.5 rounded-sm">
                          {pedido.tracking_code}
                        </span>
                      )}
                      <span className="font-archivo text-sm font-semibold text-dourado">
                        {formatCurrency(pedido.total)}
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-preto/30 shrink-0" />
                </div>
              ))}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block bg-branco border border-claro rounded-sm shadow-sm overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b border-claro/20">
                    {['Cliente', 'Data', 'Itens', 'Frete / Rastreio', 'Total', 'Status', ''].map((h) => (
                      <th
                        key={h}
                        className="text-left px-5 py-4 font-archivo text-xs uppercase tracking-wider text-preto/50"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pedidosFiltrados.map((pedido) => (
                    <tr
                      key={pedido.id}
                      className="border-b border-claro/10 hover:bg-[#FDF8F0]/60 transition-colors cursor-pointer"
                      onClick={() => setDetalhe(pedido)}
                    >
                      <td className="px-5 py-3">
                        <p className="font-archivo text-sm font-medium text-preto">{pedido.cliente_nome}</p>
                        <p className="font-archivo text-xs text-preto/50">{pedido.cliente_email}</p>
                      </td>
                      <td className="px-5 py-3">
                        <p className="font-archivo text-xs text-preto/70">
                          {format(new Date(pedido.criado_em), 'dd/MM/yyyy', { locale: ptBR })}
                        </p>
                        <p className="font-archivo text-xs text-preto/40">
                          {format(new Date(pedido.criado_em), 'HH:mm', { locale: ptBR })}
                        </p>
                      </td>
                      <td className="px-5 py-3">
                        <p className="font-archivo text-sm text-preto">
                          {Array.isArray(pedido.order_items) ? pedido.order_items.length : 0} item(s)
                        </p>
                      </td>
                      <td className="px-5 py-3">
                        <p className="font-archivo text-xs text-preto/70">{formatCurrency(pedido.frete ?? 0)}</p>
                        {pedido.tracking_code ? (
                          <span className="font-mono text-xs text-purple-700 bg-purple-50 border border-purple-200 px-1.5 py-0.5 rounded-sm inline-block mt-0.5">
                            {pedido.tracking_code}
                          </span>
                        ) : (pedido.status === 'pago' || pedido.status === 'enviado') ? (
                          <span className="font-archivo text-xs text-[#B8976A] flex items-center gap-1 mt-0.5">
                            <Clock size={11} /> Ag. etiqueta
                          </span>
                        ) : null}
                      </td>
                      <td className="px-5 py-3">
                        <p className="font-archivo text-sm font-medium text-preto">
                          {formatCurrency(pedido.total)}
                        </p>
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`font-archivo text-xs px-2.5 py-1 rounded-full border ${
                            statusColors[pedido.status as Status] ?? 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {statusLabels[pedido.status as Status] ?? pedido.status}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <ChevronRight size={16} className="text-preto/30" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* ── Modal de Detalhe ─────────────────────────────────────────────────── */}
      {detalhe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-preto/40 backdrop-blur-sm"
            onClick={() => setDetalhe(null)}
          />
          <div className="relative w-[95vw] max-w-lg max-h-[90vh] overflow-y-auto bg-branco border border-claro rounded-sm shadow-2xl m-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-claro sticky top-0 bg-branco z-10">
              <div>
                <h2 className="font-bodoni text-2xl text-preto italic">Detalhes do Pedido</h2>
                <p className="font-mono text-xs text-preto/40 mt-0.5">
                  #{String(detalhe.id).slice(0, 8).toUpperCase()}
                </p>
              </div>
              <button onClick={() => setDetalhe(null)} className="text-preto/40 hover:text-dourado">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Status timeline */}
              <div>
                <p className="font-archivo text-xs uppercase tracking-wider text-preto/50 mb-3">
                  Status do Pedido
                </p>
                <div className="flex items-center gap-1">
                  {(['pendente', 'pago', 'enviado', 'entregue'] as Status[]).map((s, idx) => {
                    const statuses: Status[] = ['pendente', 'pago', 'enviado', 'entregue']
                    const currentIdx = statuses.indexOf(detalhe.status as Status)
                    const stepIdx = statuses.indexOf(s)
                    const isActive = stepIdx <= currentIdx
                    const isCurrent = s === detalhe.status

                    return (
                      <div key={s} className="flex items-center flex-1">
                        <div
                          className={`flex-1 text-center py-1.5 px-1 font-archivo text-xs rounded-sm ${
                            isCurrent
                              ? 'bg-dourado text-branco font-medium'
                              : isActive
                              ? 'bg-dourado/20 text-dourado'
                              : 'bg-claro/10 text-preto/40'
                          }`}
                        >
                          {statusLabels[s]}
                        </div>
                        {idx < 3 && (
                          <div
                            className={`w-3 h-px ${
                              isActive && stepIdx < currentIdx ? 'bg-dourado' : 'bg-claro/20'
                            }`}
                          />
                        )}
                      </div>
                    )
                  })}
                </div>
                {detalhe.status === 'cancelado' && (
                  <div className="mt-2 px-3 py-2 bg-red-50 border border-red-200 rounded-sm">
                    <p className="font-archivo text-xs text-red-700">Este pedido foi cancelado</p>
                  </div>
                )}
              </div>

              {/* ── Painel Melhor Envio ─────────────────────────────────────── */}
              <MelhorEnvioPanel
                pedido={detalhe}
                onSuccess={() => {
                  setDetalhe(null)
                  router.refresh()
                }}
              />

              {/* Cliente */}
              <div className="bg-branco border border-claro/20 rounded-sm p-4 space-y-1.5">
                <p className="font-archivo text-xs uppercase tracking-wider text-preto/50 mb-2">Cliente</p>
                <p className="font-archivo text-sm font-medium text-preto">{detalhe.cliente_nome}</p>
                <p className="font-archivo text-xs text-preto/70">{detalhe.cliente_email}</p>
                {detalhe.cliente_telefone && (
                  <a
                    href={`https://wa.me/55${detalhe.cliente_telefone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-archivo text-xs text-green-700 flex items-center gap-1 hover:underline"
                  >
                    📱 {detalhe.cliente_telefone} — WhatsApp
                  </a>
                )}
              </div>

              {/* Endereço */}
              <div className="bg-branco border border-claro/20 rounded-sm p-4">
                <p className="font-archivo text-xs uppercase tracking-wider text-preto/50 mb-2">
                  Endereço de Entrega
                </p>
                <p className="font-archivo text-sm text-preto/80 leading-relaxed">
                  {endereco.rua}{endereco.numero ? `, ${endereco.numero}` : ''}
                  {endereco.complemento ? `, ${endereco.complemento}` : ''}
                  {endereco.bairro || endereco.cidade ? (
                    <><br />{endereco.bairro} — {endereco.cidade}/{endereco.estado}</>
                  ) : null}
                  {endereco.cep ? <><br />CEP: {endereco.cep}</> : null}
                </p>
              </div>

              {/* Itens */}
              <div>
                <p className="font-archivo text-xs uppercase tracking-wider text-preto/50 mb-3">
                  Itens do Pedido
                </p>
                <div className="space-y-2">
                  {Array.isArray(detalhe.order_items) &&
                    detalhe.order_items.map((item: Pedido) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between py-2 border-b border-claro/10"
                      >
                        <div>
                          <p className="font-archivo text-sm text-preto">{getItemProductName(item)}</p>
                          <p className="font-archivo text-xs text-preto/50">{getItemVariantInfo(item)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-archivo text-sm text-preto">
                            {item.quantidade}x {formatCurrency(item.preco_unitario)}
                          </p>
                          <p className="font-archivo text-xs text-dourado font-medium">
                            {formatCurrency(item.quantidade * item.preco_unitario)}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Totais */}
              <div className="bg-branco border border-claro/20 rounded-sm p-4 space-y-2">
                <div className="flex justify-between font-archivo text-sm text-preto/70">
                  <span>Subtotal</span>
                  <span>{formatCurrency(detalhe.subtotal)}</span>
                </div>
                <div className="flex justify-between font-archivo text-sm text-preto/70">
                  <span>Frete</span>
                  <span>{formatCurrency(detalhe.frete)}</span>
                </div>
                <div className="flex justify-between font-archivo text-base font-semibold text-preto border-t border-claro/20 pt-2">
                  <span>Total</span>
                  <span className="text-dourado">{formatCurrency(detalhe.total)}</span>
                </div>
              </div>

              {/* Ações de status */}
              <div className="flex gap-3 pt-1">
                {statusFlow[detalhe.status as Status] && (
                  <button
                    onClick={() => handleAdvanceStatus(detalhe)}
                    disabled={advancing}
                    className="flex-1 py-2.5 bg-dourado text-branco rounded-sm font-archivo text-sm font-medium hover:bg-preto transition-colors disabled:opacity-60"
                  >
                    {advancing
                      ? 'Atualizando...'
                      : `Avançar para "${statusLabels[statusFlow[detalhe.status as Status]!]}"`}
                  </button>
                )}
                {detalhe.status !== 'cancelado' && detalhe.status !== 'entregue' && (
                  <button
                    onClick={() => handleCancel(detalhe.id)}
                    className="px-4 py-2.5 border border-red-200 text-red-600 rounded-sm font-archivo text-sm hover:bg-red-50 transition-colors"
                  >
                    Cancelar
                  </button>
                )}
              </div>

              {/* Meta: ID do envio ME */}
              {detalhe.melhor_envio_id && (
                <p className="font-mono text-xs text-preto/30 text-center">
                  ME ID: {detalhe.melhor_envio_id}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
