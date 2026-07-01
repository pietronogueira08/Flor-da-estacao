"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export function BotanicalHero() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const paths = svgRef.current.querySelectorAll("path");
    
    gsap.set(paths, {
      strokeDasharray: (i, el) => el.getTotalLength(),
      strokeDashoffset: (i, el) => el.getTotalLength(),
    });

    gsap.to(paths, {
      strokeDashoffset: 0,
      duration: 2.5,
      ease: "power2.out",
      stagger: 0.2,
      delay: 0.2,
    });
  }, []);

  return (
    <div className="w-full flex justify-center py-12">
      <svg
        ref={svgRef}
        width="600"
        height="800"
        viewBox="0 0 600 800"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="max-w-full h-auto"
      >
        {/* Ramo central */}
        <path
          d="M 300 750 Q 250 500, 320 250 T 280 100"
          stroke="#D2A9B1"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />
        {/* Folhas */}
        <path
          d="M 283 620 C 240 600, 220 550, 260 520 C 270 540, 275 580, 283 620 Z"
          stroke="#D2A9B1"
          strokeWidth="1.5"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M 305 450 C 350 430, 380 390, 340 350 C 330 380, 320 420, 305 450 Z"
          stroke="#D2A9B1"
          strokeWidth="1.5"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M 315 280 C 270 260, 250 220, 290 190 C 300 210, 305 250, 315 280 Z"
          stroke="#D2A9B1"
          strokeWidth="1.5"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Flores */}
        <path
          d="M 250 520 C 240 490, 210 490, 210 520 C 210 550, 240 550, 250 520 Z"
          stroke="#D2A9B1"
          strokeWidth="1.5"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M 340 350 C 360 330, 390 340, 380 370 C 370 400, 340 390, 340 350 Z"
          stroke="#D2A9B1"
          strokeWidth="1.5"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Bagas */}
        <path
          d="M 320 600 A 10 10 0 1 1 319.9 600"
          stroke="#D2A9B1"
          strokeWidth="1.5"
          fill="none"
        />
        <path
          d="M 280 380 A 8 8 0 1 1 279.9 380"
          stroke="#D2A9B1"
          strokeWidth="1.5"
          fill="none"
        />
        <path
          d="M 330 200 A 12 12 0 1 1 329.9 200"
          stroke="#D2A9B1"
          strokeWidth="1.5"
          fill="none"
        />
      </svg>
    </div>
  );
}
