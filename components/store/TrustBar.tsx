import Link from "next/link";

export function TrustBar() {
  const items = [
    {
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      ),
      title: "Frete Grátis",
      desc: "Compras acima de R$ 299",
    },
    {
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M9 14l-4-4 4-4M15 10h-4m4 4H9" />
          <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
        </svg>
      ),
      title: "Trocas Gratuitas",
      desc: "Em até 30 dias corridos",
    },
    {
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      ),
      title: "Pagamento Seguro",
      desc: "Ambiente 100% protegido",
    },
    {
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
          <line x1="1" y1="10" x2="23" y2="10" />
        </svg>
      ),
      title: "Parcelamento",
      desc: "Até 3x sem juros",
    },
  ];

  return (
    <section className="bg-branco border-t border-b border-claro py-10 px-4 md:px-8">
      <div className="container mx-auto">
        {/* Desktop: 4 colunas */}
        <ul className="hidden md:grid grid-cols-4 gap-8">
          {items.map((item) => (
            <li key={item.title} className="flex flex-col items-center text-center gap-3">
              <span className="text-dourado">{item.icon}</span>
              <div>
                <p className="font-archivo text-sm font-medium text-preto">{item.title}</p>
                <p className="font-archivo text-xs text-zaya mt-0.5">{item.desc}</p>
              </div>
            </li>
          ))}
        </ul>
        {/* Mobile: lista vertical compacta */}
        <ul className="flex flex-col gap-4 md:hidden">
          {items.map((item) => (
            <li key={item.title} className="flex items-center gap-4">
              <span className="text-dourado shrink-0">{item.icon}</span>
              <div>
                <p className="font-archivo text-sm font-medium text-preto">{item.title}</p>
                <p className="font-archivo text-xs text-zaya">{item.desc}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
