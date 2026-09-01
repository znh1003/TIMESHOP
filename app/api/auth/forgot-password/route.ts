import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.email) {
      return NextResponse.json({ error: "Email es requerido." }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      message: "Si el email existe, recibirás un enlace para restablecer tu contraseña.",
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "No se pudo enviar el enlace." },
      { status: 500 },
    );
  }
}
