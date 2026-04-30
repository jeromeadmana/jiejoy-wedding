import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// GET — Public list of published albums with photo counts. Albums with
// zero photos are filtered out so empty placeholders never show on the
// public landing page.
export async function GET() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("jiejoy_albums")
    .select("*, jiejoy_photos(count)")
    .eq("is_published", true)
    .order("sort_order", { ascending: true });

  if (error) {
    return NextResponse.json({ error: "Failed to fetch albums" }, { status: 500 });
  }

  const albums = (data ?? [])
    .map((a) => ({
      ...a,
      photo_count: a.jiejoy_photos?.[0]?.count ?? 0,
      jiejoy_photos: undefined,
    }))
    .filter((a) => a.photo_count > 0);

  return NextResponse.json(albums);
}
