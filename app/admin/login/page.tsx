'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ZayaWordmark } from '@/components/store/ZayaWordmark'
import { Eye, EyeOff, Gem, AlertCircle } from 'lucide-react'

export default function AdminLoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [shake, setShake] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Derive the email from username — supports bare username or full email
    const email = username.includes('@') && username.includes('.')
      ? username
      : `${username}@zaya.com.br`

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError('Usuário ou senha incorretos. Verifique e tente novamente.')
      setLoading(false)
      setShake(true)
      setTimeout(() => setShake(false), 600)
      return
    }

    router.push('/admin/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAFAFA] via-[#F5F0EA] to-[#EDE8E0] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated botanical background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Large gem top-left */}
        <div className="absolute -top-10 -left-10 opacity-[0.06] animate-[spin_40s_linear_infinite]">
          <Gem size={300} className="text-dourado" />
        </div>
        {/* Medium gem bottom-right */}
        <div className="absolute -bottom-16 -right-8 opacity-[0.05] animate-[spin_60s_linear_infinite_reverse]">
          <Gem size={240} className="text-dourado" />
        </div>
        {/* Small gems scattered */}
        <div className="absolute top-1/4 right-1/4 opacity-[0.08] animate-pulse">
          <Gem size={40} className="text-dourado" />
        </div>
        <div className="absolute bottom-1/3 left-1/4 opacity-[0.06] animate-pulse" style={{ animationDelay: '1s' }}>
          <Gem size={28} className="text-dourado" />
        </div>
        <div className="absolute top-2/3 right-1/3 opacity-[0.05] animate-pulse" style={{ animationDelay: '2s' }}>
          <Gem size={20} className="text-dourado" />
        </div>
        {/* Decorative lines */}
        <div className="absolute top-0 left-1/2 w-px h-40 bg-gradient-to-b from-transparent via-dourado/20 to-transparent" />
        <div className="absolute bottom-0 right-1/3 w-px h-32 bg-gradient-to-t from-transparent via-dourado/15 to-transparent" />
      </div>

      {/* Main card */}
      <div
        className={`w-full max-w-sm relative animate-[fadeSlideUp_0.5s_ease_forwards] ${shake ? 'animate-[shake_0.5s_ease]' : ''}`}
        style={{ animationFillMode: 'both' }}
      >
        <div className="bg-white/80 backdrop-blur-md border border-white/60 rounded-sm shadow-2xl shadow-preto/10 p-8 relative overflow-hidden">
          {/* Card shimmer top border */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-dourado to-transparent" />

          {/* Logo section */}
          <div className="text-center mb-8 flex flex-col items-center gap-3">
            <div className="animate-[fadeSlideUp_0.6s_ease_0.1s_forwards] opacity-0" style={{ animationFillMode: 'both' }}>
              <ZayaWordmark width={150} height={50} />
            </div>
            <div className="flex items-center gap-2 animate-[fadeSlideUp_0.6s_ease_0.2s_forwards] opacity-0" style={{ animationFillMode: 'both' }}>
              <div className="h-px w-12 bg-dourado/30" />
              <Gem size={10} className="text-dourado" />
              <div className="h-px w-12 bg-dourado/30" />
            </div>
            <p className="font-archivo text-[10px] text-preto/40 tracking-[0.25em] uppercase animate-[fadeSlideUp_0.6s_ease_0.3s_forwards] opacity-0" style={{ animationFillMode: 'both' }}>
              Painel Administrativo
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Error */}
            {error && (
              <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 px-3 py-2.5 rounded-sm animate-[fadeSlideUp_0.3s_ease_forwards]">
                <AlertCircle size={15} className="mt-0.5 shrink-0" />
                <p className="font-archivo text-xs leading-relaxed">{error}</p>
              </div>
            )}

            {/* Username */}
            <div className="animate-[fadeSlideUp_0.6s_ease_0.35s_forwards] opacity-0" style={{ animationFillMode: 'both' }}>
              <label
                htmlFor="username"
                className="block font-archivo text-[10px] text-preto/50 uppercase tracking-[0.15em] mb-1.5"
              >
                Usuário
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                className="w-full bg-white border border-claro/80 rounded-sm px-4 py-2.5 font-archivo text-sm text-preto placeholder-preto/25 focus:outline-none focus:border-dourado focus:ring-2 focus:ring-dourado/10 transition-all duration-200"
                placeholder="Zayalojadmin@"
              />
            </div>

            {/* Password */}
            <div className="animate-[fadeSlideUp_0.6s_ease_0.45s_forwards] opacity-0" style={{ animationFillMode: 'both' }}>
              <label
                htmlFor="password"
                className="block font-archivo text-[10px] text-preto/50 uppercase tracking-[0.15em] mb-1.5"
              >
                Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full bg-white border border-claro/80 rounded-sm px-4 py-2.5 pr-10 font-archivo text-sm text-preto placeholder-preto/25 focus:outline-none focus:border-dourado focus:ring-2 focus:ring-dourado/10 transition-all duration-200"
                  placeholder="••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-preto/30 hover:text-dourado transition-colors"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-1 animate-[fadeSlideUp_0.6s_ease_0.55s_forwards] opacity-0" style={{ animationFillMode: 'both' }}>
              <button
                type="submit"
                disabled={loading}
                className="w-full relative overflow-hidden bg-preto text-branco font-archivo font-medium text-sm py-3 rounded-sm hover:bg-dourado transition-colors duration-300 disabled:opacity-60 disabled:cursor-not-allowed group"
              >
                {/* Shimmer overlay */}
                <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                <span className="relative">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-3.5 h-3.5 border-2 border-branco/40 border-t-branco rounded-full animate-spin" />
                      Entrando...
                    </span>
                  ) : (
                    'Entrar'
                  )}
                </span>
              </button>
            </div>
          </form>

          {/* Footer */}
          <p className="font-archivo text-[10px] text-preto/30 text-center mt-6 animate-[fadeSlideUp_0.6s_ease_0.65s_forwards] opacity-0" style={{ animationFillMode: 'both' }}>
            Acesso restrito · Atelier Zaya
          </p>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          15%       { transform: translateX(-8px); }
          30%       { transform: translateX(8px); }
          45%       { transform: translateX(-6px); }
          60%       { transform: translateX(6px); }
          75%       { transform: translateX(-4px); }
          90%       { transform: translateX(4px); }
        }
      `}</style>
    </div>
  )
}
