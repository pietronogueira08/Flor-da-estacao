"use client";

import { useState, useEffect } from "react";

const messages = [
  "Frete grátis acima de R$ 299",
  "Parcele em até 3x sem juros",
  "Trocas gratuitas em 30 dias",
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
            {msg}
          </span>
        ))}
      </div>
    </div>
  );
}
