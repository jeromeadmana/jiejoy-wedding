import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// In-memory rate limiter: max 10 lookups per IP per 5 minutes
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 5 * 60 * 1000; // 5 minutes
const RATE_LIMIT_MAX = 10;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }

  entry.count++;
  return true;
}

// Periodic cleanup to prevent memory leak (runs every 10 min)
if (typeof globalThis !== "undefined") {
  const cleanup = () => {
    const now = Date.now();
    for (const [ip, entry] of rateLimitMap) {
      if (now > entry.resetAt) rateLimitMap.delete(ip);
    }
  };
  // Use a global flag to avoid duplicate intervals
  const g = globalThis as unknown as { _rateLimitCleanup?: boolean };
  if (!g._rateLimitCleanup) {
    g._rateLimitCleanup = true;
    setInterval(cleanup, 10 * 60 * 1000);
  }
}

// GET — Public: lookup invitation by code
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  // Rate limit by IP
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || req.headers.get("x-real-ip")
    || "unknown";

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  const { code } = await params;

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("jiejoy_invitations")
    .select("id, code, guest_name, max_guests, responded, responded_at, rsvp_id")
    .eq("code", code)
    .maybeSingle();

  if (error) {
    console.error("Invitation lookup error:", error);
    return NextResponse.json({ error: "Failed to lookup invitation" }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Invalid invitation code" }, { status: 404 });
  }

  // If already responded, also fetch the existing RSVP data
  if (data.responded && data.rsvp_id) {
    const { data: rsvp } = await supabase
      .from("jiejoy_rsvps")
      .select("*, jiejoy_rsvp_guests(*)")
      .eq("id", data.rsvp_id)
      .single();

    return NextResponse.json({ ...data, existing_rsvp: rsvp });
  }

  return NextResponse.json(data);
}
