'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { ZayaWordmark } from '@/components/store/ZayaWordmark'
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  ClipboardList,
  LogOut,
  Gem,
  TrendingUp,
} from 'lucide-react'

const navItems = [
  { href: '/admin/dashboard',   icon: LayoutDashboard, label: 'Dashboard'    },
  { href: '/admin/produtos',    icon: ShoppingBag,     label: 'Produtos'     },
  { href: '/admin/estoque',     icon: Package,         label: 'Estoque'      },
  { href: '/admin/pedidos',     icon: ClipboardList,   label: 'Pedidos'      },
  { href: '/admin/vendas',      icon: TrendingUp,      label: 'Vendas'       },
  { href: '/admin/customizacao',icon: Gem,             label: 'Customização' },
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
    <aside className="w-64 bg-branco border-r border-claro flex flex-col h-full shadow-sm">
      {/* Logo / Brand */}
      <div className="px-6 py-8 border-b border-claro">
        <Link href="/" className="flex flex-col items-center gap-3 mb-1 hover:opacity-80 transition-opacity">
          <ZayaWordmark width={120} height={40} />
          <div className="text-center">
            <p className="font-bodoni text-lg font-semibold text-preto leading-tight">
              Zaya
            </p>
            <p className="font-archivo text-xs text-zaya tracking-widest uppercase">
              Atelier Zaya
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
              className={`flex items-center gap-3 px-4 py-3 rounded-sm font-archivo text-sm transition-all duration-150 group ${
                isActive
                  ? 'bg-dourado/15 text-dourado font-medium border-l-2 border-dourado'
                  : 'text-preto/60 hover:bg-claro/40 hover:text-dourado'
              }`}
            >
              <Icon
                size={18}
                className={isActive ? 'text-dourado' : 'text-preto/40 group-hover:text-dourado'}
              />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Decorative element */}
      <div className="px-6 py-4 flex justify-center opacity-30">
        <Gem size={22} className="text-dourado" />
      </div>

      {/* Logout */}
      <div className="px-4 pb-6 border-t border-claro pt-4">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full text-left font-archivo text-sm text-preto/50 hover:text-dourado hover:bg-claro/30 rounded-sm transition-all duration-150 group"
        >
          <LogOut size={18} className="group-hover:text-dourado" />
          Sair
        </button>
      </div>
    </aside>
  )
}
