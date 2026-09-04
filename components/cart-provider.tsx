"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  startTransition,
  type ReactNode,
} from "react";

export type CartItem = {
  id: string | number;
  slug: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  itemCount: number;
  addToCart: (product: Omit<CartItem, "quantity">) => void;
  updateQuantity: (id: string | number, delta: number) => void;
  removeFromCart: (id: string | number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);
const CART_STORAGE_KEY = "timeshop_cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as CartItem[];
      if (Array.isArray(parsed)) startTransition(() => setItems(parsed));
    } catch {
      window.localStorage.removeItem(CART_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addToCart = (product: Omit<CartItem, "quantity">) => {
    setItems((current) => {
      const item = current.find((entry) => entry.id === product.id);
      if (item) {
        return current.map((entry) =>
          entry.id === product.id ? { ...entry, quantity: entry.quantity + 1 } : entry,
        );
      }

      return [...current, { ...product, quantity: 1 }];
    });
    window.dispatchEvent(new CustomEvent("timeshop:add-to-cart", { detail: product }));
  };

  const updateQuantity = (id: string | number, delta: number) => {
    setItems((current) =>
      current
        .map((entry) =>
          entry.id === id ? { ...entry, quantity: Math.max(0, entry.quantity + delta) } : entry,
        )
        .filter((entry) => entry.quantity > 0),
    );
  };

  const removeFromCart = (id: string | number) => {
    setItems((current) => current.filter((entry) => entry.id !== id));
  };

  const clearCart = () => setItems([]);

  const subtotal = useMemo(
    () => items.reduce((total, item) => total + item.price * item.quantity, 0),
    [items],
  );
  const shipping = subtotal > 0 && subtotal < 2500 ? 299 : 0;
  const total = subtotal + shipping;
  const itemCount = items.reduce((count, item) => count + item.quantity, 0);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      subtotal,
      shipping,
      total,
      itemCount,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
    }),
    [items, subtotal, shipping, total, itemCount],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }

  return context;
}
