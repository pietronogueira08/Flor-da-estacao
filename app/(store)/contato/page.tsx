import React from "react";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "Contato | Flor da Estação",
};

export default function ContatoPage() {
  return (
    <div className="container mx-auto px-4 lg:px-8 py-16 max-w-6xl">
      <div className="text-center mb-16">
        <h1 className="font-cormorant text-5xl md:text-6xl text-carvao italic mb-6">Fale Conosco</h1>
        <p className="font-jost text-musgo text-lg">Estamos aqui para ajudar com qualquer dúvida.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
        <div>
          <h2 className="font-cormorant text-3xl text-carvao mb-6">Envie uma mensagem</h2>
          <form className="space-y-6 font-jost">
            <div>
              <label htmlFor="nome" className="block text-sm text-carvao mb-2">Nome Completo</label>
              <input type="text" id="nome" className="w-full border border-rosa-antigo/50 bg-transparent px-4 py-3 focus:outline-none focus:border-ameixa transition-colors" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm text-carvao mb-2">E-mail</label>
              <input type="email" id="email" className="w-full border border-rosa-antigo/50 bg-transparent px-4 py-3 focus:outline-none focus:border-ameixa transition-colors" />
            </div>
            <div>
              <label htmlFor="mensagem" className="block text-sm text-carvao mb-2">Mensagem</label>
              <textarea id="mensagem" rows={5} className="w-full border border-rosa-antigo/50 bg-transparent px-4 py-3 focus:outline-none focus:border-ameixa transition-colors resize-none"></textarea>
            </div>
            <Button className="w-full bg-ameixa text-marfim h-12 text-base hover:bg-carvao">
              Enviar Mensagem
            </Button>
          </form>
        </div>

        <div>
          <h2 className="font-cormorant text-3xl text-carvao mb-6">Informações</h2>
          <div className="space-y-6 font-jost text-carvao/80">
            <div>
              <p className="font-medium text-carvao mb-1">WhatsApp</p>
              <p>(22) 99999-9999</p>
            </div>
            <div>
              <p className="font-medium text-carvao mb-1">E-mail</p>
              <p>contato@flordaestacao.com.br</p>
            </div>
            <div>
              <p className="font-medium text-carvao mb-1">Endereço</p>
              <p>Centro - São João da Barra, RJ</p>
              <p>CEP: 28200-000</p>
            </div>
          </div>

          <div className="mt-10 bg-nevoa h-64 w-full rounded-sm overflow-hidden relative flex items-center justify-center">
            {/* Embed fake maps or real google maps */}
            <div className="absolute inset-0 bg-rosa-antigo/10"></div>
            <p className="font-jost text-ameixa z-10 font-medium">Mapa - São João da Barra</p>
          </div>
        </div>
      </div>
    </div>
  );
}
