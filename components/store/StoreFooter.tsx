import Link from "next/link";
import { ZayaWordmark } from "@/components/store/ZayaWordmark";

export function StoreFooter() {
  return (
    <footer className="bg-branco pt-16 pb-8 border-t border-claro/20">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8 mb-12">

          {/* Logo + descrição */}
          <div className="md:col-span-1 flex flex-col items-center md:items-start">
            <Link href="/" aria-label="Zaya — Página inicial" className="mb-4 hover:opacity-80 transition-opacity">
              <ZayaWordmark width={100} height={34} />
            </Link>
            <p className="font-archivo text-zaya text-sm text-center md:text-left mb-6">
              Moda feminina com refinamento editorial e identidade própria.
            </p>
            {/* Redes sociais */}
            <div className="flex gap-4">
              <a
                href="https://instagram.com/zayaoficial"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram da Zaya"
                className="text-dourado hover:text-preto transition-colors focus-visible:ring-2 focus-visible:ring-dourado rounded-sm"
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
            <h4 className="font-bodoni text-xl text-preto mb-4">Loja</h4>
            <ul className="space-y-2">
              <li><Link href="/produtos" className="font-archivo text-sm text-zaya hover:text-dourado focus-visible:ring-2 focus-visible:ring-dourado rounded-sm">Todos os produtos</Link></li>
              <li><Link href="/categoria/novidades" className="font-archivo text-sm text-zaya hover:text-dourado focus-visible:ring-2 focus-visible:ring-dourado rounded-sm">Novidades</Link></li>
              <li><Link href="/categoria/vestidos" className="font-archivo text-sm text-zaya hover:text-dourado focus-visible:ring-2 focus-visible:ring-dourado rounded-sm">Vestidos</Link></li>
              <li><Link href="/categoria/blusas-camisas" className="font-archivo text-sm text-zaya hover:text-dourado focus-visible:ring-2 focus-visible:ring-dourado rounded-sm">Blusas &amp; Camisas</Link></li>
            </ul>
          </div>

          {/* Ajuda */}
          <div>
            <h4 className="font-bodoni text-xl text-preto mb-4">Ajuda</h4>
            <ul className="space-y-2">
              <li><Link href="/contato" className="font-archivo text-sm text-zaya hover:text-dourado focus-visible:ring-2 focus-visible:ring-dourado rounded-sm">Contato</Link></li>
              <li><Link href="/trocas" className="font-archivo text-sm text-zaya hover:text-dourado focus-visible:ring-2 focus-visible:ring-dourado rounded-sm">Trocas e Devoluções</Link></li>
              <li><Link href="/sobre" className="font-archivo text-sm text-zaya hover:text-dourado focus-visible:ring-2 focus-visible:ring-dourado rounded-sm">Nossa História</Link></li>
              <li><Link href="/privacidade" className="font-archivo text-sm text-zaya hover:text-dourado focus-visible:ring-2 focus-visible:ring-dourado rounded-sm">Política de Privacidade</Link></li>
              <li><Link href="/termos" className="font-archivo text-sm text-zaya hover:text-dourado focus-visible:ring-2 focus-visible:ring-dourado rounded-sm">Termos de Uso</Link></li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h4 className="font-bodoni text-xl text-preto mb-4">Contato</h4>
            <address className="not-italic font-archivo text-sm text-zaya space-y-2">
              <p>São João da Barra, RJ</p>
              <p>WhatsApp: (22) 99999-9999</p>
              <p>contato@zaya.com.br</p>
            </address>

            {/* Formas de pagamento */}
            <div className="mt-6">
              <p className="font-archivo text-xs text-zaya uppercase tracking-widest mb-3">Pagamento</p>
              <div className="flex flex-wrap gap-2" aria-label="Formas de pagamento aceitas">
                {/* Pix */}
                <span title="Pix" className="bg-branco border border-claro/30 rounded-sm px-2 py-1 font-archivo text-[10px] text-preto/70 font-medium">PIX</span>
                {/* Visa */}
                <span title="Visa" className="bg-branco border border-claro/30 rounded-sm px-2 py-1 font-archivo text-[10px] text-preto/70 font-medium">VISA</span>
                {/* Mastercard */}
                <span title="Mastercard" className="bg-branco border border-claro/30 rounded-sm px-2 py-1 font-archivo text-[10px] text-preto/70 font-medium">MC</span>
                {/* Boleto */}
                <span title="Boleto Bancário" className="bg-branco border border-claro/30 rounded-sm px-2 py-1 font-archivo text-[10px] text-preto/70 font-medium">BOLETO</span>
              </div>
            </div>
          </div>

        </div>

        {/* Rodapé final */}
        <div className="text-center pt-8 border-t border-claro/20 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-archivo text-xs text-zaya">
            © 2025 Zaya. Todos os direitos reservados.
          </p>
          <div className="flex gap-4">
            <Link href="/privacidade" className="font-archivo text-xs text-zaya hover:text-dourado transition-colors focus-visible:ring-2 focus-visible:ring-dourado rounded-sm">
              Privacidade
            </Link>
            <Link href="/termos" className="font-archivo text-xs text-zaya hover:text-dourado transition-colors focus-visible:ring-2 focus-visible:ring-dourado rounded-sm">
              Termos
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
