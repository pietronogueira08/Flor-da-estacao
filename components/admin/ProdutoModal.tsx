'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { X, Plus, Trash2 } from 'lucide-react'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = Record<string, any>

interface Variant {
  id?: string
  tamanho: string
  cor: string
  sku: string
  estoque: number
  preco_override: number | null
}

interface ProductImage {
  id?: string
  url: string
  posicao: number
  is_placeholder: boolean
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function getCategoriaNome(cat: AnyRecord | AnyRecord[] | null | undefined): string {
  if (!cat) return ''
  if (Array.isArray(cat)) return cat[0]?.nome ?? ''
  return cat.nome ?? ''
}

function getCategoriaId(cat: AnyRecord | AnyRecord[] | null | undefined): string {
  if (!cat) return ''
  if (Array.isArray(cat)) return cat[0]?.id ?? ''
  return cat.id ?? ''
}

function extractVariants(pv: unknown): Variant[] {
  if (!pv || !Array.isArray(pv)) return [{ tamanho: 'M', cor: '', sku: '', estoque: 0, preco_override: null }]
  if (pv.length === 0) return [{ tamanho: 'M', cor: '', sku: '', estoque: 0, preco_override: null }]
  return (pv as AnyRecord[]).map((v) => ({
    id: v.id,
    tamanho: v.tamanho ?? '',
    cor: v.cor ?? '',
    sku: v.sku ?? '',
    estoque: v.estoque ?? 0,
    preco_override: v.preco_override ?? null,
  }))
}

function extractImages(pi: unknown): ProductImage[] {
  if (!pi || !Array.isArray(pi)) return [{ url: '', posicao: 0, is_placeholder: true }]
  if (pi.length === 0) return [{ url: '', posicao: 0, is_placeholder: true }]
  return (pi as AnyRecord[]).map((img) => ({
    id: img.id,
    url: img.url ?? '',
    posicao: img.posicao ?? 0,
    is_placeholder: img.is_placeholder ?? true,
  }))
}

export default function ProdutoModal({
  produto,
  categorias,
  onClose,
  onSave,
}: {
  produto: AnyRecord | null
  categorias: AnyRecord[]
  onClose: () => void
  onSave: () => void
}) {
  const isEditing = !!produto
  const supabase = createClient()
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [nome, setNome] = useState(produto?.nome ?? '')
  const [slug, setSlug] = useState(produto?.slug ?? '')
  const [descricao, setDescricao] = useState(produto?.descricao ?? '')
  const [precoBase, setPrecoBase] = useState(produto?.preco_base?.toString() ?? '')
  const [categoriaId, setCategoriaId] = useState(getCategoriaId(produto?.categories))
  const [ativo, setAtivo] = useState(produto?.ativo ?? true)

  const [variants, setVariants] = useState<Variant[]>(extractVariants(produto?.product_variants))
  const [images, setImages] = useState<ProductImage[]>(extractImages(produto?.product_images))

  const handleNomeChange = (v: string) => {
    setNome(v)
    if (!isEditing) setSlug(slugify(v))
  }

  const addVariant = () => {
    setVariants([...variants, { tamanho: '', cor: '', sku: '', estoque: 0, preco_override: null }])
  }

  const removeVariant = (idx: number) => {
    setVariants(variants.filter((_, i) => i !== idx))
  }

  const updateVariant = (idx: number, field: keyof Variant, value: string | number | null) => {
    setVariants(variants.map((v, i) => (i === idx ? { ...v, [field]: value } : v)))
  }

  const addImage = () => {
    setImages([...images, { url: '', posicao: images.length, is_placeholder: true }])
  }

  const removeImage = (idx: number) => {
    setImages(images.filter((_, i) => i !== idx))
  }

  const updateImage = (idx: number, field: keyof ProductImage, value: string | number | boolean) => {
    setImages(images.map((img, i) => (i === idx ? { ...img, [field]: value } : img)))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const productData = {
        nome,
        slug,
        descricao: descricao || null,
        preco_base: parseFloat(precoBase),
        categoria_id: categoriaId || null,
        ativo,
      }

      let productId = produto?.id

      if (isEditing) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', productId)
        if (error) throw error
      } else {
        const { data, error } = await supabase
          .from('products')
          .insert(productData)
          .select('id')
          .single()
        if (error) throw error
        productId = data.id
      }

      // Salvar variantes
      const validVariants = variants.filter((v) => v.sku && v.tamanho)
      for (const variant of validVariants) {
        if (variant.id) {
          await supabase
            .from('product_variants')
            .update({
              tamanho: variant.tamanho,
              cor: variant.cor,
              sku: variant.sku,
              estoque: variant.estoque,
              preco_override: variant.preco_override,
            })
            .eq('id', variant.id)
        } else {
          await supabase.from('product_variants').insert({
            product_id: productId,
            tamanho: variant.tamanho,
            cor: variant.cor,
            sku: variant.sku,
            estoque: variant.estoque,
            preco_override: variant.preco_override,
          })
        }
      }

      // Salvar imagens
      const validImages = images.filter((img) => img.url)
      for (const img of validImages) {
        if (img.id) {
          await supabase
            .from('product_images')
            .update({ url: img.url, posicao: img.posicao, is_placeholder: img.is_placeholder })
            .eq('id', img.id)
        } else {
          await supabase.from('product_images').insert({
            product_id: productId,
            url: img.url,
            posicao: img.posicao,
            is_placeholder: img.is_placeholder,
          })
        }
      }

      router.refresh()
      onSave()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar produto')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-preto/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-branco border border-claro rounded-sm shadow-2xl m-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-claro">
          <h2 className="font-bodoni text-2xl text-preto italic">
            {isEditing ? 'Editar Produto' : 'Novo Produto'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-preto/40 hover:text-dourado hover:bg-claro/10 rounded-sm"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-sm font-archivo text-sm">
              {error}
            </div>
          )}

