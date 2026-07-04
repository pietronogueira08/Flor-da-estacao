import Image from "next/image";
import Link from "next/link";

export function BrandStorySection() {
  return (
    <section className="py-20 px-4 md:px-8 container mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
        {/* Foto */}
        <div className="relative aspect-[4/5] w-full max-w-md mx-auto md:mx-0 rounded-sm overflow-hidden">
          <Image
            src="/about-us.png"
            alt="Ateliê Flor da Estação — tecidos delicados e flores secas em luz natural"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            unoptimized
          />
          {/* Borda decorativa deslocada */}
          <div className="absolute inset-0 border border-rosa-antigo/40 m-4 pointer-events-none rounded-sm" />
        </div>

        {/* Texto */}
        <div className="flex flex-col justify-center">
          <p className="font-jost text-musgo text-xs tracking-widest uppercase mb-4">
            Nossa essência
          </p>
          <h2 className="font-cormorant text-4xl md:text-5xl text-carvao italic leading-tight mb-6">
            Nascida entre flores,{" "}
            <span className="not-italic font-light">feita para você</span>
          </h2>
          {/* [RASCUNHO — revisar antes de publicar] */}
          <p className="font-jost text-carvao/70 text-base leading-relaxed mb-4">
            Nascida em São João da Barra, a Flor da Estação veste a mulher que
            encontra beleza nos ciclos da natureza. Cada peça é escolhida com o
            cuidado de quem cuida do próprio jardim.
          </p>
          <p className="font-jost text-carvao/70 text-base leading-relaxed mb-8">
            Aqui, moda é gesto. É a forma como você floresce todos os dias.
          </p>
          <Link
            href="/sobre"
            className="inline-flex items-center gap-2 font-jost text-sm text-ameixa uppercase tracking-widest group"
          >
            Conheça nossa história
            <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
