import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { rsvpSchema } from "@/lib/validators";
import { verifyAdmin } from "@/lib/auth";

// POST — Public RSVP submission
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = rsvpSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const { guests, ...rsvpData } = parsed.data;

    // Check for duplicate email (only among non-deleted)
    const { data: existing } = await supabase
      .from("jiejoy_rsvps")
      .select("id")
      .eq("email", rsvpData.email)
      .eq("is_deleted", false)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "An RSVP with this email already exists. Please contact us if you need to update your response." },
        { status: 409 }
      );
    }

    // Insert RSVP
    const { data: rsvp, error: rsvpError } = await supabase
      .from("jiejoy_rsvps")
      .insert(rsvpData)
      .select("id")
      .single();

    if (rsvpError) {
      console.error("RSVP insert error:", rsvpError);
      return NextResponse.json({ error: "Failed to save RSVP" }, { status: 500 });
    }

    // Insert guest companions if any
    if (guests && guests.length > 0) {
      const guestRows = guests.map((g) => ({ ...g, rsvp_id: rsvp.id }));
      const { error: guestError } = await supabase
        .from("jiejoy_rsvp_guests")
        .insert(guestRows);

      if (guestError) {
        console.error("Guest insert error:", guestError);
      }
    }

    return NextResponse.json({ id: rsvp.id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET — Admin list all RSVPs
export async function GET(req: NextRequest) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { searchParams } = new URL(req.url);
  const attending = searchParams.get("attending");
  const search = searchParams.get("search");

  let query = supabase
    .from("jiejoy_rsvps")
    .select("*, jiejoy_rsvp_guests(*)")
    .eq("is_deleted", false)
    .order("created_at", { ascending: false });

  if (attending !== null) {
    query = query.eq("attending", attending === "true");
  }

  if (search) {
    query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error("RSVP list error:", error);
    return NextResponse.json({ error: "Failed to fetch RSVPs" }, { status: 500 });
  }

  return NextResponse.json(data);
}
