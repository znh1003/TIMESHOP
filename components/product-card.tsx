"use client";

import Link from "next/link";
import { formatPrice, type Product } from "@/data/products";
import { useCart } from "@/components/cart-provider";
import { useWishlist } from "@/components/wishlist";

export function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const { toggle, isSaved } = useWishlist();
  const saved = isSaved(product.id);
  const isOutOfStock = product.stock.toLowerCase().includes("agotado");

  const addProduct = () => {
    if (isOutOfStock) return;
    addToCart({
      id: product.databaseId ?? product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.image,
    });
  };

  return (
    <article className={`product-card ${isOutOfStock ? "is-out-of-stock" : ""}`}>
      <div className="product-image-wrap">
        <Link href={`/products/${product.slug}`} className="product-image-link" aria-label={`Ver ${product.name}`}>
          <img src={product.image} alt={product.name} />
        </Link>
        <div className="product-card-topline">
          {product.badge ? <span className="badge">{product.badge === "Best Seller" ? "Más vendido" : product.badge}</span> : <span className="badge badge-new">Novedad</span>}
          <button type="button" className={`wishlist-button ${saved ? "is-saved" : ""}`} onClick={() => toggle(product.id, product.slug)} aria-label={saved ? "Quitar de favoritos" : "Añadir a favoritos"}>
            {saved ? "♥" : "♡"}
          </button>
        </div>
        <div className="product-card-actions">
          <button type="button" className="quick-add-button" onClick={addProduct} disabled={isOutOfStock}>
            {isOutOfStock ? "Agotado" : "Añadir al carrito"}
          </button>
          <Link href={`/products/${product.slug}`} className="quick-view-button">Vista rápida</Link>
        </div>
      </div>
      <div className="product-body">
        <h3><Link href={`/products/${product.slug}`}>{product.name}</Link></h3>
        <p>{product.shortDescription}</p>
        <div className="product-rating" aria-label="5 de 5 estrellas">
          <span aria-hidden="true">★★★★★</span><span>5.0</span>
        </div>
        <div className="price-row">
          <div>
            <div className="price">{formatPrice(product.price)}</div>
            {product.oldPrice ? <span className="old-price">{formatPrice(product.oldPrice)}</span> : null}
          </div>
        </div>
      </div>
    </article>
  );
}
