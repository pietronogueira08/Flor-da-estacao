import React from "react";
import { ProductCard } from "@/components/store/ProductCard";
import { Divider } from "@/components/ui/Divider";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const title = slug.charAt(0).toUpperCase() + slug.slice(1).replace("-", " ");
  return {
    title: `${title} | Zaya`,
  };
}

export default async function CategoriaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select(`
      *,
      categories!inner (nome, slug),
      product_images (url, is_placeholder)
    `)
    .eq('categories.slug', slug)
    .order("criado_em", { ascending: false });

  const allProducts = products || [];
  const catalogo = allProducts.filter(p => !p.id.startsWith('b1000000'));
  
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
          {catalogo.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-claro/5 rounded-sm border border-claro/20">
              <p className="font-bodoni text-3xl text-preto italic mb-2">Nenhuma peça encontrada</p>
              <p className="font-archivo text-sm text-zaya">Em breve teremos novidades incríveis nesta categoria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6 gap-y-12">
              {catalogo.map((prod: any) => (
                <ProductCard
                  key={prod.id}
                  id={prod.id}
                  slug={prod.slug}
                  nome={prod.nome}
                  categoria={prod.categories?.nome || slug}
                  preco={prod.preco_base}
                  is_placeholder={!prod.product_images?.[0]?.url}
                  imageUrl={prod.product_images?.[0]?.url}
                  cores={[]}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
