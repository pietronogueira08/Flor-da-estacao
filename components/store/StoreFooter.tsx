import Link from "next/link";

export function StoreFooter() {
  return (
    <footer className="bg-nevoa pt-16 pb-8 border-t border-rosa-antigo/20">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8 mb-12">

          {/* Logo + descrição */}
          <div className="md:col-span-1 flex flex-col items-center md:items-start">
            <Link href="/" aria-label="Flor da Estação — Página inicial" className="mb-4 hover:opacity-80 transition-opacity">
              <span className="font-cormorant text-3xl text-ameixa italic tracking-wide font-medium">
                Flor da Estação
              </span>
            </Link>
            <p className="font-jost text-musgo text-sm text-center md:text-left mb-6">
              Moda feminina com identidade botânica e romântica.
            </p>
            {/* Redes sociais */}
            <div className="flex gap-4">
              <a
                href="https://instagram.com/flordaestacao"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram da Flor da Estação"
                className="text-ameixa hover:text-carvao transition-colors focus-visible:ring-2 focus-visible:ring-ameixa rounded-sm"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
            </div>
          </div>

          {/* Loja */}
          <div>
            <h4 className="font-cormorant text-xl text-carvao mb-4">Loja</h4>
            <ul className="space-y-2">
              <li><Link href="/produtos" className="font-jost text-sm text-musgo hover:text-ameixa focus-visible:ring-2 focus-visible:ring-ameixa rounded-sm">Todos os produtos</Link></li>
              <li><Link href="/categoria/novidades" className="font-jost text-sm text-musgo hover:text-ameixa focus-visible:ring-2 focus-visible:ring-ameixa rounded-sm">Novidades</Link></li>
              <li><Link href="/categoria/vestidos" className="font-jost text-sm text-musgo hover:text-ameixa focus-visible:ring-2 focus-visible:ring-ameixa rounded-sm">Vestidos</Link></li>
              <li><Link href="/categoria/blusas-camisas" className="font-jost text-sm text-musgo hover:text-ameixa focus-visible:ring-2 focus-visible:ring-ameixa rounded-sm">Blusas & Camisas</Link></li>
            </ul>
          </div>

          {/* Ajuda */}
          <div>
            <h4 className="font-cormorant text-xl text-carvao mb-4">Ajuda</h4>
            <ul className="space-y-2">
              <li><Link href="/contato" className="font-jost text-sm text-musgo hover:text-ameixa focus-visible:ring-2 focus-visible:ring-ameixa rounded-sm">Contato</Link></li>
              <li><Link href="/trocas" className="font-jost text-sm text-musgo hover:text-ameixa focus-visible:ring-2 focus-visible:ring-ameixa rounded-sm">Trocas e Devoluções</Link></li>
              <li><Link href="/sobre" className="font-jost text-sm text-musgo hover:text-ameixa focus-visible:ring-2 focus-visible:ring-ameixa rounded-sm">Nossa História</Link></li>
              <li><Link href="/privacidade" className="font-jost text-sm text-musgo hover:text-ameixa focus-visible:ring-2 focus-visible:ring-ameixa rounded-sm">Política de Privacidade</Link></li>
              <li><Link href="/termos" className="font-jost text-sm text-musgo hover:text-ameixa focus-visible:ring-2 focus-visible:ring-ameixa rounded-sm">Termos de Uso</Link></li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h4 className="font-cormorant text-xl text-carvao mb-4">Contato</h4>
            <address className="not-italic font-jost text-sm text-musgo space-y-2">
              <p>São João da Barra, RJ</p>
              <p>WhatsApp: (22) 99999-9999</p>
              <p>contato@flordaestacao.com.br</p>
            </address>

            {/* Formas de pagamento */}
            <div className="mt-6">
              <p className="font-jost text-xs text-musgo uppercase tracking-widest mb-3">Pagamento</p>
              <div className="flex flex-wrap gap-2" aria-label="Formas de pagamento aceitas">
                {/* Pix */}
                <span title="Pix" className="bg-marfim border border-rosa-antigo/30 rounded-sm px-2 py-1 font-jost text-[10px] text-carvao/70 font-medium">PIX</span>
                {/* Visa */}
                <span title="Visa" className="bg-marfim border border-rosa-antigo/30 rounded-sm px-2 py-1 font-jost text-[10px] text-carvao/70 font-medium">VISA</span>
                {/* Mastercard */}
                <span title="Mastercard" className="bg-marfim border border-rosa-antigo/30 rounded-sm px-2 py-1 font-jost text-[10px] text-carvao/70 font-medium">MC</span>
                {/* Boleto */}
                <span title="Boleto Bancário" className="bg-marfim border border-rosa-antigo/30 rounded-sm px-2 py-1 font-jost text-[10px] text-carvao/70 font-medium">BOLETO</span>
              </div>
            </div>
          </div>

        </div>

        {/* Rodapé final */}
        <div className="text-center pt-8 border-t border-rosa-antigo/20 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-jost text-xs text-musgo">
            © 2025 Flor da Estação. Todos os direitos reservados.
          </p>
          <div className="flex gap-4">
            <Link href="/privacidade" className="font-jost text-xs text-musgo hover:text-ameixa transition-colors focus-visible:ring-2 focus-visible:ring-ameixa rounded-sm">
              Privacidade
            </Link>
            <Link href="/termos" className="font-jost text-xs text-musgo hover:text-ameixa transition-colors focus-visible:ring-2 focus-visible:ring-ameixa rounded-sm">
              Termos
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
