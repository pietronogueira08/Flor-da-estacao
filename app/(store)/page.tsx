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
import { InstagramFeed } from "@/components/store/InstagramFeed";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 60;

export default async function HomePage() {
  const supabase = await createClient();

  const [productsResponse, settingsResponse] = await Promise.all([
    supabase
      .from("products")
      .select(`
        *,
        categories (nome),
        product_images (url, is_placeholder)
      `)
      .order("criado_em", { ascending: false })
      .limit(8),
    supabase
      .from("store_settings")
      .select("*")
      .eq("id", 1)
      .single()
  ]);

  const products = productsResponse.data;
  const settings = settingsResponse.data;
  const heroImages = settings?.hero_images || [];
  const instagramImages = settings?.instagram_images || [];

  const novidades = products || [];

  const categorias = [
    { nome: "Calças", slug: "calcas", img: "/cat-calcas-real.jpeg" },
    { nome: "Blusas", slug: "blusas", img: "/cat-blusas-real.jpeg" },
    { nome: "Vestidos", slug: "vestidos", img: "/cat-vestidos-real.jpeg" },
    { nome: "Conjuntos", slug: "conjuntos", img: "/cat-conjuntos-real.png" },
    { nome: "Macacão", slug: "macacao", img: "/cat-macacao-real.png" },
    { nome: "Short", slug: "short", img: "/cat-short-real.png" },
    { nome: "Saia", slug: "saia", img: "/cat-saias-real.jpeg" },
  ];

  return (
    <div className="w-full">

      {/* ━━━━━━━━━━━━━━━━━━━━ 1. HERO ━━━━━━━━━━━━━━━━━━━━ */}
      <section
        className="w-full flex flex-col items-center relative overflow-hidden"
        aria-label="Seção principal da loja"
      >
        <BotanicalHero heroImages={heroImages} />
        <div className="text-center pb-12 px-4 bg-branco w-full">
          <h1 className="font-bodoni text-3xl md:text-5xl lg:text-6xl text-preto italic leading-tight mb-8">
            Silêncio que veste
          </h1>
          <Link
            href="/produtos"
            className="block md:inline-block bg-dourado text-branco hover:bg-preto font-archivo text-sm uppercase tracking-widest px-8 py-4 transition-colors duration-300 rounded-sm focus-visible:ring-2 focus-visible:ring-dourado focus-visible:ring-offset-2 w-full md:w-auto text-center"
          >
            Ver coleção
          </Link>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━ 2. CATEGORIAS ━━━━━━━━━━━━━━━━━━━━ */}
      <section className="py-16 px-4 md:px-8 container mx-auto" aria-label="Categorias">
        {/* Mobile: carrossel horizontal | Desktop: grid 6 colunas */}
        <div
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 md:grid md:grid-cols-3 lg:grid-cols-6 md:overflow-visible md:pb-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
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

      {/* ━━━━━━━━━━━━━━━━━━━━ 4. NOVIDADES (VITRINE ÚNICA) ━━━━━━━━━━━━━━━━━━━━ */}
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
              categoria={prod.categories?.nome || "Produto"}
              preco={prod.preco_base}
              is_placeholder={!prod.product_images?.[0]?.url}
              imageUrl={prod.product_images?.[0]?.url}
              cores={[]}
              badge="Novo"
            />
          ))}
        </div>
        <div className="flex justify-center mt-12">
          <Link
            href="/produtos"
            className="inline-block border border-dourado text-dourado hover:bg-dourado hover:text-branco bg-transparent font-archivo text-sm uppercase tracking-widest px-8 py-3 transition-colors duration-300 rounded-sm focus-visible:ring-2 focus-visible:ring-dourado"
          >
            Ver tudo
          </Link>
        </div>
      </section>

      {/* Sem divisor aqui porque o Banner tem fundo imagem */}
      
      {/* ━━━━━━━━━━━━━━━━━━━━ 5. BANNER EDITORIAL ━━━━━━━━━━━━━━━━━━━━ */}
      <EditorialBanner />

      {/* Sem divisor porque Feed tem fundo sólido */}

      {/* ━━━━━━━━━━━━━━━━━━━━ 6. FEED INSTAGRAM ━━━━━━━━━━━━━━━━━━━━ */}
      <InstagramFeed feedImages={instagramImages} />

      <Divider />

      {/* ━━━━━━━━━━━━━━━━━━━━ 7. PROVA SOCIAL ━━━━━━━━━━━━━━━━━━━━ */}
      <SocialProofSection />

      <Divider />

      {/* ━━━━━━━━━━━━━━━━━━━━ 8. NEWSLETTER ━━━━━━━━━━━━━━━━━━━━ */}
      <NewsletterSection />

      {/* Sem divisor final por design padrão do footer em sequência */}

      {/* ━━━━━━━━━━━━━━━━━━━━ 9. BLOCO DE CONFIANÇA ━━━━━━━━━━━━━━━━━━━━ */}
      <TrustBar />

    </div>
  );
}
