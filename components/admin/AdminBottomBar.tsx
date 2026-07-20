'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  ClipboardList,
  TrendingUp,
} from 'lucide-react'

const navItems = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/produtos',  icon: ShoppingBag,    label: 'Produtos'   },
  { href: '/admin/estoque',   icon: Package,        label: 'Estoque'    },
  { href: '/admin/pedidos',   icon: ClipboardList,  label: 'Pedidos'    },
  { href: '/admin/vendas',    icon: TrendingUp,     label: 'Vendas'     },
]

export default function AdminBottomBar() {
  const pathname = usePathname()

  return (
    <nav className="block md:hidden fixed bottom-0 left-0 right-0 z-50 h-16 bg-branco border-t border-claro flex items-center justify-around">
      {navItems.map(({ href, icon: Icon, label }) => {
        const isActive = pathname?.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full"
          >
            <Icon
              size={20}
              className={isActive ? 'text-dourado' : 'text-preto/40'}
            />
            <span
              className={`font-archivo text-[10px] leading-tight ${
                isActive ? 'text-dourado font-medium' : 'text-preto/40'
              }`}
            >
              {label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
