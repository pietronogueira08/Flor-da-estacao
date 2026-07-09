"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ProductPlaceholder } from "./ProductPlaceholder";
import { useCart } from "@/lib/hooks/useCart";

export interface ProductCardProps {
  id: string;
  slug: string;
  nome: string;
  categoria: string;
  preco: number;
  is_placeholder?: boolean;
  imageUrl?: string;
  cores?: string[];
  badge?: "Novo" | "Mais Vendido";
}

export function ProductCard({
  slug,
  nome,
  categoria,
  preco,
  is_placeholder,
  imageUrl,
  cores = [],
  badge,
}: ProductCardProps) {
  const [favoritado, setFavoritado] = useState(false);
  const [tamSelecionado, setTamSelecionado] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const { addItem, openCart } = useCart();
  const tamanhos = ["P", "M", "G"];

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!tamSelecionado) return;
    
    setIsAdding(true);
    
    // Create a generic variantId for the quick-add
    const defaultCor = cores && cores.length > 0 ? "Padrão" : "Única";
    const variantId = `${id}-${tamSelecionado}-${defaultCor}`;
    
    addItem({
      variantId,
      nome,
      preco,
      cor: defaultCor,
      tamanho: tamSelecionado,
      imageUrl: imageUrl || "",
    });

    setTimeout(() => {
      setIsAdding(false);
      openCart();
    }, 600);
  };

  return (
    <div className="group block relative">
      {/* Imagem */}
      <div className="relative overflow-hidden bg-branco rounded-sm mb-3">
        {/* Badge */}
        {badge && (
          <span className="absolute top-2 left-2 z-10 font-archivo text-[10px] uppercase tracking-widest px-2 py-1 rounded-sm bg-dourado text-branco">
            {badge}
          </span>
        )}

        {/* Botão Favoritar */}
        <button
          onClick={() => setFavoritado((f) => !f)}
          aria-label={favoritado ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          className="absolute top-2 right-2 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-branco/80 backdrop-blur-sm hover:bg-branco transition-colors focus-visible:ring-2 focus-visible:ring-dourado"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill={favoritado ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={favoritado ? "text-dourado" : "text-preto/60"}
            aria-hidden="true"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>

        {/* Imagem do produto */}
        {is_placeholder || !imageUrl ? (
          <ProductPlaceholder />
        ) : (
          <Link href={`/produto/${slug}`} tabIndex={-1} aria-hidden="true">
            <div className="aspect-[3/4] relative w-full overflow-hidden">
              <Image
                src={imageUrl}
                alt={`${nome} — ${categoria} Zaya`}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                unoptimized
              />
            </div>
          </Link>
        )}

        {/* Quick-add / Seletor de tamanho — desktop: no hover | mobile: sempre visível */}
        <div className="absolute bottom-0 left-0 right-0 bg-branco/95 backdrop-blur-sm p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 md:translate-y-full md:group-hover:translate-y-0 flex flex-col gap-2">
          {/* Tamanhos */}
          <div className="flex gap-1.5 justify-center">
            {tamanhos.map((tam) => (
              <button
                key={tam}
                onClick={(e) => { e.preventDefault(); setTamSelecionado(tam); }}
                aria-label={`Tamanho ${tam}`}
                aria-pressed={tamSelecionado === tam}
                className={`w-8 h-8 text-xs font-archivo border rounded-sm transition-all duration-300 active:scale-75 focus-visible:ring-2 focus-visible:ring-dourado ${
                  tamSelecionado === tam
                    ? "bg-dourado text-branco border-dourado scale-110 shadow-md"
                    : "border-preto/30 text-preto hover:border-dourado hover:text-dourado"
                }`}
              >
                {tam}
              </button>
            ))}
          </div>
          {/* Botão Adicionar */}
          {tamSelecionado ? (
            <button
              onClick={handleAddToCart}
              disabled={isAdding}
              className={`block w-full text-center font-archivo text-xs uppercase tracking-widest py-2 rounded-sm transition-all duration-300 focus-visible:ring-2 focus-visible:ring-dourado ${
                isAdding 
                  ? "bg-green-600 text-branco scale-95 opacity-90" 
                  : "bg-dourado text-branco hover:bg-preto hover:scale-[1.02] active:scale-95 shadow-sm"
              }`}
            >
              {isAdding ? "Adicionado ✓" : "Adicionar à Sacola"}
            </button>
          ) : (
            <Link
              href={`/produto/${slug}`}
              className="block w-full text-center font-archivo text-xs uppercase tracking-widest bg-dourado text-branco py-2 rounded-sm hover:bg-preto transition-colors focus-visible:ring-2 focus-visible:ring-dourado"
            >
              Ver produto
            </Link>
          )}
        </div>

        {/* Mobile: botão sempre visível abaixo da imagem */}
        <div className="md:hidden">
          {/* Handled by the always-visible bottom bar via different logic below */}
        </div>
      </div>

      {/* Info do produto */}
      <Link href={`/produto/${slug}`} className="block space-y-1 focus-visible:ring-2 focus-visible:ring-dourado rounded-sm">
        <p className="font-archivo text-xs text-zaya uppercase tracking-wider">{categoria}</p>
        <h3 className="font-bodoni text-lg md:text-xl text-preto leading-tight line-clamp-2">{nome}</h3>
        <div className="flex items-center justify-between mt-2">
          <p className="font-archivo text-preto font-medium">
            R$ {preco.toFixed(2).replace(".", ",")}
          </p>
          {cores.length > 0 && (
            <div className="flex gap-1" aria-label="Cores disponíveis">
              {cores.map((cor, i) => (
                <span
                  key={i}
                  className="w-3 h-3 rounded-full border border-preto/20"
                  style={{ backgroundColor: cor }}
                  aria-hidden="true"
                />
              ))}
            </div>
          )}
        </div>
      </Link>

      {/* Mobile: quick-add sempre visível */}
      <div className="md:hidden mt-2">
        <div className="flex gap-2 mb-2">
          {tamanhos.map((tam) => (
            <button
              key={tam}
              onClick={(e) => { e.preventDefault(); setTamSelecionado(tam); }}
              aria-label={`Tamanho ${tam}`}
              aria-pressed={tamSelecionado === tam}
              className={`w-10 h-10 text-xs font-archivo border rounded-sm transition-all duration-300 active:scale-75 focus-visible:ring-2 focus-visible:ring-dourado ${
                tamSelecionado === tam
                  ? "bg-dourado text-branco border-dourado scale-110 shadow-md"
                  : "border-preto/30 text-preto"
              }`}
            >
              {tam}
            </button>
          ))}
        </div>
        {tamSelecionado ? (
          <button
            onClick={handleAddToCart}
            disabled={isAdding}
            className={`block w-full text-center font-archivo text-xs uppercase tracking-widest py-2 rounded-sm transition-all duration-300 focus-visible:ring-2 focus-visible:ring-dourado ${
              isAdding 
                ? "bg-green-600 text-branco scale-95 opacity-90 border border-green-600" 
                : "border border-dourado bg-dourado text-branco active:scale-95 shadow-sm"
            }`}
          >
            {isAdding ? "Adicionado ✓" : "Adicionar à Sacola"}
          </button>
        ) : (
          <Link
            href={`/produto/${slug}`}
            className="block w-full text-center font-archivo text-xs uppercase tracking-widest border border-dourado text-dourado py-2 rounded-sm hover:bg-dourado hover:text-branco transition-colors focus-visible:ring-2 focus-visible:ring-dourado"
          >
            Ver produto
          </Link>
        )}
      </div>
    </div>
  );
}
