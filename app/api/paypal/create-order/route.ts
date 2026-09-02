import { NextResponse } from "next/server";
import { createPayPalOrder } from "@/lib/paypal-client";
import { products } from "@/data/products";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { items?: Array<{ id?: number; quantity?: number }>; currency?: string; orderId?: string };
    const currency = body.currency ?? "MXN";
    const orderId = body.orderId ?? `ts-${Date.now()}`;
    const items = Array.isArray(body.items) ? body.items : [];
    const requestedItems = items.map((item) => ({
      product: products.find((entry) => entry.id === Number(item.id)),
      quantity: Math.max(1, Math.min(20, Number(item.quantity ?? 1))),
    }));
    if (requestedItems.some((item) => !item.product)) {
      return NextResponse.json({ error: "Uno o más productos ya no están disponibles." }, { status: 400 });
    }
    const subtotal = items.reduce((sum, item) => {
      const product = products.find((entry) => entry.id === Number(item.id));
      const quantity = Math.max(1, Math.min(20, Number(item.quantity ?? 1)));
      return sum + (product?.price ?? 0) * quantity;
    }, 0);
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

    const result = await createPayPalOrder({ amount, currency, orderId });
    const approvalUrl = result.links?.find((item: { rel: string; href: string }) => item.rel === "approve")?.href;
    const paypalOrderId = result.id;

    if (!paypalOrderId) {
      return NextResponse.json({ error: "No se pudo iniciar la orden de pago." }, { status: 400 });
    }

    return NextResponse.json({ id: paypalOrderId, approvalUrl, orderId });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No pudimos completar tu pago." },
      { status: 500 },
    );
  }
}
