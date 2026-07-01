import { NextResponse } from 'next/server';
import { createClient } from '../../../../lib/supabase/server';
import { Payment } from 'mercadopago';
import { initMercadoPagoClient } from '../../checkout/mp-client';

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get('action') || url.searchParams.get('topic');
    const id = url.searchParams.get('data.id') || url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID não fornecido' }, { status: 400 });
    }

    // Apenas lidamos com eventos de pagamento
    if (action !== 'payment' && action !== 'payment.created' && action !== 'payment.updated') {
      return NextResponse.json({ status: 'ignored' });
    }

    const accessToken = process.env.MP_ACCESS_TOKEN;
    if (!accessToken) {
      console.log('Webhook recebido, mas MP_ACCESS_TOKEN não está configurado.');
      return NextResponse.json({ status: 'ok' });
    }

    const mpClient = initMercadoPagoClient(accessToken);
    const paymentClient = new Payment(mpClient);
    const payment = await paymentClient.get({ id });

    if (payment.status === 'approved') {
      const orderId = payment.external_reference;
      
      if (orderId) {
        const supabase = await createClient();
        
        // 1. Atualiza status do pedido
        await supabase
          .from('orders')
          .update({ status: 'pago', payment_id: id })
          .eq('id', orderId);

        // 2. Busca itens do pedido para decrementar estoque
        const { data: items } = await supabase
          .from('order_items')
          .select('variant_id, quantidade')
          .eq('order_id', orderId);

        if (items && items.length > 0) {
          for (const item of items) {
            // Chama uma procedure RPC no supabase se houver, ou atualiza via update
            // O mais seguro para concorrência seria RPC, mas podemos fazer lendo e escrevendo
            const { data: variant } = await supabase
              .from('product_variants')
              .select('estoque')
              .eq('id', item.variant_id)
              .single();

            if (variant && variant.estoque !== null) {
              await supabase
                .from('product_variants')
                .update({ estoque: Math.max(0, variant.estoque - item.quantidade) })
                .eq('id', item.variant_id);

              // Registra movimentação
              await supabase
                .from('stock_movements')
                .insert({
                  variant_id: item.variant_id,
                  variacao_qtd: -item.quantidade,
                  motivo: `Venda pedido ${orderId}`
                });
            }
          }
        }
      }
    }

    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error('Erro no webhook MP:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
