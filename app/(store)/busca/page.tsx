import React from "react";
import { ProductCard } from "@/components/store/ProductCard";
import { Divider } from "@/components/ui/Divider";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Busca | Flor da Estação",
};

export default async function BuscaPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q || "";
  const supabase = await createClient();

  // Se houvesse busca real (ilike etc), faria aqui. Usando fetch simples para simular.
  const { data: products } = await supabase.from("produtos").select("*").order("created_at", { ascending: false });

  // Filter in memory for fallback if query exists
  const filtered = (products || []).filter((p: any) => 
    p.nome.toLowerCase().includes(query.toLowerCase()) || 
    (p.categoria && p.categoria.toLowerCase().includes(query.toLowerCase()))
  );

  const catalogo = filtered.length > 0 ? filtered : query ? [] : [
    { id: "1", slug: "vestido-floral-1", nome: "Vestido Midi Floral", preco: 289.90, categoria: "Vestidos", is_placeholder: true },
    { id: "2", slug: "blusa-linho-2", nome: "Blusa de Linho Romântica", preco: 159.90, categoria: "Blusas", is_placeholder: true },
  ];

  return (
    <div className="container mx-auto px-4 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="font-cormorant text-5xl text-carvao italic mb-6">Busca</h1>
        
        <form className="max-w-md mx-auto relative flex" action="/busca" method="GET">
          <input 
            type="text" 
            name="q"
            defaultValue={query}
            placeholder="O que você procura?" 
            className="w-full border-b-2 border-rosa-antigo/50 bg-transparent px-2 py-3 focus:outline-none focus:border-ameixa transition-colors font-jost text-lg" 
          />
          <button type="submit" className="absolute right-2 top-3 text-ameixa">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </button>
        </form>

        {query && (
          <p className="font-jost text-musgo mt-6">
            Resultados para: <strong className="text-carvao">"{query}"</strong>
          </p>
        )}
      </div>

      <Divider className="py-4 mb-8" />

      {query && catalogo.length === 0 ? (
        <div className="text-center py-16 font-jost text-carvao">
          <p className="text-lg">Nenhum produto encontrado para "{query}".</p>
          <p className="text-musgo mt-2">Tente buscar por outras palavras-chave.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 gap-y-12">
          {catalogo.map((prod: any) => (
            <ProductCard
              key={prod.id}
              id={prod.id}
              slug={prod.slug}
              nome={prod.nome}
              categoria={prod.categoria || "Produto"}
              preco={prod.preco}
              is_placeholder={prod.is_placeholder || !prod.imagem_url}
              imageUrl={prod.imagem_url}
              cores={prod.cores || []}
            />
          ))}
        </div>
      )}
    </div>
  );
}
