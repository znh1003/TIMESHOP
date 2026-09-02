import { NextResponse } from "next/server";
import { capturePayPalOrder } from "@/lib/paypal-client";
import { getSupabaseServerClient, tableNames } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      orderId?: string;
      orderNumber?: string;
      customerName?: string;
      email?: string;
      phone?: string;
      total?: number;
      currency?: string;
      shippingAddress?: Record<string, string>;
      items?: Array<{ productId?: string; productName?: string; price?: number; quantity?: number }>;
    };
    const orderId = body.orderId;

    if (!orderId) {
      return NextResponse.json({ error: "No se recibió la orden de PayPal." }, { status: 400 });
    }

    const result = await capturePayPalOrder(orderId);
    const captureId = result.purchase_units?.[0]?.payments?.captures?.[0]?.id ?? null;
    const status = result.status ?? "COMPLETED";

    const supabase = getSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json({ error: "No se pudo conectar con la base de datos para guardar el pedido." }, { status: 503 });
    }

    if (supabase) {
      const orderNumber = body.orderNumber ?? `TS-${Date.now()}`;
      const total = Number(result.purchase_units?.[0]?.amount?.value ?? body.total ?? 0);

      const { data: orderData, error: orderError } = await supabase
        .from(tableNames.orders)
        .insert([
          {
            order_number: orderNumber,
            guest_email: body.email ?? null,
            customer_name: body.customerName ?? "Cliente",
            phone: body.phone ?? null,
            shipping_address: body.shippingAddress ?? null,
            total,
            currency: body.currency ?? "MXN",
            payment_status: status === "COMPLETED" ? "Pagado" : "Pendiente",
            order_status: status === "COMPLETED" ? "Procesando" : "Pendiente",
            paypal_order_id: orderId,
            paypal_capture_id: captureId,
          },
        ])
        .select()
        .single();

      if (!orderError && orderData && Array.isArray(body.items) && body.items.length > 0) {
        const { error: orderItemsError } = await supabase.from(tableNames.orderItems).insert(
          body.items.map((item) => ({
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
    }

    return NextResponse.json({ result, captured: true, captureId, status });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No pudimos confirmar tu pago." },
      { status: 500 },
    );
  }
}
