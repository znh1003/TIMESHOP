"use client";

import { useEffect, useState } from "react";

const WISHLIST_KEY = "timeshop_wishlist";
const WISHLIST_EVENT = "timeshop:wishlist-change";

function readWishlist() {
  try {
    const value = JSON.parse(window.localStorage.getItem(WISHLIST_KEY) ?? "[]");
    return Array.isArray(value) ? value.filter((id): id is number => typeof id === "number") : [];
  } catch {
    return [];
  }
}

function writeWishlist(ids: number[]) {
  window.localStorage.setItem(WISHLIST_KEY, JSON.stringify(ids));
  window.dispatchEvent(new CustomEvent(WISHLIST_EVENT));
}

export function useWishlist() {
  const [ids, setIds] = useState<number[]>([]);

  useEffect(() => {
    const sync = () => setIds(readWishlist());
    sync();
    window.addEventListener(WISHLIST_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(WISHLIST_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const toggle = (id: number) => {
    const next = ids.includes(id) ? ids.filter((value) => value !== id) : [...ids, id];
    setIds(next);
    writeWishlist(next);
  };

  return { ids, toggle, isSaved: (id: number) => ids.includes(id) };
}
