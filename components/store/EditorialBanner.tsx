import Image from "next/image";
import Link from "next/link";

export function EditorialBanner() {
  return (
    <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <Image
        src="/about-us.png"
        alt="Mulher vestindo Flor da Estação em cenário natural botânico"
        fill
        className="object-cover object-center"
        sizes="100vw"
        unoptimized
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-carvao/40" />

      {/* Conteúdo */}
      <div className="relative z-10 text-center px-6 max-w-2xl mx-auto">
        <p className="font-jost text-rosa-antigo text-xs tracking-widest uppercase mb-4">
          Coleção Verão 2025
        </p>
        {/* [RASCUNHO — revisar antes de publicar] */}
        <h2 className="font-cormorant text-5xl md:text-6xl text-marfim italic leading-tight mb-6">
          Para a mulher que carrega flores onde vai.
        </h2>
        <Link
          href="/produtos"
          className="inline-block bg-marfim text-ameixa font-jost text-sm uppercase tracking-widest px-8 py-3 hover:bg-ameixa hover:text-marfim transition-colors duration-300 rounded-sm"
        >
          Explorar coleção
        </Link>
      </div>
    </section>
  );
}
