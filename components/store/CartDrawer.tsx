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
      // Bloquear scroll do body
      document.body.style.overflow = "hidden";
      
      gsap.fromTo(
        overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: "power2.out" }
      );
      gsap.fromTo(
        drawerRef.current,
        { y: "-100%" },
        { y: "0%", duration: 0.4, ease: "power3.out" }
      );
    } else {
      document.body.style.overflow = "";
      
      gsap.to(overlayRef.current, { opacity: 0, duration: 0.3, ease: "power2.in" });
      gsap.to(drawerRef.current, { y: "-100%", duration: 0.4, ease: "power3.in" });
    }
    
    return () => {
      document.body.style.overflow = "";
    };
  }, [isCartOpen]);

  // Se não estiver aberto e a animação de saída já terminou, não renderiza nada?
  // O GSAP lida com o translate, mas para não ficar ocultando elementos no DOM, usamos visibilidade controlada via opacity/transform.
  // Vamos manter renderizado no DOM para a animação de saída funcionar, mas escondido no pointer-events.

  return (
    <div
      className={`fixed inset-0 z-[100] ${isCartOpen ? "pointer-events-auto" : "pointer-events-none"}`}
      aria-hidden={!isCartOpen}
    >
      {/* Overlay escuro */}
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-preto/40 opacity-0"
        onClick={closeCart}
        aria-label="Fechar carrinho"
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className="absolute top-0 right-0 h-full w-full sm:max-w-md bg-branco shadow-2xl flex flex-col -translate-y-full"
        role="dialog"
        aria-modal="true"
        aria-label="Carrinho de Compras"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-claro/30">
          <h2 className="font-bodoni text-2xl text-preto italic">Sua Sacola</h2>
          <button
            onClick={closeCart}
            aria-label="Fechar carrinho"
            className="text-preto hover:text-dourado transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-dourado rounded-sm min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Lista de Itens */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-claro">
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
              <div key={item.variantId} className="flex gap-4 group">
                <div className="w-20 h-28 bg-claro/10 rounded-sm overflow-hidden relative shrink-0">
                  {item.imageUrl ? (
                    <Image src={item.imageUrl} alt={item.nome} fill className="object-cover" unoptimized />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-claro/50">
                      IMG
                    </div>
                  )}
                </div>
                
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-bodoni text-lg text-preto leading-tight">{item.nome}</h3>
                      <button 
                        onClick={() => removeItem(item.variantId)}
                        className="text-preto/40 hover:text-dourado transition-colors"
                        aria-label={`Remover ${item.nome}`}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    </div>
                    <p className="text-xs text-preto/60 font-archivo mt-1 uppercase tracking-widest">
                      {item.cor} | {item.tamanho}
                    </p>
                  </div>
                  
                  <div className="flex justify-between items-end">
                    <div className="flex items-center border border-claro/30 rounded-sm h-10">
                      <button 
                        onClick={() => updateQuantity(item.variantId, item.quantidade - 1)}
                        className="px-3 text-preto hover:text-dourado transition-colors min-w-[40px] h-full flex items-center justify-center"
                        aria-label="Diminuir quantidade"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                      </button>
                      <span className="w-8 text-center font-archivo text-sm text-preto">{item.quantidade}</span>
                      <button 
                        onClick={() => updateQuantity(item.variantId, item.quantidade + 1)}
                        className="px-3 text-preto hover:text-dourado transition-colors min-w-[40px] h-full flex items-center justify-center"
                        aria-label="Aumentar quantidade"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                      </button>
                    </div>
                    <p className="font-archivo font-medium text-preto">
                      R$ {item.preco.toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer do Drawer */}
        {items.length > 0 && (
          <div className="p-6 bg-claro/10 border-t border-claro/30">
            <div className="flex justify-between font-archivo text-preto mb-2">
              <span>Subtotal</span>
              <span>R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
            </div>
            <div className="flex justify-between font-archivo text-sm text-preto/60 mb-6">
              <span>Frete</span>
              <span>Calculado no checkout</span>
            </div>
            
            <Link 
              href="/checkout"
              onClick={closeCart}
              className="block w-full text-center bg-preto text-branco py-4 rounded-sm font-archivo font-medium uppercase tracking-widest hover:bg-dourado transition-colors focus-visible:ring-2 focus-visible:ring-dourado"
            >
              Finalizar Compra
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
