import React from "react";
import Image from "next/image";
import { Divider } from "@/components/ui/Divider";

export const metadata = {
  title: "Sobre | Flor da Estação",
};

export default function SobrePage() {
  return (
    <div className="container mx-auto px-4 lg:px-8 py-16 max-w-4xl">
      <div className="text-center mb-16">
        <h1 className="font-cormorant text-5xl md:text-6xl text-carvao italic mb-6">Nossa Essência</h1>
        <p className="font-jost text-musgo text-lg uppercase tracking-widest">A beleza no tempo de cada flor</p>
      </div>

      <div className="aspect-video relative bg-nevoa mb-16 rounded-sm overflow-hidden flex items-center justify-center">
        <Image 
          src="/about-us.png" 
          alt="Ateliê Flor da Estação" 
          fill 
          className="object-cover"
          unoptimized
        />
      </div>

      <div className="prose prose-lg mx-auto font-jost text-carvao/80 space-y-8">
        <p>
          A <strong className="font-cormorant text-2xl italic font-normal text-ameixa">Flor da Estação</strong> nasceu do desejo de resgatar a delicadeza e a força do feminino através do vestir. Inspirada pelos ciclos da natureza, nossa marca acredita que, assim como as estações do ano e as flores que desabrocham no seu tempo, cada mulher possui sua própria beleza e ritmo.
        </p>
        <p>
          Em São João da Barra, RJ, nossa história começou como um pequeno ateliê e hoje se expande, sempre mantendo o cuidado artesanal e o olhar poético sobre a moda. Trabalhamos com tecidos selecionados, modelagens que abraçam o corpo com fluidez e detalhes botânicos que são a nossa assinatura.
        </p>
      </div>
      
      <Divider className="my-16" />
      
      <div className="text-center">
        <h2 className="font-cormorant text-3xl text-carvao italic mb-4">Feito para você florescer</h2>
        <p className="font-jost text-musgo">Em todas as estações do ano.</p>
      </div>
    </div>
  );
}
