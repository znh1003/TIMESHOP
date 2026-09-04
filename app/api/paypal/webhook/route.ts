import { NextResponse } from "next/server";
import { getSupabaseServerClient, tableNames } from "@/lib/supabase";
import { verifyPayPalWebhook } from "@/lib/paypal-client";
import { sendOrderConfirmation } from "@/lib/email";

type CaptureResource = {
  id?: string;
  status?: string;
  amount?: { value?: string; currency_code?: string };
  supplementary_data?: { related_ids?: { order_id?: string; capture_id?: string } };
};

async function recordCapturedOrder(supabase: NonNullable<ReturnType<typeof getSupabaseServerClient>>, paypalOrderId: string, resource: CaptureResource) {
  const { data: existingOrder, error: existingOrderError } = await supabase
    .from(tableNames.orders)
    .select("id, order_number, guest_email, customer_name, total, currency, confirmation_email_sent_at")
    .eq("paypal_order_id", paypalOrderId)
    .maybeSingle();
  if (existingOrderError) throw new Error("No se pudo consultar el pedido de PayPal.");

  if (existingOrder) {
    await supabase.from(tableNames.orders).update({ payment_status: "Pagado", order_status: "Procesando", paypal_capture_id: resource.id ?? null }).eq("id", existingOrder.id);
    await supabase.from(tableNames.payments).update({ status: "Pagado", paypal_capture_id: resource.id ?? null }).eq("paypal_order_id", paypalOrderId);
    await supabase.rpc("confirm_product_inventory", { p_paypal_order_id: paypalOrderId });
    if (!existingOrder.confirmation_email_sent_at && existingOrder.guest_email) {
      const sent = await sendOrderConfirmation({ email: existingOrder.guest_email, customerName: existingOrder.customer_name, orderNumber: existingOrder.order_number, total: existingOrder.total, currency: existingOrder.currency }).catch(() => false);
      if (sent) await supabase.from(tableNames.orders).update({ confirmation_email_sent_at: new Date().toISOString() }).eq("id", existingOrder.id).is("confirmation_email_sent_at", null);
    }
    return;
  }

  const { data: draft, error: draftError } = await supabase
    .from("checkout_drafts")
    .select("order_number, user_id, guest_email, customer_name, phone, shipping_address, items, total, currency")
    .eq("paypal_order_id", paypalOrderId)
    .maybeSingle();
  if (draftError || !draft) throw new Error("No se encontró el borrador del pedido capturado.");

  const paidTotal = Number(resource.amount?.value);
  if (!Number.isFinite(paidTotal) || paidTotal !== Number(draft.total) || resource.amount?.currency_code !== draft.currency) {
    throw new Error("El pago capturado no coincide con el borrador del pedido.");
  }

  const { data: order, error: orderError } = await supabase
    .from(tableNames.orders)
    .insert({
      order_number: draft.order_number,
      user_id: draft.user_id,
      guest_email: draft.guest_email,
      customer_name: draft.customer_name ?? "Cliente",
      phone: draft.phone,
      shipping_address: draft.shipping_address,
      total: paidTotal,
      currency: draft.currency,
      payment_status: "Pagado",
      order_status: "Procesando",
      paypal_order_id: paypalOrderId,
      paypal_capture_id: resource.id ?? null,
    })
    .select("id, order_number, guest_email, customer_name, total, currency")
    .single();
  if (orderError?.code === "23505") return;
  if (orderError || !order) throw new Error("No se pudo guardar el pedido capturado.");

  const items = draft.items as Array<{ productId?: string; productName?: string; price?: number; quantity?: number }>;
  if (!Array.isArray(items) || !items.length) throw new Error("El pedido capturado no contiene productos.");
  const { error: itemsError } = await supabase.from(tableNames.orderItems).insert(items.map((item) => ({
    order_id: order.id,
    product_id: item.productId && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(item.productId) ? item.productId : null,
    product_name: item.productName ?? "Producto",
    price: Number(item.price ?? 0),
    quantity: Number(item.quantity ?? 1),
  })));
  if (itemsError) throw new Error("No se pudieron guardar los productos del pedido capturado.");

  const { error: paymentError } = await supabase.from(tableNames.payments).insert({
    order_id: order.id,
    payment_method: "PayPal",
    paypal_order_id: paypalOrderId,
    paypal_capture_id: resource.id ?? null,
    status: "Pagado",
    amount: paidTotal,
  });
  if (paymentError) throw new Error("No se pudo registrar el pago capturado.");
  await supabase.rpc("confirm_product_inventory", { p_paypal_order_id: paypalOrderId });
  await supabase.from("checkout_drafts").update({ status: "captured" }).eq("paypal_order_id", paypalOrderId);
  if (order.guest_email) {
    const sent = await sendOrderConfirmation({ email: order.guest_email, customerName: order.customer_name, orderNumber: order.order_number, total: order.total, currency: order.currency }).catch(() => false);
    if (sent) await supabase.from(tableNames.orders).update({ confirmation_email_sent_at: new Date().toISOString() }).eq("id", order.id).is("confirmation_email_sent_at", null);
  }
}

