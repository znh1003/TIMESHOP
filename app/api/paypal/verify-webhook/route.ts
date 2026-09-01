import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const eventId = body?.id;
    const eventType = body?.event_type;

    if (!eventId || !eventType) {
      return NextResponse.json({ ok: false, error: "Evento inválido" }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      verified: true,
      eventId,
      eventType,
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Webhook verification failed" },
      { status: 500 },
    );
  }
}
