import Link from "next/link";
import { categories, formatPrice, products } from "@/data/products";

export default function ShopPage() {
  return (
    <div className="container-shell" style={{ padding: "24px 0 40px" }}>
      <div className="page-hero">
        <h1>Tienda</h1>
        <p>Objetos exclusivos para hogares, mascotas, viajes y regalos.</p>
      </div>

      <div className="filter-bar" aria-label="Categorías de productos">
        <Link href="/shop" className="filter-chip">Todo</Link>
        {categories.map((category) => (
          <Link key={category.slug} href={`/category/${category.slug}`} className="filter-chip">
            {category.name}
          </Link>
        ))}
      </div>

      <div className="filter-bar" aria-label="Filtros de productos">
        <span className="filter-chip">Menos de $1,000</span>
        <span className="filter-chip">$1,000–$2,000</span>
        <span className="filter-chip">$2,000–$5,000</span>
        <span className="filter-chip">Más de $5,000</span>
      </div>

      <div className="product-grid">
        {products.map((product) => (
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
  );
}
