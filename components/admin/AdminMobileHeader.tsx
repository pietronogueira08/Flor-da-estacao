'use client'

export default function AdminMobileHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-14 bg-branco border-b border-claro flex items-center px-4 md:hidden">
      <div>
        <p className="font-bodoni text-base font-semibold text-preto leading-tight italic">
          Atelier Zaya
        </p>
        <p className="font-archivo text-[10px] text-preto/50 tracking-widest uppercase leading-tight">
          Painel Admin
        </p>
      </div>
    </header>
  )
}
