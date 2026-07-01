'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  ClipboardList,
  LogOut,
  Flower2,
} from 'lucide-react'

const navItems = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/produtos',  icon: ShoppingBag,    label: 'Produtos'   },
  { href: '/admin/estoque',   icon: Package,        label: 'Estoque'    },
  { href: '/admin/pedidos',   icon: ClipboardList,  label: 'Pedidos'    },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <aside className="w-64 bg-marfim border-r border-rosa-antigo/40 flex flex-col h-full shadow-sm">
      {/* Logo / Brand */}
      <div className="px-6 py-8 border-b border-rosa-antigo/30">
        <Link href="/" className="flex items-center gap-3 mb-1 hover:opacity-80 transition-opacity">
          <Image
            src="/logo.svg"
            alt="Flor da Estação"
            width={32}
            height={32}
            className="h-8 w-8"
            onError={() => {/* silently fail */}}
          />
          <div>
            <p className="font-cormorant text-lg font-semibold text-carvao leading-tight">
              Flor da Estação
            </p>
            <p className="font-jost text-xs text-musgo tracking-widest uppercase">
              Estação OS
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname?.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-3 rounded-sm font-jost text-sm transition-all duration-150 group ${
                isActive
                  ? 'bg-rosa-antigo/30 text-ameixa font-medium border-l-2 border-ameixa'
                  : 'text-carvao/70 hover:bg-rosa-antigo/10 hover:text-ameixa'
              }`}
            >
              <Icon
                size={18}
                className={isActive ? 'text-ameixa' : 'text-carvao/50 group-hover:text-ameixa'}
              />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Decorative element */}
      <div className="px-6 py-4 flex justify-center opacity-20">
        <Flower2 size={28} className="text-rosa-antigo" />
      </div>

      {/* Logout */}
      <div className="px-4 pb-6 border-t border-rosa-antigo/30 pt-4">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full text-left font-jost text-sm text-carvao/60 hover:text-ameixa hover:bg-rosa-antigo/10 rounded-sm transition-all duration-150 group"
        >
          <LogOut size={18} className="group-hover:text-ameixa" />
          Sair
        </button>
      </div>
    </aside>
  )
}
