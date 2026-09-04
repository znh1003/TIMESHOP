import { products, type Product } from "@/data/products";
import { getSupabaseServerClient } from "@/lib/supabase";

type CatalogRow = {
  id: string;
  slug: string;
  name: string;
  category: Product["category"];
  price: number;
  old_price: number | null;
  short_description: string;
  description: string;
  materials: string[];
  dimensions: string;
  colors: string[];
  stock: string;
  inventory_quantity: number | null;
  featured: boolean;
  limited: boolean;
  image_url: string;
  gallery: string[];
};

export async function getCatalogProducts(): Promise<Product[]> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return products;
  const { data, error } = await supabase.from("products").select("id, slug, name, category, price, old_price, short_description, description, materials, dimensions, colors, stock, inventory_quantity, featured, limited, image_url, gallery");
  if (error || !data?.length) return products;

  return (data as CatalogRow[]).flatMap((row) => {
    const fallback = products.find((product) => product.slug === row.slug);
    if (!fallback) return [];
    return [{
      ...fallback,
      databaseId: row.id,
      name: row.name,
      category: row.category,
      price: Number(row.price),
      oldPrice: row.old_price === null ? undefined : Number(row.old_price),
      shortDescription: row.short_description,
      description: row.description,
      materials: row.materials,
      dimensions: row.dimensions,
      colors: row.colors,
      stock: row.inventory_quantity === 0 ? "Agotado" : row.inventory_quantity !== null && row.inventory_quantity <= 5 ? "Pocas unidades" : row.stock,
      inventoryQuantity: row.inventory_quantity ?? undefined,
      featured: row.featured,
      limited: row.limited,
      image: row.image_url,
      gallery: row.gallery,
    }];
  });
}