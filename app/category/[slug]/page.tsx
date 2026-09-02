import Link from "next/link";
import { notFound } from "next/navigation";
import { use } from "react";
import { categories, formatPrice, products } from "@/data/products";

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const category = categories.find((item) => item.slug === resolvedParams.slug);
  if (!category) notFound();

  const categoryProducts = products.filter((product) => product.category === category.slug);

  return (
    <div className="container-shell" style={{ padding: "24px 0 40px" }}>
      <div className="page-hero">
        <h1>{category.name}</h1>
        <p>{category.label}</p>
      </div>

      <div className="category-card" style={{ marginBottom: 20 }}>
        <img src={category.image} alt={category.name} />
      </div>

      <div className="filter-bar" aria-label="Filtros por categoría">
        <span className="filter-chip">Precio</span>
        <span className="filter-chip">Más populares</span>
        <span className="filter-chip">Más recientes</span>
      </div>

      <div className="product-grid">
        {categoryProducts.map((product) => (
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
