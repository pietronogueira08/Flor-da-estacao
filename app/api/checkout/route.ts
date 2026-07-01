import { NextResponse } from 'next/server';
import { createClient } from '../../../lib/supabase/server';
import { Preference } from 'mercadopago';
import { initMercadoPagoClient } from './mp-client'; // We'll create this or just inline MP setup

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { carrinho, endereco, frete } = body;

    if (!carrinho || carrinho.length === 0) {
      return NextResponse.json({ error: 'Carrinho vazio' }, { status: 400 });
    }

    const supabase = await createClient();

    // 1. Valida estoque de cada variante
    for (const item of carrinho) {
      const { data: variant, error } = await supabase
        .from('product_variants')
        .select('estoque, products(name)')
        .eq('id', item.variantId)
        .single();
        
      if (!variant) {
        // Se estiver em modo mock/sem supabase configurado, pula
        continue;
      }
      
      if (variant.estoque !== null && variant.estoque < item.quantidade) {
        return NextResponse.json(
          { error: `Estoque insuficiente para ${item.nome}` },
          { status: 400 }
        );
      }
    }

    const subtotal = carrinho.reduce((acc: number, item: any) => acc + (item.preco * item.quantidade), 0);
    const total = subtotal + (frete?.preco || 0);

    // 2. Cria registro em orders
    // Gerar um UUID se o Supabase não estiver configurado (fallback)
    const mockOrderId = crypto.randomUUID();
    
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        id: process.env.NEXT_PUBLIC_SUPABASE_URL !== 'your_supabase_project_url' ? undefined : mockOrderId,
        cliente_nome: endereco.nome,
        cliente_email: endereco.email,
        cliente_telefone: endereco.telefone,
        endereco: endereco,
        frete: frete?.preco || 0,
        subtotal: subtotal,
        total: total,
        status: 'pendente'
      })
      .select('id')
      .single();

    const orderId = orderData?.id || mockOrderId;

    // 3. Cria registros em order_items
    if (orderData?.id) {
      const orderItems = carrinho.map((item: any) => ({
        order_id: orderId,
        variant_id: item.variantId,
        quantidade: item.quantidade,
        preco_unitario: item.preco
      }));
      
      await supabase.from('order_items').insert(orderItems);
    }

    // 4. Cria preferência no Mercado Pago ou Mock
    const accessToken = process.env.MP_ACCESS_TOKEN;
    
    if (!accessToken || accessToken.startsWith('TEST-') || accessToken === 'mock') {
      return NextResponse.json({ orderId, mockPayment: true });
    }

    // Integração MP Real
    const mpClient = initMercadoPagoClient(accessToken);
    const preference = new Preference(mpClient);

    const preferenceData = await preference.create({
      body: {
        items: carrinho.map((item: any) => ({
          id: item.variantId,
          title: item.nome,
          quantity: item.quantidade,
          unit_price: item.preco,
          currency_id: 'BRL'
        })),
        payer: {
          name: endereco.nome,
          email: endereco.email
        },
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_APP_URL}/pedido/${orderId}`,
          failure: `${process.env.NEXT_PUBLIC_APP_URL}/checkout`,
          pending: `${process.env.NEXT_PUBLIC_APP_URL}/pedido/${orderId}`
        },
        auto_return: 'approved',
        external_reference: orderId,
        notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhook/mercadopago`
      }
    });

    return NextResponse.json({ orderId, preferenceId: preferenceData.id });

  } catch (error) {
    console.error('Erro ao processar checkout:', error);
    return NextResponse.json({ error: 'Erro interno ao processar pedido' }, { status: 500 });
  }
}
