"use client";

import Link from "next/link";
import { products } from "@/data/products";
import { ProductCard } from "@/components/product-card";
import { useWishlist } from "@/components/wishlist";

export function FavoriteProducts() {
  const { ids } = useWishlist();
  const favorites = products.filter((product) => ids.includes(product.id));

  if (favorites.length === 0) {
    return <div className="empty-state"><p className="muted">Your wishlist is empty. Save pieces you love to find them here.</p><Link href="/shop" className="primary-button">Explore collection</Link></div>;
  }

  return <div className="product-grid">{favorites.map((product) => <ProductCard key={product.id} product={product} />)}</div>;
}
