import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    app: "TIMESHOP",
    status: "ready",
    locale: "es-MX",
  });
}
