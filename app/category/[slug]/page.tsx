import { notFound } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import { getCatalogCategories, getCatalogProducts } from "@/lib/catalog";

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const category = (await getCatalogCategories()).find((item) => item.slug === resolvedParams.slug);
  if (!category) notFound();

  const products = await getCatalogProducts();
  const categoryProducts = products.filter((product) => product.category === category.slug);

  return (
    <div className="container-shell" style={{ padding: "24px 0 40px" }}>
      <div className="page-hero">
        <h1>{category.name}</h1>
        <p>{category.label}</p>
      </div>

      {category.image ? <div className="category-card" style={{ marginBottom: 20 }}><img src={category.image} alt={category.name} /></div> : null}

      <div className="filter-bar" aria-label="Filtros por categoría">
        <span className="filter-chip">Precio</span>
        <span className="filter-chip">Más populares</span>
        <span className="filter-chip">Más recientes</span>
      </div>

      <div className="product-grid">
        {categoryProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
