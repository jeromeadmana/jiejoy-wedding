import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// GET — Public: lookup invitation by code
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
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
