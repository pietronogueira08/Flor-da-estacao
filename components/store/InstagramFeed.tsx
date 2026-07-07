import Image from "next/image";
import Link from "next/link";

const feedImages = [
  { id: 1, src: "/hero-bg.png", alt: "Editorial Zaya" },
  { id: 2, src: "/about-us.png", alt: "Bastidores Zaya" },
  { id: 3, src: "/prod-vestido.png", alt: "Vestido Zaya" },
  { id: 4, src: "/prod-blusa.png", alt: "Blusa Zaya" },
  { id: 5, src: "/prod-saia.png", alt: "Saia Zaya" },
  { id: 6, src: "/prod-camisa.png", alt: "Camisa Zaya" },
];

export function InstagramFeed() {
  return (
    <section className="py-16 px-4 md:px-8 bg-branco" aria-label="Feed do Instagram">
      <div className="container mx-auto">
        <div className="flex flex-col items-center text-center mb-10">
          <p className="font-archivo text-zaya text-xs tracking-widest uppercase mb-3">Nossa Essência Diária</p>
          <h2 className="font-bodoni text-4xl text-preto italic mb-6">@zaya_loja</h2>
          <Link
            href="https://www.instagram.com/zaya_loja/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block border border-dourado text-dourado font-archivo text-xs uppercase tracking-widest px-6 py-2 hover:bg-dourado hover:text-branco transition-colors duration-300 rounded-sm focus-visible:ring-2 focus-visible:ring-dourado focus-visible:ring-offset-1"
          >
            Siga no Instagram
          </Link>
        </div>

        {/* Grid de 6 fotos */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-4">
          {feedImages.map((img) => (
            <a
              key={img.id}
              href="https://www.instagram.com/zaya_loja/"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square overflow-hidden block bg-claro/20 rounded-sm focus-visible:ring-2 focus-visible:ring-dourado"
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 16vw"
                unoptimized
              />
              {/* Overlay hover */}
              <div className="absolute inset-0 bg-preto/0 group-hover:bg-preto/20 transition-colors duration-500 flex items-center justify-center">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-500 scale-75 group-hover:scale-100"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
