'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { ShoppingCart, TrendingUp, Package, AlertTriangle, Flower2 } from 'lucide-react'

interface DashboardData {
  pedidosHoje: number
  totalReceita: number
  produtosAtivos: number
  estoqueBaixo: number
  pedidosRecentes: Array<{
    id: string
    cliente_nome: string
    total: number
    status: string
    criado_em: string
  }>
  maisVendidos: Array<{
    id: string
    nome: string
    total: number
    preco: number
  }>
  graficoVendas: Array<{
    data: string
    valor: number
  }>
}

const statusColors: Record<string, string> = {
  pendente:  'bg-yellow-100 text-yellow-800 border-yellow-200',
  pago:      'bg-blue-100 text-blue-800 border-blue-200',
  enviado:   'bg-purple-100 text-purple-800 border-purple-200',
  entregue:  'bg-green-100 text-green-800 border-green-200',
  cancelado: 'bg-red-100 text-red-800 border-red-200',
}

const statusLabels: Record<string, string> = {
  pendente:  'Pendente',
  pago:      'Pago',
  enviado:   'Enviado',
  entregue:  'Entregue',
  cancelado: 'Cancelado',
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

interface MetricCardProps {
  title: string
  value: string | number
  subtitle: string
  icon: React.ReactNode
  accent?: boolean
  warning?: boolean
}

function MetricCard({ title, value, subtitle, icon, accent, warning }: MetricCardProps) {
  return (
    <div
      className={`bg-marfim border rounded-sm p-6 shadow-sm ${
        warning ? 'border-red-200' : 'border-rosa-antigo/30'
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="font-jost text-xs uppercase tracking-wider text-carvao/50 mb-2">
            {title}
          </p>
          <p
            className={`font-cormorant text-4xl font-semibold ${
              warning ? 'text-red-600' : accent ? 'text-ameixa' : 'text-carvao'
            }`}
          >
            {value}
          </p>
          <p className="font-jost text-xs text-carvao/50 mt-2">{subtitle}</p>
        </div>
        <div
          className={`p-3 rounded-sm ${
            warning ? 'bg-red-50 text-red-400' : 'bg-rosa-antigo/20 text-ameixa'
          }`}
        >
          {icon}
        </div>
      </div>
    </div>
  )
}

// Estado vazio — Supabase não configurado
function EmptyState() {
  return (
    <div className="min-h-screen bg-nevoa">
      <div className="border-b border-rosa-antigo/30 bg-marfim px-8 py-6">
        <h1 className="font-cormorant text-3xl text-carvao italic">Dashboard</h1>
        <p className="font-jost text-sm text-musgo mt-1">Estação OS · Visão Geral</p>
      </div>
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <div className="text-center">
          <Flower2 size={48} className="text-rosa-antigo/40 mx-auto mb-4" />
          <h2 className="font-cormorant text-2xl text-carvao/50 italic">
            Conecte o Supabase para ver os dados
          </h2>
          <p className="font-jost text-sm text-carvao/40 mt-2 max-w-sm">
            Configure as variáveis de ambiente no arquivo{' '}
            <code className="font-mono text-xs bg-rosa-antigo/10 px-1 rounded">.env.local</code>{' '}
            para exibir as métricas da loja.
          </p>
          <div className="mt-4 bg-marfim border border-rosa-antigo/30 rounded-sm p-4 text-left max-w-sm mx-auto">
            <p className="font-mono text-xs text-carvao/60 space-y-1">
              <span className="block">NEXT_PUBLIC_SUPABASE_URL=...</span>
              <span className="block">NEXT_PUBLIC_SUPABASE_ANON_KEY=...</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DashboardClient({ data }: { data: DashboardData | null }) {
  if (!data) return <EmptyState />

  return (
    <div className="min-h-screen bg-nevoa">
      {/* Header */}
      <div className="border-b border-rosa-antigo/30 bg-marfim px-8 py-6">
        <h1 className="font-cormorant text-3xl text-carvao italic">Dashboard</h1>
        <p className="font-jost text-sm text-musgo mt-1">Estação OS · Visão Geral</p>
      </div>

      <div className="p-8 space-y-8">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <MetricCard
            title="Pedidos Hoje"
            value={data.pedidosHoje}
            subtitle="novos pedidos"
            icon={<ShoppingCart size={22} />}
          />
          <MetricCard
            title="Receita do Mês"
            value={formatCurrency(data.totalReceita)}
            subtitle="pedidos pagos/enviados/entregues"
            icon={<TrendingUp size={22} />}
            accent
          />
          <MetricCard
            title="Produtos Ativos"
            value={data.produtosAtivos}
            subtitle="no catálogo"
            icon={<Package size={22} />}
          />
          <MetricCard
            title="Estoque Baixo"
            value={data.estoqueBaixo}
            subtitle="variantes com ≤ 3 unidades"
            icon={<AlertTriangle size={22} />}
            warning={data.estoqueBaixo > 0}
          />
        </div>

        {/* Chart */}
        <div className="bg-marfim border border-rosa-antigo/30 rounded-sm shadow-sm p-6">
          <h2 className="font-cormorant text-xl text-carvao italic mb-1">
            Vendas — Últimos 30 dias
          </h2>
          <p className="font-jost text-xs text-carvao/50 mb-6">
            Receita diária de pedidos confirmados
          </p>
          {data.graficoVendas.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={data.graficoVendas}>
                <defs>
                  <linearGradient id="colorVendas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D2A9B1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#D2A9B1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#D2A9B1" strokeOpacity={0.3} />
                <XAxis
                  dataKey="data"
                  tick={{ fontFamily: 'Jost', fontSize: 11, fill: '#241B1E80' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontFamily: 'Jost', fontSize: 11, fill: '#241B1E80' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `R$${v}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFF5F7',
                    border: '1px solid #D2A9B1',
                    borderRadius: '2px',
                    fontFamily: 'Jost',
                    fontSize: 12,
                  }}
                  formatter={(value) => [formatCurrency(Number(value) || 0), 'Receita']}
                />
                <Area
                  type="monotone"
                  dataKey="valor"
                  stroke="#7D4F5A"
                  strokeWidth={2}
                  fill="url(#colorVendas)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-60 flex items-center justify-center">
              <p className="font-jost text-sm text-carvao/40">
                Nenhuma venda confirmada nos últimos 30 dias
              </p>
            </div>
          )}
        </div>

        {/* Bottom grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Mais vendidos */}
          <div className="bg-marfim border border-rosa-antigo/30 rounded-sm shadow-sm p-6">
            <h2 className="font-cormorant text-xl text-carvao italic mb-1">
              Produtos Mais Vendidos
            </h2>
            <p className="font-jost text-xs text-carvao/50 mb-4">Top 5 por quantidade</p>
            {data.maisVendidos.length > 0 ? (
              <div className="space-y-3">
                {data.maisVendidos.map((produto, idx) => (
                  <div
                    key={produto.id}
                    className="flex items-center gap-4 py-2 border-b border-rosa-antigo/10 last:border-0"
                  >
                    <span className="font-cormorant text-2xl text-rosa-antigo/50 w-6 text-center">
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-jost text-sm text-carvao truncate">{produto.nome}</p>
                      <p className="font-jost text-xs text-musgo">
                        {formatCurrency(produto.preco)}
                      </p>
                    </div>
                    <span className="font-jost text-sm font-medium text-ameixa">
                      {produto.total} un.
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="font-jost text-sm text-carvao/40 py-4 text-center">
                Nenhuma venda registrada
              </p>
            )}
          </div>

          {/* Pedidos recentes */}
          <div className="bg-marfim border border-rosa-antigo/30 rounded-sm shadow-sm p-6">
            <h2 className="font-cormorant text-xl text-carvao italic mb-1">
              Pedidos Recentes
            </h2>
            <p className="font-jost text-xs text-carvao/50 mb-4">Últimos 5 pedidos</p>
            {data.pedidosRecentes.length > 0 ? (
              <div className="space-y-3">
                {data.pedidosRecentes.map((pedido) => (
                  <div
                    key={pedido.id}
                    className="flex items-center gap-4 py-2 border-b border-rosa-antigo/10 last:border-0"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-jost text-sm text-carvao truncate">
                        {pedido.cliente_nome}
                      </p>
                      <p className="font-jost text-xs text-carvao/50">
                        {formatDate(pedido.criado_em)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-jost text-xs px-2 py-0.5 rounded-full border ${
                          statusColors[pedido.status] ?? 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {statusLabels[pedido.status] ?? pedido.status}
                      </span>
                      <span className="font-jost text-sm font-medium text-carvao">
                        {formatCurrency(pedido.total)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="font-jost text-sm text-carvao/40 py-4 text-center">
                Nenhum pedido registrado
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
