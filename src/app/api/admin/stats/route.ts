import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();

  const { data: rsvps, error } = await supabase
    .from("jiejoy_rsvps")
    .select("attending, guest_count")
    .eq("is_deleted", false);

  if (error) {
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }

  const stats = {
    totalRsvps: rsvps.length,
    attending: rsvps.filter((r) => r.attending).length,
    notAttending: rsvps.filter((r) => !r.attending).length,
    totalGuests: rsvps
      .filter((r) => r.attending)
      .reduce((sum, r) => sum + 1 + (r.guest_count || 0), 0),
  };

  return NextResponse.json(stats);
}
