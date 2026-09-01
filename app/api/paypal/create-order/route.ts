import { NextResponse } from "next/server";
import { createPayPalOrder } from "@/lib/paypal-client";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { amount?: number; currency?: string; orderId?: string };
    const amount = Number(body.amount ?? 0);
    const currency = body.currency ?? "MXN";
    const orderId = body.orderId ?? `ts-${Date.now()}`;

    if (!amount || amount <= 0) {
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

    if (!approvalUrl) {
      return NextResponse.json({ error: "No se pudo iniciar la orden de pago." }, { status: 400 });
    }

    return NextResponse.json({ approvalUrl, orderId });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No pudimos completar tu pago." },
      { status: 500 },
    );
  }
}
