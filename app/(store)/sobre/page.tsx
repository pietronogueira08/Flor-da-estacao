import React from "react";
import Image from "next/image";
import { Divider } from "@/components/ui/Divider";

export const metadata = {
  title: "Sobre | Zaya",
  description: "Conheça a história da Zaya — moda feminina com identidade editorial e refinamento discreto.",
};

export default function SobrePage() {
  return (
    <div className="container mx-auto px-4 lg:px-8 py-16 max-w-4xl">
      <div className="text-center mb-16">
        <h1 className="font-bodoni text-5xl md:text-6xl text-preto italic mb-6">Nossa Essência</h1>
        <p className="font-archivo text-zaya text-lg uppercase tracking-widest">A beleza que não precisa se explicar</p>
      </div>

      <div className="aspect-video relative bg-claro/30 mb-16 rounded-sm overflow-hidden flex items-center justify-center">
        <Image 
          src="/zaya-about-premium.png" 
          alt="Atelier Zaya" 
          fill 
          className="object-cover"
          unoptimized
        />
      </div>

      <div className="prose prose-lg mx-auto font-archivo text-preto/80 space-y-8">
        <p>
          A <strong className="font-bodoni text-2xl italic font-normal text-dourado">Zaya</strong> nasceu do desejo de vestir a mulher que já chegou. Não busca tendências — define presença. Inspirada pela estética editorial e pelo silêncio do luxo discreto, cada peça é escolhida com intenção.
        </p>
        <p>
          Em São João da Barra, RJ, nossa história começou com cuidado e olhar apurado. Trabalhamos com tecidos selecionados, silhuetas limpas e detalhes que permanecem — porque o que é bom não precisa gritar.
        </p>
      </div>
      
      <Divider className="my-16" />
      
      <div className="text-center">
        <h2 className="font-bodoni text-3xl text-preto italic mb-4">Feita para quem já sabe</h2>
        <p className="font-archivo text-zaya">Quietude que comunica. Elegância que fica.</p>
      </div>
    </div>
  );
}
