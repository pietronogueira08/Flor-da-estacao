import React from "react";
import Link from "next/link";
import Image from "next/image";

export function StoreFooter() {
  return (
    <footer className="bg-nevoa pt-16 pb-8 border-t border-rosa-antigo/20">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8 mb-12">
          
          <div className="md:col-span-1 flex flex-col items-center md:items-start">
            <Image src="/logo.svg" alt="Flor da Estação" width={160} height={60} className="mb-6 h-14 w-auto" />
            <p className="font-jost text-musgo text-sm text-center md:text-left">
              Moda feminina com identidade botânica e romântica.
            </p>
          </div>

          <div>
            <h4 className="font-cormorant text-xl text-carvao mb-4">Loja</h4>
            <ul className="space-y-2">
              <li><Link href="/produtos" className="font-jost text-sm text-musgo hover:text-ameixa">Todos os produtos</Link></li>
              <li><Link href="/categoria/novidades" className="font-jost text-sm text-musgo hover:text-ameixa">Novidades</Link></li>
              <li><Link href="/categoria/vestidos" className="font-jost text-sm text-musgo hover:text-ameixa">Vestidos</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-cormorant text-xl text-carvao mb-4">Ajuda</h4>
            <ul className="space-y-2">
              <li><Link href="/contato" className="font-jost text-sm text-musgo hover:text-ameixa">Contato</Link></li>
              <li><Link href="/trocas" className="font-jost text-sm text-musgo hover:text-ameixa">Trocas e Devoluções</Link></li>
              <li><Link href="/sobre" className="font-jost text-sm text-musgo hover:text-ameixa">Nossa História</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-cormorant text-xl text-carvao mb-4">Contato</h4>
            <address className="not-italic font-jost text-sm text-musgo space-y-2">
              <p>São João da Barra, RJ</p>
              <p>WhatsApp: (22) 99999-9999</p>
              <p>contato@flordaestacao.com.br</p>
              <div className="flex gap-4 mt-4">
                <a href="#" className="text-ameixa hover:text-carvao">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                </a>
              </div>
            </address>
          </div>

        </div>
        <div className="text-center pt-8 border-t border-rosa-antigo/20">
          <p className="font-jost text-xs text-musgo">
            &copy; 2025 Flor da Estação. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
