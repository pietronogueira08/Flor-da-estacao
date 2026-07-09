"use client";

import React, { useState } from "react";
import { useCart } from "@/lib/hooks/useCart";
import { Button } from "@/components/ui/Button";
import { ProductPlaceholder } from "@/components/store/ProductPlaceholder";
import Image from "next/image";

export function ProductDetails({ product }: { product: any }) {
  const { addItem, openCart } = useCart();
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>(product.cores?.[0] || "");
  const [adding, setAdding] = useState(false);

  const tamanhos = ["P", "M", "G", "GG"];
  const is_placeholder = product.is_placeholder || !product.imagem_url;

  const handleAdd = () => {
    if (!selectedSize) {
      alert("Por favor, selecione um tamanho");
      return;
    }
    setAdding(true);
    addItem({
      variantId: `${product.id}-${selectedSize}-${selectedColor}`,
      productId: product.id,
      nome: product.nome,
      preco: product.preco,
      tamanho: selectedSize,
      cor: selectedColor,
      quantidade: 1,
      imageUrl: product.imagem_url,
    });
    setTimeout(() => {
      setAdding(false);
      openCart();
    }, 600);
  };

  return (
    <div className="flex flex-col md:flex-row gap-12">
      <div className="w-full md:w-1/2">
        {is_placeholder ? (
          <ProductPlaceholder className="w-full aspect-[3/4]" />
        ) : (
          <div className="w-full aspect-[3/4] relative bg-claro/10 rounded-sm overflow-hidden">
            <Image src={product.imagem_url} alt={product.nome} fill className="object-cover" unoptimized />
          </div>
        )}
      </div>

      <div className="w-full md:w-1/2 flex flex-col pt-4 md:pt-10">
        <p className="font-archivo text-sm text-preto/60 uppercase tracking-wider mb-2">{product.categoria}</p>
        <h1 className="font-bodoni text-4xl lg:text-5xl text-preto italic leading-tight mb-4">{product.nome}</h1>
        <p className="font-archivo text-2xl text-preto mb-8">R$ {product.preco.toFixed(2).replace(".", ",")}</p>

        {product.cores && product.cores.length > 0 && (
          <div className="mb-6">
            <p className="font-archivo text-sm text-preto mb-3">Cor selecionada</p>
            <div className="flex gap-3">
              {product.cores.map((cor: string) => (
                <button
                  key={cor}
                  onClick={() => setSelectedColor(cor)}
                  className={`w-8 h-8 rounded-full border-2 transition-transform active:scale-90 ${selectedColor === cor ? 'border-preto scale-110 shadow-sm' : 'border-transparent hover:scale-105'} ring-1 ring-black/10`}
                  style={{ backgroundColor: cor }}
                />
              ))}
            </div>
          </div>
        )}

        <div className="mb-10">
          <div className="flex justify-between items-center mb-3">
            <p className="font-archivo text-sm text-preto">Tamanho</p>
            <button className="font-archivo text-xs text-preto/60 underline hover:text-dourado transition-colors">Guia de medidas</button>
          </div>
          <div className="flex gap-3">
            {tamanhos.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`w-12 h-12 flex items-center justify-center font-archivo border rounded-sm transition-all duration-300 active:scale-75 focus-visible:ring-2 focus-visible:ring-dourado ${
                  selectedSize === size
                    ? 'border-dourado bg-dourado text-branco scale-110 shadow-md'
                    : 'border-claro text-preto hover:border-dourado hover:text-dourado'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <button 
          onClick={handleAdd}
          disabled={adding}
          className={`w-full h-14 text-lg font-archivo uppercase tracking-widest rounded-sm transition-all duration-300 focus-visible:ring-2 focus-visible:ring-dourado mb-8 ${
            adding
              ? "bg-green-600 text-branco scale-[0.98] opacity-90 border border-green-600 shadow-inner"
              : "bg-dourado text-branco hover:bg-preto hover:scale-[1.02] active:scale-[0.98] shadow-md border border-dourado hover:border-preto"
          }`}
        >
          {adding ? "Adicionado ✓" : "Adicionar à Sacola"}
        </button>

        <div className="prose prose-sm font-archivo text-preto/80 mb-8">
          <p>{product.descricao || "Uma peça delicada e atemporal, confeccionada com tecidos nobres para garantir conforto e elegância em qualquer estação."}</p>
        </div>

        <div className="flex items-center gap-3 text-preto/60 font-archivo text-sm py-4 border-t border-claro/30">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
          Frete calculado no checkout
        </div>
      </div>
    </div>
  );
}
