import Image from "next/image";
import Link from "next/link";
import { BotanicalHero } from "@/components/animations/BotanicalHero";
import { ProductCard } from "@/components/store/ProductCard";
import { Divider } from "@/components/ui/Divider";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 60; // revalidate every minute

export default async function HomePage() {
  const supabase = await createClient();
  
  // Fetch latest products
  const { data: products } = await supabase
    .from("produtos")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(8);

  const novidades = products && products.length > 0 ? products : [
    { id: "1", slug: "vestido-floral-1", nome: "Vestido Midi Floral", preco: 289.90, categoria: "Vestidos", is_placeholder: true, cores: ["#D2A9B1"] },
    { id: "2", slug: "blusa-linho-2", nome: "Blusa de Linho Romântica", preco: 159.90, categoria: "Blusas", is_placeholder: true, cores: ["#FFF5F7", "#241B1E"] },
    { id: "3", slug: "saia-midi-3", nome: "Saia Midi Plissada", preco: 199.90, categoria: "Saias", is_placeholder: true, cores: ["#6B7860"] },
    { id: "4", slug: "camisa-seda-4", nome: "Camisa de Seda Botânica", preco: 329.90, categoria: "Camisas", is_placeholder: true, cores: ["#FBF2F0"] },
  ];

  const categorias = [
    { nome: "Vestidos", slug: "vestidos", img: "/cat-vestidos.jpg" },
    { nome: "Blusas & Camisas", slug: "blusas-camisas", img: "/cat-blusas.jpg" },
    { nome: "Saias", slug: "saias", img: "/cat-saias.jpg" },
    { nome: "Calças", slug: "calcas", img: "/cat-calcas.jpg" },
    { nome: "Tricots", slug: "tricots", img: "/cat-tricots.jpg" },
    { nome: "Acessórios", slug: "acessorios", img: "/cat-acessorios.jpg" },
  ];

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section 
        className="pt-10 pb-20 px-4 flex flex-col items-center relative overflow-hidden"
        style={{ backgroundImage: 'url("/hero-bg.png")', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}
      >
        <div className="absolute inset-0 bg-marfim/30 z-0"></div>
        <div className="relative z-10 w-full flex flex-col items-center">
          <BotanicalHero />
        <div className="text-center mt-[-40px] z-10 relative">
          <h2 className="font-jost text-musgo text-lg tracking-widest uppercase mb-6">
            Coleção Verão
          </h2>
          <Link
            href="/produtos"
            className="inline-block text-ameixa border-b border-ameixa pb-1 font-jost text-sm uppercase tracking-widest hover:text-carvao hover:border-carvao transition-colors"
          >
            Ver coleção
          </Link>
        </div>
        </div>
      </section>

      <Divider />

      {/* Categorias Section */}
      <section className="py-16 px-4 md:px-8 container mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categorias.map((cat) => (
            <Link
              key={cat.slug}
              href={`/categoria/${cat.slug}`}
              className="group flex flex-col items-center justify-center p-6 bg-rosa-antigo/10 border border-rosa-antigo/20 rounded-sm hover:bg-rosa-antigo/20 transition-colors h-32"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="mb-3 text-ameixa opacity-70 group-hover:opacity-100 transition-opacity">
                <path d="M12 2C12 2 15 7 15 12C15 17 12 22 12 22C12 22 9 17 9 12C9 7 12 2 12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="font-jost text-carvao text-sm text-center">
                {cat.nome}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <Divider />

      {/* Novidades Section */}
      <section className="py-16 px-4 md:px-8 container mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-cormorant text-4xl text-carvao italic">Novidades</h2>
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
            />
          ))}
        </div>
        <div className="flex justify-center mt-12">
          <Link
            href="/produtos"
            className="inline-block text-ameixa border border-ameixa px-8 py-3 font-jost text-sm uppercase tracking-widest hover:bg-ameixa hover:text-marfim transition-colors rounded-sm"
          >
            Ver tudo
          </Link>
        </div>
      </section>
    </div>
  );
}
