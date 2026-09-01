import { NextResponse } from "next/server";
import { getSupabaseServerClient, tableNames } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      orderId?: string;
      customerName?: string;
      email?: string;
      phone?: string;
      shippingAddress?: Record<string, string>;
      items?: Array<{ productId?: string; productName?: string; price?: number; quantity?: number }>;
      total?: number;
      currency?: string;
      paymentStatus?: string;
      orderStatus?: string;
      paypalOrderId?: string;
      paypalCaptureId?: string;
    };

    const supabase = getSupabaseServerClient();

    if (!supabase) {
      return NextResponse.json(
        { ok: false, error: "Supabase no está configurado. Agrega NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY." },
        { status: 503 },
      );
    }

    const orderNumber = body.orderId ?? `TS-${Date.now()}`;
    const total = Number(body.total ?? 0);

    if (!total || total <= 0) {
      return NextResponse.json({ ok: false, error: "El total del pedido es inválido." }, { status: 400 });
    }

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
          payment_status: body.paymentStatus ?? "Pagado",
          order_status: body.orderStatus ?? "Procesando",
          paypal_order_id: body.paypalOrderId ?? null,
          paypal_capture_id: body.paypalCaptureId ?? null,
        },
      ])
      .select()
      .single();

    if (orderError || !orderData) {
      return NextResponse.json(
        { ok: false, error: orderError?.message ?? "No se pudo guardar el pedido." },
        { status: 500 },
      );
    }

    const items = Array.isArray(body.items) ? body.items : [];

    if (items.length > 0) {
      const orderItems = items.map((item) => ({
        order_id: orderData.id,
        product_id: item.productId ?? null,
        product_name: item.productName ?? "Producto",
        price: Number(item.price ?? 0),
        quantity: Number(item.quantity ?? 1),
      }));

      const { error: itemError } = await supabase.from(tableNames.orderItems).insert(orderItems);
      if (itemError) {
        return NextResponse.json(
          { ok: false, error: `Pedido guardado, pero falló la creación de productos del pedido: ${itemError.message}` },
          { status: 500 },
        );
      }
    }

    const { error: paymentError } = await supabase.from(tableNames.payments).insert([
      {
        order_id: orderData.id,
        payment_method: "PayPal",
        paypal_order_id: body.paypalOrderId ?? null,
        paypal_capture_id: body.paypalCaptureId ?? null,
        status: body.paymentStatus ?? "Pagado",
        amount: total,
      },
    ]);

    if (paymentError) {
      return NextResponse.json(
        { ok: false, error: `Pedido guardado, pero falló el registro del pago: ${paymentError.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Pedido creado correctamente.",
      order: {
        id: orderData.id,
        orderNumber: orderNumber,
        status: body.orderStatus ?? "Procesando",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "No se pudo crear el pedido." },
      { status: 500 },
    );
  }
}
