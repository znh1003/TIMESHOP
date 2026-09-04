"use client";

import { notFound, useRouter } from "next/navigation";
import { formatPrice, getProductBySlug, type Product } from "@/data/products";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { useCart } from "@/components/cart-provider";
import { use, useEffect, useState } from "react";
import { TrustSignals } from "@/components/trust-signals";
import { useWishlist } from "@/components/wishlist";

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const [product, setProduct] = useState<Product | undefined>(() => getProductBySlug(resolvedParams.slug));
  const { addToCart } = useCart();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(product?.gallery[0] ?? "");
  const [selectedColor, setSelectedColor] = useState(product?.colors[0] ?? "");
  const [zoomOpen, setZoomOpen] = useState(false);
  const { toggle, isSaved } = useWishlist();

  useEffect(() => {
    fetch("/api/products").then(async (response) => {
      const data = await response.json() as { items?: Product[] };
      const databaseProduct = data.items?.find((item) => item.slug === resolvedParams.slug);
      if (response.ok && databaseProduct) {
        setProduct(databaseProduct);
        setActiveImage(databaseProduct.gallery[0] ?? databaseProduct.image);
        setSelectedColor(databaseProduct.colors[0] ?? "");
      }
    }).catch(() => undefined);
  }, [resolvedParams.slug]);

  if (!product) notFound();

  const handleBackToProducts = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push("/shop");
  };

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
      <div className="product-breadcrumb">
        <button type="button" className="back-button" onClick={handleBackToProducts}>Volver a productos</button>
      </div>

      <div className="product-detail-layout">
        <div className="gallery-grid">
          <button type="button" className="gallery-main-image" onClick={() => setZoomOpen(true)} aria-label="Zoom product image"><img src={activeImage} alt={product.name} /></button>
          <div className="gallery-thumbnails">
            {product.gallery.map((image, index) => <button type="button" key={`${product.slug}-${index}`} className={activeImage === image ? "is-active" : ""} onClick={() => setActiveImage(image)}><img src={image} alt={`${product.name} thumbnail ${index + 1}`} /></button>)}
          </div>
        </div>

        <aside className="detail-panel">
          <h1 className="product-detail-title">{product.name}</h1>
          <div className="detail-rating" aria-label="5 de 5 estrellas">★★★★★ <span>5.0 · Opiniones</span></div>
          <div className="detail-price-row">
            <div className="price">{formatPrice(product.price)}</div>
            {product.oldPrice ? <span className="old-price">{formatPrice(product.oldPrice)}</span> : null}
          </div>
          <p className="muted" style={{ margin: "8px 0 18px" }}>{product.shortDescription}</p>
          <div className="quantity-control" aria-label="Quantity">
            <span>Cantidad</span>
            <div>
              <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} aria-label="Decrease quantity">−</button>
              <strong>{quantity}</strong>
              <button type="button" onClick={() => setQuantity((value) => value + 1)} aria-label="Increase quantity">+</button>
            </div>
          </div>
          <div className="variant-control">
            <div><span>Color</span><strong>{selectedColor}</strong></div>
            <div className="variant-options">
              {product.colors.map((color) => <button type="button" key={color} className={selectedColor === color ? "is-selected" : ""} onClick={() => setSelectedColor(color)}>{color}</button>)}
            </div>
          </div>
          <div className="meta-row"><span>Disponibilidad</span><span>{product.stock}</span></div>
          <div className="meta-row"><span>Materiales</span><span>{product.materials.join(", ")}</span></div>
          <div className="meta-row"><span>Dimensiones</span><span>{product.dimensions}</span></div>
          <div className="detail-actions">
            <button
              className="primary-button"
              onClick={() => {
                for (let index = 0; index < quantity; index += 1) addToCart({ id: product.databaseId ?? product.id, slug: product.slug, name: product.name, price: product.price, image: product.image });
              }}
            >
              Añadir al carrito
            </button>
            <button
              className="secondary-button"
              onClick={() => {
                for (let index = 0; index < quantity; index += 1) addToCart({ id: product.databaseId ?? product.id, slug: product.slug, name: product.name, price: product.price, image: product.image });
                router.push("/checkout");
              }}
            >
              Comprar ahora
            </button>
          </div>
          <div className="detail-assurances">
            <div><strong>Pago seguro con PayPal</strong><span>Compra protegida</span></div>
            <div><strong>Envío a todo México</strong><span>Entrega rastreada</span></div>
            <div><strong>Devoluciones dentro de 30 días</strong><span>Proceso sencillo</span></div>
            <div><strong>Atención personalizada</strong><span>Estamos para ayudarte</span></div>
          </div>
          <div className="detail-actions" style={{ marginTop: 12 }}>
            <button className={`ghost-button ${isSaved(product.id) ? "is-saved" : ""}`} onClick={() => toggle(product.id, product.slug)}>{isSaved(product.id) ? "♥ Saved" : "♡ Wishlist"}</button>
            <a href={whatsappHref} target="_blank" rel="noreferrer" className="ghost-button">WhatsApp México</a>
          </div>
        </aside>
      </div>

      <section style={{ marginTop: 26 }}>
        <h2 className="section-title">Descripción del producto</h2>
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
          <h2 className="section-title">Características</h2>
        </div>
        <div className="story-grid">
          <div className="story-card"><h3>Diseño</h3><p>Formas sobrias y presencia visual que elevan el ambiente.</p></div>
          <div className="story-card"><h3>Calidad</h3><p>Materiales seleccionados y acabados pensados para durar.</p></div>
          <div className="story-card"><h3>Materiales</h3><p>Texturas premium, durabilidad y detalles funcionales.</p></div>
          <div className="story-card"><h3>Incluye</h3><p>La pieza preparada para integrarse a tu espacio desde el primer día.</p></div>
        </div>
      </section>

      <div style={{ marginTop: 24 }}>
        <button type="button" className="ghost-button" onClick={handleBackToProducts}>Volver a productos</button>
      </div>
      <WhatsAppButton />
      {zoomOpen ? <div className="image-lightbox" role="dialog" aria-modal="true" aria-label="Product image preview" onClick={() => setZoomOpen(false)}><button type="button" aria-label="Close image preview" onClick={() => setZoomOpen(false)}>×</button><img src={activeImage} alt={product.name} /></div> : null}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
    </div>
  );
}
