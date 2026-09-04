import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { capturePayPalOrder } from "@/lib/paypal-client";
import { getSupabaseServerClient, tableNames } from "@/lib/supabase";
import { sendOrderConfirmation } from "@/lib/email";
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
  const supabase = createServerClient(url, key, { cookies: { getAll: () => requestCookies(request), setAll: () => undefined } });
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export async function POST(request: Request) {
  const limited = await rateLimit(request, "paypal-capture-order", 20, 60_000);
  if (limited) return limited;
  try {
    const body = (await request.json()) as {
      orderId?: string;
    };
    const orderId = body.orderId;

    if (!orderId) {
      return NextResponse.json({ error: "No se recibió la orden de PayPal." }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json({ error: "No se pudo conectar con la base de datos para guardar el pedido." }, { status: 503 });
    }
    const user = await currentUser(request);

    const { data: existingOrder, error: lookupError } = await supabase.from(tableNames.orders).select("id, paypal_capture_id, payment_status").eq("paypal_order_id", orderId).maybeSingle();
    if (lookupError) return NextResponse.json({ error: "No se pudo verificar el registro del pedido antes de cobrar." }, { status: 503 });
    if (existingOrder) return NextResponse.json({ captured: true, duplicate: true, captureId: existingOrder.paypal_capture_id, status: existingOrder.payment_status });

    const { data: draft, error: draftError } = await supabase.from("checkout_drafts").select("order_number, user_id, guest_email, customer_name, phone, shipping_address, items, total, currency, status").eq("paypal_order_id", orderId).maybeSingle();
    if (draftError || !draft || draft.status !== "created") return NextResponse.json({ error: "El pedido de pago no es válido o ya fue procesado." }, { status: 400 });

    const result = await capturePayPalOrder(orderId);
    const captureId = result.purchase_units?.[0]?.payments?.captures?.[0]?.id ?? null;
    const status = result.status ?? "COMPLETED";
    const payer = result.payer as { email_address?: string; name?: { given_name?: string; surname?: string } } | undefined;
    const payerName = [payer?.name?.given_name, payer?.name?.surname].filter(Boolean).join(" ");

    if (supabase) {
      const total = Number(result.purchase_units?.[0]?.amount?.value ?? 0);
      const referenceId = result.purchase_units?.[0]?.reference_id;
      if (status !== "COMPLETED" || referenceId !== draft.order_number || total !== Number(draft.total) || result.purchase_units?.[0]?.amount?.currency_code !== draft.currency) {
        return NextResponse.json({ error: "La confirmación de PayPal no coincide con el pedido." }, { status: 400 });
      }

      const { data: orderData, error: orderError } = await supabase
        .from(tableNames.orders)
        .insert([
          {
            order_number: draft.order_number,
            user_id: draft.user_id ?? user?.id ?? null,
            guest_email: draft.guest_email ?? user?.email ?? payer?.email_address ?? null,
            customer_name: draft.customer_name ?? (payerName || "Cliente"),
            phone: draft.phone ?? null,
            shipping_address: draft.shipping_address ?? null,
            total,
            currency: draft.currency,
            payment_status: status === "COMPLETED" ? "Pagado" : "Pendiente",
            order_status: status === "COMPLETED" ? "Procesando" : "Pendiente",
            paypal_order_id: orderId,
            paypal_capture_id: captureId,
          },
        ])
        .select()
        .single();

      const items = draft.items as Array<{ productId?: string; productName?: string; price?: number; quantity?: number }>;
      if (!orderError && orderData && Array.isArray(items) && items.length > 0) {
        const { error: orderItemsError } = await supabase.from(tableNames.orderItems).insert(
          items.map((item) => ({
            order_id: orderData.id,
            product_id: item.productId && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(item.productId) ? item.productId : null,
            product_name: item.productName ?? "Producto",
            price: Number(item.price ?? 0),
            quantity: Number(item.quantity ?? 1),
          })),
        );
        if (orderItemsError) {
          return NextResponse.json({ error: `No se pudieron guardar los productos del pedido: ${orderItemsError.message}` }, { status: 500 });
        }
      }

      if (orderError || !orderData) {
        return NextResponse.json({ error: orderError?.message ?? "No se pudo guardar el pedido." }, { status: 500 });
      }

      if (!orderError) {
        const { error: paymentError } = await supabase.from(tableNames.payments).insert([
          {
            order_id: orderData.id,
            payment_method: "PayPal",
            paypal_order_id: orderId,
            paypal_capture_id: captureId,
            status: status === "COMPLETED" ? "Pagado" : "Pendiente",
            amount: total,
          },
        ]);
        if (paymentError) {
          return NextResponse.json({ error: `Pedido guardado, pero no se pudo registrar el pago: ${paymentError.message}` }, { status: 500 });
        }
      }
      await supabase.rpc("confirm_product_inventory", { p_paypal_order_id: orderId });
      await supabase.from("checkout_drafts").update({ status: "captured" }).eq("paypal_order_id", orderId);
      if (orderData.guest_email) {
        void sendOrderConfirmation({ email: orderData.guest_email, customerName: orderData.customer_name, orderNumber: orderData.order_number, total: orderData.total, currency: orderData.currency })
          .then((sent) => sent ? supabase.from(tableNames.orders).update({ confirmation_email_sent_at: new Date().toISOString() }).eq("id", orderData.id).is("confirmation_email_sent_at", null) : null)
          .catch(() => undefined);
      }
    }

    return NextResponse.json({ result, captured: true, captureId, status });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No pudimos confirmar tu pago." },
      { status: 500 },
    );
  }
}
