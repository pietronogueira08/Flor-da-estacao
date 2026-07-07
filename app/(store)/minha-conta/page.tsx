"use client";

import React, { useState } from 'react';
import { Search, Package, Clock, CheckCircle, Truck } from 'lucide-react';
import { createClient } from '../../../lib/supabase/client';
import Link from 'next/link';

const supabase = createClient();

export default function MinhaContaPage() {
  const [email, setEmail] = useState('');
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const buscarPedidos = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setSearched(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('cliente_email', email)
        .order('criado_em', { ascending: false });
        
      if (data) {
        setPedidos(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status.toLowerCase()) {
      case 'pendente': return <Clock size={16} className="text-yellow-600" />;
      case 'pago': return <CheckCircle size={16} className="text-[#6B7860]" />;
      case 'enviado': return <Truck size={16} className="text-blue-600" />;
      default: return <Package size={16} className="text-gray-600" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch(status.toLowerCase()) {
      case 'pendente': return 'Aguardando Pagamento';
      case 'pago': return 'Pagamento Confirmado';
      case 'enviado': return 'Em Transporte';
      default: return status;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 min-h-[70vh]">
      <h1 className="text-4xl font-cormorant-garamond text-escuro mb-2 text-center">Meus Pedidos</h1>
      <p className="text-gray-500 font-archivo text-center mb-10">Acompanhe o status das suas compras na loja.</p>
      
      <div className="max-w-md mx-auto bg-branco border border-claro p-6 rounded-lg mb-12">
        <form onSubmit={buscarPedidos} className="space-y-4">
          <div>
            <label className="block text-sm font-jost text-escuro mb-2">Digite seu e-mail de compra</label>
            <div className="relative">
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="exemplo@email.com"
                className="w-full border border-[#D2A9B1] rounded p-3 pl-10 focus:outline-none focus:border-[#7D4F5A] font-jost"
                required
              />
              <Search className="absolute left-3 top-3.5 text-gray-400" size={18} />
            </div>
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-[#7D4F5A] text-[#FFF5F7] py-3 rounded font-jost font-medium hover:bg-opacity-90 disabled:opacity-70 transition-colors"
          >
            {loading ? 'Buscando...' : 'Buscar Pedidos'}
          </button>
        </form>
      </div>

      {searched && !loading && pedidos.length === 0 && (
        <div className="text-center text-gray-500 font-jost bg-gray-50 py-12 rounded-lg border border-gray-100">
          Nenhum pedido encontrado para o e-mail <strong>{email}</strong>.<br/>
          Verifique se digitou corretamente o e-mail usado na compra.
        </div>
      )}

      {pedidos.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-cormorant-garamond text-[#241B1E] mb-6">Seus Pedidos ({pedidos.length})</h2>
          
          {pedidos.map(pedido => (
            <div key={pedido.id} className="border border-[#D2A9B1]/30 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
              <div className="bg-[#FFF5F7] px-6 py-4 border-b border-[#D2A9B1]/30 flex flex-wrap justify-between items-center gap-4">
                <div>
                  <p className="text-xs text-gray-500 font-jost uppercase tracking-wider">Pedido</p>
                  <p className="font-semibold text-[#241B1E] font-jost">{pedido.id.split('-')[0].toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-jost uppercase tracking-wider">Data</p>
                  <p className="text-[#241B1E] font-jost">{new Date(pedido.criado_em).toLocaleDateString('pt-BR')}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-jost uppercase tracking-wider">Total</p>
                  <p className="font-medium text-[#241B1E] font-jost">R$ {pedido.total?.toFixed(2).replace('.', ',')}</p>
                </div>
                <Link href={`/pedido/${pedido.id}`} className="text-[#7D4F5A] text-sm font-medium hover:underline font-jost">
                  Ver detalhes
                </Link>
              </div>
              <div className="px-6 py-5 bg-white">
                <div className="flex items-center gap-2 font-jost">
                  {getStatusIcon(pedido.status)}
                  <span className="font-medium text-[#241B1E]">{getStatusLabel(pedido.status)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
