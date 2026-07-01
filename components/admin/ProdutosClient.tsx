'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Plus, Search, Edit, Trash2, Eye, EyeOff, Flower2 } from 'lucide-react'
import ProdutoModal from './ProdutoModal'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = Record<string, any>

function getProdutoCategoriaNome(produto: AnyRecord): string {
  const cat = produto.categories
  if (!cat) return '—'
  if (Array.isArray(cat)) return cat[0]?.nome ?? '—'
  return cat.nome ?? '—'
}

function getProdutoVarianteCount(produto: AnyRecord): number {
  const v = produto.product_variants
  if (!v) return 0
  return Array.isArray(v) ? v.length : 0
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export default function ProdutosClient({
  produtos,
  categorias,
}: {
  produtos: AnyRecord[]
  categorias: AnyRecord[]
}) {
  const [busca, setBusca] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProduto, setEditingProduto] = useState<AnyRecord | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const produtosFiltrados = produtos.filter(
    (p) =>
      String(p.nome ?? '').toLowerCase().includes(busca.toLowerCase()) ||
      getProdutoCategoriaNome(p).toLowerCase().includes(busca.toLowerCase())
  )

  const handleToggleAtivo = async (id: string, ativo: boolean) => {
    await supabase.from('products').update({ ativo: !ativo }).eq('id', id)
    router.refresh()
  }

  const handleDelete = async (id: string, nome: string) => {
    if (!confirm(`Tem certeza que deseja excluir "${nome}"? Esta ação não pode ser desfeita.`))
      return
    await supabase.from('products').delete().eq('id', id)
    router.refresh()
  }

  const handleSave = () => {
    setModalOpen(false)
    setEditingProduto(null)
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-nevoa">
      {/* Header */}
      <div className="border-b border-rosa-antigo/30 bg-marfim px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-cormorant text-3xl text-carvao italic">Produtos</h1>
            <p className="font-jost text-sm text-musgo mt-1">
              {produtos.length} produto{produtos.length !== 1 ? 's' : ''} cadastrado{produtos.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => { setEditingProduto(null); setModalOpen(true) }}
            className="flex items-center gap-2 bg-ameixa text-marfim px-5 py-2.5 font-jost text-sm font-medium hover:bg-carvao transition-colors rounded-sm"
          >
            <Plus size={16} />
            Novo Produto
          </button>
        </div>
      </div>

      <div className="p-8">
        {/* Search */}
        <div className="relative mb-6 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-carvao/40" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome ou categoria..."
            className="w-full pl-9 pr-4 py-2.5 bg-marfim border border-rosa-antigo/40 rounded-sm font-jost text-sm text-carvao placeholder-carvao/30 focus:outline-none focus:border-ameixa"
          />
        </div>

        {/* Table */}
        {produtosFiltrados.length === 0 ? (
          <div className="bg-marfim border border-rosa-antigo/30 rounded-sm p-12 text-center">
            <Flower2 size={40} className="text-rosa-antigo/40 mx-auto mb-3" />
            <p className="font-cormorant text-xl text-carvao/50 italic">
              {busca ? 'Nenhum produto encontrado' : 'Nenhum produto cadastrado'}
            </p>
            <p className="font-jost text-sm text-carvao/40 mt-1">
              {busca
                ? 'Tente outros termos de busca'
                : 'Clique em "Novo Produto" para começar'}
            </p>
          </div>
        ) : (
          <div className="bg-marfim border border-rosa-antigo/30 rounded-sm shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-rosa-antigo/20">
                  <th className="text-left px-6 py-4 font-jost text-xs uppercase tracking-wider text-carvao/50">
                    Produto
                  </th>
                  <th className="text-left px-4 py-4 font-jost text-xs uppercase tracking-wider text-carvao/50">
                    Categoria
                  </th>
                  <th className="text-left px-4 py-4 font-jost text-xs uppercase tracking-wider text-carvao/50">
                    Preço Base
                  </th>
                  <th className="text-left px-4 py-4 font-jost text-xs uppercase tracking-wider text-carvao/50">
                    Variantes
                  </th>
                  <th className="text-left px-4 py-4 font-jost text-xs uppercase tracking-wider text-carvao/50">
                    Status
                  </th>
                  <th className="text-right px-6 py-4 font-jost text-xs uppercase tracking-wider text-carvao/50">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {produtosFiltrados.map((produto) => (
                  <tr
                    key={produto.id}
                    className="border-b border-rosa-antigo/10 hover:bg-nevoa/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="font-jost text-sm font-medium text-carvao">{produto.nome}</p>
                      <p className="font-jost text-xs text-carvao/40 mt-0.5">/{produto.slug}</p>
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-jost text-xs px-2.5 py-1 bg-rosa-antigo/15 text-ameixa rounded-full">
                        {getProdutoCategoriaNome(produto)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-jost text-sm text-carvao">
                        {formatCurrency(produto.preco_base)}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-jost text-sm text-carvao">
                        {getProdutoVarianteCount(produto)} variantes
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`font-jost text-xs px-2.5 py-1 rounded-full border ${
                          produto.ativo
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : 'bg-gray-50 text-gray-500 border-gray-200'
                        }`}
                      >
                        {produto.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleAtivo(produto.id, produto.ativo)}
                          className="p-2 text-carvao/40 hover:text-ameixa hover:bg-rosa-antigo/10 rounded-sm transition-colors"
                          title={produto.ativo ? 'Desativar' : 'Ativar'}
                        >
                          {produto.ativo ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                        <button
                          onClick={() => { setEditingProduto(produto); setModalOpen(true) }}
                          className="p-2 text-carvao/40 hover:text-ameixa hover:bg-rosa-antigo/10 rounded-sm transition-colors"
                          title="Editar"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(produto.id, produto.nome)}
                          className="p-2 text-carvao/40 hover:text-red-500 hover:bg-red-50 rounded-sm transition-colors"
                          title="Excluir"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <ProdutoModal
          produto={editingProduto}
          categorias={categorias}
          onClose={() => { setModalOpen(false); setEditingProduto(null) }}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
