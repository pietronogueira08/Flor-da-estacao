import { NextRequest, NextResponse } from 'next/server'

// Declaração de Conteúdo Eletrônica — Correios
// Gera um HTML imprimível com os dados do pedido no padrão dos Correios
export async function POST(request: NextRequest) {
  const body = await request.json()
  const { order } = body

  if (!order) {
    return NextResponse.json({ error: 'order é obrigatório' }, { status: 400 })
  }

  const items = order.order_items ?? []
  const endereco = order.endereco ?? {}
  const dataHoje = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  })

  const itensRows = items.map((item: any, i: number) => {
    const nome = item.product_variants?.products?.nome ?? 'Produto'
    const variante = [item.product_variants?.tamanho, item.product_variants?.cor].filter(Boolean).join(' / ')
    return `
      <tr>
        <td>${i + 1}</td>
        <td>${nome}${variante ? ` (${variante})` : ''}</td>
        <td style="text-align:center">${item.quantidade ?? 1}</td>
        <td style="text-align:right">R$ ${Number(item.preco_unitario ?? 0).toFixed(2).replace('.', ',')}</td>
        <td style="text-align:right">R$ ${(Number(item.preco_unitario ?? 0) * Number(item.quantidade ?? 1)).toFixed(2).replace('.', ',')}</td>
      </tr>
    `
  }).join('')

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Declaração de Conteúdo — Pedido ${order.id?.slice(0, 8).toUpperCase()}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; font-size: 11px; color: #000; padding: 20px; }
    .header { text-align: center; border: 2px solid #000; padding: 10px; margin-bottom: 12px; }
    .header h1 { font-size: 16px; font-weight: bold; }
    .header p { font-size: 11px; margin-top: 4px; }
    .section { border: 1px solid #000; margin-bottom: 10px; }
    .section-title { background: #000; color: #fff; padding: 4px 8px; font-weight: bold; font-size: 11px; }
    .section-body { padding: 8px; }
    .row { display: flex; gap: 20px; margin-bottom: 4px; }
    .field { flex: 1; }
    .field label { font-weight: bold; font-size: 10px; }
    .field span { display: block; border-bottom: 1px solid #999; padding: 1px 0; min-height: 14px; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #eee; border: 1px solid #000; padding: 4px; text-align: left; font-size: 10px; }
    td { border: 1px solid #000; padding: 4px; font-size: 10px; }
    .totals { text-align: right; margin-top: 6px; font-size: 11px; }
    .totals strong { font-size: 13px; }
    .footer { margin-top: 12px; border-top: 1px solid #000; padding-top: 8px; font-size: 10px; }
    .assinatura { margin-top: 30px; display: flex; justify-content: space-between; }
    .assinatura div { border-top: 1px solid #000; width: 200px; text-align: center; padding-top: 4px; font-size: 10px; }
    @media print {
      body { padding: 10px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="margin-bottom:12px">
    <button onclick="window.print()" style="padding:8px 18px;background:#000;color:#fff;border:none;cursor:pointer;font-size:13px;border-radius:2px">
      🖨️ Imprimir Declaração
    </button>
    <button onclick="window.close()" style="padding:8px 18px;background:#eee;color:#000;border:1px solid #ccc;cursor:pointer;font-size:13px;border-radius:2px;margin-left:8px">
      Fechar
    </button>
  </div>

  <div class="header">
    <h1>DECLARAÇÃO DE CONTEÚDO</h1>
    <p>Correios do Brasil — Encomenda Nacional</p>
    <p>Nº Pedido: <strong>${order.id?.slice(0, 8).toUpperCase()}</strong> &nbsp;|&nbsp; Data: <strong>${dataHoje}</strong></p>
  </div>

  <div class="section">
    <div class="section-title">REMETENTE</div>
    <div class="section-body">
      <div class="row">
        <div class="field"><label>Nome / Razão Social</label><span>Atelier Zaya</span></div>
        <div class="field"><label>CPF / CNPJ</label><span></span></div>
      </div>
      <div class="row">
        <div class="field"><label>Endereço</label><span>Av. Liberdade, 306 — Grussaí</span></div>
        <div class="field"><label>CEP</label><span>28200-000</span></div>
      </div>
      <div class="row">
        <div class="field"><label>Cidade</label><span>São João da Barra</span></div>
        <div class="field"><label>UF</label><span>RJ</span></div>
        <div class="field"><label>Telefone</label><span>(22) 99916-3206</span></div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">DESTINATÁRIO</div>
    <div class="section-body">
      <div class="row">
        <div class="field"><label>Nome</label><span>${endereco.nome ?? order.cliente_nome ?? ''}</span></div>
        <div class="field"><label>Telefone</label><span>${order.cliente_telefone ?? ''}</span></div>
      </div>
      <div class="row">
        <div class="field"><label>Endereço</label><span>${endereco.rua ?? ''}, ${endereco.numero ?? ''}${endereco.complemento ? ` — ${endereco.complemento}` : ''}</span></div>
        <div class="field"><label>CEP</label><span>${endereco.cep ?? ''}</span></div>
      </div>
      <div class="row">
        <div class="field"><label>Bairro</label><span>${endereco.bairro ?? ''}</span></div>
        <div class="field"><label>Cidade</label><span>${endereco.cidade ?? ''}</span></div>
        <div class="field"><label>UF</label><span>${endereco.estado ?? ''}</span></div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">CONTEÚDO DA ENCOMENDA</div>
    <div class="section-body">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Descrição do Produto</th>
            <th style="text-align:center">Qtd.</th>
            <th style="text-align:right">Valor Unit.</th>
            <th style="text-align:right">Valor Total</th>
          </tr>
        </thead>
        <tbody>
          ${itensRows || `<tr><td colspan="5" style="text-align:center">—</td></tr>`}
        </tbody>
      </table>
      <div class="totals">
        <p>Subtotal: R$ ${Number(order.subtotal ?? 0).toFixed(2).replace('.', ',')}</p>
        <p>Frete: R$ ${Number(order.frete ?? 0).toFixed(2).replace('.', ',')}</p>
        <p><strong>Total: R$ ${Number(order.total ?? 0).toFixed(2).replace('.', ',')}</strong></p>
      </div>
    </div>
  </div>

  <div class="footer">
    <p>Declaro que o conteúdo desta encomenda está descrito corretamente acima e que não há substâncias ilícitas ou materiais proibidos pelos Correios.</p>
    <div class="assinatura">
      <div>Assinatura do Remetente</div>
      <div>Atelier Zaya — ${dataHoje}</div>
    </div>
  </div>
</body>
</html>`

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  })
}
