import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

// GET — Admin list all albums (published + unpublished) with photo counts
export async function GET(req: NextRequest) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("jiejoy_albums")
    .select("*, jiejoy_photos(count)")
    .order("sort_order", { ascending: true });

  if (error) {
    return NextResponse.json({ error: "Failed to fetch albums" }, { status: 500 });
  }

  // Flatten count
  const albums = (data ?? []).map((a) => ({
    ...a,
    photo_count: a.jiejoy_photos?.[0]?.count ?? 0,
    jiejoy_photos: undefined,
  }));

  return NextResponse.json(albums);
}

// POST — Create a new album
export async function POST(req: NextRequest) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body?.title || typeof body.title !== "string") {
    return NextResponse.json({ error: "title required" }, { status: 400 });
  }

  const slug = (body.slug ?? toSlug(body.title)).toString();
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
    return NextResponse.json({ error: "Invalid slug — use lowercase, digits, hyphens" }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Place new album at the end of the order
  const { data: maxRow } = await supabase
    .from("jiejoy_albums")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const sort_order = (maxRow?.sort_order ?? 0) + 10;

  const { data, error } = await supabase
    .from("jiejoy_albums")
    .insert({
      slug,
      title: body.title,
      description: body.description ?? null,
      sort_order,
      is_published: false,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "An album with that slug already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to create album" }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

function toSlug(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
