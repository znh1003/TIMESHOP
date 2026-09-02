import type { Metadata } from "next";
import { getProductBySlug, products } from "@/data/products";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) {
    return {
      title: "Producto no encontrado | TIMESHOP",
    };
  }

  return {
    title: `${product.name} | TIMESHOP`,
    description: product.shortDescription,
    alternates: {
      canonical: `/products/${product.slug}`,
    },
    openGraph: {
      title: product.name,
      description: product.shortDescription,
      images: [product.image],
    },
  };
}

export async function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}
