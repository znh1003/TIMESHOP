import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createPayPalOrder } from "@/lib/paypal-client";
import { getCatalogProducts } from "@/lib/catalog";
import { getSupabaseServerClient } from "@/lib/supabase";

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
  try {
    let body: { items?: Array<{ id?: string | number; quantity?: number }>; currency?: string; orderId?: string; customerName?: string; email?: string; phone?: string; shippingAddress?: Record<string, string> };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "El cuerpo de la solicitud no es válido." }, { status: 400 });
    }
    const currency = body.currency ?? "MXN";
    const orderId = body.orderId ?? `ts-${Date.now()}`;
    const items = Array.isArray(body.items) ? body.items : [];
    const products = await getCatalogProducts();
    const requestedItems = items.map((item) => ({
      product: products.find((entry) => entry.databaseId === String(item.id) || entry.id === item.id),
      quantity: Math.max(1, Math.min(20, Number(item.quantity ?? 1))),
    }));
    if (requestedItems.some((item) => !item.product)) {
      return NextResponse.json({ error: "Uno o más productos ya no están disponibles." }, { status: 400 });
    }
    if (requestedItems.some((item) => !item.product?.databaseId)) {
      return NextResponse.json({ error: "El catálogo de producción no está disponible para aceptar pedidos." }, { status: 503 });
    }
    const subtotal = requestedItems.reduce((sum, item) => sum + (item.product?.price ?? 0) * item.quantity, 0);
    const amount = subtotal + (subtotal > 0 && subtotal < 2500 ? 299 : 0);

    if (!items.length || !amount || amount <= 0) {
      return NextResponse.json({ error: "El monto del pedido no es válido." }, { status: 400 });
    }

    if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
      return NextResponse.json(
        { error: "PayPal no está configurado. Agrega PAYPAL_CLIENT_ID y PAYPAL_CLIENT_SECRET." },
        { status: 503 },
      );
    }

    const database = getSupabaseServerClient();
    if (!database) return NextResponse.json({ error: "No se pudo conectar con la base de datos para iniciar el pedido." }, { status: 503 });
    const result = await createPayPalOrder({ amount, currency, orderId });
    const approvalUrl = result.links?.find((item: { rel: string; href: string }) => item.rel === "approve")?.href;
    const paypalOrderId = result.id;

    if (!paypalOrderId) {
      return NextResponse.json({ error: "No se pudo iniciar la orden de pago." }, { status: 400 });
    }

    const reservationItems = requestedItems.map(({ product, quantity }) => ({ productId: product?.databaseId, quantity }));
    const { data: reserved, error: reservationError } = await database.rpc("reserve_product_inventory", {
      p_paypal_order_id: paypalOrderId,
      p_items: reservationItems,
    });
    if (reservationError || !reserved) {
      return NextResponse.json({ error: "No hay existencias suficientes para completar este pedido." }, { status: 409 });
    }

    const user = await currentUser(request);
    const { error: draftError } = await database.from("checkout_drafts").insert({
      paypal_order_id: paypalOrderId,
      order_number: orderId,
      user_id: user?.id ?? null,
      guest_email: body.email?.trim() || user?.email || null,
      customer_name: body.customerName?.trim() || null,
      phone: body.phone?.trim() || null,
      shipping_address: body.shippingAddress ?? null,
      items: requestedItems.map(({ product, quantity }) => ({ productId: product?.databaseId ?? null, productName: product?.name, price: product?.price, quantity })),
      subtotal,
      shipping: amount - subtotal,
      total: amount,
      currency,
    });
    if (draftError) {
      await database.rpc("release_product_inventory", { p_paypal_order_id: paypalOrderId });
      return NextResponse.json({ error: "No se pudo guardar el pedido antes del pago." }, { status: 503 });
    }

    return NextResponse.json({ id: paypalOrderId, approvalUrl, orderId });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No pudimos completar tu pago." },
      { status: 500 },
    );
  }
}
