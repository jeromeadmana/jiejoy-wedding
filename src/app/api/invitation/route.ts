import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { invitationSchema } from "@/lib/validators";
import { verifyAdmin } from "@/lib/auth";

function generateCode(): string {
  return randomBytes(4).toString("hex"); // 8-char hex string
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

    const results = [];
    for (const entry of entries) {
      const parsed = invitationSchema.safeParse(entry);
      if (!parsed.success) {
        return NextResponse.json(
          { error: "Validation failed", details: parsed.error.flatten(), entry },
          { status: 400 }
        );
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
        return NextResponse.json({ error: "Failed to create invitation" }, { status: 500 });
      }

      results.push(data);
    }

    return NextResponse.json(results, { status: 201 });
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
