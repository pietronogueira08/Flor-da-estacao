import React from "react";
import { ProductCard } from "@/components/store/ProductCard";
import { Divider } from "@/components/ui/Divider";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Todos os Produtos | Flor da Estação",
  description: "Nossa coleção completa de moda feminina com identidade botânica.",
};

export default async function ProdutosPage() {
  const supabase = await createClient();
  const { data: products } = await supabase.from("produtos").select("*").order("created_at", { ascending: false });

  const catalogo = products && products.length > 0 ? products : [
    { id: "1", slug: "vestido-floral-1", nome: "Vestido Midi Floral", preco: 289.90, categoria: "Vestidos", is_placeholder: true },
    { id: "2", slug: "blusa-linho-2", nome: "Blusa de Linho Romântica", preco: 159.90, categoria: "Blusas", is_placeholder: true },
    { id: "3", slug: "saia-midi-3", nome: "Saia Midi Plissada", preco: 199.90, categoria: "Saias", is_placeholder: true },
    { id: "4", slug: "camisa-seda-4", nome: "Camisa de Seda Botânica", preco: 329.90, categoria: "Camisas", is_placeholder: true },
    { id: "5", slug: "vestido-longo-5", nome: "Vestido Longo Nevoa", preco: 349.90, categoria: "Vestidos", is_placeholder: true },
    { id: "6", slug: "calca-alfaiataria-6", nome: "Calça Alfaiataria", preco: 229.90, categoria: "Calças", is_placeholder: true },
  ];

  return (
    <div className="container mx-auto px-4 lg:px-8 py-12">
      <div className="text-center mb-8">
        <h1 className="font-cormorant text-5xl text-carvao italic mb-4">Catálogo</h1>
        <p className="font-jost text-musgo">{catalogo.length} peças encontradas</p>
      </div>

      <Divider className="py-4 mb-8" />

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="space-y-8 sticky top-24">
            <div>
              <h3 className="font-cormorant text-2xl text-carvao mb-4">Categorias</h3>
              <ul className="space-y-2 font-jost text-musgo">
                <li><label className="flex items-center gap-2 cursor-pointer hover:text-ameixa"><input type="checkbox" className="accent-ameixa" /> Vestidos</label></li>
                <li><label className="flex items-center gap-2 cursor-pointer hover:text-ameixa"><input type="checkbox" className="accent-ameixa" /> Blusas & Camisas</label></li>
                <li><label className="flex items-center gap-2 cursor-pointer hover:text-ameixa"><input type="checkbox" className="accent-ameixa" /> Saias</label></li>
                <li><label className="flex items-center gap-2 cursor-pointer hover:text-ameixa"><input type="checkbox" className="accent-ameixa" /> Calças</label></li>
              </ul>
            </div>

            <div>
              <h3 className="font-cormorant text-2xl text-carvao mb-4">Tamanho</h3>
              <div className="flex gap-2">
                {["P", "M", "G", "GG"].map(size => (
                  <button key={size} className="w-10 h-10 border border-rosa-antigo text-carvao font-jost flex items-center justify-center hover:bg-rosa-antigo/20">
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Grid */}
        <div className="flex-grow">
          <div className="flex justify-end mb-6">
            <select className="font-jost text-sm border border-rosa-antigo/30 bg-marfim text-carvao px-3 py-2 outline-none focus:border-ameixa">
              <option>Relevância</option>
              <option>Menor preço</option>
              <option>Maior preço</option>
              <option>Novidades</option>
            </select>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6 gap-y-12">
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
        </div>
      </div>
    </div>
  );
}
