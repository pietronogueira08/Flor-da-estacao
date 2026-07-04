"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/hooks/useCart";

export function StoreHeader() {
  const { cartCount } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? "bg-marfim shadow-sm py-3" : "bg-transparent py-5"
      }`}
    >
      <div className="container mx-auto px-4 lg:px-8 flex items-center justify-between">
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/produtos" className="relative font-jost text-carvao hover:text-ameixa transition-colors group">
            Shop
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-[1px] bg-ameixa transition-all duration-300 group-hover:w-full"></span>
          </Link>
          <Link href="/categoria/vestidos" className="relative font-jost text-carvao hover:text-ameixa transition-colors group">
            Vestidos
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-[1px] bg-ameixa transition-all duration-300 group-hover:w-full"></span>
          </Link>
          <Link href="/sobre" className="relative font-jost text-carvao hover:text-ameixa transition-colors group">
            A Marca
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-[1px] bg-ameixa transition-all duration-300 group-hover:w-full"></span>
          </Link>
        </nav>
        
        <Link href="/" className="absolute left-1/2 -translate-x-1/2 flex items-center hover:scale-105 hover:opacity-90 transition-all duration-500">
          <Image src="/logo.svg" alt="Flor da Estação" width={140} height={50} className="h-12 w-auto" priority unoptimized />
        </Link>

        <div className="flex items-center gap-5 ml-auto">
          <Link href="/busca" className="text-carvao hover:text-ameixa transition-transform duration-300 hover:scale-110 active:scale-95">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </Link>
          <Link href="/carrinho" className="text-carvao hover:text-ameixa transition-transform duration-300 hover:scale-110 active:scale-95 relative group">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-rotate-3 transition-transform duration-300">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-ameixa text-marfim text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full animate-in zoom-in duration-300">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
