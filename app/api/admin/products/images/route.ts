import { NextResponse } from "next/server";
import { createAdminAuthClient, createAdminDataClient, isAdminEmail } from "@/lib/admin-auth";

const MAX_FILE_SIZE = 8 * 1024 * 1024;

function requestCookies(request: Request) {
  return () => request.headers.get("cookie")?.split(";").map((part) => {
    const [name, ...value] = part.trim().split("=");
    return { name, value: value.join("=") };
  }).filter((cookie) => cookie.name) ?? [];
}

export async function POST(request: Request) {
  const auth = createAdminAuthClient(requestCookies(request));
  const { data } = auth ? await auth.auth.getUser() : { data: { user: null } };
  if (!isAdminEmail(data.user?.email)) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  const supabase = createAdminDataClient();
  if (!supabase) return NextResponse.json({ error: "El almacenamiento no está configurado." }, { status: 503 });

  const formData = await request.formData();
  const productId = formData.get("productId");
  const images = formData.getAll("images").filter((entry): entry is File => entry instanceof File);
  if (typeof productId !== "string" || !productId || !images.length || images.length > 8) return NextResponse.json({ error: "Selecciona entre 1 y 8 imágenes." }, { status: 400 });
  if (images.some((image) => !image.type.startsWith("image/") || image.size > MAX_FILE_SIZE)) return NextResponse.json({ error: "Cada imagen debe pesar como máximo 8 MB." }, { status: 400 });

  const urls: string[] = [];
  for (const image of images) {
    const extension = image.name.split(".").pop()?.replace(/[^a-z0-9]/gi, "").toLowerCase() || "jpg";
    const path = `${productId}/${crypto.randomUUID()}.${extension}`;
    const { error } = await supabase.storage.from("product-images").upload(path, await image.arrayBuffer(), { contentType: image.type, upsert: false });
    if (error) return NextResponse.json({ error: "No se pudo guardar una de las imágenes." }, { status: 500 });
    const { data: publicUrl } = supabase.storage.from("product-images").getPublicUrl(path);
    urls.push(publicUrl.publicUrl);
  }

  return NextResponse.json({ urls });
}