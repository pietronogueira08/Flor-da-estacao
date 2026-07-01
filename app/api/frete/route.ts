import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { cep_destino, itens } = await request.json();

    if (!cep_destino) {
      return NextResponse.json({ error: 'CEP de destino obrigatório' }, { status: 400 });
    }

    // Em sandbox (MELHORENVIO_SANDBOX=true) ou dev mode sem chave: retorna dados mock
    // if (process.env.MELHORENVIO_TOKEN) {
    //   // Integração com Melhor Envio aqui
    // }

    // Mock response para desenvolvimento
    return NextResponse.json({
      opcoes: [
        { id: 'pac', nome: 'PAC', preco: 18.90, prazo: '7-12 dias úteis' },
        { id: 'sedex', nome: 'SEDEX', preco: 34.50, prazo: '2-4 dias úteis' }
      ]
    });
    
  } catch (error) {
    console.error('Erro ao calcular frete:', error);
    return NextResponse.json({ error: 'Erro interno ao calcular frete' }, { status: 500 });
  }
}
