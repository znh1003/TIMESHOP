import { categories as fallbackCategories, products, type Category, type Product } from "@/data/products";
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
  shipping_fee: number | null;
  featured: boolean;
  limited: boolean;
  image_url: string;
  color_images: Record<string, string> | null;
  color_prices: Record<string, number> | null;
  gallery: string[];
  detail_images: string[] | null;
  is_published: boolean;
};

type CategoryRow = {
  slug: string;
  name: string;
  description: string | null;
  image_url: string | null;
};

const useDemoCatalog = process.env.NODE_ENV === "development";

export async function getCatalogCategories(): Promise<Category[]> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return useDemoCatalog ? fallbackCategories : [];
  const { data, error } = await supabase.from("categories").select("slug, name, description, image_url").order("name");
  if (error) return useDemoCatalog ? fallbackCategories : [];
  if (!data) return [];

  return (data as CategoryRow[]).map((category) => {
    const fallback = fallbackCategories.find((item) => item.slug === category.slug);
    return {
      slug: category.slug,
      name: category.name,
      label: category.description || fallback?.label || `Explora nuestra colección de ${category.name}.`,
      description: category.description || fallback?.description || `Productos seleccionados en ${category.name}.`,
      image: category.image_url || fallback?.image || "",
    };
  });
}

export async function getCatalogProducts(): Promise<Product[]> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return useDemoCatalog ? products : [];
  const fields = "id, slug, name, category, price, old_price, short_description, description, materials, dimensions, colors, stock, inventory_quantity, shipping_fee, featured, limited, image_url, color_images, color_prices, gallery, detail_images, is_published";
  const legacyFields = fields.replace(", color_prices", "");
  const initialResult = await supabase.from("products").select(fields).eq("is_published", true);
  let data = initialResult.data as unknown as CatalogRow[] | null;
  let error = initialResult.error;
  if (error?.code === "42703") {
    const legacyResult = await supabase.from("products").select(legacyFields).eq("is_published", true);
    data = legacyResult.data as unknown as CatalogRow[] | null;
    error = legacyResult.error;
  }
  if (error) return useDemoCatalog ? products : [];
  if (!data) return [];

  return (data ?? []).map((row) => {
    const fallback = products.find((product) => product.slug === row.slug);
    return {
      ...(fallback ?? { badge: undefined, details: [], oldPrice: undefined }),
      id: row.id,
      databaseId: row.id,
      slug: row.slug,
      name: row.name,
      category: row.category,
      price: Number(row.price),
      oldPrice: row.old_price === null ? undefined : Number(row.old_price),
      shortDescription: row.short_description,
      description: row.description,
      materials: row.materials,
      dimensions: row.dimensions,
      colors: row.colors,
      stock: row.inventory_quantity === null ? row.stock : row.inventory_quantity === 0 ? "Agotado" : row.inventory_quantity <= 5 ? "Pocas unidades" : "En stock",
      inventoryQuantity: row.inventory_quantity ?? undefined,
      shippingFee: Number(row.shipping_fee ?? 0),
      featured: row.featured,
      limited: row.limited,
      image: row.image_url || row.gallery?.[0] || "",
      colorImages: row.color_images ?? {},
      colorPrices: row.color_prices ?? {},
      gallery: row.image_url ? [row.image_url, ...(row.gallery?.[0] === row.image_url ? row.gallery.slice(1) : row.gallery ?? [])] : row.gallery ?? [],
      detailImages: row.detail_images ?? [],
    };
  });
}