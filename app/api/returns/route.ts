import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getSupabaseServerClient, tableNames } from "@/lib/supabase";
import { rateLimit } from "@/lib/rate-limit";

function requestCookies(request: Request) {
  return request.headers.get("cookie")?.split(";").map((part) => {
    const [name, ...value] = part.trim().split("=");
    return { name, value: value.join("=") };
  }).filter((cookie) => cookie.name) ?? [];
}

async function currentUser(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  const auth = createServerClient(url, key, { cookies: { getAll: () => requestCookies(request), setAll: () => undefined } });
  const { data } = await auth.auth.getUser();
  return data.user;
}

export async function POST(request: Request) {
  const limited = rateLimit(request, "return-request", 5, 60 * 60_000);
  if (limited) return limited;
  try {
    let body: { orderNumber?: string; reason?: string; description?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ ok: false, error: "El cuerpo de la solicitud no es válido." }, { status: 400 });
    }
    if (!body.orderNumber?.trim() || !body.reason?.trim() || !body.description?.trim()) {
      return NextResponse.json({ ok: false, error: "Indica tu pedido, el motivo y una descripción de la devolución." }, { status: 400 });
    }
    const user = await currentUser(request);
    if (!user) return NextResponse.json({ ok: false, error: "Inicia sesión para solicitar una devolución." }, { status: 401 });
    const supabase = getSupabaseServerClient();
    if (!supabase) return NextResponse.json({ ok: false, error: "La base de datos no está configurada." }, { status: 503 });
    const { data: order, error: orderError } = await supabase.from(tableNames.orders).select("id").or(`user_id.eq.${user.id},guest_email.eq.${user.email ?? ""}`).eq("order_number", body.orderNumber.trim()).maybeSingle();
    if (orderError || !order) return NextResponse.json({ ok: false, error: "No encontramos ese pedido en tu cuenta." }, { status: 404 });
    const { data, error } = await supabase.from(tableNames.returns).insert([{
      order_id: order.id,
      reason: body.reason.trim(),
      description: body.description.trim(),
      status: "Solicitud de devolución",
    }]).select("id, status").single();
    if (error || !data) return NextResponse.json({ ok: false, error: error?.message ?? "No se pudo registrar la devolución." }, { status: 500 });

    return NextResponse.json({
      ok: true,
      message: "Solicitud de devolución recibida.",
      id: data.id,
      status: data.status,
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "No se pudo enviar la solicitud." },
      { status: 500 },
    );
  }
}
