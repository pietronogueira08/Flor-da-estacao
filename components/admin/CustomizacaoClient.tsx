'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Upload, Trash2, Image as ImageIcon, Save, Video, Plus, X } from 'lucide-react'
import Image from 'next/image'

export default function CustomizacaoClient({ settings }: { settings: any }) {
  const router = useRouter()
  const supabase = createClient()

  const [heroImages, setHeroImages] = useState<string[]>(settings?.hero_images || [])
  const [heroVideo, setHeroVideo] = useState<string | null>(settings?.hero_video || null)
  const [utilityBarTexts, setUtilityBarTexts] = useState<string[]>(
    settings?.utility_bar_texts || ["FRETE GRÁTIS ACIMA DE R$ 399", "PARCELE EM ATÉ 6X SEM JUROS", "MODA COM IDENTIDADE EDITORIAL"]
  )
  const [editorialBannerImage, setEditorialBannerImage] = useState<string | null>(settings?.editorial_banner_image || null)
  const [editorialBannerText, setEditorialBannerText] = useState<string>(settings?.editorial_banner_text || "Silêncio que veste")
  
  const [contactWhatsapp, setContactWhatsapp] = useState<string>(settings?.contact_whatsapp || "(22) 99916-3206")
  const [contactEmail, setContactEmail] = useState<string>(settings?.contact_email || "contato@zaya.com.br")
  const [contactAddress, setContactAddress] = useState<string>(settings?.contact_address || "São João da Barra, RJ")

  const [instagramImages, setInstagramImages] = useState<any[]>(settings?.instagram_images || [])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [newUtilityText, setNewUtilityText] = useState('')

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'hero_image' | 'hero_video' | 'editorial_image' | 'instagram') => {
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

      if (type === 'hero_image') {
        setHeroImages([...heroImages, publicUrl])
      } else if (type === 'hero_video') {
        setHeroVideo(publicUrl)
      } else if (type === 'editorial_image') {
        setEditorialBannerImage(publicUrl)
      } else {
        setInstagramImages([...instagramImages, { src: publicUrl, link: 'https://www.instagram.com/zaya_loja/' }])
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer upload do arquivo.')
    } finally {
      setLoading(false)
      e.target.value = ''
    }
  }

  const handleRemove = (index: number | null, type: 'hero_image' | 'hero_video' | 'editorial_image' | 'instagram' | 'utility') => {
    if (type === 'hero_image' && index !== null) {
      setHeroImages(heroImages.filter((_, i) => i !== index))
    } else if (type === 'instagram' && index !== null) {
      setInstagramImages(instagramImages.filter((_, i) => i !== index))
    } else if (type === 'utility' && index !== null) {
      setUtilityBarTexts(utilityBarTexts.filter((_, i) => i !== index))
    } else if (type === 'hero_video') {
      setHeroVideo(null)
    } else if (type === 'editorial_image') {
      setEditorialBannerImage(null)
    }
    setSuccess(false)
  }

  const handleAddUtilityText = () => {
    if (newUtilityText.trim()) {
      setUtilityBarTexts([...utilityBarTexts, newUtilityText.trim()])
      setNewUtilityText('')
    }
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
          hero_video: heroVideo,
          utility_bar_texts: utilityBarTexts,
          editorial_banner_image: editorialBannerImage,
          editorial_banner_text: editorialBannerText,
          contact_whatsapp: contactWhatsapp,
          contact_email: contactEmail,
          contact_address: contactAddress,
          instagram_images: instagramImages,
          atualizado_em: new Date().toISOString()
        })
        .eq('id', 1)

      if (error) throw error
      setSuccess(true)
      router.refresh()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar configurações.')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-branco">
      <div className="border-b border-claro bg-branco px-8 py-6 sticky top-0 z-50 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-bodoni text-3xl text-preto italic">Customização da Loja</h1>
            <p className="font-archivo text-sm text-zaya mt-1">
              Personalize imagens, vídeos e textos das principais áreas da loja
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 bg-dourado text-branco px-5 py-2.5 font-archivo text-sm font-medium hover:bg-preto transition-colors rounded-sm disabled:opacity-50 shadow-md"
          >
            <Save size={16} />
            {loading ? 'Salvando...' : 'Salvar Todas as Alterações'}
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

        {/* UTILITY BAR SECTION */}
        <section className="space-y-4 p-6 bg-claro/10 rounded-sm border border-claro/30">
          <div>
            <h2 className="font-bodoni text-2xl text-preto italic">Barra de Avisos (Topo)</h2>
            <p className="font-archivo text-sm text-preto/60 mt-1">
              Frases que ficam alternando na barra preta no topo do site.
            </p>
          </div>
          <div className="space-y-3">
            {utilityBarTexts.map((text, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-branco border border-claro px-4 py-2 rounded-sm">
                <span className="flex-1 font-archivo text-sm text-preto uppercase tracking-widest">{text}</span>
                <button onClick={() => handleRemove(idx, 'utility')} className="text-red-500 hover:bg-red-50 p-1.5 rounded-sm transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            <div className="flex gap-2 pt-2">
              <input
                type="text"
                value={newUtilityText}
                onChange={(e) => setNewUtilityText(e.target.value)}
                placeholder="Ex: FRETE GRÁTIS PARA TODO O BRASIL"
                className="flex-1 bg-branco border border-claro rounded-sm px-4 py-2 font-archivo text-sm focus:outline-none focus:border-dourado uppercase"
              />
              <button onClick={handleAddUtilityText} className="bg-preto text-branco px-4 py-2 rounded-sm hover:bg-dourado flex items-center gap-2 font-archivo text-sm">
                <Plus size={16} /> Adicionar
              </button>
            </div>
          </div>
        </section>

        <hr className="border-claro" />

        {/* HERO SECTION */}
        <section className="space-y-6">
          <div>
            <h2 className="font-bodoni text-2xl text-preto italic">Banner Principal (Hero)</h2>
            <p className="font-archivo text-sm text-preto/60 mt-1">
              Selecione se deseja usar Imagens ou um Vídeo. (O vídeo tem prioridade sobre as imagens).
            </p>
          </div>

          {/* Vídeo Hero */}
          <div className="space-y-3">
            <h3 className="font-archivo font-medium text-preto text-sm">Vídeo Automático (Autoplay sem som, ideal até 30s)</h3>
            {heroVideo ? (
              <div className="relative aspect-video bg-preto rounded-sm overflow-hidden w-full max-w-md group border border-claro">
                <video src={heroVideo} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                <button
                  onClick={() => handleRemove(null, 'hero_video')}
                  className="absolute top-2 right-2 p-2 bg-preto/70 text-branco rounded-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                  title="Remover vídeo"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ) : (
              <label className="flex items-center gap-3 bg-branco border border-claro hover:border-dourado hover:text-dourado transition-colors cursor-pointer rounded-sm px-6 py-4 max-w-md group">
                <Video size={20} className="text-preto/50 group-hover:text-dourado" />
                <span className="font-archivo text-sm text-preto group-hover:text-dourado font-medium">Fazer Upload de Vídeo (.mp4)</span>
                <input type="file" accept="video/mp4,video/mov,video/quicktime" onChange={(e) => handleUpload(e, 'hero_video')} className="hidden" disabled={loading} />
              </label>
            )}
            {heroVideo && <p className="text-xs text-zaya">Enquanto houver um vídeo, ele será exibido em vez das imagens abaixo.</p>}
          </div>

          {/* Imagens Hero */}
          <div className="space-y-3 pt-4">
            <h3 className="font-archivo font-medium text-preto text-sm">Ou Imagens em Carrossel</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {heroImages.map((url, idx) => (
                <div key={idx} className="relative aspect-video bg-claro/20 rounded-sm overflow-hidden group border border-claro">
                  <Image src={url} alt={`Hero ${idx + 1}`} fill className="object-cover" unoptimized />
                  <button
                    onClick={() => handleRemove(idx, 'hero_image')}
                    className="absolute top-2 right-2 p-1.5 bg-preto/70 text-branco rounded-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              <label className="relative aspect-video flex flex-col items-center justify-center border-2 border-dashed border-claro hover:border-dourado hover:bg-claro/5 transition-colors cursor-pointer rounded-sm group">
                <Upload size={24} className="text-preto/30 group-hover:text-dourado mb-2" />
                <span className="font-archivo text-xs text-preto/50 group-hover:text-dourado">Adicionar Imagem</span>
                <input type="file" accept="image/*" onChange={(e) => handleUpload(e, 'hero_image')} className="hidden" disabled={loading} />
              </label>
            </div>
          </div>
        </section>

        <hr className="border-claro" />

        {/* EDITORIAL BANNER SECTION */}
        <section className="space-y-4">
          <div>
            <h2 className="font-bodoni text-2xl text-preto italic">Banner Editorial (Meio da página)</h2>
            <p className="font-archivo text-sm text-preto/60 mt-1">
              Aquela imagem que fica na segunda seção da tela com um título grande sobreposto.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="font-archivo font-medium text-preto text-sm block">Frase do Banner</label>
              <textarea
                value={editorialBannerText}
                onChange={(e) => setEditorialBannerText(e.target.value)}
                className="w-full bg-branco border border-claro rounded-sm px-4 py-3 font-archivo text-sm focus:outline-none focus:border-dourado h-24 resize-none"
                placeholder="Silêncio que veste"
              />
            </div>
            <div className="space-y-3">
              <label className="font-archivo font-medium text-preto text-sm block">Imagem do Banner</label>
              {editorialBannerImage ? (
                <div className="relative aspect-video bg-claro/20 rounded-sm overflow-hidden group border border-claro w-full max-w-sm">
                  <Image src={editorialBannerImage} alt="Banner Editorial" fill className="object-cover" unoptimized />
                  <button
                    onClick={() => handleRemove(null, 'editorial_image')}
                    className="absolute top-2 right-2 p-1.5 bg-preto/70 text-branco rounded-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ) : (
                <label className="relative aspect-video flex flex-col items-center justify-center border-2 border-dashed border-claro hover:border-dourado hover:bg-claro/5 transition-colors cursor-pointer rounded-sm group w-full max-w-sm">
                  <ImageIcon size={24} className="text-preto/30 group-hover:text-dourado mb-2" />
                  <span className="font-archivo text-xs text-preto/50 group-hover:text-dourado">Fazer Upload</span>
                  <input type="file" accept="image/*" onChange={(e) => handleUpload(e, 'editorial_image')} className="hidden" disabled={loading} />
                </label>
              )}
            </div>
          </div>
        </section>

        <hr className="border-claro" />

        {/* INSTAGRAM SECTION */}
        <section className="space-y-4">
          <div>
            <h2 className="font-bodoni text-2xl text-preto italic">Feed do Instagram</h2>
            <p className="font-archivo text-sm text-preto/60 mt-1">
              Salve a foto do post que deseja exibir no site e faça o upload abaixo. As 6 fotos aparecem em destaque na página inicial.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {instagramImages.map((img, idx) => {
              const src = typeof img === 'string' ? img : (img?.src || img?.url || '/about-us.png')
              return (
                <div key={idx} className="relative aspect-square bg-claro/20 rounded-sm overflow-hidden group border border-claro">
                  <Image src={src} alt={`Instagram ${idx + 1}`} fill className="object-cover" unoptimized />
                  <button
                    onClick={() => handleRemove(idx, 'instagram')}
                    className="absolute top-2 right-2 p-1.5 bg-preto/70 text-branco rounded-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                    title="Remover foto"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )
            })}

            <label className="relative aspect-square flex flex-col items-center justify-center border-2 border-dashed border-claro hover:border-dourado hover:bg-claro/5 transition-colors cursor-pointer rounded-sm group">
              <ImageIcon size={20} className="text-preto/30 group-hover:text-dourado mb-2" />
              <span className="font-archivo text-xs text-preto/50 group-hover:text-dourado text-center px-2">Upload Manual da Foto</span>
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
        
        <hr className="border-claro" />

        {/* CONTATO SECTION */}
        <section className="space-y-4 pb-12">
          <div>
            <h2 className="font-bodoni text-2xl text-preto italic">Contato & Informações</h2>
            <p className="font-archivo text-sm text-preto/60 mt-1">
              Estes dados aparecem no Rodapé do site.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="font-archivo font-medium text-preto text-sm">WhatsApp</label>
              <input
                type="text"
                value={contactWhatsapp}
                onChange={(e) => setContactWhatsapp(e.target.value)}
                className="w-full bg-branco border border-claro rounded-sm px-4 py-2 font-archivo text-sm focus:outline-none focus:border-dourado"
              />
            </div>
            <div className="space-y-2">
              <label className="font-archivo font-medium text-preto text-sm">E-mail</label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full bg-branco border border-claro rounded-sm px-4 py-2 font-archivo text-sm focus:outline-none focus:border-dourado"
              />
            </div>
            <div className="space-y-2">
              <label className="font-archivo font-medium text-preto text-sm">Endereço / Cidade</label>
              <input
                type="text"
                value={contactAddress}
                onChange={(e) => setContactAddress(e.target.value)}
                className="w-full bg-branco border border-claro rounded-sm px-4 py-2 font-archivo text-sm focus:outline-none focus:border-dourado"
              />
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}
