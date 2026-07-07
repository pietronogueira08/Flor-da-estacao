'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Search, AlertTriangle, X, Gem } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// Usando tipos mais flexíveis para compatibilidade com retorno do Supabase
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Variante = Record<string, any>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Movimento = Record<string, any>

function getVarianteProdutoNome(v: Variante): string {
  const p = v.products
  if (!p) return '—'
  if (Array.isArray(p)) return p[0]?.nome ?? '—'
  return p.nome ?? '—'
}

function getMovimentoProdutoNome(m: Movimento): string {
  const pv = m.product_variants
  if (!pv) return '—'
  const variant = Array.isArray(pv) ? pv[0] : pv
  const prod = variant?.products
  if (!prod) return '—'
  if (Array.isArray(prod)) return prod[0]?.nome ?? '—'
  return prod.nome ?? '—'
}

export default function EstoqueClient({
  variantes,
  movimentos,
}: {
  variantes: Variante[]
  movimentos: Movimento[]
}) {
  const [busca, setBusca] = useState('')
  const [adjustModal, setAdjustModal] = useState<Variante | null>(null)
  const [quantidade, setQuantidade] = useState('')
  const [motivo, setMotivo] = useState('')
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState<'estoque' | 'historico'>('estoque')
  const [filtroVariante, setFiltroVariante] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const variantesFiltradas = variantes.filter(
    (v) =>
      getVarianteProdutoNome(v).toLowerCase().includes(busca.toLowerCase()) ||
      String(v.sku).toLowerCase().includes(busca.toLowerCase()) ||
      String(v.tamanho).toLowerCase().includes(busca.toLowerCase()) ||
      String(v.cor).toLowerCase().includes(busca.toLowerCase())
  )

  const movimentosFiltrados = filtroVariante
    ? movimentos.filter((m) => {
        const pv = m.product_variants
        const variant = Array.isArray(pv) ? pv[0] : pv
        return variant?.id === filtroVariante
      })
    : movimentos

  const handleAdjust = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!adjustModal) return
    setLoading(true)

    const qtd = parseInt(quantidade)
    if (isNaN(qtd)) { setLoading(false); return }

    const novoEstoque = (adjustModal.estoque ?? 0) + qtd

    await supabase
      .from('product_variants')
      .update({ estoque: novoEstoque })
      .eq('id', adjustModal.id)

    await supabase.from('stock_movements').insert({
      variant_id: adjustModal.id,
      variacao_qtd: qtd,
      motivo: motivo || 'Ajuste manual',
    })

    setAdjustModal(null)
    setQuantidade('')
    setMotivo('')
    setLoading(false)
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-branco">
      {/* Header */}
      <div className="border-b border-claro bg-branco px-8 py-6">
        <h1 className="font-bodoni text-3xl text-preto italic">Estoque</h1>
        <p className="font-archivo text-sm text-zaya mt-1">
          {variantes.filter((v) => (v.estoque ?? 0) <= 3).length} variantes com estoque baixo
        </p>
      </div>

      <div className="p-8">
        {/* Tabs */}
        <div className="flex gap-1 bg-branco border border-claro rounded-sm p-1 mb-6 w-fit">
          {(['estoque', 'historico'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 font-archivo text-sm rounded-sm transition-colors ${
                tab === t
                  ? 'bg-dourado text-branco font-medium'
                  : 'text-preto/60 hover:text-dourado'
              }`}
            >
              {t === 'estoque' ? 'Estoque Atual' : 'Histórico'}
            </button>
          ))}
        </div>

        {tab === 'estoque' && (
          <>
            <div className="relative mb-6 max-w-md">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-preto/40" />
              <input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar por produto, SKU, tamanho..."
                className="w-full pl-9 pr-4 py-2.5 bg-branco border border-claro rounded-sm font-archivo text-sm text-preto placeholder-preto/30 focus:outline-none focus:border-dourado"
              />
            </div>

            {variantesFiltradas.length === 0 ? (
              <div className="bg-branco border border-claro rounded-sm p-12 text-center">
                <Gem size={40} className="text-claro/40 mx-auto mb-3" />
                <p className="font-bodoni text-xl text-preto/50 italic">
                  Nenhuma variante encontrada
                </p>
              </div>
            ) : (
              <div className="bg-branco border border-claro rounded-sm shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-claro/20">
                      {['Produto', 'SKU', 'Tamanho', 'Cor', 'Estoque', 'Ações'].map((h) => (
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
                    {variantesFiltradas.map((v) => (
                      <tr
                        key={v.id}
                        className={`border-b border-claro/10 hover:bg-branco/50 transition-colors ${
                          (v.estoque ?? 0) <= 3 ? 'bg-red-50/30' : ''
                        }`}
                      >
                        <td className="px-5 py-3">
                          <p className="font-archivo text-sm text-preto">{getVarianteProdutoNome(v)}</p>
                        </td>
                        <td className="px-5 py-3">
                          <code className="font-mono text-xs text-preto/70 bg-branco px-1.5 py-0.5 rounded">
                            {v.sku}
                          </code>
                        </td>
                        <td className="px-5 py-3">
                          <span className="font-archivo text-sm text-preto">{v.tamanho}</span>
                        </td>
                        <td className="px-5 py-3">
                          <span className="font-archivo text-sm text-preto">{v.cor}</span>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            {(v.estoque ?? 0) <= 3 && (
                              <AlertTriangle size={14} className="text-red-500" />
                            )}
                            <span
                              className={`font-archivo text-sm font-medium ${
                                v.estoque === 0
                                  ? 'text-red-600'
                                  : (v.estoque ?? 0) <= 3
                                  ? 'text-orange-600'
                                  : 'text-green-700'
                              }`}
                            >
                              {v.estoque} un.
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <button
                            onClick={() => setAdjustModal(v)}
                            className="font-archivo text-xs px-3 py-1.5 border border-dourado/40 text-dourado hover:bg-dourado hover:text-branco rounded-sm transition-colors"
                          >
                            Ajustar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {tab === 'historico' && (
          <>
            <div className="mb-4 max-w-xs">
              <select
                value={filtroVariante}
                onChange={(e) => setFiltroVariante(e.target.value)}
                className="w-full bg-branco border border-claro rounded-sm px-3 py-2 font-archivo text-sm text-preto focus:outline-none focus:border-dourado"
              >
                <option value="">Todas as variantes</option>
                {variantes.map((v) => (
                  <option key={v.id} value={v.id}>
                    {getVarianteProdutoNome(v)} — {v.tamanho} {v.cor}
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-branco border border-claro rounded-sm shadow-sm overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-claro/20">
                    {['Data', 'Produto', 'SKU', 'Variação', 'Motivo'].map((h) => (
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
                  {movimentosFiltrados.map((m) => {
                    const pv = m.product_variants
                    const variant = Array.isArray(pv) ? pv[0] : pv
                    return (
                      <tr
                        key={m.id}
                        className="border-b border-claro/10 hover:bg-branco/50 transition-colors"
                      >
                        <td className="px-5 py-3">
                          <p className="font-archivo text-xs text-preto/60">
                            {format(new Date(m.criado_em), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </p>
                        </td>
                        <td className="px-5 py-3">
                          <p className="font-archivo text-sm text-preto">
                            {getMovimentoProdutoNome(m)}
                          </p>
                        </td>
                        <td className="px-5 py-3">
                          <code className="font-mono text-xs text-preto/70">
                            {variant?.sku ?? '—'}
                          </code>
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={`font-archivo text-sm font-semibold ${
                              m.variacao_qtd > 0 ? 'text-green-600' : 'text-red-600'
                            }`}
                          >
                            {m.variacao_qtd > 0 ? '+' : ''}{m.variacao_qtd}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <p className="font-archivo text-sm text-preto/70">{m.motivo}</p>
                        </td>
                      </tr>
                    )
                  })}
                  {movimentosFiltrados.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-5 py-12 text-center">
                        <p className="font-archivo text-sm text-preto/40">
                          Nenhum movimento registrado
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Adjust Modal */}
      {adjustModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-preto/40 backdrop-blur-sm" onClick={() => setAdjustModal(null)} />
          <div className="relative w-full max-w-sm bg-branco border border-claro rounded-sm shadow-2xl m-4 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bodoni text-xl text-preto italic">Ajustar Estoque</h2>
              <button onClick={() => setAdjustModal(null)} className="text-preto/40 hover:text-dourado">
                <X size={20} />
              </button>
            </div>

            <div className="bg-branco border border-claro/20 rounded-sm p-3 mb-5">
              <p className="font-archivo text-sm font-medium text-preto">{getVarianteProdutoNome(adjustModal)}</p>
              <p className="font-archivo text-xs text-preto/60 mt-0.5">
                {adjustModal.tamanho} · {adjustModal.cor} · <code className="font-mono">{adjustModal.sku}</code>
              </p>
              <p className="font-archivo text-sm mt-2">
                Estoque atual:{' '}
                <span className={`font-medium ${(adjustModal.estoque ?? 0) <= 3 ? 'text-red-600' : 'text-green-700'}`}>
                  {adjustModal.estoque} un.
                </span>
              </p>
            </div>

            <form onSubmit={handleAdjust} className="space-y-4">
              <div>
                <label className="block font-archivo text-xs uppercase tracking-wider text-preto/60 mb-1.5">
                  Quantidade (use negativo para retirar)
                </label>
                <input
                  type="number"
                  value={quantidade}
                  onChange={(e) => setQuantidade(e.target.value)}
                  required
                  placeholder="Ex: +5 ou -3"
                  className="w-full bg-branco border border-claro rounded-sm px-3 py-2 font-archivo text-sm text-preto focus:outline-none focus:border-dourado"
                />
                {quantidade && !isNaN(parseInt(quantidade)) && (
                  <p className="font-archivo text-xs text-zaya mt-1">
                    Novo estoque: {(adjustModal.estoque ?? 0) + parseInt(quantidade)} un.
                  </p>
                )}
              </div>

              <div>
                <label className="block font-archivo text-xs uppercase tracking-wider text-preto/60 mb-1.5">
                  Motivo
                </label>
                <input
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder="Ex: Reposição, ajuste inventário..."
                  className="w-full bg-branco border border-claro rounded-sm px-3 py-2 font-archivo text-sm text-preto focus:outline-none focus:border-dourado"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAdjustModal(null)}
                  className="flex-1 py-2.5 border border-claro rounded-sm font-archivo text-sm text-preto/60 hover:border-claro"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 bg-dourado text-branco rounded-sm font-archivo text-sm font-medium hover:bg-preto transition-colors disabled:opacity-60"
                >
                  {loading ? 'Salvando...' : 'Confirmar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
