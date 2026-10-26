import { getSupabaseServerClient } from "@/lib/supabase";

export type HomepageSlide = {
  id: string;
  image_url: string;
  alt_text: string;
  href: string | null;
  sort_order: number;
  is_active: boolean;
};

export async function getHomepageSlides(activeOnly = true): Promise<HomepageSlide[]> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return [];

  let query = supabase.from("homepage_slides").select("id, image_url, alt_text, href, sort_order, is_active");
  if (activeOnly) query = query.eq("is_active", true);
  const { data, error } = await query.order("sort_order").order("created_at");
  if (error) {
    if (error.code === "42P01") return [];
    console.error("Failed to load homepage slides:", error.message);
    return [];
  }

  return (data ?? []) as HomepageSlide[];
}