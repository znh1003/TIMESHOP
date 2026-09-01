import Link from "next/link";
import { categories, formatPrice, products } from "@/data/products";
import { WhatsAppButton } from "@/components/WhatsAppButton";

const featured = products.filter((product) => product.featured).slice(0, 4);
const trustPoints = [
  {
    title: "Pago seguro",
    text: "Procesamos tus pagos de forma segura a través de PayPal.",
  },
  {
    title: "Envíos a todo México",
    text: "Enviamos nuestros productos a diferentes destinos de México.",
  },
  {
    title: "Devoluciones",
    text: "Consulta nuestra política de devoluciones antes de comprar.",
  },
  {
    title: "Atención personalizada",
    text: "Estamos disponibles para ayudarte antes y después de tu compra.",
  },
];

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="container-shell hero-panel">
          <div className="hero-copy">
            <span className="eyebrow">Luxury living</span>
            <h1>
              Diseñado para <span>vivir diferente.</span>
            </h1>
            <p>
              Objetos únicos para espacios, momentos y estilos de vida extraordinarios.
            </p>
            <div className="hero-actions">
              <Link href="/shop" className="primary-button">
                Comprar colección
              </Link>
              <Link href="/shop" className="secondary-button">
                Explorar productos
              </Link>
            </div>
          </div>

          <div className="hero-media">
            <img
              src="https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80"
              alt="Interior premium"
            />
            <div className="image-label">Edición limitada · 2026</div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-shell">
          <div className="section-head">
            <div>
              <h2 className="section-title">Categorías</h2>
            </div>
          </div>

          <div className="category-grid">
            {categories.map((category) => (
              <Link key={category.slug} href={`/category/${category.slug}`} className="category-card">
                <img src={category.image} alt={category.name} />
                <div className="category-card-body">
                  <h3>{category.name}</h3>
                  <p>{category.label}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-shell">
          <div className="section-head">
            <div>
              <h2 className="section-title">Colección destacada</h2>
            </div>
            <Link href="/shop" className="ghost-button">
              Ver todo
            </Link>
          </div>

          <div className="product-grid">
            {featured.map((product) => (
              <article key={product.id} className="product-card">
                <img src={product.image} alt={product.name} />
                <div className="product-body">
                  {product.badge ? <span className="badge">{product.badge}</span> : null}
                  <h3>{product.name}</h3>
                  <p>{product.shortDescription}</p>
                  <div className="price-row">
                    <div>
                      <div className="price">{formatPrice(product.price)}</div>
                      {product.oldPrice ? <span className="old-price">{formatPrice(product.oldPrice)}</span> : null}
                    </div>
                    <Link href={`/products/${product.slug}`} className="primary-button small-button">
                      Ver
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>


      <section className="section">
        <div className="container-shell">
          <div className="section-head">
            <div>
              <h2 className="section-title">Compra con confianza</h2>
            </div>
          </div>

          <div className="trust-grid">
            {trustPoints.map((item) => (
              <div key={item.title} className="trust-card">
                <strong>{item.title}</strong>
                <span className="muted">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <WhatsAppButton />
    </>
  );
}
