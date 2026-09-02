"use client";

import { useState } from "react";
import { categories, products } from "@/data/products";
import { ProductCard } from "@/components/product-card";

export default function ShopPage() {
  const [category, setCategory] = useState("all");
  const [price, setPrice] = useState("all");
  const [sort, setSort] = useState("featured");
  const filteredProducts = products
    .filter((product) => category === "all" || product.category === category)
    .filter((product) => {
      if (price === "under-2000") return product.price < 2000;
      if (price === "2000-5000") return product.price >= 2000 && product.price <= 5000;
      if (price === "over-5000") return product.price > 5000;
      return true;
    })
    .sort((first, second) => {
      if (sort === "price-low") return first.price - second.price;
      if (sort === "price-high") return second.price - first.price;
      if (sort === "newest") return second.id - first.id;
      return Number(Boolean(second.featured)) - Number(Boolean(first.featured));
    });

  return (
    <div className="container-shell" style={{ padding: "24px 0 40px" }}>
      <div className="page-hero">
        <h1>Shop</h1>
        <p>A considered collection of premium objects for everyday rituals and elevated spaces.</p>
      </div>

      <div className="shop-toolbar">
        <div className="shop-filters" aria-label="Product filters">
          <label>Category<select value={category} onChange={(event) => setCategory(event.target.value)}><option value="all">All categories</option>{categories.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}</select></label>
          <label>Price<select value={price} onChange={(event) => setPrice(event.target.value)}><option value="all">All prices</option><option value="under-2000">Under $2,000</option><option value="2000-5000">$2,000–$5,000</option><option value="over-5000">Over $5,000</option></select></label>
        </div>
        <label className="sort-control">Sort by<select value={sort} onChange={(event) => setSort(event.target.value)}><option value="featured">Featured</option><option value="newest">Newest</option><option value="price-low">Price low → high</option><option value="price-high">Price high → low</option></select></label>
      </div>

      <div className="product-grid">
        {filteredProducts.map((product) => <ProductCard key={product.id} product={product} />)}
      </div>
    </div>
  );
}
