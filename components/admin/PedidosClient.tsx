'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { X, ChevronRight, Flower2 } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// Usando any para compatibilidade com o retorno do Supabase em queries aninhadas
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Pedido = Record<string, any>

type Status = 'pendente' | 'pago' | 'enviado' | 'entregue' | 'cancelado'

const statusColors: Record<Status, string> = {
  pendente:  'bg-yellow-100 text-yellow-800 border-yellow-200',
  pago:      'bg-blue-100 text-blue-800 border-blue-200',
  enviado:   'bg-purple-100 text-purple-800 border-purple-200',
  entregue:  'bg-green-100 text-green-800 border-green-200',
  cancelado: 'bg-red-100 text-red-800 border-red-200',
}

const statusLabels: Record<Status, string> = {
  pendente:  'Pendente',
  pago:      'Pago',
  enviado:   'Enviado',
  entregue:  'Entregue',
  cancelado: 'Cancelado',
}

const statusFlow: Partial<Record<Status, Status>> = {
  pendente: 'pago',
  pago:     'enviado',
  enviado:  'entregue',
}

const ALL_STATUSES: Status[] = ['pendente', 'pago', 'enviado', 'entregue', 'cancelado']

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

// Helper para obter nome do produto de um item
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
  return `${variant.tamanho ?? ''} · ${variant.cor ?? ''} · ${variant.sku ?? ''}`
}

