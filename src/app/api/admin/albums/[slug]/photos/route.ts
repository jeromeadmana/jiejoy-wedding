import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

// POST — Register a photo that the browser already uploaded to Cloudinary.
// Body: { cloudinary_public_id, width, height, caption? }
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const body = await req.json().catch(() => ({}));

  const publicId = body.cloudinary_public_id;
  const width = Number(body.width);
  const height = Number(body.height);
  const caption = typeof body.caption === "string" ? body.caption : null;

  if (!publicId || typeof publicId !== "string") {
    return NextResponse.json({ error: "cloudinary_public_id required" }, { status: 400 });
  }
  if (!Number.isFinite(width) || width <= 0 || !Number.isFinite(height) || height <= 0) {
    return NextResponse.json({ error: "valid width/height required" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: album } = await supabase
    .from("jiejoy_albums")
    .select("id")
    .eq("slug", slug)
    .single();

  if (!album) {
    return NextResponse.json({ error: "Album not found" }, { status: 404 });
  }

  // Place new photo at end of album order
  const { data: maxRow } = await supabase
    .from("jiejoy_photos")
    .select("sort_order")
    .eq("album_id", album.id)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const sort_order = (maxRow?.sort_order ?? 0) + 10;

  const { data, error } = await supabase
    .from("jiejoy_photos")
    .insert({
      album_id: album.id,
      cloudinary_public_id: publicId,
      width,
      height,
      caption,
      sort_order,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      // Photo with that public_id already registered. Idempotent: return the existing row.
      const { data: existing } = await supabase
        .from("jiejoy_photos")
        .select("*")
        .eq("cloudinary_public_id", publicId)
        .single();
      return NextResponse.json(existing, { status: 200 });
    }
    return NextResponse.json({ error: "Failed to register photo" }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

// PATCH — Bulk reorder. Body: { order: [{id, sort_order}, ...] }
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const body = await req.json().catch(() => ({}));

  const order: Array<{ id: string; sort_order: number }> = Array.isArray(body.order) ? body.order : [];
  if (order.length === 0) {
    return NextResponse.json({ error: "order array required" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: album } = await supabase
    .from("jiejoy_albums")
    .select("id")
    .eq("slug", slug)
    .single();

  if (!album) {
    return NextResponse.json({ error: "Album not found" }, { status: 404 });
  }

  // Run all updates in parallel; scope each by album_id so the admin can't
  // accidentally reorder photos in another album by passing arbitrary IDs.
  const results = await Promise.all(
    order.map(({ id, sort_order }) =>
      supabase
        .from("jiejoy_photos")
        .update({ sort_order })
        .eq("id", id)
        .eq("album_id", album.id),
    ),
  );

  if (results.some((r) => r.error)) {
    return NextResponse.json({ error: "Some updates failed" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