          {/* Informações básicas */}
          <div className="space-y-4">
            <h3 className="font-bodoni text-lg text-preto">Informações Gerais</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block font-archivo text-xs uppercase tracking-wider text-preto/60 mb-1.5">
                  Nome *
                </label>
                <input
                  value={nome}
                  onChange={(e) => handleNomeChange(e.target.value)}
                  required
                  className="w-full bg-branco border border-claro rounded-sm px-3 py-2 font-archivo text-sm text-preto focus:outline-none focus:border-dourado"
                />
              </div>

              <div>
                <label className="block font-archivo text-xs uppercase tracking-wider text-preto/60 mb-1.5">
                  Slug *
                </label>
                <input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  required
                  className="w-full bg-branco border border-claro rounded-sm px-3 py-2 font-archivo text-sm text-preto focus:outline-none focus:border-dourado"
                />
              </div>

              <div>
                <label className="block font-archivo text-xs uppercase tracking-wider text-preto/60 mb-1.5">
                  Preço Base (R$) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={precoBase}
                  onChange={(e) => setPrecoBase(e.target.value)}
                  required
                  className="w-full bg-branco border border-claro rounded-sm px-3 py-2 font-archivo text-sm text-preto focus:outline-none focus:border-dourado"
                />
              </div>

              <div>
                <label className="block font-archivo text-xs uppercase tracking-wider text-preto/60 mb-1.5">
                  Categoria
                </label>
                <select
                  value={categoriaId}
                  onChange={(e) => setCategoriaId(e.target.value)}
                  className="w-full bg-branco border border-claro rounded-sm px-3 py-2 font-archivo text-sm text-preto focus:outline-none focus:border-dourado"
                >
                  <option value="">Sem categoria</option>
                  {categorias.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="ativo"
                  checked={ativo}
                  onChange={(e) => setAtivo(e.target.checked)}
                  className="w-4 h-4 accent-dourado"
                />
                <label htmlFor="ativo" className="font-archivo text-sm text-preto">
                  Produto ativo (visível na loja)
                </label>
              </div>

              <div className="col-span-2">
                <label className="block font-archivo text-xs uppercase tracking-wider text-preto/60 mb-1.5">
                  Descrição
                </label>
                <textarea
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  rows={3}
                  className="w-full bg-branco border border-claro rounded-sm px-3 py-2 font-archivo text-sm text-preto focus:outline-none focus:border-dourado resize-none"
                />
              </div>
            </div>
          </div>

          {/* Variantes */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bodoni text-lg text-preto">Variantes</h3>
              <button
                type="button"
                onClick={addVariant}
                className="flex items-center gap-1 font-archivo text-xs text-dourado hover:text-preto"
              >
                <Plus size={14} /> Adicionar
              </button>
            </div>

            <div className="space-y-2">
              {variants.map((variant, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-5 gap-2 p-3 bg-branco border border-claro/20 rounded-sm"
                >
                  <input
                    placeholder="Tamanho"
                    value={variant.tamanho}
                    onChange={(e) => updateVariant(idx, 'tamanho', e.target.value)}
                    className="col-span-1 bg-branco border border-claro rounded-sm px-2 py-1.5 font-archivo text-xs text-preto focus:outline-none focus:border-dourado"
                  />
                  <input
                    placeholder="Cor"
                    value={variant.cor}
                    onChange={(e) => updateVariant(idx, 'cor', e.target.value)}
                    className="col-span-1 bg-branco border border-claro rounded-sm px-2 py-1.5 font-archivo text-xs text-preto focus:outline-none focus:border-dourado"
                  />
                  <input
                    placeholder="SKU"
                    value={variant.sku}
                    onChange={(e) => updateVariant(idx, 'sku', e.target.value)}
                    className="col-span-1 bg-branco border border-claro rounded-sm px-2 py-1.5 font-archivo text-xs text-preto focus:outline-none focus:border-dourado"
                  />
                  <input
                    type="number"
                    placeholder="Estoque"
                    value={variant.estoque}
                    onChange={(e) => updateVariant(idx, 'estoque', parseInt(e.target.value) || 0)}
                    className="col-span-1 bg-branco border border-claro rounded-sm px-2 py-1.5 font-archivo text-xs text-preto focus:outline-none focus:border-dourado"
                  />
                  <button
                    type="button"
                    onClick={() => removeVariant(idx)}
                    disabled={variants.length === 1}
                    className="flex items-center justify-center text-preto/30 hover:text-red-400 disabled:opacity-20"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Imagens */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bodoni text-lg text-preto">Imagens</h3>
              <button
                type="button"
                onClick={addImage}
                className="flex items-center gap-1 font-archivo text-xs text-dourado hover:text-preto"
              >
                <Plus size={14} /> Adicionar
              </button>
            </div>

            <div className="space-y-2">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-3 bg-branco border border-claro/20 rounded-sm"
                >
                  <input
                    placeholder="URL da imagem"
                    value={img.url}
                    onChange={(e) => updateImage(idx, 'url', e.target.value)}
                    className="flex-1 bg-branco border border-claro rounded-sm px-2 py-1.5 font-archivo text-xs text-preto focus:outline-none focus:border-dourado"
                  />
                  <label className="flex items-center gap-1 font-archivo text-xs text-preto/60">
                    <input
                      type="checkbox"
                      checked={img.is_placeholder}
                      onChange={(e) => updateImage(idx, 'is_placeholder', e.target.checked)}
                      className="accent-dourado"
                    />
                    Placeholder
                  </label>
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    disabled={images.length === 1}
                    className="text-preto/30 hover:text-red-400 disabled:opacity-20"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-claro/20">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 font-archivo text-sm text-preto/60 hover:text-preto border border-claro rounded-sm hover:border-claro transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 font-archivo text-sm font-medium bg-dourado text-branco rounded-sm hover:bg-preto transition-colors disabled:opacity-60"
            >
              {loading ? 'Salvando...' : isEditing ? 'Salvar Alterações' : 'Criar Produto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Export dummy to prevent unused import warning
export { getCategoriaNome }
