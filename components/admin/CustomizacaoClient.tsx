'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Upload, Trash2, Image as ImageIcon, Save } from 'lucide-react'
import Image from 'next/image'

export default function CustomizacaoClient({ settings }: { settings: any }) {
  const router = useRouter()
  const supabase = createClient()

  const [heroImages, setHeroImages] = useState<string[]>(settings?.hero_images || [])
  const [instagramImages, setInstagramImages] = useState<any[]>(settings?.instagram_images || [])
  const [instagramLinkInput, setInstagramLinkInput] = useState('')
  const [loadingIgLink, setLoadingIgLink] = useState(false)

  const handleAddInstagramLink = async () => {
    if (!instagramLinkInput) return
    setLoadingIgLink(true)
    setError(null)
    setSuccess(false)
    try {
      const res = await fetch(`https://api.microlink.io?url=${encodeURIComponent(instagramLinkInput)}`)
      const data = await res.json()
      if (data?.data?.image?.url) {
        setInstagramImages([...instagramImages, { src: data.data.image.url, link: instagramLinkInput }])
        setInstagramLinkInput('')
      } else {
        throw new Error("Não foi possível carregar o preview. Tente novamente ou use o upload manual.")
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar preview do link.')
    } finally {
      setLoadingIgLink(false)
    }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'hero' | 'instagram') => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    setError(null)
    setSuccess(false)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${type}-${Math.random().toString(36).substring(2)}.${fileExt}`
      
      const { data, error: uploadError } = await supabase.storage
        .from('store-assets')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('store-assets')
        .getPublicUrl(fileName)

      if (type === 'hero') {
        setHeroImages([...heroImages, publicUrl])
      } else {
        setInstagramImages([...instagramImages, publicUrl])
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer upload da imagem.')
    } finally {
      setLoading(false)
      // reset input
      e.target.value = ''
    }
  }

  const handleRemove = (index: number, type: 'hero' | 'instagram') => {
    if (type === 'hero') {
      setHeroImages(heroImages.filter((_, i) => i !== index))
    } else {
      setInstagramImages(instagramImages.filter((_, i) => i !== index))
    }
    setSuccess(false)
  }

  const handleSave = async () => {
    setLoading(true)
    setError(null)
    setSuccess(false)
    try {
      const { error } = await supabase
        .from('store_settings')
        .update({
          hero_images: heroImages,
          instagram_images: instagramImages,
          atualizado_em: new Date().toISOString()
        })
        .eq('id', 1)

      if (error) throw error
      setSuccess(true)
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar configurações.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-branco">
      <div className="border-b border-claro bg-branco px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-bodoni text-3xl text-preto italic">Customização da Loja</h1>
            <p className="font-archivo text-sm text-zaya mt-1">
              Personalize as imagens da página inicial
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 bg-dourado text-branco px-5 py-2.5 font-archivo text-sm font-medium hover:bg-preto transition-colors rounded-sm disabled:opacity-50"
          >
            <Save size={16} />
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </div>

      <div className="p-8 max-w-4xl space-y-12">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-sm font-archivo text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-sm font-archivo text-sm">
            Configurações salvas com sucesso!
          </div>
        )}

        {/* HERO SECTION */}
        <section className="space-y-4">
          <div>
            <h2 className="font-bodoni text-2xl text-preto italic">Banners Principais (Hero)</h2>
            <p className="font-archivo text-sm text-preto/60 mt-1">
              Adicione imagens para o fundo da primeira seção do site. Se houver mais de uma, elas mudarão a cada 10 segundos. Recomendado: Imagens em formato retrato (mobile) ou paisagem (desktop) com alta resolução.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {heroImages.map((url, idx) => (
              <div key={idx} className="relative aspect-video bg-claro/20 rounded-sm overflow-hidden group">
                <Image src={url} alt={`Hero ${idx + 1}`} fill className="object-cover" unoptimized />
                <button
                  onClick={() => handleRemove(idx, 'hero')}
                  className="absolute top-2 right-2 p-1.5 bg-preto/50 text-branco rounded-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                  title="Remover imagem"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}

            <label className="relative aspect-video flex flex-col items-center justify-center border-2 border-dashed border-claro hover:border-dourado hover:bg-claro/5 transition-colors cursor-pointer rounded-sm group">
              <Upload size={24} className="text-preto/30 group-hover:text-dourado mb-2" />
              <span className="font-archivo text-xs text-preto/50 group-hover:text-dourado">Adicionar Imagem</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleUpload(e, 'hero')}
                className="hidden"
                disabled={loading}
              />
            </label>
          </div>
        </section>

        <hr className="border-claro" />

        {/* INSTAGRAM SECTION */}
        <section className="space-y-4">
          <div>
            <h2 className="font-bodoni text-2xl text-preto italic">Feed do Instagram</h2>
            <p className="font-archivo text-sm text-preto/60 mt-1">
              Adicione links de posts do Instagram (ou faça upload manual) para exibi-los na página inicial.
            </p>
          </div>
          
          <div className="flex gap-2 mb-4">
            <input 
              type="text" 
              placeholder="Cole o link do post do Instagram aqui..." 
              value={instagramLinkInput}
              onChange={(e) => setInstagramLinkInput(e.target.value)}
              className="flex-1 bg-branco border border-claro rounded-sm px-4 py-2 font-archivo text-sm text-preto focus:outline-none focus:border-dourado"
            />
            <button 
              onClick={handleAddInstagramLink}
              disabled={loadingIgLink || !instagramLinkInput}
              className="bg-preto text-branco px-4 py-2 font-archivo text-sm rounded-sm hover:bg-dourado transition-colors disabled:opacity-50"
            >
              {loadingIgLink ? 'Carregando...' : 'Adicionar Preview'}
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {instagramImages.map((img, idx) => {
              const src = typeof img === 'string' ? img : (img?.src || img?.url || '/about-us.png')
              return (
                <div key={idx} className="relative aspect-square bg-claro/20 rounded-sm overflow-hidden group">
                  <Image src={src} alt={`Instagram ${idx + 1}`} fill className="object-cover" unoptimized />
                  <button
                    onClick={() => handleRemove(idx, 'instagram')}
                    className="absolute top-2 right-2 p-1.5 bg-preto/50 text-branco rounded-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                    title="Remover foto"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )
            })}

            <label className="relative aspect-square flex flex-col items-center justify-center border-2 border-dashed border-claro hover:border-dourado hover:bg-claro/5 transition-colors cursor-pointer rounded-sm group">
              <ImageIcon size={20} className="text-preto/30 group-hover:text-dourado mb-2" />
              <span className="font-archivo text-xs text-preto/50 group-hover:text-dourado text-center px-2">Upload Manual</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleUpload(e, 'instagram')}
                className="hidden"
                disabled={loading}
              />
            </label>
          </div>
        </section>
      </div>
    </div>
  )
}
