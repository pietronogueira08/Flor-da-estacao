"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/hooks/useCart";
import gsap from "gsap";

export function CartDrawer() {
  const { items, updateQuantity, removeItem, isCartOpen, closeCart } = useCart();
  const cartTotal = items.reduce((acc, item) => acc + item.preco * item.quantidade, 0);

  const drawerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Animação de entrada e saída com GSAP
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
      gsap.fromTo(
        drawerRef.current,
        { y: "-100%" },
        { y: "0%", duration: 0.5, ease: "power3.out" }
      );
    } else {
      document.body.style.overflow = "";
      gsap.to(drawerRef.current, { y: "-100%", duration: 0.4, ease: "power3.in" });
    }
    
    return () => {
      document.body.style.overflow = "";
    };
  }, [isCartOpen]);

  return (
    <div
      className={`fixed inset-0 z-[100] ${isCartOpen ? "pointer-events-auto" : "pointer-events-none"}`}
      aria-hidden={!isCartOpen}
    >
      {/* Full screen Drawer */}
      <div
        ref={drawerRef}
        className="absolute top-0 left-0 h-full w-full bg-branco flex flex-col -translate-y-full"
        role="dialog"
        aria-modal="true"
        aria-label="Carrinho de Compras"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 md:p-8 border-b border-claro max-w-7xl mx-auto w-full">
          <h2 className="font-bodoni text-3xl md:text-4xl text-preto italic">Sua Sacola</h2>
          <button
            onClick={closeCart}
            aria-label="Fechar carrinho"
            className="text-preto hover:text-dourado transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-dourado rounded-sm"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Lista de Itens */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            {items.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center space-y-4">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-preto/30">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
                <p className="font-archivo text-preto text-lg">Sua sacola está vazia.</p>
                <button
                  onClick={closeCart}
                  className="font-archivo text-sm text-dourado border-b border-dourado hover:text-preto hover:border-preto transition-colors"
                >
                  Continuar comprando
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.variantId} className="flex gap-6 group bg-claro/5 p-4 rounded-sm border border-claro/30">
                  <div className="w-24 h-36 bg-claro/20 rounded-sm overflow-hidden relative shrink-0">
                    {item.imageUrl ? (
                      <Image src={item.imageUrl} alt={item.nome} fill className="object-cover" unoptimized />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-preto/20">
                        IMG
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <div className="flex justify-between items-start gap-4">
                        <h3 className="font-bodoni text-2xl text-preto italic leading-tight">{item.nome}</h3>
                        <button 
                          onClick={() => removeItem(item.variantId)}
                          className="text-preto/40 hover:text-red-500 transition-colors"
                          aria-label={`Remover ${item.nome}`}
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          </svg>
                        </button>
                      </div>
                      <p className="text-sm text-preto/60 font-archivo mt-2 uppercase tracking-widest">
                        {item.cor} | {item.tamanho}
                      </p>
                    </div>
                    
                    <div className="flex justify-between items-end">
                      <div className="flex items-center border border-claro rounded-sm h-10 bg-branco">
                        <button 
                          onClick={() => updateQuantity(item.variantId, item.quantidade - 1)}
                          className="px-3 text-preto/60 hover:text-dourado transition-colors"
                          aria-label="Diminuir quantidade"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        </button>
                        <span className="w-8 text-center font-archivo text-sm text-preto">{item.quantidade}</span>
                        <button 
                          onClick={() => updateQuantity(item.variantId, item.quantidade + 1)}
                          className="px-3 text-preto/60 hover:text-dourado transition-colors"
                          aria-label="Aumentar quantidade"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        </button>
                      </div>
                      <p className="font-archivo text-lg font-medium text-preto">
                        R$ {item.preco.toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer do Drawer */}
        {items.length > 0 && (
          <div className="p-6 bg-claro/10 border-t border-claro">
            <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex-1">
                <div className="flex justify-between font-archivo text-preto mb-2">
                  <span className="text-lg">Subtotal</span>
                  <span className="text-xl font-medium">R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
                </div>
                <p className="font-archivo text-sm text-preto/60">Frete calculado no checkout.</p>
              </div>
              <Link 
                href="/checkout"
                onClick={closeCart}
                className="w-full md:w-auto px-12 text-center bg-preto text-branco py-4 font-archivo text-sm uppercase tracking-widest hover:bg-dourado transition-colors focus-visible:ring-2 focus-visible:ring-dourado rounded-sm"
              >
                Finalizar Compra
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
