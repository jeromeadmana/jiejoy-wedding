import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { AlbumViewer } from "@/components/gallery/AlbumViewer";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import type { Album, Photo } from "@/lib/types/gallery";

export const dynamic = "force-dynamic";

export default async function PublicAlbumPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = createAdminClient();

  const { data: album } = await supabase
    .from("jiejoy_albums")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle<Album>();

  if (!album) notFound();

  const { data: photos } = await supabase
    .from("jiejoy_photos")
    .select("*")
    .eq("album_id", album.id)
    .order("sort_order", { ascending: true })
    .returns<Photo[]>();

  return (
    <>
      <Navbar />
      <main
        className="min-h-screen pt-24 pb-16"
        style={{ backgroundColor: "var(--color-cream, #FDF8F8)" }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Link
            href="/gallery"
            className="mb-6 inline-flex items-center gap-2 text-sm font-semibold transition-colors"
            style={{ color: "var(--color-warm-gray, #6B6B6B)" }}
          >
            <ArrowLeft size={16} />
            All albums
          </Link>

          <header className="mb-10">
            <h1
              className="font-serif text-4xl font-bold sm:text-5xl"
              style={{ color: "var(--color-charcoal, #2C2C2C)" }}
            >
              {album.title}
            </h1>
            {album.description && (
              <p
                className="mt-3 max-w-2xl text-base sm:text-lg"
                style={{ color: "var(--color-warm-gray, #6B6B6B)" }}
              >
                {album.description}
              </p>
            )}
            <p
              className="mt-2 text-sm"
              style={{ color: "var(--color-warm-gray, #6B6B6B)" }}
            >
              {photos?.length ?? 0} {photos?.length === 1 ? "photo" : "photos"}
            </p>
          </header>

          {photos && photos.length > 0 ? (
            <AlbumViewer photos={photos} />
          ) : (
            <p
              className="text-center"
              style={{ color: "var(--color-warm-gray, #6B6B6B)" }}
            >
              No photos in this album yet.
            </p>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
