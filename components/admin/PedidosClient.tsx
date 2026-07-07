'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { X, ChevronRight, Gem } from 'lucide-react'
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
    <div className="min-h-screen bg-branco">
      {/* Header */}
      <div className="border-b border-claro bg-branco px-8 py-6">
        <h1 className="font-bodoni text-3xl text-preto italic">Pedidos</h1>
        <p className="font-archivo text-sm text-zaya mt-1">
          {pedidos.length} pedido{pedidos.length !== 1 ? 's' : ''} no total
        </p>
      </div>

      <div className="p-8">
        {/* Status Filter */}
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

        {/* Table */}
        {pedidosFiltrados.length === 0 ? (
          <div className="bg-branco border border-claro rounded-sm p-12 text-center">
            <Gem size={40} className="text-claro/40 mx-auto mb-3" />
            <p className="font-bodoni text-xl text-preto/50 italic">Nenhum pedido encontrado</p>
          </div>
        ) : (
          <div className="bg-branco border border-claro rounded-sm shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-claro/20">
                  {['Cliente', 'Data', 'Itens', 'Total', 'Status', ''].map((h) => (
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
                    className="border-b border-claro/10 hover:bg-branco/50 transition-colors cursor-pointer"
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
        )}
      </div>

      {/* Order Detail Modal */}
      {detalhe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-preto/40 backdrop-blur-sm" onClick={() => setDetalhe(null)} />
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-branco border border-claro rounded-sm shadow-2xl m-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-claro">
              <div>
                <h2 className="font-bodoni text-2xl text-preto italic">Detalhes do Pedido</h2>
                <p className="font-mono text-xs text-preto/40 mt-0.5">#{String(detalhe.id).slice(0, 8).toUpperCase()}</p>
              </div>
              <button onClick={() => setDetalhe(null)} className="text-preto/40 hover:text-dourado">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
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
                          <div className={`w-3 h-px ${isActive && stepIdx < currentIdx ? 'bg-dourado' : 'bg-claro/20'}`} />
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

              {/* Cliente */}
              <div className="bg-branco border border-claro/20 rounded-sm p-4 space-y-1.5">
                <p className="font-archivo text-xs uppercase tracking-wider text-preto/50 mb-2">Cliente</p>
                <p className="font-archivo text-sm font-medium text-preto">{detalhe.cliente_nome}</p>
                <p className="font-archivo text-xs text-preto/70">{detalhe.cliente_email}</p>
                {detalhe.cliente_telefone && (
                  <p className="font-archivo text-xs text-preto/70">{detalhe.cliente_telefone}</p>
                )}
              </div>

              {/* Endereço */}
              <div className="bg-branco border border-claro/20 rounded-sm p-4">
                <p className="font-archivo text-xs uppercase tracking-wider text-preto/50 mb-2">Endereço de Entrega</p>
                <p className="font-archivo text-sm text-preto/80 leading-relaxed">
                  {endereco.rua}{endereco.numero ? `, ${endereco.numero}` : ''}
                  {endereco.complemento ? `, ${endereco.complemento}` : ''}
                  {endereco.bairro || endereco.cidade ? <><br />{endereco.bairro} — {endereco.cidade}/{endereco.estado}</> : null}
                  {endereco.cep ? <><br />CEP: {endereco.cep}</> : null}
                </p>
              </div>

              {/* Itens */}
              <div>
                <p className="font-archivo text-xs uppercase tracking-wider text-preto/50 mb-3">Itens do Pedido</p>
                <div className="space-y-2">
                  {Array.isArray(detalhe.order_items) && detalhe.order_items.map((item: Pedido) => (
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

              {/* Actions */}
              <div className="flex gap-3 pt-2">
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
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
