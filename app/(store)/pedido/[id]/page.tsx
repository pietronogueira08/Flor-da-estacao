"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CheckCircle, Package, Truck, Info, Mail } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '../../../../lib/supabase/client';

const supabase = createClient();

// Componente simples de Confetti Botânico
const BotanicalConfetti = () => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShow(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {[...Array(20)].map((_, i) => {
        const left = `${Math.random() * 100}%`;
        const animationDuration = `${Math.random() * 3 + 2}s`;
        const animationDelay = `${Math.random() * 1}s`;
        const size = Math.random() > 0.5 ? 'w-4 h-4' : 'w-6 h-6';
        const color = ['text-[#D2A9B1]', 'text-[#7D4F5A]', 'text-[#6B7860]'][Math.floor(Math.random() * 3)];
        
        return (
          <div
            key={i}
            className={`absolute -top-10 ${color} animate-fall`}
            style={{
              left,
              animationDuration,
              animationDelay,
            }}
          >
            <svg className={size} viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.8,2.7C15,2,11.9,3,9.7,5.2C7.3,7.6,6.3,11.2,7.3,14.5c0,0.1-0.1,0.2-0.2,0.2c-2.3-0.5-4.8,0.2-6.5,1.9 c-0.6,0.6-0.8,1.6-0.3,2.2c0.6,0.7,1.6,0.6,2.2,0c1.7-1.7,2.5-4.2,1.9-6.5c0-0.1,0.1-0.2,0.2-0.2C8,13,11.5,12.1,13.9,9.7 C16.1,7.5,17.2,4.4,17.8,2.7z"/>
            </svg>
          </div>
        );
      })}
      <style jsx>{`
        @keyframes fall {
          0% { transform: translateY(-5vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(105vh) rotate(360deg); opacity: 0; }
        }
        .animate-fall {
          animation-name: fall;
          animation-timing-function: linear;
          animation-fill-mode: forwards;
        }
      `}</style>
    </div>
  );
};

export default function PedidoConfirmadoPage() {
  const { id } = useParams();
  const [pedido, setPedido] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPedido = async () => {
      try {
        if (!id) return;
        
        // Em um caso real, buscaríamos no DB. Como não temos DB em dev, vamos simular ou tentar buscar.
        const { data, error } = await supabase
          .from('orders')
          .select('*, order_items(*, product_variants(products(name, price)))')
          .eq('id', id as string)
          .single();

        if (data) {
          setPedido(data);
        } else {
          // Mock data para quando estivermos em dev s/ banco local
          setPedido({
            id,
            status: 'pago',
            cliente_nome: 'Cliente',
            cliente_email: 'cliente@exemplo.com',
            total: 159.80,
            endereco: { rua: 'Rua das Flores', numero: '123', bairro: 'Jardim', cidade: 'São Paulo', estado: 'SP' },
            criado_em: new Date().toISOString(),
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPedido();
  }, [id]);

  if (loading) {
    return <div className="min-h-[50vh] flex items-center justify-center font-jost text-[#7D4F5A]">Carregando pedido...</div>;
  }

  if (!pedido) {
    return <div className="min-h-[50vh] flex items-center justify-center font-jost text-red-500">Pedido não encontrado.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <BotanicalConfetti />
      
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-[#FBF2F0] rounded-full mb-6 text-[#6B7860]">
          <CheckCircle size={40} />
        </div>
        <h1 className="text-4xl font-cormorant-garamond text-[#241B1E] mb-4">Pedido Confirmado!</h1>
        <p className="text-gray-600 font-jost text-lg">
          Obrigado por escolher a Zaya, {pedido.cliente_nome?.split(' ')[0] || 'Cliente'}.
        </p>
      </div>

      <div className="bg-white border border-[#D2A9B1]/30 rounded-lg overflow-hidden shadow-sm">
        <div className="bg-[#FFF5F7] p-6 border-b border-[#D2A9B1]/30">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div>
              <p className="text-sm text-gray-500 font-jost">Número do Pedido</p>
              <p className="font-semibold text-[#241B1E]">{pedido.id.split('-')[0].toUpperCase()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-jost">Data</p>
              <p className="font-semibold text-[#241B1E]">
                {new Date(pedido.criado_em).toLocaleDateString('pt-BR')}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-jost">Total</p>
              <p className="font-semibold text-[#241B1E]">R$ {pedido.total?.toFixed(2).replace('.', ',')}</p>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="flex items-center text-lg font-cormorant-garamond text-[#241B1E] mb-3 border-b pb-2">
                  <Package size={18} className="mr-2 text-[#7D4F5A]" /> Status
                </h3>
                <div className="font-jost">
                  <span className="inline-block bg-[#FBF2F0] text-[#7D4F5A] px-3 py-1 rounded-full text-sm font-medium uppercase tracking-wider">
                    {pedido.status === 'pendente' ? 'Aguardando Pagamento' : 
                     pedido.status === 'pago' ? 'Pagamento Aprovado' : pedido.status}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="flex items-center text-lg font-cormorant-garamond text-[#241B1E] mb-3 border-b pb-2">
                  <Truck size={18} className="mr-2 text-[#7D4F5A]" /> Endereço de Entrega
                </h3>
                <div className="font-jost text-gray-600 text-sm leading-relaxed">
                  <p>{pedido.endereco?.rua}, {pedido.endereco?.numero} {pedido.endereco?.complemento}</p>
                  <p>{pedido.endereco?.bairro}</p>
                  <p>{pedido.endereco?.cidade} - {pedido.endereco?.estado}</p>
                  <p>CEP: {pedido.endereco?.cep}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="flex items-center text-lg font-cormorant-garamond text-[#241B1E] mb-3 border-b pb-2">
                <Info size={18} className="mr-2 text-[#7D4F5A]" /> Resumo
              </h3>
              <div className="font-jost text-sm space-y-2">
                <p className="text-gray-600">Um e-mail de confirmação foi enviado para:</p>
                <p className="font-medium text-[#241B1E] flex items-center bg-gray-50 p-2 rounded">
                  <Mail size={14} className="mr-2 text-gray-400" /> {pedido.cliente_email}
                </p>
                <p className="text-gray-500 mt-4 text-xs italic">
                  * Você receberá atualizações sobre o envio neste e-mail.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 text-center">
        <Link 
          href="/" 
          className="inline-block bg-[#7D4F5A] text-[#FFF5F7] px-8 py-3 rounded-md font-jost hover:bg-opacity-90 transition-colors"
        >
          Continuar Comprando
        </Link>
      </div>
    </div>
  );
}
