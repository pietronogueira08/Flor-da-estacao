import React from "react";
import { Divider } from "@/components/ui/Divider";

export const metadata = {
  title: "Trocas e Devoluções | Zaya",
};

export default function TrocasPage() {
  return (
    <div className="container mx-auto px-4 lg:px-8 py-16 max-w-3xl">
      <div className="text-center mb-16">
        <h1 className="font-bodoni text-5xl text-preto italic mb-6">Trocas e Devoluções</h1>
        <p className="font-archivo text-zaya">Política de satisfação Zaya</p>
      </div>

      <div className="space-y-12 font-archivo text-preto/80 leading-relaxed">
        <section>
          <h2 className="font-bodoni text-3xl text-preto mb-4">Condições Gerais</h2>
          <p>
            Na Zaya, desejamos que você ame cada peça que adquirir. Se por algum motivo precisar trocar ou devolver seu pedido, estamos à disposição para tornar o processo simples e ágil.
          </p>
        </section>

        <section>
          <h2 className="font-bodoni text-3xl text-preto mb-4">Prazos</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Trocas:</strong> até 30 dias corridos após o recebimento do pedido.</li>
            <li><strong>Devoluções (Arrependimento):</strong> até 7 dias corridos após o recebimento do pedido, conforme o Código de Defesa do Consumidor.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-bodoni text-3xl text-preto mb-4">Como solicitar</h2>
          <p>
            Entre em contato conosco através do WhatsApp (22) 99999-9999 ou e-mail contato@zaya.com.br informando o número do seu pedido e o motivo da troca/devolução.
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
