export function SocialProofSection() {
  // [RASCUNHO — revisar antes de publicar]
  const depoimentos = [
    {
      nome: "Ana Lima",
      cidade: "Rio de Janeiro, RJ",
      texto:
        "O vestido chegou ainda mais lindo do que nas fotos. O tecido é delicado e o caimento é perfeito. Com certeza vou comprar mais!",
      nota: 5,
      foto: "https://randomuser.me/api/portraits/women/12.jpg",
    },
    {
      nome: "Beatriz Souza",
      cidade: "Niterói, RJ",
      texto:
        "Adoro a identidade da marca. Cada peça conta uma história. Recebi elogios o dia todo usando a blusa que comprei aqui.",
      nota: 5,
      foto: "https://randomuser.me/api/portraits/women/44.jpg",
    },
    {
      nome: "Carla Mendes",
      cidade: "Campos dos Goytacazes, RJ",
      texto:
        "Entrega rápida, embalagem linda e a roupa superou minhas expectativas. A Zaya virou minha loja favorita!",
      nota: 5,
      foto: "https://randomuser.me/api/portraits/women/68.jpg",
    },
  ];

  return (
    <section className="py-20 px-4 md:px-8 bg-branco border-t border-claro/20">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <p className="font-archivo text-zaya text-xs tracking-widest uppercase mb-3">
            O que dizem nossas clientes
          </p>
          <h2 className="font-bodoni text-4xl text-preto italic">
            O que dizem as nossas
          </h2>
        </div>

        {/* Desktop: 3 colunas | Mobile: scroll horizontal */}
        <div
          className="flex gap-6 overflow-x-auto snap-x snap-mandatory md:grid md:grid-cols-3 md:overflow-visible pb-4 md:pb-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {depoimentos.map((dep) => (
            <article
              key={dep.nome}
              className="min-w-[85vw] md:min-w-0 snap-start bg-branco border border-claro/20 rounded-sm p-6 flex flex-col gap-4"
            >
              {/* Estrelas */}
              <div className="flex gap-1" aria-label={`${dep.nota} de 5 estrelas`}>
                {Array.from({ length: dep.nota }).map((_, i) => (
                  <svg
                    key={i}
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="text-dourado"
                    aria-hidden="true"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>

              {/* Texto */}
              <blockquote className="font-archivo text-sm text-preto/80 leading-relaxed flex-1">
                &ldquo;{dep.texto}&rdquo;
              </blockquote>

              {/* Avatar + nome */}
              <footer className="flex items-center gap-3">
                <img
                  src={dep.foto}
                  alt={`Foto de ${dep.nome}`}
                  className="w-10 h-10 rounded-full object-cover shrink-0 ring-1 ring-dourado ring-offset-2"
                />
                <div>
                  <p className="font-archivo text-sm font-medium text-preto">
                    {dep.nome}
                  </p>
                  <p className="font-archivo text-xs text-zaya">{dep.cidade}</p>
                </div>
              </footer>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
