import { NextResponse } from "next/server";
import { assertRequiredEnv } from "@/lib/env";
import { getSupabaseServerClient } from "@/lib/supabase";

export async function GET() {
  const environment = assertRequiredEnv();
  const supabase = getSupabaseServerClient();
  let databaseReady = false;

  if (supabase) {
    const { error } = await supabase.from("products").select("id").limit(1);
    databaseReady = !error;
  }

  const ok = environment.ok && databaseReady;
  return NextResponse.json({
    ok,
    app: "TIMESHOP",
    status: ok ? "ready" : "unavailable",
    locale: "es-MX",
    services: {
      database: databaseReady ? "ready" : "unavailable",
      payments: environment.ok ? "configured" : "unavailable",
    },
    missingConfiguration: environment.ok ? [] : environment.missing,
  }, { status: ok ? 200 : 503 });
}
