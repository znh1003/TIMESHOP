import { NextResponse } from "next/server";
import { assertRequiredEnv } from "@/lib/env";
import { getSupabaseServerClient } from "@/lib/supabase";

export async function GET() {
  const environment = assertRequiredEnv();
  const supabase = getSupabaseServerClient();
  let databaseReady = false;
  const emailConfigured = Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
  const globalRateLimitConfigured = Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);

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
      email: emailConfigured ? "configured" : "not_configured",
      rateLimit: globalRateLimitConfigured ? "global" : "local_fallback",
    },
    missingConfiguration: environment.ok ? [] : environment.missing,
  }, { status: ok ? 200 : 503 });
}
