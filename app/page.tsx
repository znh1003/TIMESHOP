import Link from "next/link";
import { categories, products } from "@/data/products";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { ProductCard } from "@/components/product-card";
import { TrustSignals } from "@/components/trust-signals";

const featured = products.filter((product) => product.featured).slice(0, 4);
const bestSellers = products.slice(0, 3);
const collections = categories.slice(0, 4);
const trustPoints = [
  { title: "Secure checkout", text: "Protected payment experience with trusted global methods." },
  { title: "Worldwide shipping", text: "Fast, careful delivery for customers across regions." },
  { title: "Thoughtful returns", text: "Clear policies and responsive support before and after purchase." },
  { title: "Private concierge", text: "A dedicated service layer tailored to every order and inquiry." },
];

const brandValues = [
  { title: "Curated selection", text: "Every piece is chosen to feel intentional, useful, and beautiful." },
  { title: "Modern essentials", text: "Built for refined homes, routines, and elevated daily rituals." },
  { title: "Long-term quality", text: "Premium finishes, durable materials, and timeless design language." },
];

const faqItems = [
  { q: "Do you ship internationally?", a: "Yes. We deliver to Mexico and select international destinations with tracked shipping and secure packaging." },
  { q: "What is your return policy?", a: "Returns are available within the policy window for eligible items in original condition. Our support team guides each request." },
  { q: "Are your products designed for daily use?", a: "Absolutely. We focus on durable materials, elevated finishes, and thoughtful details that last beyond a season." },
  { q: "How quickly do orders ship?", a: "Most orders are processed within 48 hours, with dispatch updates sent automatically after confirmation." },
];

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <img className="hero-image" src="https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=2200&q=85" alt="Premium interior scene" />
        <div className="hero-overlay" />
        <div className="container-shell hero-content">
          <div className="hero-copy">
            <span className="eyebrow">TIMESHOP / 2026 EDITION</span>
            <h1>Diseño premium <span>para vivir diferente.</span></h1>
            <p>Descubre piezas cuidadosamente seleccionadas para transformar tus espacios y tu día a día.</p>
            <div className="hero-actions">
              <Link href="/shop" className="primary-button">Explorar colección <span aria-hidden="true">↗</span></Link>
              <Link href="#featured-collection" className="secondary-button">Ver más <span aria-hidden="true">↓</span></Link>
            </div>
          </div>
          <a href="#featured-collection" className="scroll-indicator" aria-label="Scroll to collection">
            <span>Scroll to discover</span><span aria-hidden="true">↓</span>
          </a>
        </div>
      </section>

      <section className="section editorial-strip">
        <div className="container-shell">
          <div className="editorial-grid">
            <div className="editorial-intro">
              <span className="eyebrow subdued">TIMESHOP</span>
              <h2>Minimal design. Premium value. Timeless presence.</h2>
            </div>
            <div className="editorial-copy">
              <p>
                We design for people who appreciate restraint, detail, and the confidence that comes with living beautifully.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="featured-collection">
        <div className="container-shell">
          <div className="section-head">
            <div>
              <h2 className="section-title">Featured collection</h2>
            </div>
            <Link href="/shop" className="ghost-button">
              View all
            </Link>
          </div>

          <div className="category-grid">
            {collections.map((category) => (
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
          <TrustSignals />
        </div>
      </section>

      <section className="section">
        <div className="container-shell">
          <div className="section-head">
            <div>
              <h2 className="section-title">Featured products</h2>
            </div>
            <Link href="/shop" className="ghost-button">
              View all
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
        <div className="container-shell feature-story-inner">
          <div className="feature-story-image">
            <img
              src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80"
              alt="Luxury lifestyle composition"
            />
          </div>

          <div className="feature-story-copy">
            <span className="eyebrow subdued">Brand values</span>
            <h2>Designed to feel exceptional in every detail.</h2>
            <div className="story-grid compact-grid">
              {brandValues.map((item) => (
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
            <span className="eyebrow subdued">Lifestyle</span>
            <h2>Elevated essentials for calmer, more intentional living.</h2>
            <p>
              We curate the pieces that help shape better rituals — warm light, smoother routines, and objects that quietly improve the way a room feels.
            </p>
            <Link href="/about" className="secondary-button">
              Discover our story
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
              Shop now
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
            <span className="eyebrow subdued">Brand story</span>
            <h2>Thoughtful objects, quietly powerful.</h2>
          </div>
          <p>
            TIMESHOP was built around the idea that premium living is not loud — it is intentional. We select objects that add clarity, warmth, and confidence to the spaces we inhabit every day.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container-shell">
          <div className="section-head">
            <div>
              <h2 className="section-title">Reviews</h2>
            </div>
          </div>

          <div className="reviews-empty">
            <div className="stars">★★★★★</div>
            <h3>Customer reviews are coming soon.</h3>
            <p>We are collecting verified purchase feedback and will publish it here once it is available.</p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-shell faq-shell">
          <div className="faq-copy">
            <span className="eyebrow subdued">FAQ</span>
            <h2>Everything you need to shop with confidence.</h2>
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
              <h2 className="section-title">Trusted purchase experience</h2>
            </div>
          </div>

          <div className="trust-grid">{trustPoints.map((item) => <div key={item.title} className="trust-card"><strong>{item.title}</strong><span className="muted">{item.text}</span></div>)}</div>
        </div>
      </section>

      <section className="section cta-section">
        <div className="container-shell">
          <div className="cta-bar">
            <div>
              <span className="eyebrow subdued">The quiet luxury standard</span>
              <h3>Elevate the way you live.</h3>
            </div>
            <Link href="/shop" className="primary-button">
              Discover the collection
            </Link>
          </div>
        </div>
      </section>

      <section className="section newsletter-section">
        <div className="container-shell newsletter-box">
          <div>
            <span className="eyebrow subdued">Newsletter</span>
            <h2>Receive curated releases and early access.</h2>
          </div>

          <form className="newsletter-form">
            <input type="email" placeholder="Your email address" aria-label="Email address" />
            <button type="submit" className="primary-button">
              Join now
            </button>
          </form>
        </div>
      </section>

      <WhatsAppButton />
    </>
  );
}
