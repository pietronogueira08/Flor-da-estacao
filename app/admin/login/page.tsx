'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Flower } from 'lucide-react'

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
    <div className="min-h-screen bg-nevoa flex items-center justify-center px-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 text-rosa-antigo/10">
          <Flower size={120} />
        </div>
        <div className="absolute bottom-20 right-10 text-rosa-antigo/10 rotate-45">
          <Flower size={80} />
        </div>
        <div className="absolute top-1/2 left-1/4 text-rosa-antigo/5 -rotate-12">
          <Flower size={200} />
        </div>
      </div>

      <div className="w-full max-w-sm relative">
        {/* Card */}
        <div className="bg-marfim border border-rosa-antigo/40 rounded-sm shadow-lg p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 flex items-center justify-center">
                <Image
                  src="/logo.svg"
                  alt="Flor da Estação"
                  width={64}
                  height={64}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            <h1 className="font-cormorant text-3xl text-carvao italic font-semibold">
              Flor da Estação
            </h1>
            <p className="font-jost text-xs text-musgo tracking-[0.2em] uppercase mt-1">
              Estação OS · Painel Admin
            </p>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-rosa-antigo/30" />
            <Flower size={14} className="text-rosa-antigo" />
            <div className="flex-1 h-px bg-rosa-antigo/30" />
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-sm font-jost text-sm">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block font-jost text-xs text-carvao/70 uppercase tracking-wider mb-1.5"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-nevoa border border-rosa-antigo/40 rounded-sm px-4 py-2.5 font-jost text-sm text-carvao placeholder-carvao/30 focus:outline-none focus:border-ameixa focus:ring-1 focus:ring-ameixa/30 transition-all"
                placeholder="admin@flordeestacao.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block font-jost text-xs text-carvao/70 uppercase tracking-wider mb-1.5"
              >
                Senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-nevoa border border-rosa-antigo/40 rounded-sm px-4 py-2.5 font-jost text-sm text-carvao placeholder-carvao/30 focus:outline-none focus:border-ameixa focus:ring-1 focus:ring-ameixa/30 transition-all"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-ameixa text-marfim font-jost font-medium py-3 rounded-sm hover:bg-carvao transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          {/* Footer note */}
          <p className="font-jost text-xs text-carvao/40 text-center mt-6">
            Acesso restrito a administradores autorizados
          </p>
        </div>
      </div>
    </div>
  )
}
