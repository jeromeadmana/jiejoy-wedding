import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { signUpload } from "@/lib/cloudinary";
import { albumFolder } from "@/lib/cloudinary-url";

export async function POST(req: NextRequest) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { albumSlug } = await req.json().catch(() => ({}));
  if (!albumSlug || typeof albumSlug !== "string") {
    return NextResponse.json({ error: "albumSlug required" }, { status: 400 });
  }

  // Confirm the album exists before issuing a signature for its folder.
  // Prevents signatures being minted for arbitrary folders in the shared
  // Cloudinary account.
  const supabase = createAdminClient();
  const { data: album } = await supabase
    .from("jiejoy_albums")
    .select("slug")
    .eq("slug", albumSlug)
    .single();

  if (!album) {
    return NextResponse.json({ error: "Album not found" }, { status: 404 });
  }

  const sig = signUpload(albumFolder(album.slug));
  return NextResponse.json(sig);
}
