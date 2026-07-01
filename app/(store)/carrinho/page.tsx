"use client";

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/hooks/useCart';
import { Minus, Plus, Trash2, Leaf } from 'lucide-react';
import Image from 'next/image';

export default function CarrinhoPage() {
  const { items, updateQuantity, removeItem } = useCart();
  const cartTotal = items.reduce((acc, item) => acc + item.preco * item.quantidade, 0);

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <Leaf className="w-16 h-16 text-[#6B7860] mb-4 opacity-70" />
        <h1 className="text-3xl font-cormorant-garamond text-[#241B1E] mb-2">Sua sacola está vazia</h1>
        <p className="text-gray-500 font-jost mb-8 text-center max-w-md">
          Ainda não escolheu suas peças? Venha descobrir nossa nova coleção com identidade botânica.
        </p>
        <Link 
          href="/" 
          className="bg-[#7D4F5A] text-[#FFF5F7] px-8 py-3 rounded-md font-jost hover:bg-opacity-90 transition-colors"
        >
          Voltar para a loja
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 lg:py-16">
      <h1 className="text-4xl font-cormorant-garamond text-[#241B1E] mb-8">Sua Sacola</h1>
      
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Lista de itens */}
        <div className="flex-1">
          <div className="border-t border-[#D2A9B1]/30">
            {items.map((item) => (
              <div key={item.variantId} className="flex gap-6 py-6 border-b border-[#D2A9B1]/30">
                <div className="w-24 h-32 bg-[#FBF2F0] rounded-md overflow-hidden relative shrink-0">
                  {item.imageUrl ? (
                    <Image src={item.imageUrl} alt={item.nome} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#D2A9B1]">
                      <Leaf size={24} />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-cormorant-garamond text-xl text-[#241B1E]">{item.nome}</h3>
                      <p className="text-sm text-gray-500 font-jost mt-1">
                        Cor: {item.cor} | Tamanho: {item.tamanho}
                      </p>
                    </div>
                    <p className="font-jost font-medium text-[#241B1E]">
                      R$ {item.preco.toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                  
                  <div className="flex justify-between items-center mt-4">
                    <div className="flex items-center border border-[#D2A9B1] rounded-md h-9">
                      <button 
                        onClick={() => updateQuantity(item.variantId, item.quantidade - 1)}
                        className="px-3 text-[#241B1E] hover:text-[#7D4F5A]"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center font-jost text-sm">{item.quantidade}</span>
                      <button 
                        onClick={() => updateQuantity(item.variantId, item.quantidade + 1)}
                        className="px-3 text-[#241B1E] hover:text-[#7D4F5A]"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    
                    <button 
                      onClick={() => removeItem(item.variantId)}
                      className="text-sm text-gray-400 hover:text-[#7D4F5A] flex items-center gap-1 font-jost"
                    >
                      <Trash2 size={16} />
                      <span className="hidden sm:inline">Remover</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6">
            <Link href="/" className="text-sm text-[#7D4F5A] underline underline-offset-4 font-jost">
              Continuar comprando
            </Link>
          </div>
        </div>
        
        {/* Resumo */}
        <div className="w-full lg:w-96">
          <div className="bg-[#FBF2F0] p-6 rounded-lg">
            <h2 className="text-2xl font-cormorant-garamond text-[#241B1E] mb-6">Resumo do Pedido</h2>
            
            <div className="space-y-4 font-jost text-[#241B1E]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Frete</span>
                <span>Calculado no checkout</span>
              </div>
              
              <div className="border-t border-[#D2A9B1]/30 pt-4 mt-4">
                <div className="flex justify-between font-medium text-lg">
                  <span>Total estimado</span>
                  <span>R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
                </div>
              </div>
            </div>
            
            <Link 
              href="/checkout"
              className="block w-full text-center bg-[#7D4F5A] text-[#FFF5F7] py-4 rounded-md mt-8 font-jost font-medium hover:bg-opacity-90 transition-colors"
            >
              Finalizar Compra
            </Link>
            
            <p className="text-xs text-center text-gray-500 mt-4 font-jost">
              Pagamento 100% seguro. Suas informações estão protegidas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
