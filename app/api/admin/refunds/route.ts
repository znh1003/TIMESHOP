import { NextResponse } from "next/server";
import { createAdminAuthClient, createAdminDataClient, isAdminEmail } from "@/lib/admin-auth";
import { refundPayPalCapture } from "@/lib/paypal-client";

export async function POST(request: Request) {
  const auth = createAdminAuthClient(() => request.headers.get("cookie")?.split(";").map((part) => {
    const [name, ...value] = part.trim().split("=");
    return { name, value: value.join("=") };
  }) ?? []);
  const { data: authData } = auth ? await auth.auth.getUser() : { data: { user: null } };
  if (!isAdminEmail(authData.user?.email)) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  const { orderId, amount, reason } = await request.json() as { orderId?: string; amount?: number; reason?: string };
  if (!orderId) return NextResponse.json({ error: "Pedido no válido." }, { status: 400 });

  const supabase = createAdminDataClient();
  if (!supabase) return NextResponse.json({ error: "La base de datos no está configurada." }, { status: 503 });
  const { data: order, error: orderError } = await supabase.from("orders").select("id, total, paypal_order_id, paypal_capture_id, payment_status").eq("id", orderId).single();
  if (orderError || !order?.paypal_capture_id || order.payment_status !== "Pagado") return NextResponse.json({ error: "El pedido no tiene un pago capturado disponible para reembolso." }, { status: 400 });
  const refundAmount = amount === undefined ? Number(order.total) : Number(amount);
  if (!Number.isFinite(refundAmount) || refundAmount <= 0 || refundAmount > Number(order.total)) return NextResponse.json({ error: "El monto de reembolso no es válido." }, { status: 400 });
  const { data: previousRefunds, error: previousRefundsError } = await supabase.from("refunds").select("refund_amount, refund_status").eq("order_id", order.id).in("refund_status", ["COMPLETED", "PENDING", "Procesado", "Pendiente"]);
  if (previousRefundsError) return NextResponse.json({ error: "No se pudo verificar el saldo reembolsable." }, { status: 500 });
  const refundedTotal = (previousRefunds ?? []).reduce((sum, refund) => sum + Number(refund.refund_amount ?? 0), 0);
  if (refundAmount > Number(order.total) - refundedTotal) return NextResponse.json({ error: "El monto supera el saldo disponible para reembolso." }, { status: 400 });

  try {
    const requestKey = crypto.randomUUID();
    const { error: requestError } = await supabase.from("refunds").insert({ order_id: order.id, paypal_order_id: order.paypal_order_id, capture_id: order.paypal_capture_id, refund_request_key: requestKey, refund_amount: refundAmount, refund_status: "REQUESTED", refund_reason: reason?.trim() || null });
    if (requestError?.code === "23505") return NextResponse.json({ error: "Ya hay un reembolso en proceso para este pago." }, { status: 409 });
    if (requestError) return NextResponse.json({ error: "No se pudo registrar la solicitud de reembolso." }, { status: 500 });

    const refund = await refundPayPalCapture(order.paypal_capture_id, refundAmount, requestKey);
    const { error } = await supabase.from("refunds").update({ refund_id: refund.id, refund_status: refund.status ?? "PENDING", refund_date: new Date().toISOString() }).eq("refund_request_key", requestKey);
    if (error) return NextResponse.json({ error: "El reembolso fue solicitado. PayPal confirmará su estado por webhook." }, { status: 202 });
    return NextResponse.json({ ok: true, refundId: refund.id, status: refund.status });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "No se pudo procesar el reembolso." }, { status: 502 });
  }
}