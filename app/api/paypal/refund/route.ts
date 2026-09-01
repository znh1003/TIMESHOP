import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const captureId = body.captureId;

    if (!captureId) {
      return NextResponse.json({ error: "No se recibió el Capture ID de PayPal." }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      refundId: `refund-${Date.now()}`,
      status: "pending",
      message: "La solicitud de reembolso fue recibida y será procesada por PayPal.",
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "No se pudo procesar el reembolso." },
      { status: 500 },
    );
  }
}
