import React from "react";
import { ProductDetails } from "@/components/store/ProductDetails";
import { ProductCard } from "@/components/store/ProductCard";
import { Divider } from "@/components/ui/Divider";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: product } = await supabase.from("produtos").select("*").eq("slug", slug).single();
  
  if (!product) {
    return {
      title: "Produto | Zaya",
    };
  }

  return {
    title: `${product.nome} | Zaya`,
    description: product.descricao || `Compre ${product.nome} na Zaya. Moda feminina com identidade editorial.`,
  };
}

export default async function ProdutoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  
  let { data: product } = await supabase.from("produtos").select("*").eq("slug", slug).single();
  
  // Fallback if product not found (could be placeholder)
  if (!product) {
    // Generate placeholder data if needed
    product = {
      id: slug,
      slug: slug,
      nome: slug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
      preco: 199.90,
      categoria: "Coleção",
      descricao: "Peça exclusiva da nossa coleção botânica. Tecido leve, caimento perfeito e acabamento impecável.",
      is_placeholder: true,
      cores: ["#D2A9B1", "#FBF2F0"],
    };
  }

  // Fetch related products
  const { data: related } = await supabase
    .from("produtos")
    .select("*")
    .eq("categoria", product.categoria)
    .neq("id", product.id)
    .limit(4);

  const relacionados = related && related.length > 0 ? related : [
    { id: "r1", slug: "relacionado-1", nome: "Produto Relacionado 1", preco: 159.90, categoria: product.categoria, is_placeholder: true },
    { id: "r2", slug: "relacionado-2", nome: "Produto Relacionado 2", preco: 259.90, categoria: product.categoria, is_placeholder: true },
    { id: "r3", slug: "relacionado-3", nome: "Produto Relacionado 3", preco: 189.90, categoria: product.categoria, is_placeholder: true },
    { id: "r4", slug: "relacionado-4", nome: "Produto Relacionado 4", preco: 219.90, categoria: product.categoria, is_placeholder: true },
  ];

  return (
    <div className="container mx-auto px-4 lg:px-8 py-12">
      <ProductDetails product={product} />

      <div className="mt-32">
        <Divider className="mb-12" />
        <h2 className="font-cormorant text-4xl text-carvao italic text-center mb-12">
          Você também pode gostar
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {relacionados.map((rel: any) => (
            <ProductCard
              key={rel.id}
              id={rel.id}
              slug={rel.slug}
              nome={rel.nome}
              categoria={rel.categoria || "Produto"}
              preco={rel.preco}
              is_placeholder={rel.is_placeholder || !rel.imagem_url}
              imageUrl={rel.imagem_url}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
