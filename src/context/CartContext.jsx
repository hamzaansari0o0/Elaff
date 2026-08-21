'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext(null);
const STORAGE_KEY = 'elaff_cart';

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load any previously saved cart once, on mount.
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setItems(JSON.parse(stored));
    } catch {
      // ignore corrupted storage
    }
    setIsLoaded(true);
  }, []);

  // Persist after the initial load, so we don't overwrite storage with an empty array first.
  useEffect(() => {
    if (isLoaded) localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, isLoaded]);

  function addItem(product) {
    setItems((prev) => {
      if (prev.some((item) => item.slug === product.slug)) return prev;
      return [
        ...prev,
        {
          slug: product.slug,
          title: product.title,
          image: product.image,
          price: product.price,
          quantity: '1',
        },
      ];
    });
  }

  function removeItem(slug) {
    setItems((prev) => prev.filter((item) => item.slug !== slug));
  }

  function updateQuantity(slug, quantity) {
    setItems((prev) => prev.map((item) => (item.slug === slug ? { ...item, quantity } : item)));
  }

  function clearCart() {
    setItems([]);
  }

  function isInCart(slug) {
    return items.some((item) => item.slug === slug);
  }

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, isInCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
