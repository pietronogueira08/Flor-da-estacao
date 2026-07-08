import React from "react";
import { ProductDetails } from "@/components/store/ProductDetails";
import { ProductCard } from "@/components/store/ProductCard";
import { Divider } from "@/components/ui/Divider";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: product } = await supabase.from("products").select("*").eq("slug", slug).single();
  
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
  
  let { data: product } = await supabase
    .from("products")
    .select(`
      *,
      categories (nome),
      product_images (url, is_placeholder)
    `)
    .eq("slug", slug)
    .single();
  
  // Fallback if product not found (could be placeholder)
  if (!product) {
    // Generate placeholder data if needed
    product = {
      id: slug,
      slug: slug,
      nome: slug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
      preco_base: 199.90,
      categories: { nome: "Coleção" },
      descricao: "Peça exclusiva da nossa coleção botânica. Tecido leve, caimento perfeito e acabamento impecável.",
      product_images: [],
      cores: ["#D2A9B1", "#FBF2F0"],
    };
  }

  // Fetch related products
  const { data: related } = await supabase
    .from("products")
    .select(`
      *,
      categories (nome),
      product_images (url, is_placeholder)
    `)
    .eq("categoria_id", product.categoria_id)
    .neq("id", product.id)
    .limit(4);

  const realRelated = related ? related.filter(p => !p.id.startsWith('b1000000')) : [];
  
  const relacionados = realRelated.length > 0 ? realRelated : (related || []);

  const mappedProduct = {
    ...product,
    preco: product.preco_base,
    categoria: product.categories?.nome || "Produto",
    imagem_url: product.product_images?.[0]?.url,
    is_placeholder: !product.product_images?.[0]?.url,
    cores: product.cores || []
  };

  return (
    <div className="container mx-auto px-4 lg:px-8 py-12">
      <ProductDetails product={mappedProduct} />

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
              categoria={rel.categories?.nome || "Produto"}
              preco={rel.preco_base}
              is_placeholder={!rel.product_images?.[0]?.url}
              imageUrl={rel.product_images?.[0]?.url}
              cores={[]}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
