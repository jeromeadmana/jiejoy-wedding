import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { deleteFromCloudinary } from "@/lib/cloudinary";

// PATCH — Update photo caption
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> },
) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => ({}));

  const update: Record<string, unknown> = {};
  if (typeof body.caption === "string" || body.caption === null) update.caption = body.caption;

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("jiejoy_photos")
    .update(update)
    .eq("id", id)
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Failed to update photo" }, { status: 500 });
  }

  return NextResponse.json(data);
}

// DELETE — Remove photo from album and Cloudinary
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> },
) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const supabase = createAdminClient();

  const { data: photo } = await supabase
    .from("jiejoy_photos")
    .select("cloudinary_public_id, album_id")
    .eq("id", id)
    .single();

  if (!photo) {
    return NextResponse.json({ error: "Photo not found" }, { status: 404 });
  }

  // Best-effort Cloudinary cleanup; don't block the DB delete if it fails.
  await deleteFromCloudinary(photo.cloudinary_public_id).catch(() => {});

  const { error } = await supabase.from("jiejoy_photos").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: "Failed to delete photo" }, { status: 500 });
  }

  // Clear cover_public_id on the parent album if it was pointing at this photo
  await supabase
    .from("jiejoy_albums")
    .update({ cover_public_id: null })
    .eq("id", photo.album_id)
    .eq("cover_public_id", photo.cloudinary_public_id);

  return NextResponse.json({ success: true });
}
