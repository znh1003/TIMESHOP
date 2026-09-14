import Link from "next/link";
import { getCatalogCategories, getCatalogProducts } from "@/lib/catalog";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { ProductCard } from "@/components/product-card";
import { TrustSignals } from "@/components/trust-signals";
import { TimeAwareHero } from "@/components/time-aware-hero";
import { NewsletterSignup } from "@/components/newsletter-signup";

export const dynamic = "force-dynamic";

const trustPoints = [
  { title: "Pago seguro", text: "Procesado mediante plataformas de pago confiables." },
  { title: "Envío con seguimiento", text: "Consulta el estado de tu pedido." },
  { title: "Atención personalizada", text: "Nuestro equipo está disponible para ayudarte." },
  { title: "Políticas transparentes", text: "Consulta nuestras políticas antes de comprar." },
];

const shippingHighlights = [
  { title: "🇲🇽 Envíos a todo México", text: "Cobertura nacional para que recibas tu pedido donde estés." },
  { title: "📦 Entrega estimada", text: "Los tiempos pueden variar según el destino y la paquetería." },
  { title: "🔒 Compra segura y pagos protegidos", text: "Tus datos y tu pago están protegidos durante toda la compra." },
  { title: "💬 Atención al cliente", text: "Estamos aquí para ayudarte." },
];

const faqItems = [
  { q: "¿Hacen envíos a todo México?", a: "Sí. Enviamos a todo México con seguimiento una vez que tu pedido sale de preparación." },
  { q: "¿Cuál es la política de devoluciones?", a: "Cada solicitud se revisa conforme a las condiciones del producto, el motivo de la compra y la legislación aplicable." },
  { q: "¿Los productos son para uso diario?", a: "Sí. Seleccionamos materiales resistentes y acabados pensados para acompañarte todos los días." },
  { q: "¿Cuánto tarda la entrega?", a: "Los tiempos de entrega son estimados y pueden variar según la preparación, el destino, la paquetería y las aduanas." },
];

export default async function HomePage() {
  const products = await getCatalogProducts();
  const collections = (await getCatalogCategories()).slice(0, 4);
  const featured = products.filter((product) => product.featured).slice(0, 4);
  const bestSellers = products.slice(0, 3);
  return (
    <>
      <TimeAwareHero />

      <section className="section editorial-strip">
        <div className="container-shell">
          <div className="editorial-grid">
            <div className="editorial-intro">
              <span className="eyebrow subdued">TIMESHOP</span>
              <h2>Diseño minimalista. Valor premium. Presencia atemporal.</h2>
            </div>
            <div className="editorial-copy">
              <p>
                Diseñamos para quienes valoran la sobriedad, los detalles y la confianza de vivir rodeados de belleza.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="featured-collection">
        <div className="container-shell">
          <div className="section-head">
            <div>
              <h2 className="section-title">Colecciones</h2>
            </div>
            <Link href="/shop" className="ghost-button">
              Ver todo
            </Link>
          </div>

          <div className="category-button-grid" aria-label="Colecciones">
            {collections.map((category) => (
              <Link key={category.slug} href={`/category/${category.slug}`} className="category-button">
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-shell">
          <div className="section-head"><h2 className="section-title">Compra con confianza</h2></div>
          <TrustSignals />
        </div>
      </section>

      <section className="section">
        <div className="container-shell">
          <div className="section-head">
            <div>
              <h2 className="section-title">Productos destacados</h2>
            </div>
            <Link href="/shop" className="ghost-button">
              Ver todo
            </Link>
          </div>

          <div className="product-grid">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="section feature-story">
        <div className="container-shell feature-story-inner feature-story-inner--shipping">
          <div className="feature-story-copy">
            <span className="eyebrow subdued">Información de envío</span>
            <h2>Tu pedido, claro y protegido desde la compra hasta la entrega.</h2>
            <div className="story-grid compact-grid">
              {shippingHighlights.map((item) => (
                <div key={item.title} className="story-card">
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section lifestyle-section">
        <div className="container-shell lifestyle-layout">
          <div className="lifestyle-copy">
            <span className="eyebrow subdued">Estilo de vida</span>
            <h2>Esenciales premium para vivir cada día con más intención.</h2>
            <p>
              Seleccionamos piezas que mejoran tus rituales: luz cálida, rutinas más sencillas y objetos que transforman discretamente cada espacio.
            </p>
            <Link href="/about" className="secondary-button">
              Conoce nuestra historia
            </Link>
          </div>

          <div className="lifestyle-visual">
            <img
              src="https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80"
              alt="Warm premium home styling"
            />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-shell">
          <div className="section-head">
            <div>
              <h2 className="section-title">Best sellers</h2>
            </div>
            <Link href="/shop" className="ghost-button">
              Comprar ahora
            </Link>
          </div>

          <div className="product-grid">
            {bestSellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="section story-band">
        <div className="container-shell story-band-inner">
          <div>
            <span className="eyebrow subdued">Historia de TIMESHOP</span>
            <h2>Objetos pensados, con una fuerza silenciosa.</h2>
          </div>
          <p>
            TIMESHOP nació de una idea: vivir con calidad no significa hacerlo en voz alta, sino con intención. Seleccionamos objetos que aportan claridad, calidez y confianza a los espacios de cada día.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container-shell faq-shell">
          <div className="faq-copy">
            <span className="eyebrow subdued">Preguntas frecuentes</span>
            <h2>Todo lo que necesitas para comprar con confianza.</h2>
          </div>

          <div className="faq-list">
            {faqItems.map((item) => (
              <details key={item.q} className="faq-item">
                <summary><h3>{item.q}</h3><span aria-hidden="true">+</span></summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-shell">
          <div className="section-head">
            <div>
              <h2 className="section-title">Compra segura y acompañada</h2>
            </div>
          </div>

          <div className="trust-grid">{trustPoints.map((item) => <div key={item.title} className="trust-card"><strong>{item.title}</strong><span className="muted">{item.text}</span></div>)}</div>
        </div>
      </section>

      <section className="section cta-section">
        <div className="container-shell">
          <div className="cta-bar">
            <div>
              <span className="eyebrow subdued">El estándar TIMESHOP</span>
              <h3>Eleva tu forma de vivir.</h3>
            </div>
            <Link href="/shop" className="primary-button">
              Descubrir la colección
            </Link>
          </div>
        </div>
      </section>

      <section className="section newsletter-section">
        <div className="container-shell newsletter-box">
          <div>
            <span className="eyebrow subdued">Boletín</span>
            <h2>Recibe novedades seleccionadas y acceso anticipado.</h2>
          </div>

          <NewsletterSignup />
        </div>
      </section>

      <WhatsAppButton />
    </>
  );
}