export default function PedidosClient({ pedidos }: { pedidos: Pedido[] }) {
  const [filtroStatus, setFiltroStatus] = useState<Status | 'todos'>('todos')
  const [detalhe, setDetalhe] = useState<Pedido | null>(null)
  const [advancing, setAdvancing] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const pedidosFiltrados =
    filtroStatus === 'todos'
      ? pedidos
      : pedidos.filter((p) => p.status === filtroStatus)

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

  return (
    <div className="min-h-screen bg-nevoa">
      {/* Header */}
      <div className="border-b border-rosa-antigo/30 bg-marfim px-8 py-6">
        <h1 className="font-cormorant text-3xl text-carvao italic">Pedidos</h1>
        <p className="font-jost text-sm text-musgo mt-1">
          {pedidos.length} pedido{pedidos.length !== 1 ? 's' : ''} no total
        </p>
      </div>

      <div className="p-8">
        {/* Status Filter */}
        <div className="flex gap-2 flex-wrap mb-6">
          <button
            onClick={() => setFiltroStatus('todos')}
            className={`px-4 py-2 font-jost text-sm rounded-sm border transition-colors ${
              filtroStatus === 'todos'
                ? 'bg-ameixa text-marfim border-ameixa'
                : 'bg-marfim text-carvao/60 border-rosa-antigo/30 hover:border-ameixa'
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
                className={`px-4 py-2 font-jost text-sm rounded-sm border transition-colors ${
                  filtroStatus === s
                    ? 'bg-ameixa text-marfim border-ameixa'
                    : 'bg-marfim text-carvao/60 border-rosa-antigo/30 hover:border-ameixa'
                }`}
              >
                {statusLabels[s]} ({count})
              </button>
            )
          })}
        </div>

        {/* Table */}
        {pedidosFiltrados.length === 0 ? (
          <div className="bg-marfim border border-rosa-antigo/30 rounded-sm p-12 text-center">
            <Flower2 size={40} className="text-rosa-antigo/40 mx-auto mb-3" />
            <p className="font-cormorant text-xl text-carvao/50 italic">Nenhum pedido encontrado</p>
          </div>
        ) : (
          <div className="bg-marfim border border-rosa-antigo/30 rounded-sm shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-rosa-antigo/20">
                  {['Cliente', 'Data', 'Itens', 'Total', 'Status', ''].map((h) => (
                    <th
                      key={h}
                      className="text-left px-5 py-4 font-jost text-xs uppercase tracking-wider text-carvao/50"
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
                    className="border-b border-rosa-antigo/10 hover:bg-nevoa/50 transition-colors cursor-pointer"
                    onClick={() => setDetalhe(pedido)}
                  >
                    <td className="px-5 py-3">
                      <p className="font-jost text-sm font-medium text-carvao">{pedido.cliente_nome}</p>
                      <p className="font-jost text-xs text-carvao/50">{pedido.cliente_email}</p>
                    </td>
                    <td className="px-5 py-3">
                      <p className="font-jost text-xs text-carvao/70">
                        {format(new Date(pedido.criado_em), 'dd/MM/yyyy', { locale: ptBR })}
                      </p>
                      <p className="font-jost text-xs text-carvao/40">
                        {format(new Date(pedido.criado_em), 'HH:mm', { locale: ptBR })}
                      </p>
                    </td>
                    <td className="px-5 py-3">
                      <p className="font-jost text-sm text-carvao">
                        {Array.isArray(pedido.order_items) ? pedido.order_items.length : 0} item(s)
                      </p>
                    </td>
                    <td className="px-5 py-3">
                      <p className="font-jost text-sm font-medium text-carvao">
                        {formatCurrency(pedido.total)}
                      </p>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`font-jost text-xs px-2.5 py-1 rounded-full border ${
                          statusColors[pedido.status as Status] ?? 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {statusLabels[pedido.status as Status] ?? pedido.status}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <ChevronRight size={16} className="text-carvao/30" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {detalhe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-carvao/40 backdrop-blur-sm" onClick={() => setDetalhe(null)} />
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-marfim border border-rosa-antigo/40 rounded-sm shadow-2xl m-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-rosa-antigo/30">
              <div>
                <h2 className="font-cormorant text-2xl text-carvao italic">Detalhes do Pedido</h2>
                <p className="font-mono text-xs text-carvao/40 mt-0.5">#{String(detalhe.id).slice(0, 8).toUpperCase()}</p>
              </div>
              <button onClick={() => setDetalhe(null)} className="text-carvao/40 hover:text-ameixa">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status timeline */}
              <div>
                <p className="font-jost text-xs uppercase tracking-wider text-carvao/50 mb-3">
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
                          className={`flex-1 text-center py-1.5 px-1 font-jost text-xs rounded-sm ${
                            isCurrent
                              ? 'bg-ameixa text-marfim font-medium'
                              : isActive
                              ? 'bg-ameixa/20 text-ameixa'
                              : 'bg-rosa-antigo/10 text-carvao/40'
                          }`}
                        >
                          {statusLabels[s]}
                        </div>
                        {idx < 3 && (
                          <div className={`w-3 h-px ${isActive && stepIdx < currentIdx ? 'bg-ameixa' : 'bg-rosa-antigo/20'}`} />
                        )}
                      </div>
                    )
                  })}
                </div>
                {detalhe.status === 'cancelado' && (
                  <div className="mt-2 px-3 py-2 bg-red-50 border border-red-200 rounded-sm">
                    <p className="font-jost text-xs text-red-700">Este pedido foi cancelado</p>
                  </div>
                )}
              </div>

              {/* Cliente */}
              <div className="bg-nevoa border border-rosa-antigo/20 rounded-sm p-4 space-y-1.5">
                <p className="font-jost text-xs uppercase tracking-wider text-carvao/50 mb-2">Cliente</p>
                <p className="font-jost text-sm font-medium text-carvao">{detalhe.cliente_nome}</p>
                <p className="font-jost text-xs text-carvao/70">{detalhe.cliente_email}</p>
                {detalhe.cliente_telefone && (
                  <p className="font-jost text-xs text-carvao/70">{detalhe.cliente_telefone}</p>
                )}
              </div>

              {/* Endereço */}
              <div className="bg-nevoa border border-rosa-antigo/20 rounded-sm p-4">
                <p className="font-jost text-xs uppercase tracking-wider text-carvao/50 mb-2">Endereço de Entrega</p>
                <p className="font-jost text-sm text-carvao/80 leading-relaxed">
                  {endereco.rua}{endereco.numero ? `, ${endereco.numero}` : ''}
                  {endereco.complemento ? `, ${endereco.complemento}` : ''}
                  {endereco.bairro || endereco.cidade ? <><br />{endereco.bairro} — {endereco.cidade}/{endereco.estado}</> : null}
                  {endereco.cep ? <><br />CEP: {endereco.cep}</> : null}
                </p>
              </div>

              {/* Itens */}
              <div>
                <p className="font-jost text-xs uppercase tracking-wider text-carvao/50 mb-3">Itens do Pedido</p>
                <div className="space-y-2">
                  {Array.isArray(detalhe.order_items) && detalhe.order_items.map((item: Pedido) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between py-2 border-b border-rosa-antigo/10"
                    >
                      <div>
                        <p className="font-jost text-sm text-carvao">{getItemProductName(item)}</p>
                        <p className="font-jost text-xs text-carvao/50">{getItemVariantInfo(item)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-jost text-sm text-carvao">
                          {item.quantidade}x {formatCurrency(item.preco_unitario)}
                        </p>
                        <p className="font-jost text-xs text-ameixa font-medium">
                          {formatCurrency(item.quantidade * item.preco_unitario)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totais */}
              <div className="bg-nevoa border border-rosa-antigo/20 rounded-sm p-4 space-y-2">
                <div className="flex justify-between font-jost text-sm text-carvao/70">
                  <span>Subtotal</span>
                  <span>{formatCurrency(detalhe.subtotal)}</span>
                </div>
                <div className="flex justify-between font-jost text-sm text-carvao/70">
                  <span>Frete</span>
                  <span>{formatCurrency(detalhe.frete)}</span>
                </div>
                <div className="flex justify-between font-jost text-base font-semibold text-carvao border-t border-rosa-antigo/20 pt-2">
                  <span>Total</span>
                  <span className="text-ameixa">{formatCurrency(detalhe.total)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                {statusFlow[detalhe.status as Status] && (
                  <button
                    onClick={() => handleAdvanceStatus(detalhe)}
                    disabled={advancing}
                    className="flex-1 py-2.5 bg-ameixa text-marfim rounded-sm font-jost text-sm font-medium hover:bg-carvao transition-colors disabled:opacity-60"
                  >
                    {advancing
                      ? 'Atualizando...'
                      : `Avançar para "${statusLabels[statusFlow[detalhe.status as Status]!]}"`}
                  </button>
                )}
                {detalhe.status !== 'cancelado' && detalhe.status !== 'entregue' && (
                  <button
                    onClick={() => handleCancel(detalhe.id)}
                    className="px-4 py-2.5 border border-red-200 text-red-600 rounded-sm font-jost text-sm hover:bg-red-50 transition-colors"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
