import type { Metadata } from "next";
import { getCatalogProducts } from "@/lib/catalog";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = (await getCatalogProducts()).find((item) => item.slug === slug);
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
  return (await getCatalogProducts()).map((product) => ({ slug: product.slug }));
}
