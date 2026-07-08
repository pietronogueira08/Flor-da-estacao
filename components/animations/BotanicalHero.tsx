"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ZayaWordmark } from "@/components/store/ZayaWordmark";
import Image from "next/image";

export function BotanicalHero({ heroImages = [] }: { heroImages?: string[] }) {
  const wordmarkRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!wordmarkRef.current || !subtitleRef.current) return;

    gsap.fromTo(
      wordmarkRef.current,
      { opacity: 0, scale: 0.96 },
      { opacity: 1, scale: 1, duration: 1.4, ease: "power2.out", delay: 0.3 }
    );

    gsap.fromTo(
      subtitleRef.current,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 1, ease: "power2.out", delay: 0.9 }
    );
  }, []);

  useEffect(() => {
    if (heroImages.length > 1) {
      const interval = setInterval(() => {
        if (bgRef.current) {
          gsap.to(bgRef.current, { opacity: 0, duration: 1, onComplete: () => {
            setCurrentIndex((prev) => (prev + 1) % heroImages.length);
            gsap.to(bgRef.current, { opacity: 1, duration: 1 });
          }});
        } else {
          setCurrentIndex((prev) => (prev + 1) % heroImages.length);
        }
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [heroImages]);

  const hasImages = heroImages.length > 0;

  return (
    <div
      className="w-full flex flex-col items-center justify-center min-h-[60vh] md:min-h-[85vh] relative"
      style={hasImages ? {} : {
        background: "radial-gradient(ellipse at center, #E8E8E8 0%, #C0C0C0 40%, #A5A5A5 100%)",
      }}
      aria-label="Hero Zaya"
    >
      {hasImages && (
        <div ref={bgRef} className="absolute inset-0 z-0">
          <Image
            src={heroImages[currentIndex]}
            alt="Zaya Hero Background"
            fill
            className="object-cover"
            priority
            unoptimized
          />
          <div className="absolute inset-0 bg-branco/10" />
        </div>
      )}

      <div className="relative z-10 flex flex-col items-center">
        <p
          ref={subtitleRef}
          style={{ opacity: 0 }}
          className="font-archivo text-preto text-xs tracking-[0.3em] uppercase mb-6 drop-shadow-sm"
        >
          coleção verão 2025
        </p>
        <div ref={wordmarkRef} style={{ opacity: 0 }} className="flex items-center justify-center drop-shadow-sm">
          <ZayaWordmark width={220} height={72} />
        </div>
      </div>
    </div>
  );
}
