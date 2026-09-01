import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    return NextResponse.json({
      ok: true,
      message: "Solicitud de devolución recibida.",
      reason: body.reason || "Producto defectuoso",
      status: "Solicitud de devolución",
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "No se pudo enviar la solicitud." },
      { status: 500 },
    );
  }
}
