import { NextResponse } from "next/server";
import { getHomepageSlides } from "@/lib/homepage-slides";

export async function GET() {
  return NextResponse.json({ items: await getHomepageSlides() }, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } });
}