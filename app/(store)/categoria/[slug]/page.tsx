import React from "react";
import { ProductCard } from "@/components/store/ProductCard";
import { Divider } from "@/components/ui/Divider";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const title = slug.charAt(0).toUpperCase() + slug.slice(1).replace("-", " ");
  return {
    title: `${title} | Flor da Estação`,
  };
}

export default async function CategoriaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: products } = await supabase.from("produtos").select("*").eq("categoria", slug).order("created_at", { ascending: false });

  const catalogo = products && products.length > 0 ? products : [
    { id: "1", slug: "produto-exemplo", nome: "Produto Exemplo", preco: 199.90, categoria: slug, is_placeholder: true },
    { id: "2", slug: "produto-exemplo-2", nome: "Produto Exemplo 2", preco: 299.90, categoria: slug, is_placeholder: true },
  ];

  const title = slug.charAt(0).toUpperCase() + slug.slice(1).replace("-", " ");

  return (
    <div className="container mx-auto px-4 lg:px-8 py-12">
      <div className="text-center mb-8">
        <h1 className="font-cormorant text-5xl text-carvao italic mb-4">{title}</h1>
        <p className="font-jost text-musgo">{catalogo.length} peças encontradas</p>
      </div>

      <Divider className="py-4 mb-8" />

      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="space-y-8 sticky top-24">
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

        <div className="flex-grow">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6 gap-y-12">
            {catalogo.map((prod: any) => (
              <ProductCard
                key={prod.id}
                id={prod.id}
                slug={prod.slug}
                nome={prod.nome}
                categoria={prod.categoria || slug}
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
