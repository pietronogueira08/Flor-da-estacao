'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Search, AlertTriangle, X, Flower2 } from 'lucide-react'
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
    <div className="min-h-screen bg-nevoa">
      {/* Header */}
      <div className="border-b border-rosa-antigo/30 bg-marfim px-8 py-6">
        <h1 className="font-cormorant text-3xl text-carvao italic">Estoque</h1>
        <p className="font-jost text-sm text-musgo mt-1">
          {variantes.filter((v) => (v.estoque ?? 0) <= 3).length} variantes com estoque baixo
        </p>
      </div>

      <div className="p-8">
        {/* Tabs */}
        <div className="flex gap-1 bg-marfim border border-rosa-antigo/30 rounded-sm p-1 mb-6 w-fit">
          {(['estoque', 'historico'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 font-jost text-sm rounded-sm transition-colors ${
                tab === t
                  ? 'bg-ameixa text-marfim font-medium'
                  : 'text-carvao/60 hover:text-ameixa'
              }`}
            >
              {t === 'estoque' ? 'Estoque Atual' : 'Histórico'}
            </button>
          ))}
        </div>

        {tab === 'estoque' && (
          <>
            <div className="relative mb-6 max-w-md">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-carvao/40" />
              <input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar por produto, SKU, tamanho..."
                className="w-full pl-9 pr-4 py-2.5 bg-marfim border border-rosa-antigo/40 rounded-sm font-jost text-sm text-carvao placeholder-carvao/30 focus:outline-none focus:border-ameixa"
              />
            </div>

            {variantesFiltradas.length === 0 ? (
              <div className="bg-marfim border border-rosa-antigo/30 rounded-sm p-12 text-center">
                <Flower2 size={40} className="text-rosa-antigo/40 mx-auto mb-3" />
                <p className="font-cormorant text-xl text-carvao/50 italic">
                  Nenhuma variante encontrada
                </p>
              </div>
            ) : (
              <div className="bg-marfim border border-rosa-antigo/30 rounded-sm shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-rosa-antigo/20">
                      {['Produto', 'SKU', 'Tamanho', 'Cor', 'Estoque', 'Ações'].map((h) => (
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
                    {variantesFiltradas.map((v) => (
                      <tr
                        key={v.id}
                        className={`border-b border-rosa-antigo/10 hover:bg-nevoa/50 transition-colors ${
                          (v.estoque ?? 0) <= 3 ? 'bg-red-50/30' : ''
                        }`}
                      >
                        <td className="px-5 py-3">
                          <p className="font-jost text-sm text-carvao">{getVarianteProdutoNome(v)}</p>
                        </td>
                        <td className="px-5 py-3">
                          <code className="font-mono text-xs text-carvao/70 bg-nevoa px-1.5 py-0.5 rounded">
                            {v.sku}
                          </code>
                        </td>
                        <td className="px-5 py-3">
                          <span className="font-jost text-sm text-carvao">{v.tamanho}</span>
                        </td>
                        <td className="px-5 py-3">
                          <span className="font-jost text-sm text-carvao">{v.cor}</span>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            {(v.estoque ?? 0) <= 3 && (
                              <AlertTriangle size={14} className="text-red-500" />
                            )}
                            <span
                              className={`font-jost text-sm font-medium ${
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
                            className="font-jost text-xs px-3 py-1.5 border border-ameixa/40 text-ameixa hover:bg-ameixa hover:text-marfim rounded-sm transition-colors"
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
                className="w-full bg-marfim border border-rosa-antigo/40 rounded-sm px-3 py-2 font-jost text-sm text-carvao focus:outline-none focus:border-ameixa"
              >
                <option value="">Todas as variantes</option>
                {variantes.map((v) => (
                  <option key={v.id} value={v.id}>
                    {getVarianteProdutoNome(v)} — {v.tamanho} {v.cor}
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-marfim border border-rosa-antigo/30 rounded-sm shadow-sm overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-rosa-antigo/20">
                    {['Data', 'Produto', 'SKU', 'Variação', 'Motivo'].map((h) => (
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
                  {movimentosFiltrados.map((m) => {
                    const pv = m.product_variants
                    const variant = Array.isArray(pv) ? pv[0] : pv
                    return (
                      <tr
                        key={m.id}
                        className="border-b border-rosa-antigo/10 hover:bg-nevoa/50 transition-colors"
                      >
                        <td className="px-5 py-3">
                          <p className="font-jost text-xs text-carvao/60">
                            {format(new Date(m.criado_em), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </p>
                        </td>
                        <td className="px-5 py-3">
                          <p className="font-jost text-sm text-carvao">
                            {getMovimentoProdutoNome(m)}
                          </p>
                        </td>
                        <td className="px-5 py-3">
                          <code className="font-mono text-xs text-carvao/70">
                            {variant?.sku ?? '—'}
                          </code>
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={`font-jost text-sm font-semibold ${
                              m.variacao_qtd > 0 ? 'text-green-600' : 'text-red-600'
                            }`}
                          >
                            {m.variacao_qtd > 0 ? '+' : ''}{m.variacao_qtd}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <p className="font-jost text-sm text-carvao/70">{m.motivo}</p>
                        </td>
                      </tr>
                    )
                  })}
                  {movimentosFiltrados.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-5 py-12 text-center">
                        <p className="font-jost text-sm text-carvao/40">
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
          <div className="absolute inset-0 bg-carvao/40 backdrop-blur-sm" onClick={() => setAdjustModal(null)} />
          <div className="relative w-full max-w-sm bg-marfim border border-rosa-antigo/40 rounded-sm shadow-2xl m-4 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-cormorant text-xl text-carvao italic">Ajustar Estoque</h2>
              <button onClick={() => setAdjustModal(null)} className="text-carvao/40 hover:text-ameixa">
                <X size={20} />
              </button>
            </div>

            <div className="bg-nevoa border border-rosa-antigo/20 rounded-sm p-3 mb-5">
              <p className="font-jost text-sm font-medium text-carvao">{getVarianteProdutoNome(adjustModal)}</p>
              <p className="font-jost text-xs text-carvao/60 mt-0.5">
                {adjustModal.tamanho} · {adjustModal.cor} · <code className="font-mono">{adjustModal.sku}</code>
              </p>
              <p className="font-jost text-sm mt-2">
                Estoque atual:{' '}
                <span className={`font-medium ${(adjustModal.estoque ?? 0) <= 3 ? 'text-red-600' : 'text-green-700'}`}>
                  {adjustModal.estoque} un.
                </span>
              </p>
            </div>

            <form onSubmit={handleAdjust} className="space-y-4">
              <div>
                <label className="block font-jost text-xs uppercase tracking-wider text-carvao/60 mb-1.5">
                  Quantidade (use negativo para retirar)
                </label>
                <input
                  type="number"
                  value={quantidade}
                  onChange={(e) => setQuantidade(e.target.value)}
                  required
                  placeholder="Ex: +5 ou -3"
                  className="w-full bg-nevoa border border-rosa-antigo/40 rounded-sm px-3 py-2 font-jost text-sm text-carvao focus:outline-none focus:border-ameixa"
                />
                {quantidade && !isNaN(parseInt(quantidade)) && (
                  <p className="font-jost text-xs text-musgo mt-1">
                    Novo estoque: {(adjustModal.estoque ?? 0) + parseInt(quantidade)} un.
                  </p>
                )}
              </div>

              <div>
                <label className="block font-jost text-xs uppercase tracking-wider text-carvao/60 mb-1.5">
                  Motivo
                </label>
                <input
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder="Ex: Reposição, ajuste inventário..."
                  className="w-full bg-nevoa border border-rosa-antigo/40 rounded-sm px-3 py-2 font-jost text-sm text-carvao focus:outline-none focus:border-ameixa"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAdjustModal(null)}
                  className="flex-1 py-2.5 border border-rosa-antigo/30 rounded-sm font-jost text-sm text-carvao/60 hover:border-rosa-antigo"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 bg-ameixa text-marfim rounded-sm font-jost text-sm font-medium hover:bg-carvao transition-colors disabled:opacity-60"
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
