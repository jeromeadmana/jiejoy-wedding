import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { invitationSchema } from "@/lib/validators";
import { verifyAdmin } from "@/lib/auth";

function generateCode(): string {
  return randomBytes(12).toString("hex"); // 24-char hex string (~10^28 combinations)
}

// POST — Admin: create invitation(s)
export async function POST(req: NextRequest) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const supabase = createAdminClient();

    // Support both single and bulk creation
    const entries = Array.isArray(body.entries) ? body.entries : [body];
    const isBulk = Array.isArray(body.entries);

    const created = [];
    const skipped: { guest_name: string; reason: string }[] = [];

    for (const entry of entries) {
      const parsed = invitationSchema.safeParse(entry);
      if (!parsed.success) {
        if (!isBulk) {
          // Single creation: fail immediately with details
          return NextResponse.json(
            { error: "Validation failed", details: parsed.error.flatten() },
            { status: 400 }
          );
        }
        // Bulk: skip invalid entries and continue
        skipped.push({
          guest_name: entry.guest_name || "Unknown",
          reason: parsed.error.issues.map((i) => i.message).join(", "),
        });
        continue;
      }

      const code = generateCode();
      const { data, error } = await supabase
        .from("jiejoy_invitations")
        .insert({
          code,
          guest_name: parsed.data.guest_name,
          max_guests: parsed.data.max_guests,
        })
        .select()
        .single();

      if (error) {
        console.error("Invitation insert error:", error);
        if (!isBulk) {
          return NextResponse.json({ error: "Failed to create invitation" }, { status: 500 });
        }
        skipped.push({ guest_name: parsed.data.guest_name, reason: "Database error" });
        continue;
      }

      created.push(data);
    }

    if (isBulk) {
      return NextResponse.json({ created, skipped }, { status: 201 });
    }

    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET — Admin: list all invitations
export async function GET(req: NextRequest) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("jiejoy_invitations")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Invitation list error:", error);
    return NextResponse.json({ error: "Failed to fetch invitations" }, { status: 500 });
  }

  return NextResponse.json(data);
}

// DELETE — Admin: hard delete an unconfirmed invitation
export async function DELETE(req: NextRequest) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "Invitation ID required" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Only allow deletion of invitations that haven't been responded to
    const { data: invitation } = await supabase
      .from("jiejoy_invitations")
      .select("id, responded")
      .eq("id", id)
      .maybeSingle();

    if (!invitation) {
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
    }

    if (invitation.responded) {
      return NextResponse.json(
        { error: "Cannot delete an invitation that has already been responded to" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("jiejoy_invitations")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Invitation delete error:", error);
      return NextResponse.json({ error: "Failed to delete invitation" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
