'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { ZayaWordmark } from '@/components/store/ZayaWordmark'
import { Gem } from 'lucide-react'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError('Email ou senha incorretos. Verifique suas credenciais.')
      setLoading(false)
      return
    }

    router.push('/admin/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-branco flex items-center justify-center px-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 text-claro/20">
          <Gem size={100} />
        </div>
        <div className="absolute bottom-20 right-10 text-claro/15 rotate-45">
          <Gem size={64} />
        </div>
        <div className="absolute top-1/2 left-1/4 text-claro/10 -rotate-12">
          <Gem size={160} />
        </div>
      </div>

      <div className="w-full max-w-sm relative">
        {/* Card */}
        <div className="bg-branco border border-claro rounded-sm shadow-lg p-8">
          {/* Logo */}
          <div className="text-center mb-8 flex flex-col items-center">
            <ZayaWordmark width={140} height={46} />
            <p className="font-archivo text-xs text-zaya tracking-[0.2em] uppercase mt-4">
              Atelier Zaya · Painel Admin
            </p>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-claro/50" />
            <Gem size={12} className="text-dourado" />
            <div className="flex-1 h-px bg-claro/50" />
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-sm font-archivo text-sm">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block font-archivo text-xs text-preto/70 uppercase tracking-wider mb-1.5"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-branco border border-claro rounded-sm px-4 py-2.5 font-archivo text-sm text-preto placeholder-preto/30 focus:outline-none focus:border-dourado focus:ring-1 focus:ring-dourado/30 transition-all"
                placeholder="admin@zaya.com.br"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block font-archivo text-xs text-preto/70 uppercase tracking-wider mb-1.5"
              >
                Senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-branco border border-claro rounded-sm px-4 py-2.5 font-archivo text-sm text-preto placeholder-preto/30 focus:outline-none focus:border-dourado focus:ring-1 focus:ring-dourado/30 transition-all"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-dourado text-branco font-archivo font-medium py-3 rounded-sm hover:bg-preto transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          {/* Footer note */}
          <p className="font-archivo text-xs text-preto/40 text-center mt-6">
            Acesso restrito a administradores autorizados
          </p>
        </div>
      </div>
    </div>
  )
}
