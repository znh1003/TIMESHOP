import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.email || !body.password) {
      return NextResponse.json({ error: "Email y contraseña son requeridos." }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      user: {
        email: body.email,
        name: body.name || "Nuevo cliente",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "No se pudo crear la cuenta." },
      { status: 500 },
    );
  }
}
