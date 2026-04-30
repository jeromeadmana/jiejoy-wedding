import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// GET — One random photo from any published album. Used by the gallery
// landing-page hero rotator and the "Surprise Me" CTA. Each request returns
// a fresh random pick, so the page is uncacheable.
export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createAdminClient();

  // Count photos in published albums first; otherwise we can't pick a
  // random offset bounded to the actual pool.
  const { count, error: countErr } = await supabase
    .from("jiejoy_photos")
    .select("id, jiejoy_albums!inner(is_published)", { count: "exact", head: true })
    .eq("jiejoy_albums.is_published", true);

  if (countErr || !count) {
    return NextResponse.json({ photo: null });
  }

  const offset = Math.floor(Math.random() * count);

  const { data, error } = await supabase
    .from("jiejoy_photos")
    .select("*, jiejoy_albums!inner(slug, title, is_published)")
    .eq("jiejoy_albums.is_published", true)
    .range(offset, offset);

  if (error || !data?.[0]) {
    return NextResponse.json({ photo: null });
  }

  const row = data[0] as typeof data[0] & {
    jiejoy_albums: { slug: string; title: string };
  };

  return NextResponse.json({
    photo: {
      id: row.id,
      cloudinary_public_id: row.cloudinary_public_id,
      width: row.width,
      height: row.height,
      caption: row.caption,
      album_slug: row.jiejoy_albums.slug,
      album_title: row.jiejoy_albums.title,
    },
  });
}
