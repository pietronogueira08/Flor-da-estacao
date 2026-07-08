"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useCart } from "@/lib/hooks/useCart";
import { ZayaWordmark } from "@/components/store/ZayaWordmark";

const categorias = [
  { nome: "Novidades", slug: "novidades" },
  { nome: "Vestidos", slug: "vestidos" },
  { nome: "Blusas & Camisas", slug: "blusas-camisas" },
  { nome: "Saias", slug: "saias" },
  { nome: "Calças", slug: "calcas" },
  { nome: "Tricots", slug: "tricots" },
  { nome: "Acessórios", slug: "acessorios" },
];

export function StoreHeader() {
  const { cartCount, openCart } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [colecaoOpen, setColecaoOpen] = useState(false);
  const colecaoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fechar mega-menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (colecaoRef.current && !colecaoRef.current.contains(e.target as Node)) {
        setColecaoOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fechar drawer no resize para desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <header
      className={`fixed top-8 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? "bg-branco shadow-sm py-3" : "bg-transparent py-5"
      }`}
    >
      <div className="container mx-auto px-4 lg:px-8 flex items-center justify-between">

        {/* ── Navegação Desktop ── */}
        <nav className="hidden md:flex items-center gap-8" aria-label="Navegação principal">
          
          <Link href="/" className="relative font-archivo text-preto hover:text-dourado transition-colors group focus-visible:ring-2 focus-visible:ring-dourado rounded-sm">
            Home
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-[1px] bg-dourado transition-all duration-300 group-hover:w-full" />
          </Link>

          {/* Mega-menu Coleção */}
          <div ref={colecaoRef} className="relative">
            <button
              onClick={() => setColecaoOpen((o) => !o)}
              aria-expanded={colecaoOpen}
              aria-haspopup="true"
              className="relative font-archivo text-preto hover:text-dourado transition-colors group flex items-center gap-1 focus-visible:ring-2 focus-visible:ring-dourado rounded-sm"
            >
              Coleção
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
                className={`transition-transform duration-200 ${colecaoOpen ? "rotate-180" : ""}`}
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-[1px] bg-dourado transition-all duration-300 group-hover:w-full" />
            </button>

            {/* Dropdown */}
            {colecaoOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-48 bg-branco shadow-lg border border-claro/20 rounded-sm overflow-hidden z-50">
                {categorias.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/categoria/${cat.slug}`}
                    onClick={() => setColecaoOpen(false)}
                    className="block px-4 py-2.5 font-archivo text-sm text-preto hover:bg-claro/10 hover:text-dourado transition-colors focus-visible:ring-2 focus-visible:ring-dourado"
                  >
                    {cat.nome}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link href="/categoria/novidades" className="relative font-archivo text-preto hover:text-dourado transition-colors group focus-visible:ring-2 focus-visible:ring-dourado rounded-sm">
            Novidades
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-[1px] bg-dourado transition-all duration-300 group-hover:w-full" />
          </Link>

          <Link href="/sobre" className="relative font-archivo text-preto hover:text-dourado transition-colors group focus-visible:ring-2 focus-visible:ring-dourado rounded-sm">
            A Marca
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-[1px] bg-dourado transition-all duration-300 group-hover:w-full" />
          </Link>
        </nav>

        {/* ── Logo Central ── */}
        <Link
          href="/"
          className="absolute left-1/2 -translate-x-1/2 flex items-center hover:scale-105 hover:opacity-90 transition-all duration-500 focus-visible:ring-2 focus-visible:ring-dourado rounded-sm"
          aria-label="Zaya — Página inicial"
        >
          <span className="font-bodoni text-3xl md:text-4xl text-preto italic tracking-widest uppercase">Zaya</span>
        </Link>

        {/* ── Ações (direita) ── */}
        <div className="flex items-center gap-5 ml-auto">
          {/* Busca */}
          <Link
            href="/busca"
            aria-label="Buscar produtos"
            className="text-preto hover:text-dourado transition-transform duration-300 hover:scale-110 active:scale-95 hidden md:flex focus-visible:ring-2 focus-visible:ring-dourado rounded-sm"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </Link>

          {/* Carrinho */}
          <button
            onClick={openCart}
            aria-label={`Carrinho${cartCount > 0 ? ` — ${cartCount} ${cartCount === 1 ? "item" : "itens"}` : ""}`}
            className="text-preto hover:text-dourado transition-transform duration-300 hover:scale-110 active:scale-95 relative group focus-visible:ring-2 focus-visible:ring-dourado rounded-sm"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-rotate-3 transition-transform duration-300" aria-hidden="true">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-dourado text-branco text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full" aria-hidden="true">
                {cartCount}
              </span>
            )}
          </button>

          {/* Hamburguer — mobile */}
          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            className="md:hidden text-preto hover:text-dourado transition-colors focus-visible:ring-2 focus-visible:ring-dourado rounded-sm"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              {menuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* ── Mobile Drawer ── */}
      {menuOpen && (
        <nav
          aria-label="Menu mobile"
          className="md:hidden bg-branco border-t border-claro/20 shadow-lg"
        >
          <div className="container mx-auto px-4 py-4 flex flex-col gap-1">
            {/* Coleção accordion */}
            <div>
              <button
                onClick={() => setColecaoOpen((o) => !o)}
                className="w-full flex items-center justify-between py-3 font-archivo text-preto hover:text-dourado transition-colors focus-visible:ring-2 focus-visible:ring-dourado"
              >
                <span>Coleção</span>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                  className={`transition-transform ${colecaoOpen ? "rotate-180" : ""}`}
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              {colecaoOpen && (
                <div className="pl-4 pb-2 flex flex-col gap-1 border-l border-claro/30">
                  {categorias.map((cat) => (
                    <Link
                      key={cat.slug}
                      href={`/categoria/${cat.slug}`}
                      onClick={() => { setMenuOpen(false); setColecaoOpen(false); }}
                      className="py-2 font-archivo text-sm text-zaya hover:text-dourado transition-colors focus-visible:ring-2 focus-visible:ring-dourado"
                    >
                      {cat.nome}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link href="/" onClick={() => setMenuOpen(false)} className="py-3 font-archivo text-preto hover:text-dourado transition-colors border-t border-claro/10 focus-visible:ring-2 focus-visible:ring-dourado">
              Home
            </Link>
            <Link href="/categoria/novidades" onClick={() => setMenuOpen(false)} className="py-3 font-archivo text-preto hover:text-dourado transition-colors border-t border-claro/10 focus-visible:ring-2 focus-visible:ring-dourado">
              Novidades
            </Link>
            <Link href="/sobre" onClick={() => setMenuOpen(false)} className="py-3 font-archivo text-preto hover:text-dourado transition-colors border-t border-claro/10 focus-visible:ring-2 focus-visible:ring-dourado">
              A Marca
            </Link>
            <Link href="/busca" onClick={() => setMenuOpen(false)} className="py-3 font-archivo text-preto hover:text-dourado transition-colors border-t border-claro/10 focus-visible:ring-2 focus-visible:ring-dourado">
              Buscar
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
