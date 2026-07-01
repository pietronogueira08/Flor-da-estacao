"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCart } from '@/lib/hooks/useCart';
import { useRouter } from 'next/navigation';
import { MapPin, Truck, CreditCard, CheckCircle2, ChevronRight, Loader2 } from 'lucide-react';
import { Payment } from '@mercadopago/sdk-react';
import { initMercadoPago } from '@mercadopago/sdk-react';
import Image from 'next/image';

initMercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY || 'TEST-00000000-0000-0000-0000-000000000000');

const enderecoSchema = z.object({
  nome: z.string().min(3, "Nome completo obrigatório"),
  email: z.string().email("E-mail inválido"),
  telefone: z.string().min(10, "Telefone inválido"),
  cep: z.string().length(8, "CEP deve ter 8 números"),
  rua: z.string().min(2, "Rua obrigatória"),
  numero: z.string().min(1, "Número obrigatório"),
  complemento: z.string().optional(),
  bairro: z.string().min(2, "Bairro obrigatório"),
  cidade: z.string().min(2, "Cidade obrigatória"),
  estado: z.string().length(2, "UF inválida"),
});

type EnderecoData = z.infer<typeof enderecoSchema>;

export default function CheckoutPage() {
  const { items, clearCart } = useCart();
  const cartTotal = items.reduce((acc, item) => acc + item.preco * item.quantidade, 0);
  const router = useRouter();
  
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [endereco, setEndereco] = useState<EnderecoData | null>(null);
  
  const [freteOpcoes, setFreteOpcoes] = useState<any[]>([]);
  const [freteSelecionado, setFreteSelecionado] = useState<any | null>(null);
  const [loadingFrete, setLoadingFrete] = useState(false);
  
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  
  // Fake payment for dev
  const [isDevMock, setIsDevMock] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<EnderecoData>({
    resolver: zodResolver(enderecoSchema)
  });

  const cep = watch('cep');

  useEffect(() => {
    if (items.length === 0 && step === 1) {
      router.push('/carrinho');
    }
  }, [items, router, step]);

  useEffect(() => {
    if (cep && cep.replace(/\D/g, '').length === 8) {
      const fetchCep = async () => {
        try {
          const res = await fetch(`https://viacep.com.br/ws/${cep.replace(/\D/g, '')}/json/`);
          const data = await res.json();
          if (!data.erro) {
            setValue('rua', data.logradouro);
            setValue('bairro', data.bairro);
            setValue('cidade', data.localidade);
            setValue('estado', data.uf);
          }
        } catch (e) {
          console.error(e);
        }
      };
      fetchCep();
    }
  }, [cep, setValue]);

  const onEnderecoSubmit = (data: EnderecoData) => {
    setEndereco(data);
    setStep(2);
    calcularFrete(data.cep);
  };

  const calcularFrete = async (cepDestino: string) => {
    setLoadingFrete(true);
    try {
      const res = await fetch('/api/frete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cep_destino: cepDestino, itens: items })
      });
      const data = await res.json();
      setFreteOpcoes(data.opcoes);
    } catch (e) {
      console.error(e);
      // Fallback fallback
      setFreteOpcoes([
        { id: 'pac', nome: 'PAC', preco: 18.90, prazo: '7-12 dias úteis' },
        { id: 'sedex', nome: 'SEDEX', preco: 34.50, prazo: '2-4 dias úteis' }
      ]);
    } finally {
      setLoadingFrete(false);
    }
  };

  const continuarParaPagamento = async () => {
    if (!freteSelecionado) return;
    
    setLoadingCheckout(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          carrinho: items,
          endereco,
          frete: freteSelecionado
        })
      });
      
      const data = await res.json();
      
      if (data.error) {
        alert(data.error);
        return;
      }
      
      setOrderId(data.orderId);
      
      if (data.mockPayment) {
        setIsDevMock(true);
      } else if (data.preferenceId) {
        setPreferenceId(data.preferenceId);
      }
      
      setStep(3);
    } catch (e) {
      console.error(e);
      alert('Erro ao processar o checkout.');
    } finally {
      setLoadingCheckout(false);
    }
  };

  const simularPagamentoDev = async () => {
    setLoadingCheckout(true);
    // Simula atualizar pedido
    setTimeout(() => {
      clearCart();
      router.push(`/pedido/${orderId}`);
    }, 1500);
  };

  const totalGeral = cartTotal + (freteSelecionado?.preco || 0);

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-cormorant-garamond text-[#241B1E] mb-8 text-center">Finalizar Compra</h1>
      
      {/* Stepper */}
      <div className="flex items-center justify-center mb-12">
        <div className={`flex items-center ${step >= 1 ? 'text-[#7D4F5A]' : 'text-gray-400'}`}>
          <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center mr-2 border-current">
            <MapPin size={16} />
          </div>
          <span className="font-jost text-sm font-medium hidden sm:inline">Endereço</span>
        </div>
        <div className={`w-16 h-px mx-4 ${step >= 2 ? 'bg-[#7D4F5A]' : 'bg-gray-300'}`} />
        <div className={`flex items-center ${step >= 2 ? 'text-[#7D4F5A]' : 'text-gray-400'}`}>
          <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center mr-2 border-current">
            <Truck size={16} />
          </div>
          <span className="font-jost text-sm font-medium hidden sm:inline">Frete</span>
        </div>
        <div className={`w-16 h-px mx-4 ${step >= 3 ? 'bg-[#7D4F5A]' : 'bg-gray-300'}`} />
        <div className={`flex items-center ${step >= 3 ? 'text-[#7D4F5A]' : 'text-gray-400'}`}>
          <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center mr-2 border-current">
            <CreditCard size={16} />
          </div>
          <span className="font-jost text-sm font-medium hidden sm:inline">Pagamento</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Main Content */}
        <div className="flex-1">
          {step === 1 && (
            <div className="bg-white p-6 rounded-lg border border-[#D2A9B1]/30">
              <h2 className="text-2xl font-cormorant-garamond text-[#241B1E] mb-6">Dados de Entrega</h2>
              <form onSubmit={handleSubmit(onEnderecoSubmit)} className="space-y-4 font-jost">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1 text-gray-700">Nome Completo</label>
                    <input {...register('nome')} className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:border-[#7D4F5A]" />
                    {errors.nome && <p className="text-red-500 text-xs mt-1">{errors.nome.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm mb-1 text-gray-700">E-mail</label>
                    <input type="email" {...register('email')} className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:border-[#7D4F5A]" />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm mb-1 text-gray-700">Telefone (WhatsApp)</label>
                    <input {...register('telefone')} className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:border-[#7D4F5A]" />
                    {errors.telefone && <p className="text-red-500 text-xs mt-1">{errors.telefone.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm mb-1 text-gray-700">CEP (Apenas números)</label>
                    <input {...register('cep')} maxLength={8} className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:border-[#7D4F5A]" />
                    {errors.cep && <p className="text-red-500 text-xs mt-1">{errors.cep.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
                  <div className="md:col-span-3">
                    <label className="block text-sm mb-1 text-gray-700">Rua</label>
                    <input {...register('rua')} className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:border-[#7D4F5A]" />
                    {errors.rua && <p className="text-red-500 text-xs mt-1">{errors.rua.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm mb-1 text-gray-700">Número</label>
                    <input {...register('numero')} className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:border-[#7D4F5A]" />
                    {errors.numero && <p className="text-red-500 text-xs mt-1">{errors.numero.message}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm mb-1 text-gray-700">Complemento</label>
                    <input {...register('complemento')} className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:border-[#7D4F5A]" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm mb-1 text-gray-700">Bairro</label>
                    <input {...register('bairro')} className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:border-[#7D4F5A]" />
                    {errors.bairro && <p className="text-red-500 text-xs mt-1">{errors.bairro.message}</p>}
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-sm mb-1 text-gray-700">Cidade</label>
                    <input {...register('cidade')} className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:border-[#7D4F5A]" />
                    {errors.cidade && <p className="text-red-500 text-xs mt-1">{errors.cidade.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm mb-1 text-gray-700">UF</label>
                    <input {...register('estado')} maxLength={2} className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:border-[#7D4F5A]" />
                    {errors.estado && <p className="text-red-500 text-xs mt-1">{errors.estado.message}</p>}
                  </div>
                </div>

                <div className="pt-6 flex justify-end">
                  <button type="submit" className="bg-[#7D4F5A] text-[#FFF5F7] px-8 py-3 rounded-md font-medium hover:bg-opacity-90 flex items-center">
                    Continuar para Frete <ChevronRight size={18} className="ml-2" />
                  </button>
                </div>
              </form>
            </div>
          )}

          {step === 2 && (
            <div className="bg-white p-6 rounded-lg border border-[#D2A9B1]/30">
              <h2 className="text-2xl font-cormorant-garamond text-[#241B1E] mb-6">Opções de Frete</h2>
              
              <div className="mb-6 p-4 bg-[#FBF2F0] rounded-md flex justify-between items-center">
                <div className="text-sm font-jost text-gray-700">
                  <span className="font-semibold block mb-1">Entregar em:</span>
                  {endereco?.rua}, {endereco?.numero} {endereco?.complemento && `- ${endereco?.complemento}`}<br />
                  {endereco?.cidade} / {endereco?.estado} - CEP: {endereco?.cep}
                </div>
                <button onClick={() => setStep(1)} className="text-[#7D4F5A] text-sm underline font-jost">Editar</button>
              </div>

              {loadingFrete ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 text-[#7D4F5A] animate-spin" />
                </div>
              ) : (
                <div className="space-y-4 font-jost">
                  {freteOpcoes.map((opcao) => (
                    <label key={opcao.id} className={`flex items-center justify-between p-4 border rounded-md cursor-pointer transition-colors ${freteSelecionado?.id === opcao.id ? 'border-[#7D4F5A] bg-[#FFF5F7]' : 'border-gray-200 hover:border-[#D2A9B1]'}`}>
                      <div className="flex items-center">
                        <input 
                          type="radio" 
                          name="frete" 
                          className="mr-4 accent-[#7D4F5A] w-4 h-4" 
                          checked={freteSelecionado?.id === opcao.id}
                          onChange={() => setFreteSelecionado(opcao)}
                        />
                        <div>
                          <span className="font-medium text-[#241B1E] block">{opcao.nome}</span>
                          <span className="text-sm text-gray-500">Entrega em {opcao.prazo}</span>
                        </div>
                      </div>
                      <span className="font-semibold text-[#241B1E]">R$ {opcao.preco.toFixed(2).replace('.', ',')}</span>
                    </label>
                  ))}
                </div>
              )}

              <div className="pt-8 flex justify-between">
                <button onClick={() => setStep(1)} className="text-gray-500 font-jost font-medium px-4 py-2 hover:bg-gray-50 rounded-md">
                  Voltar
                </button>
                <button 
                  onClick={continuarParaPagamento} 
                  disabled={!freteSelecionado || loadingCheckout}
                  className="bg-[#7D4F5A] text-[#FFF5F7] px-8 py-3 rounded-md font-medium hover:bg-opacity-90 disabled:opacity-50 flex items-center"
                >
                  {loadingCheckout ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                  Ir para Pagamento <ChevronRight size={18} className="ml-2" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="bg-white p-6 rounded-lg border border-[#D2A9B1]/30">
              <h2 className="text-2xl font-cormorant-garamond text-[#241B1E] mb-6">Pagamento</h2>
              
              {isDevMock ? (
                <div className="p-6 border border-yellow-300 bg-yellow-50 rounded-md font-jost text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-yellow-200 text-yellow-700 mb-4">
                    <CheckCircle2 size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-yellow-800 mb-2">Modo de Desenvolvimento</h3>
                  <p className="text-sm text-yellow-700 mb-6">O pagamento simulado foi ativado. Clique abaixo para confirmar o pedido.</p>
                  
                  <button 
                    onClick={simularPagamentoDev}
                    disabled={loadingCheckout}
                    className="bg-yellow-600 text-white px-8 py-3 rounded-md font-medium hover:bg-yellow-700 transition-colors w-full flex justify-center items-center"
                  >
                    {loadingCheckout ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                    Confirmar Pedido Simulado
                  </button>
                </div>
              ) : preferenceId ? (
                <div className="min-h-[400px]">
                  <Payment 
                    initialization={{ preferenceId, amount: totalGeral }}
                    customization={{ paymentMethods: { creditCard: 'all', debitCard: 'all', ticket: 'all', bankTransfer: 'all' } }}
                    onSubmit={async (param) => {
                       // O Mercado Pago trata aqui
                    }}
                    onReady={() => console.log('MP Ready')}
                    onError={(error) => console.error(error)}
                  />
                </div>
              ) : (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 text-[#7D4F5A] animate-spin" />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Resumo Lateral */}
        <div className="w-full lg:w-80">
          <div className="bg-[#FBF2F0] p-6 rounded-lg sticky top-24">
            <h3 className="text-xl font-cormorant-garamond text-[#241B1E] mb-4 border-b border-[#D2A9B1]/30 pb-4">Resumo do Pedido</h3>
            
            <div className="space-y-4 mb-4 max-h-60 overflow-y-auto pr-2">
              {items.map(item => (
                <div key={item.variantId} className="flex gap-3">
                  <div className="w-12 h-16 bg-white rounded flex-shrink-0 relative overflow-hidden">
                    {item.imageUrl && <Image src={item.imageUrl} alt={item.nome} fill className="object-cover" />}
                  </div>
                  <div className="font-jost flex-1">
                    <p className="text-sm text-[#241B1E] font-medium leading-tight">{item.nome}</p>
                    <p className="text-xs text-gray-500 mt-1">{item.quantidade}x R$ {item.preco.toFixed(2).replace('.', ',')}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t border-[#D2A9B1]/30 pt-4 space-y-2 font-jost text-sm text-[#241B1E]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
              </div>
              <div className="flex justify-between">
                <span>Frete</span>
                <span>{freteSelecionado ? `R$ ${freteSelecionado.preco.toFixed(2).replace('.', ',')}` : '---'}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 mt-2 border-t border-[#D2A9B1]/30">
                <span>Total</span>
                <span>R$ {totalGeral.toFixed(2).replace('.', ',')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