export async function POST(request: Request) {
  try {
    const event = await request.json();
    const eventId = event?.id;
    const eventType = event?.event_type;

    if (!eventId) {
      return NextResponse.json({ received: false, error: "Missing event id" }, { status: 400 });
    }

    const verified = await verifyPayPalWebhook(event, request.headers);
    if (!verified) return NextResponse.json({ received: false, error: "Invalid webhook signature" }, { status: 401 });

    const supabase = getSupabaseServerClient();
    if (supabase) {
      const { error: eventError } = await supabase.from(tableNames.webhookEvents).insert([
        {
          event_id: eventId,
          event_type: eventType ?? "unknown",
          payload: event,
          status: "verified",
        },
      ]);
      if (eventError?.code === "23505") return NextResponse.json({ received: true, eventId, eventType, status: "duplicate" });
      if (eventError) throw new Error("No se pudo registrar el evento de PayPal.");

      const resource = event.resource as CaptureResource | undefined;
      const paypalOrderId = resource?.supplementary_data?.related_ids?.order_id;
      if (eventType?.startsWith("PAYMENT.CAPTURE.") && paypalOrderId) {
        const completed = eventType === "PAYMENT.CAPTURE.COMPLETED";
        if (completed) {
          await recordCapturedOrder(supabase, paypalOrderId, resource);
        } else {
          await supabase.from(tableNames.orders).update({ payment_status: resource?.status ?? "Pendiente", order_status: "Pendiente", paypal_capture_id: resource?.id ?? null }).eq("paypal_order_id", paypalOrderId);
          await supabase.from(tableNames.payments).update({ status: resource?.status ?? "Pendiente", paypal_capture_id: resource?.id ?? null }).eq("paypal_order_id", paypalOrderId);
        }
      }
      if (eventType?.startsWith("PAYMENT.REFUND.") && resource?.id) {
        const { data: updatedRefunds } = await supabase
          .from(tableNames.refunds)
          .update({ refund_status: resource.status ?? eventType, refund_id: resource.id, refund_date: new Date().toISOString() })
          .eq("refund_id", resource.id)
          .select("id");
        if (!updatedRefunds?.length && resource.supplementary_data?.related_ids?.capture_id) {
          await supabase
            .from(tableNames.refunds)
            .update({ refund_status: resource.status ?? eventType, refund_id: resource.id, refund_date: new Date().toISOString() })
            .eq("capture_id", resource.supplementary_data.related_ids.capture_id)
            .eq("refund_status", "REQUESTED")
            .is("refund_id", null);
        }
      }
    }

    return NextResponse.json({
      received: true,
      eventId,
      eventType,
      status: "processed",
    });
  } catch (error) {
    return NextResponse.json(
      { received: false, error: error instanceof Error ? error.message : "Webhook processing failed" },
      { status: 500 },
    );
  }
}
