import { NextResponse } from "next/server";
import { getSupabaseServerClient, tableNames } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const event = await request.json();
    const eventId = event?.id;
    const eventType = event?.event_type;

    if (!eventId) {
      return NextResponse.json({ received: false, error: "Missing event id" }, { status: 400 });
    }

    if (!process.env.PAYPAL_WEBHOOK_ID) {
      return NextResponse.json({ received: false, error: "Webhook not configured" }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();
    if (supabase) {
      await supabase.from(tableNames.webhookEvents).insert([
        {
          event_id: eventId,
          event_type: eventType ?? "unknown",
          payload: event,
          status: "received",
        },
      ]);
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
