import { NextResponse } from "next/server";

type RateLimitEntry = { count: number; resetAt: number };

const requests = new Map<string, RateLimitEntry>();

function clientIp(request: Request) {
  return request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || "unknown";
}

export function rateLimit(request: Request, scope: string, limit: number, windowMs: number) {
  const now = Date.now();
  const key = `${scope}:${clientIp(request)}`;
  const current = requests.get(key);
  const entry = !current || current.resetAt <= now ? { count: 0, resetAt: now + windowMs } : current;
  entry.count += 1;
  requests.set(key, entry);

  if (requests.size > 10_000) {
    for (const [storedKey, storedEntry] of requests) if (storedEntry.resetAt <= now) requests.delete(storedKey);
  }
  if (entry.count <= limit) return null;

  const retryAfter = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));
  return NextResponse.json(
    { error: "Demasiadas solicitudes. Inténtalo de nuevo más tarde." },
    { status: 429, headers: { "Retry-After": String(retryAfter) } },
  );
}