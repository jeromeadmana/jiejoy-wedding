import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// GET — Public album + photos (only if published)
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const supabase = createAdminClient();

  const { data: album } = await supabase
    .from("jiejoy_albums")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (!album) {
    return NextResponse.json({ error: "Album not found" }, { status: 404 });
  }

  const { data: photos } = await supabase
    .from("jiejoy_photos")
    .select("*")
    .eq("album_id", album.id)
    .order("sort_order", { ascending: true });

  return NextResponse.json({ ...album, photos: photos ?? [] });
}
