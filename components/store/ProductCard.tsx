"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ProductPlaceholder } from "./ProductPlaceholder";

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
  const tamanhos = ["P", "M", "G"];

  return (
    <div className="group block relative">
      {/* Imagem */}
      <div className="relative overflow-hidden bg-marfim rounded-sm mb-3">
        {/* Badge */}
        {badge && (
          <span className="absolute top-2 left-2 z-10 font-jost text-[10px] uppercase tracking-widest px-2 py-1 rounded-sm bg-ameixa text-marfim">
            {badge}
          </span>
        )}

        {/* Botão Favoritar */}
        <button
          onClick={() => setFavoritado((f) => !f)}
          aria-label={favoritado ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          className="absolute top-2 right-2 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-marfim/80 backdrop-blur-sm hover:bg-marfim transition-colors focus-visible:ring-2 focus-visible:ring-ameixa"
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
            className={favoritado ? "text-ameixa" : "text-carvao/60"}
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
                alt={`${nome} — ${categoria} Flor da Estação`}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                unoptimized
              />
            </div>
          </Link>
        )}

        {/* Quick-add / Seletor de tamanho — desktop: no hover | mobile: sempre visível */}
        <div className="absolute bottom-0 left-0 right-0 bg-marfim/95 backdrop-blur-sm p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 md:translate-y-full md:group-hover:translate-y-0 flex flex-col gap-2">
          {/* Tamanhos */}
          <div className="flex gap-1.5 justify-center">
            {tamanhos.map((tam) => (
              <button
                key={tam}
                onClick={() => setTamSelecionado(tam)}
                aria-label={`Tamanho ${tam}`}
                aria-pressed={tamSelecionado === tam}
                className={`w-8 h-8 text-xs font-jost border rounded-sm transition-colors focus-visible:ring-2 focus-visible:ring-ameixa ${
                  tamSelecionado === tam
                    ? "bg-ameixa text-marfim border-ameixa"
                    : "border-carvao/30 text-carvao hover:border-ameixa hover:text-ameixa"
                }`}
              >
                {tam}
              </button>
            ))}
          </div>
          {/* Botão Adicionar */}
          <Link
            href={`/produto/${slug}`}
            className="block text-center font-jost text-xs uppercase tracking-widest bg-ameixa text-marfim py-2 rounded-sm hover:bg-carvao transition-colors focus-visible:ring-2 focus-visible:ring-ameixa"
          >
            Ver produto
          </Link>
        </div>

        {/* Mobile: botão sempre visível abaixo da imagem */}
        <div className="md:hidden">
          {/* Handled by the always-visible bottom bar via different logic below */}
        </div>
      </div>

      {/* Info do produto */}
      <Link href={`/produto/${slug}`} className="block space-y-1 focus-visible:ring-2 focus-visible:ring-ameixa rounded-sm">
        <p className="font-jost text-xs text-musgo uppercase tracking-wider">{categoria}</p>
        <h3 className="font-cormorant text-xl text-carvao leading-tight">{nome}</h3>
        <div className="flex items-center justify-between mt-2">
          <p className="font-jost text-carvao font-medium">
            R$ {preco.toFixed(2).replace(".", ",")}
          </p>
          {cores.length > 0 && (
            <div className="flex gap-1" aria-label="Cores disponíveis">
              {cores.map((cor, i) => (
                <span
                  key={i}
                  className="w-3 h-3 rounded-full border border-carvao/20"
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
        <div className="flex gap-1.5 mb-2">
          {tamanhos.map((tam) => (
            <button
              key={tam}
              onClick={() => setTamSelecionado(tam)}
              aria-label={`Tamanho ${tam}`}
              aria-pressed={tamSelecionado === tam}
              className={`w-8 h-8 text-xs font-jost border rounded-sm transition-colors focus-visible:ring-2 focus-visible:ring-ameixa ${
                tamSelecionado === tam
                  ? "bg-ameixa text-marfim border-ameixa"
                  : "border-carvao/30 text-carvao"
              }`}
            >
              {tam}
            </button>
          ))}
        </div>
        <Link
          href={`/produto/${slug}`}
          className="block text-center font-jost text-xs uppercase tracking-widest border border-ameixa text-ameixa py-2 rounded-sm hover:bg-ameixa hover:text-marfim transition-colors focus-visible:ring-2 focus-visible:ring-ameixa"
        >
          Ver produto
        </Link>
      </div>
    </div>
  );
}
