"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type CartItem = {
  variantId: string;
  productId: string;
  nome: string;
  preco: number;
  tamanho: string;
  cor: string;
  quantidade: number;
  imageUrl?: string;
};

interface CartContextData {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantidade: number) => void;
  clearCart: () => void;
  cartCount: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  useEffect(() => {
    const saved = localStorage.getItem("@FlorDaEstacao:cart");
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse cart", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("@FlorDaEstacao:cart", JSON.stringify(items));
  }, [items]);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const addItem = (item: CartItem) => {
    setItems((prev) => {
      const exists = prev.find((i) => i.variantId === item.variantId);
      if (exists) {
        return prev.map((i) =>
          i.variantId === item.variantId
            ? { ...i, quantidade: i.quantidade + item.quantidade }
            : i
        );
      }
      return [...prev, item];
    });
    openCart(); // Auto-open cart when adding items
  };

  const removeItem = (variantId: string) => {
    setItems((prev) => prev.filter((i) => i.variantId !== variantId));
  };

  const updateQuantity = (variantId: string, quantidade: number) => {
    if (quantidade <= 0) {
      removeItem(variantId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.variantId === variantId ? { ...i, quantidade } : i))
    );
  };

  const clearCart = () => setItems([]);

  const cartCount = items.reduce((acc, item) => acc + item.quantidade, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, cartCount, isCartOpen, openCart, closeCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
