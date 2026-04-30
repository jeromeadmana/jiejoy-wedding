import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { deleteFromCloudinary } from "@/lib/cloudinary";

// GET — Single album with photos
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const supabase = createAdminClient();

  const { data: album, error: aErr } = await supabase
    .from("jiejoy_albums")
    .select("*")
    .eq("slug", slug)
    .single();

  if (aErr || !album) {
    return NextResponse.json({ error: "Album not found" }, { status: 404 });
  }

  const { data: photos } = await supabase
    .from("jiejoy_photos")
    .select("*")
    .eq("album_id", album.id)
    .order("sort_order", { ascending: true });

  return NextResponse.json({ ...album, photos: photos ?? [] });
}

// PATCH — Update album metadata (title, description, cover, sort_order, is_published)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const body = await req.json().catch(() => ({}));

  // Only whitelist fields the admin is allowed to touch
  const update: Record<string, unknown> = {};
  if (typeof body.title === "string") update.title = body.title;
  if (typeof body.description === "string" || body.description === null) update.description = body.description;
  if (typeof body.cover_public_id === "string" || body.cover_public_id === null) update.cover_public_id = body.cover_public_id;
  if (typeof body.is_published === "boolean") update.is_published = body.is_published;
  if (typeof body.sort_order === "number") update.sort_order = body.sort_order;

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("jiejoy_albums")
    .update(update)
    .eq("slug", slug)
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Failed to update album" }, { status: 500 });
  }

  return NextResponse.json(data);
}

// DELETE — Delete album and all its photos (DB cascade + Cloudinary cleanup)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const supabase = createAdminClient();

  const { data: album } = await supabase
    .from("jiejoy_albums")
    .select("id")
    .eq("slug", slug)
    .single();

  if (!album) {
    return NextResponse.json({ error: "Album not found" }, { status: 404 });
  }

  // Best-effort Cloudinary cleanup before DB cascade. If Cloudinary deletion
  // fails for any photo we still drop the DB row — the user can clean up
  // orphaned Cloudinary assets manually rather than the album becoming stuck.
  const { data: photos } = await supabase
    .from("jiejoy_photos")
    .select("cloudinary_public_id")
    .eq("album_id", album.id);

  if (photos?.length) {
    await Promise.allSettled(photos.map((p) => deleteFromCloudinary(p.cloudinary_public_id)));
  }

  const { error } = await supabase.from("jiejoy_albums").delete().eq("id", album.id);
  if (error) {
    return NextResponse.json({ error: "Failed to delete album" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
