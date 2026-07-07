import Link from "next/link";
import Image from "next/image";
import { BotanicalHero } from "@/components/animations/BotanicalHero";
import { ProductCard } from "@/components/store/ProductCard";
import { Divider } from "@/components/ui/Divider";
import { BrandStorySection } from "@/components/store/BrandStorySection";
import { EditorialBanner } from "@/components/store/EditorialBanner";
import { SocialProofSection } from "@/components/store/SocialProofSection";
import { NewsletterSection } from "@/components/store/NewsletterSection";
import { TrustBar } from "@/components/store/TrustBar";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 60;

export default async function HomePage() {
  const supabase = await createClient();

  const { data: products } = await supabase
    .from("produtos")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(8);

  const novidades = products && products.length > 0
    ? products
    : [
        { id: "1", slug: "vestido-floral-1", nome: "Vestido Midi Floral", preco: 289.90, categoria: "Vestidos", is_placeholder: false, imagem_url: "/prod-vestido.png", cores: ["#D9D9D9"] },
        { id: "2", slug: "blusa-linho-2", nome: "Blusa de Linho Romântica", preco: 159.90, categoria: "Blusas", is_placeholder: false, imagem_url: "/prod-blusa.png", cores: ["#FAFAFA", "#1A1A1A"] },
        { id: "3", slug: "saia-midi-3", nome: "Saia Midi Plissada", preco: 199.90, categoria: "Saias", is_placeholder: false, imagem_url: "/prod-saia.png", cores: ["#A5A5A5"] },
        { id: "4", slug: "camisa-seda-4", nome: "Camisa de Seda Botânica", preco: 329.90, categoria: "Camisas", is_placeholder: false, imagem_url: "/prod-camisa.png", cores: ["#FAFAFA"] },
      ];

  // Mais Vendidos (reutiliza os mesmos dados por ora com badge)
  const maisVendidos = [
    { id: "1", slug: "vestido-floral-1", nome: "Vestido Midi Floral", preco: 289.90, categoria: "Vestidos", is_placeholder: false, imagem_url: "/prod-vestido.png", cores: ["#D9D9D9"] },
    { id: "3", slug: "saia-midi-3", nome: "Saia Midi Plissada", preco: 199.90, categoria: "Saias", is_placeholder: false, imagem_url: "/prod-saia.png", cores: ["#A5A5A5"] },
    { id: "2", slug: "blusa-linho-2", nome: "Blusa de Linho Romântica", preco: 159.90, categoria: "Blusas", is_placeholder: false, imagem_url: "/prod-blusa.png", cores: ["#FAFAFA", "#1A1A1A"] },
    { id: "4", slug: "camisa-seda-4", nome: "Camisa de Seda Botânica", preco: 329.90, categoria: "Camisas", is_placeholder: false, imagem_url: "/prod-camisa.png", cores: ["#FAFAFA"] },
  ];

  const categorias = [
    { nome: "Vestidos", slug: "vestidos", img: "/cat-vestidos.png" },
    { nome: "Blusas & Camisas", slug: "blusas-camisas", img: "/cat-blusas.png" },
    { nome: "Saias", slug: "saias", img: "/cat-saias.png" },
    { nome: "Calças", slug: "calcas", img: "/cat-calcas.png" },
    { nome: "Tricots", slug: "tricots", img: "/cat-tricots.png" },
    { nome: "Acessórios", slug: "acessorios", img: "/cat-acessorios.png" },
  ];

  return (
    <div className="w-full">

      {/* ━━━━━━━━━━━━━━━━━━━━ 1. HERO ━━━━━━━━━━━━━━━━━━━━ */}
      <section
        className="w-full flex flex-col items-center relative overflow-hidden"
        aria-label="Seção principal da loja"
      >
        <BotanicalHero />
        <div className="text-center py-10 px-4 bg-branco w-full">
          <h1 className="font-bodoni text-5xl md:text-6xl text-preto italic leading-tight mb-3">
            Silêncio que veste
          </h1>
          <p className="font-archivo text-zaya text-sm tracking-widest uppercase mb-8">
            Coleção Verão 2025
          </p>
          <Link
            href="/produtos"
            className="inline-block bg-dourado text-branco font-archivo text-sm uppercase tracking-widest px-8 py-4 hover:bg-preto transition-colors duration-300 rounded-sm focus-visible:ring-2 focus-visible:ring-dourado focus-visible:ring-offset-2"
          >
            Ver coleção
          </Link>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━ 2. CATEGORIAS ━━━━━━━━━━━━━━━━━━━━ */}
      <section className="py-16 px-4 md:px-8 container mx-auto" aria-label="Categorias">
        {/* Mobile: carrossel horizontal | Desktop: grid 6 colunas */}
        <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 md:grid md:grid-cols-3 lg:grid-cols-6 md:overflow-visible md:pb-0">
          {categorias.map((cat) => (
            <Link
              key={cat.slug}
              href={`/categoria/${cat.slug}`}
              className="group flex flex-col items-center min-w-[40vw] md:min-w-0 snap-start focus-visible:ring-2 focus-visible:ring-dourado rounded-sm"
            >
              <div className="relative w-full aspect-square rounded-sm overflow-hidden mb-3 bg-claro/20">
                <Image
                  src={cat.img}
                  alt={`Categoria ${cat.nome} — Zaya`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 45vw, (max-width: 1200px) 20vw, 15vw"
                  unoptimized
                />
              </div>
              <span className="font-archivo text-preto text-sm text-center group-hover:text-dourado transition-colors">
                {cat.nome}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <Divider />

      {/* ━━━━━━━━━━━━━━━━━━━━ 3. SOBRE A MARCA ━━━━━━━━━━━━━━━━━━━━ */}
      <BrandStorySection />

      <Divider />

      {/* ━━━━━━━━━━━━━━━━━━━━ 4. NOVIDADES ━━━━━━━━━━━━━━━━━━━━ */}
      <section className="py-16 px-4 md:px-8 container mx-auto" aria-label="Novidades">
        <div className="text-center mb-12">
          <p className="font-archivo text-zaya text-xs tracking-widest uppercase mb-3">Chegando agora</p>
          <h2 className="font-bodoni text-4xl md:text-5xl text-preto italic">Novidades</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 gap-y-12">
          {novidades.map((prod: any) => (
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
              badge="Novo"
            />
          ))}
        </div>
        <div className="flex justify-center mt-12">
          <Link
            href="/produtos"
            className="inline-block text-dourado border border-dourado px-8 py-3 font-archivo text-sm uppercase tracking-widest hover:bg-dourado hover:text-branco transition-colors rounded-sm focus-visible:ring-2 focus-visible:ring-dourado"
          >
            Ver tudo
          </Link>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━ 5. BANNER EDITORIAL ━━━━━━━━━━━━━━━━━━━━ */}
      <EditorialBanner />

      <Divider />

      {/* ━━━━━━━━━━━━━━━━━━━━ 6. MAIS VENDIDOS ━━━━━━━━━━━━━━━━━━━━ */}
      <section className="py-16 px-4 md:px-8 container mx-auto" aria-label="Mais vendidos">
        <div className="text-center mb-12">
          <p className="font-archivo text-zaya text-xs tracking-widest uppercase mb-3">Os queridinhos</p>
          <h2 className="font-bodoni text-4xl md:text-5xl text-preto italic">Mais Vendidos</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 gap-y-12">
          {maisVendidos.map((prod) => (
            <ProductCard
              key={`mv-${prod.id}`}
              id={prod.id}
              slug={prod.slug}
              nome={prod.nome}
              categoria={prod.categoria}
              preco={prod.preco}
              is_placeholder={prod.is_placeholder}
              imageUrl={prod.imagem_url}
              cores={prod.cores}
              badge="Mais Vendido"
            />
          ))}
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━ 7. PROVA SOCIAL ━━━━━━━━━━━━━━━━━━━━ */}
      <SocialProofSection />

      {/* ━━━━━━━━━━━━━━━━━━━━ 8. NEWSLETTER ━━━━━━━━━━━━━━━━━━━━ */}
      <NewsletterSection />

      {/* ━━━━━━━━━━━━━━━━━━━━ 9. BLOCO DE CONFIANÇA ━━━━━━━━━━━━━━━━━━━━ */}
      <TrustBar />

    </div>
  );
}
