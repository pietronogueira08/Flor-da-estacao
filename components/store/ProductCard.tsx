import React from "react";
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
  cores?: string[]; // hex codes like ["#D2A9B1", "#241B1E"]
}

export function ProductCard({
  slug,
  nome,
  categoria,
  preco,
  is_placeholder,
  imageUrl,
  cores = [],
}: ProductCardProps) {
  return (
    <Link href={`/produto/${slug}`} className="group block">
      <div className="relative overflow-hidden bg-marfim rounded-sm mb-3">
        {is_placeholder || !imageUrl ? (
          <ProductPlaceholder />
        ) : (
          <div className="aspect-[3/4] relative w-full overflow-hidden">
            <Image
              src={imageUrl}
              alt={nome}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />
          </div>
        )}
      </div>

      <div className="space-y-1">
        <p className="font-jost text-xs text-musgo uppercase tracking-wider">{categoria}</p>
        <h3 className="font-cormorant text-xl text-carvao leading-tight">{nome}</h3>
        <div className="flex items-center justify-between mt-2">
          <p className="font-jost text-carvao font-medium">
            R$ {preco.toFixed(2).replace(".", ",")}
          </p>
          {cores.length > 0 && (
            <div className="flex gap-1">
              {cores.map((cor, i) => (
                <span
                  key={i}
                  className="w-3 h-3 rounded-full border border-carvao/20"
                  style={{ backgroundColor: cor }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
