"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ZayaWordmark } from "@/components/store/ZayaWordmark";

export function BotanicalHero() {
  const wordmarkRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);

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

  return (
    <div
      className="w-full flex flex-col items-center justify-center py-20 md:py-32"
      style={{
        background: "radial-gradient(ellipse at center, #E8E8E8 0%, #C0C0C0 40%, #A5A5A5 100%)",
      }}
      aria-label="Hero Zaya"
    >
      <div ref={wordmarkRef} style={{ opacity: 0 }} className="flex items-center justify-center">
        <ZayaWordmark width={220} height={72} />
      </div>
      <p
        ref={subtitleRef}
        style={{ opacity: 0 }}
        className="font-archivo text-preto/60 text-xs tracking-[0.3em] uppercase mt-6"
      >
        coleção verão 2025
      </p>
    </div>
  );
}
