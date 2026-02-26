import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyAdmin } from "@/lib/auth";

// GET — Single RSVP
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("jiejoy_rsvps")
    .select("*, jiejoy_rsvp_guests(*)")
    .eq("id", id)
    .eq("is_deleted", false)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "RSVP not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}

// PUT — Update RSVP
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("jiejoy_rsvps")
    .update(body)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Failed to update RSVP" }, { status: 500 });
  }

  return NextResponse.json(data);
}

// DELETE — Soft-delete RSVP (marks as deleted, no actual row removal)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("jiejoy_rsvps")
    .update({ is_deleted: true })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: "Failed to delete RSVP" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
