"use client";

import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { formatPrice, getProductBySlug } from "@/data/products";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { useCart } from "@/components/cart-provider";
import { use, useState } from "react";
import { TrustSignals } from "@/components/trust-signals";
import { useWishlist } from "@/components/wishlist";

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const product = getProductBySlug(resolvedParams.slug);
  const { addToCart } = useCart();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(product?.gallery[0] ?? "");
  const [zoomOpen, setZoomOpen] = useState(false);
  const { toggle, isSaved } = useWishlist();

  if (!product) notFound();

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.gallery,
    brand: { "@type": "Brand", name: "TIMESHOP" },
    offers: { "@type": "Offer", priceCurrency: "MXN", price: product.price, availability: product.stock.toLowerCase().includes("agotado") ? "https://schema.org/OutOfStock" : "https://schema.org/InStock" },
  };

  const whatsappHref = `https://wa.me/8617820479265?text=${encodeURIComponent(`Consulta sobre el producto ${product.name}`)}`;

  return (
    <div className="container-shell" style={{ padding: "24px 0 40px" }}>
      <div className="page-hero">
        <h1>{product.name}</h1>
        <p>{product.shortDescription}</p>
      </div>

      <div className="product-detail-layout">
        <div className="gallery-grid">
          <button type="button" className="gallery-main-image" onClick={() => setZoomOpen(true)} aria-label="Zoom product image"><img src={activeImage} alt={product.name} /></button>
          <div className="gallery-thumbnails">
            {product.gallery.map((image, index) => <button type="button" key={`${product.slug}-${index}`} className={activeImage === image ? "is-active" : ""} onClick={() => setActiveImage(image)}><img src={image} alt={`${product.name} thumbnail ${index + 1}`} /></button>)}
          </div>
        </div>

        <aside className="detail-panel">
          <div className="detail-rating" aria-label="5 out of 5 stars">★★★★★ <span>5.0 · Reviews</span></div>
          <div className="detail-price-row">
            <div className="price">{formatPrice(product.price)}</div>
            {product.oldPrice ? <span className="old-price">{formatPrice(product.oldPrice)}</span> : null}
          </div>
          <p className="muted" style={{ margin: "8px 0 18px" }}>{product.shortDescription}</p>
          <div className="quantity-control" aria-label="Quantity">
            <span>Quantity</span>
            <div>
              <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} aria-label="Decrease quantity">−</button>
              <strong>{quantity}</strong>
              <button type="button" onClick={() => setQuantity((value) => value + 1)} aria-label="Increase quantity">+</button>
            </div>
          </div>
          <div className="meta-row"><span>Stock</span><span>{product.stock}</span></div>
          <div className="meta-row"><span>Materiales</span><span>{product.materials.join(", ")}</span></div>
          <div className="meta-row"><span>Dimensiones</span><span>{product.dimensions}</span></div>
          <div className="meta-row"><span>Colores</span><span>{product.colors.join(", ")}</span></div>
          <div className="detail-actions">
            <button
              className="primary-button"
              onClick={() => {
                for (let index = 0; index < quantity; index += 1) addToCart({ id: product.id, slug: product.slug, name: product.name, price: product.price, image: product.image });
              }}
            >
              Añadir a la bolsa
            </button>
            <button
              className="secondary-button"
              onClick={() => {
                for (let index = 0; index < quantity; index += 1) addToCart({ id: product.id, slug: product.slug, name: product.name, price: product.price, image: product.image });
                router.push("/checkout");
              }}
            >
              Comprar ahora
            </button>
          </div>
          <div className="detail-assurances">
            <div><strong>Pago seguro con PayPal</strong><span>Secure checkout</span></div>
            <div><strong>Envío a todo México</strong><span>Tracked delivery</span></div>
            <div><strong>Devoluciones dentro de 30 días</strong><span>Easy returns</span></div>
            <div><strong>Compra protegida</strong><span>Customer care included</span></div>
          </div>
          <div className="detail-actions" style={{ marginTop: 12 }}>
            <button className={`ghost-button ${isSaved(product.id) ? "is-saved" : ""}`} onClick={() => toggle(product.id)}>{isSaved(product.id) ? "♥ Saved" : "♡ Wishlist"}</button>
            <a href={whatsappHref} target="_blank" rel="noreferrer" className="ghost-button">WhatsApp</a>
          </div>
        </aside>
      </div>

      <section style={{ marginTop: 26 }}>
        <h2 className="section-title">Product details</h2>
        <p className="muted" style={{ marginTop: 12 }}>{product.description}</p>
        <ul className="detail-list">
          {product.details.map((detail) => (
            <li key={detail}>{detail}</li>
          ))}
        </ul>
      </section>
      <TrustSignals />

      <section className="section">
        <div className="section-head">
          <h2 className="section-title">¿Por qué elegirlo?</h2>
        </div>
        <div className="story-grid">
          <div className="story-card"><h3>Diseño</h3><p>Formas sobrias y presencia visual que elevan el ambiente.</p></div>
          <div className="story-card"><h3>Calidad</h3><p>Materiales seleccionados y acabados pensados para durar.</p></div>
          <div className="story-card"><h3>Materiales</h3><p>Texturas premium, durabilidad y detalles funcionales.</p></div>
          <div className="story-card"><h3>Exclusividad</h3><p>Ediciones y piezas diseñadas para vivir con intención.</p></div>
        </div>
      </section>

      <div style={{ marginTop: 24 }}>
        <Link href="/shop" className="ghost-button">Volver a la tienda</Link>
      </div>
      <WhatsAppButton />
      {zoomOpen ? <div className="image-lightbox" role="dialog" aria-modal="true" aria-label="Product image preview" onClick={() => setZoomOpen(false)}><button type="button" aria-label="Close image preview" onClick={() => setZoomOpen(false)}>×</button><img src={activeImage} alt={product.name} /></div> : null}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
    </div>
  );
}
