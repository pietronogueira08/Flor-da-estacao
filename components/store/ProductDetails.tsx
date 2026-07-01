"use client";

import React, { useState } from "react";
import { useCart } from "@/lib/hooks/useCart";
import { Button } from "@/components/ui/Button";
import { ProductPlaceholder } from "@/components/store/ProductPlaceholder";
import Image from "next/image";

export function ProductDetails({ product }: { product: any }) {
  const { addItem } = useCart();
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
      alert("Adicionado ao carrinho!");
    }, 500);
  };

  return (
    <div className="flex flex-col md:flex-row gap-12">
      <div className="w-full md:w-1/2">
        {is_placeholder ? (
          <ProductPlaceholder className="w-full aspect-[3/4]" />
        ) : (
          <div className="w-full aspect-[3/4] relative bg-nevoa rounded-sm overflow-hidden">
            <Image src={product.imagem_url} alt={product.nome} fill className="object-cover" />
          </div>
        )}
      </div>

      <div className="w-full md:w-1/2 flex flex-col pt-4 md:pt-10">
        <p className="font-jost text-sm text-musgo uppercase tracking-wider mb-2">{product.categoria}</p>
        <h1 className="font-cormorant text-4xl lg:text-5xl text-carvao leading-tight mb-4">{product.nome}</h1>
        <p className="font-jost text-2xl text-carvao mb-8">R$ {product.preco.toFixed(2).replace(".", ",")}</p>

        {product.cores && product.cores.length > 0 && (
          <div className="mb-6">
            <p className="font-jost text-sm text-carvao mb-3">Cor selecionada</p>
            <div className="flex gap-3">
              {product.cores.map((cor: string) => (
                <button
                  key={cor}
                  onClick={() => setSelectedColor(cor)}
                  className={`w-8 h-8 rounded-full border-2 ${selectedColor === cor ? 'border-carvao' : 'border-transparent'} ring-1 ring-black/10`}
                  style={{ backgroundColor: cor }}
                />
              ))}
            </div>
          </div>
        )}

        <div className="mb-10">
          <div className="flex justify-between items-center mb-3">
            <p className="font-jost text-sm text-carvao">Tamanho</p>
            <button className="font-jost text-xs text-musgo underline">Guia de medidas</button>
          </div>
          <div className="flex gap-3">
            {tamanhos.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`w-12 h-12 flex items-center justify-center font-jost border transition-colors ${
                  selectedSize === size
                    ? 'border-carvao bg-carvao text-marfim'
                    : 'border-rosa-antigo/50 text-carvao hover:border-ameixa'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <Button 
          onClick={handleAdd}
          disabled={adding}
          className="w-full h-14 text-lg bg-ameixa hover:bg-carvao text-marfim mb-8"
        >
          {adding ? "Adicionando..." : "Adicionar ao Carrinho"}
        </Button>

        <div className="prose prose-sm font-jost text-carvao/80 mb-8">
          <p>{product.descricao || "Uma peça delicada e atemporal, confeccionada com tecidos nobres para garantir conforto e elegância em qualquer estação."}</p>
        </div>

        <div className="flex items-center gap-3 text-musgo font-jost text-sm py-4 border-t border-rosa-antigo/20">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
          Frete calculado no checkout
        </div>
      </div>
    </div>
  );
}
