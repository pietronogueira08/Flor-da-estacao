"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const messages = [
  { text: "Frete grátis acima de R$ 399", icon: "/ic-caminhao.png" },
  { text: "Parcele em até 6x sem juros", icon: "/ic-maquina.png" },
  { text: "Trocas gratuitas em 30 dias", icon: "/ic-setas.png" },
];

export function UtilityBar() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % messages.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-preto text-branco text-center py-2 px-4 z-[60] relative overflow-hidden">
      <div className="relative h-5">
        {messages.map((msg, i) => (
          <span
            key={i}
            className={`absolute inset-0 flex items-center justify-center font-archivo text-xs tracking-widest uppercase transition-all duration-500 ${
              i === current
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-3"
            }`}
          >
            <Image 
              src={msg.icon} 
              alt="Ícone" 
              width={14} 
              height={14} 
              className="mr-2 object-contain brightness-0 invert" 
              unoptimized
            />
            {msg.text}
          </span>
        ))}
      </div>
    </div>
  );
}
