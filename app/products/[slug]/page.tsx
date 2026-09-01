"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { formatPrice, getProductBySlug } from "@/data/products";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { useCart } from "@/components/cart-provider";

export default function ProductPage({ params }: { params: { slug: string } }) {
  const product = getProductBySlug(params.slug);
  const { addToCart } = useCart();

  if (!product) notFound();

  const whatsappHref = `https://wa.me/5215512345678?text=${encodeURIComponent(`Consulta sobre el producto ${product.name}`)}`;

  return (
    <div className="container-shell" style={{ padding: "24px 0 40px" }}>
      <div className="page-hero">
        <h1>{product.name}</h1>
        <p>{product.shortDescription}</p>
      </div>

      <div className="product-detail-layout">
        <div className="gallery-grid">
          {product.gallery.map((image, index) => (
            <img key={`${product.slug}-${index}`} src={image} alt={`${product.name} ${index + 1}`} />
          ))}
        </div>

        <aside className="detail-panel">
          <div className="price">{formatPrice(product.price)}</div>
          <p className="muted" style={{ margin: "8px 0 18px" }}>{product.shortDescription}</p>
          <div className="meta-row"><span>Stock</span><span>{product.stock}</span></div>
          <div className="meta-row"><span>Materiales</span><span>{product.materials.join(", ")}</span></div>
          <div className="meta-row"><span>Dimensiones</span><span>{product.dimensions}</span></div>
          <div className="meta-row"><span>Colores</span><span>{product.colors.join(", ")}</span></div>
          <div className="detail-actions">
            <button className="primary-button" onClick={() => addToCart({ id: product.id, slug: product.slug, name: product.name, price: product.price, image: product.image })}>
              Añadir a la bolsa
            </button>
            <button className="secondary-button" onClick={() => addToCart({ id: product.id, slug: product.slug, name: product.name, price: product.price, image: product.image })}>
              Comprar ahora
            </button>
          </div>
          <div className="detail-actions" style={{ marginTop: 12 }}>
            <button className="ghost-button">♡ Favorito</button>
            <a href={whatsappHref} target="_blank" rel="noreferrer" className="ghost-button">WhatsApp</a>
          </div>
        </aside>
      </div>

      <section style={{ marginTop: 26 }}>
        <h2 className="section-title">Descripción</h2>
        <p className="muted" style={{ marginTop: 12 }}>{product.description}</p>
        <ul className="detail-list">
          {product.details.map((detail) => (
            <li key={detail}>{detail}</li>
          ))}
        </ul>
      </section>

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
    </div>
  );
}
