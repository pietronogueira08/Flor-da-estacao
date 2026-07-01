import React from "react";
import { Divider } from "@/components/ui/Divider";

export const metadata = {
  title: "Trocas e Devoluções | Flor da Estação",
};

export default function TrocasPage() {
  return (
    <div className="container mx-auto px-4 lg:px-8 py-16 max-w-3xl">
      <div className="text-center mb-16">
        <h1 className="font-cormorant text-5xl text-carvao italic mb-6">Trocas e Devoluções</h1>
        <p className="font-jost text-musgo">Política de satisfação Flor da Estação</p>
      </div>

      <div className="space-y-12 font-jost text-carvao/80 leading-relaxed">
        <section>
          <h2 className="font-cormorant text-3xl text-carvao mb-4">Condições Gerais</h2>
          <p>
            Na Flor da Estação, desejamos que você ame cada peça que adquirir. Se por algum motivo precisar trocar ou devolver seu pedido, estamos à disposição para tornar o processo simples e ágil.
          </p>
        </section>

        <section>
          <h2 className="font-cormorant text-3xl text-carvao mb-4">Prazos</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Trocas:</strong> até 30 dias corridos após o recebimento do pedido.</li>
            <li><strong>Devoluções (Arrependimento):</strong> até 7 dias corridos após o recebimento do pedido, conforme o Código de Defesa do Consumidor.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-cormorant text-3xl text-carvao mb-4">Como solicitar</h2>
          <p>
            Entre em contato conosco através do WhatsApp (22) 99999-9999 ou e-mail contato@flordaestacao.com.br informando o número do seu pedido e o motivo da troca/devolução.
          </p>
          <p className="mt-4">
            Lembrando que a peça deve retornar nas mesmas condições em que foi entregue: com a etiqueta afixada, sem indícios de uso, lavagem ou odores.
          </p>
        </section>
      </div>

      <Divider className="my-16" />
    </div>
  );
}
